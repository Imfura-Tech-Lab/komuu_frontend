"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
  DocumentIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { useMemberGroups, MemberGroup } from "@/lib/hooks/use-member-groups";
import { Conversation, useMemberConversations } from "@/lib/hooks/useMemberConversations";
import {
  useMemberConversationMessages,
  ConversationMessage,
} from "@/lib/hooks/useMemberConversationMessages";
import { useRealtimeMessages, useTypingIndicator } from "@/lib/hooks/useRealtimeMessages";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { chatBgStyle } from "@/components/community/chat-doodle";

// ============================================================================
// HELPERS
// ============================================================================

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMsgTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDateSep(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isImage(url: string) { return /\.(jpg|jpeg|png|gif|webp)$/i.test(url); }
function fName(url: string) { return url.split("/").pop() || "file"; }
function fmtSize(b: number) { return b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`; }

// ============================================================================
// CHAT WIDGET
// ============================================================================

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<MemberGroup | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const [msgText, setMsgText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { joinedGroups, loading: grpLoading, fetchJoinedGroups } = useMemberGroups();
  const { conversations, loading: convLoading, fetchConversations, startConversation } = useMemberConversations();
  const { messages, loading: msgLoading, fetchMessages, sendMessage, clearMessages, startPolling, stopPolling } = useMemberConversationMessages();

  useRealtimeMessages({
    conversationId: activeConv?.id ?? null,
    onNewMessage: useCallback((_msg: ConversationMessage) => { if (activeConv) fetchMessages(activeConv.id); }, [activeConv, fetchMessages]),
    onMessageDeleted: useCallback((_id: number) => { if (activeConv) fetchMessages(activeConv.id); }, [activeConv, fetchMessages]),
  });

  const { typingUsers, sendTyping } = useTypingIndicator(activeConv?.id ?? null);

  useEffect(() => {
    try { const d = JSON.parse(localStorage.getItem("user_data") || "{}"); if (d.id) setUserId(d.id); } catch {}
  }, []);

  useEffect(() => { if (open && !activeGroup) fetchJoinedGroups(1); }, [open]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => () => stopPolling(), [stopPolling]);

  const isOwn = useCallback((msg: ConversationMessage) => {
    if (!userId) return false;
    return (typeof msg.sender.id === "string" ? parseInt(msg.sender.id as unknown as string) : msg.sender.id) === userId;
  }, [userId]);

  // Select a group → fetch conversations → use first one as the chatroom
  const selectGroup = async (group: MemberGroup) => {
    setActiveGroup(group);
    setSearch("");
    clearMessages();
    stopPolling();
    await fetchConversations(group.slug);
  };

  // Auto-select or create the single chatroom conversation
  useEffect(() => {
    if (!activeGroup || convLoading) return;

    const openChat = async (conv: Conversation) => {
      setActiveConv(conv);
      await fetchMessages(conv.id);
      startPolling(conv.id, 5000);
    };

    if (conversations.length > 0) {
      openChat(conversations[0]);
    } else {
      // Create default chatroom
      (async () => {
        const conv = await startConversation({
          group: parseInt(activeGroup.id),
          title: activeGroup.name,
          content: `Welcome to ${activeGroup.name}!`,
        });
        if (conv) {
          await fetchConversations(activeGroup.slug);
          openChat(conv);
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup?.id, convLoading]);

  const goBack = () => {
    setActiveGroup(null);
    setActiveConv(null);
    stopPolling();
    clearMessages();
    removeFile();
    setMsgText("");
    setSearch("");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!msgText.trim() && !file) || !activeConv || msgLoading) return;
    if (msgText.trim().length > 0 && msgText.trim().length < 10) { showErrorToast("Min 10 characters"); return; }
    const ok = await sendMessage({ conversation_id: activeConv.id, content: msgText.trim() || "Sent an attachment", attachment: file || undefined });
    if (ok) { setMsgText(""); removeFile(); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10485760) { showErrorToast("Max 10MB"); return; }
    setFile(f);
    if (f.type.startsWith("image/")) { const r = new FileReader(); r.onload = (ev) => setPreview(ev.target?.result as string); r.readAsDataURL(f); } else setPreview(null);
  };

  const removeFile = () => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; };

  const filteredGroups = joinedGroups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()));

  const groupedMsgs = messages.reduce<{ date: string; msgs: ConversationMessage[] }[]>((acc, msg) => {
    const k = new Date(msg.created_at).toDateString();
    const last = acc[acc.length - 1];
    if (last?.date === k) last.msgs.push(msg); else acc.push({ date: k, msgs: [msg] });
    return acc;
  }, []);

  // ============================================================================
  // CLOSED STATE — floating bubble
  // ============================================================================
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#00B5A5] hover:bg-[#008F82] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  // ============================================================================
  // OPEN STATE — chat window
  // ============================================================================
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setOpen(false)} />

      <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-48px)] md:w-[400px] h-[calc(100vh-120px)] md:h-[600px] max-h-[700px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden" style={chatBgStyle.light}>

        {/* ===== HEADER ===== */}
        <div className="bg-[#00B5A5] px-4 py-3 flex items-center gap-3 flex-shrink-0">
          {activeGroup && (
            <button onClick={goBack} className="text-white/80 hover:text-white"><ArrowLeftIcon className="w-5 h-5" /></button>
          )}
          <div className="flex-1 min-w-0">
            {!activeGroup ? (
              <h3 className="text-white font-semibold text-sm">Chats</h3>
            ) : (
              <>
                <h3 className="text-white font-semibold text-sm truncate">{activeGroup.name}</h3>
                <p className="text-white/60 text-[10px] truncate">
                  {typingUsers.length > 0
                    ? <span className="text-white/90 italic">{typingUsers.join(", ")} typing...</span>
                    : `${activeGroup.members} members`}
                </p>
              </>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="p-1 text-white/80 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        {/* ===== GROUPS LIST ===== */}
        {!activeGroup && (
          <>
            {/* Search */}
            <div className="px-3 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input type="text" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-1 focus:ring-[#00B5A5] text-gray-900 dark:text-white placeholder-gray-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {grpLoading ? (
                <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/50 dark:bg-gray-800/50 rounded-xl animate-pulse" />)}</div>
              ) : filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <UserGroupIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
                  <p className="text-xs text-gray-500">{search ? "No groups found" : "No groups joined"}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Join groups from the Community page</p>
                </div>
              ) : filteredGroups.map(g => (
                <button key={g.slug} onClick={() => selectGroup(g)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/60 dark:hover:bg-gray-800/60 border-b border-gray-100/30 dark:border-gray-800/30 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex items-center justify-center flex-shrink-0">
                    <UserGroupIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{g.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{g.members} members · {g.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ===== CHAT AREA ===== */}
        {activeGroup && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {(msgLoading || convLoading) && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-6 h-6 border-2 border-[#00B5A5] border-t-transparent rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-5">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No messages yet</p>
                    <p className="text-[10px] text-gray-400 mt-1">Say hello to the group!</p>
                  </div>
                </div>
              ) : (
                <>
                  {groupedMsgs.map(grp => (
                    <React.Fragment key={grp.date}>
                      <div className="flex justify-center py-1.5">
                        <span className="px-2.5 py-0.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-[9px] font-medium text-gray-500 shadow-sm">{formatDateSep(grp.msgs[0].created_at)}</span>
                      </div>
                      {grp.msgs.map((msg, i) => {
                        const own = isOwn(msg);
                        const prev = i > 0 ? grp.msgs[i - 1] : null;
                        const sameSender = prev && prev.sender.id === msg.sender.id;
                        return (
                          <div key={msg.id} className={`flex ${own ? "justify-end" : "justify-start"} ${sameSender ? "mt-0.5" : "mt-2.5"}`}>
                            {!own && (
                              <div className="w-6 mr-1.5 flex-shrink-0">
                                {!sameSender && (
                                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mt-0.5">
                                    <span className="text-[8px] font-bold text-gray-600 dark:text-gray-300">{msg.sender.name[0]?.toUpperCase()}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="max-w-[80%]">
                              {!own && !sameSender && <p className="text-[9px] font-semibold text-[#00B5A5] mb-0.5 ml-1">{msg.sender.name}</p>}
                              <div className={`rounded-2xl shadow-sm ${own ? "bg-[#00B5A5] text-white rounded-br-sm" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm"}`}>
                                {msg.file_url && (
                                  <div className="p-1">
                                    {isImage(msg.file_url) ? (
                                      <img src={msg.file_url} alt="" className="max-h-36 rounded-xl" />
                                    ) : (
                                      <div className={`flex items-center gap-1.5 p-2 rounded-xl text-xs ${own ? "bg-white/10" : "bg-gray-50 dark:bg-gray-700"}`}>
                                        <DocumentIcon className="w-4 h-4" /><span className="truncate">{fName(msg.file_url)}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {msg.content && <p className={`text-[12px] leading-relaxed whitespace-pre-wrap break-words ${msg.file_url ? "px-2.5 pb-1 pt-0.5" : "px-2.5 py-1.5"}`}>{msg.content}</p>}
                                <div className="flex items-center justify-end gap-0.5 px-2.5 pb-1">
                                  <span className={`text-[8px] ${own ? "text-white/50" : "text-gray-400"}`}>{formatMsgTime(msg.created_at)}</span>
                                  {own && <CheckCircleIcon className="w-2.5 h-2.5 text-white/50" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                  <div ref={endRef} />
                </>
              )}
            </div>

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="px-4 py-1 text-[10px] text-[#00B5A5] italic bg-white/60 backdrop-blur-sm">
                {typingUsers.join(", ")} typing...
              </div>
            )}

            {/* Input */}
            <div className="px-2 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex-shrink-0">
              {file && (
                <div className="mb-1.5 mx-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2">
                  {preview ? <img src={preview} alt="" className="w-10 h-10 object-cover rounded" /> : <DocumentIcon className="w-5 h-5 text-gray-500" />}
                  <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate flex-1">{file.name}</span>
                  <button onClick={removeFile} className="text-gray-400 hover:text-red-500"><XMarkIcon className="w-3.5 h-3.5" /></button>
                </div>
              )}
              <form onSubmit={handleSend} className="flex items-end gap-1.5">
                <input ref={fileRef} type="file" onChange={handleFile} className="hidden" accept="image/*,application/pdf,.doc,.docx" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={msgLoading} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <PaperClipIcon className="w-4 h-4" />
                </button>
                <textarea
                  value={msgText} onChange={e => setMsgText(e.target.value)} onInput={() => sendTyping()}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                  placeholder="Message..." rows={1} disabled={msgLoading}
                  className="flex-1 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl focus:ring-1 focus:ring-[#00B5A5] text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                  style={{ minHeight: "36px", maxHeight: "80px" }}
                />
                <button type="submit" disabled={(!msgText.trim() && !file) || msgLoading} className="p-2 bg-[#00B5A5] text-white rounded-full hover:bg-[#008F82] disabled:opacity-40 transition-colors">
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
