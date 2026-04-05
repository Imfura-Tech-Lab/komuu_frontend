"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useMemberGroups, MemberGroup } from "@/lib/hooks/use-member-groups";
import { Conversation, useMemberConversations } from "@/lib/hooks/useMemberConversations";
import {
  useMemberConversationMessages,
  ConversationMessage,
} from "@/lib/hooks/useMemberConversationMessages";
import { useRealtimeMessages, useTypingIndicator } from "@/lib/hooks/useRealtimeMessages";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";
import { FileViewer } from "@/components/ui/FileViwer";
import StartConversationModal from "@/components/community/Startconversationmodal";
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

function formatDateSeparator(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function fileName(url: string) {
  return url.split("/").pop() || "attachment";
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ============================================================================
// CHAT VIEW (right panel)
// ============================================================================

type ChatView = "groups" | "conversations" | "messages";

// ============================================================================
// MAIN CHAT APP
// ============================================================================

export default function ChatApp() {
  // State
  const [activeGroup, setActiveGroup] = useState<MemberGroup | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [view, setView] = useState<ChatView>("groups");
  const [search, setSearch] = useState("");
  const [msgText, setMsgText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [viewer, setViewer] = useState<{ url: string; name: string } | null>(null);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"sidebar" | "chat">("sidebar");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks
  const { joinedGroups, loading: groupsLoading, fetchJoinedGroups } = useMemberGroups();
  const { conversations, loading: convsLoading, fetchConversations, startConversation } = useMemberConversations();
  const { messages, loading: msgsLoading, fetchMessages, sendMessage, clearMessages, startPolling, stopPolling } = useMemberConversationMessages();

  useRealtimeMessages({
    conversationId: activeConv?.id ?? null,
    onNewMessage: useCallback(() => {
      if (activeConv) fetchMessages(activeConv.id);
    }, [activeConv, fetchMessages]),
    onMessageDeleted: useCallback(() => {
      if (activeConv) fetchMessages(activeConv.id);
    }, [activeConv, fetchMessages]),
  });

  const { typingUsers, sendTyping } = useTypingIndicator(activeConv?.id ?? null);

  // Init
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("user_data") || "{}");
      if (d.id) setUserId(d.id);
    } catch { /* */ }
    fetchJoinedGroups(1);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Handlers
  const isOwn = useCallback((msg: ConversationMessage) => {
    if (!userId) return false;
    const sid = typeof msg.sender.id === "string" ? parseInt(msg.sender.id as unknown as string) : msg.sender.id;
    return sid === userId;
  }, [userId]);

  const selectGroup = async (group: MemberGroup) => {
    setActiveGroup(group);
    setActiveConv(null);
    clearMessages();
    stopPolling();
    setView("conversations");
    setMobilePanel("chat");
    await fetchConversations(group.slug);
  };

  const selectConv = async (conv: Conversation) => {
    setActiveConv(conv);
    setView("messages");
    stopPolling();
    clearMessages();
    await fetchMessages(conv.id);
    startPolling(conv.id, 5000);
  };

  const goBack = () => {
    if (view === "messages") {
      setActiveConv(null);
      stopPolling();
      clearMessages();
      setView("conversations");
      removeFile();
    } else if (view === "conversations") {
      setActiveGroup(null);
      setView("groups");
      setMobilePanel("sidebar");
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!msgText.trim() && !file) || !activeConv || msgsLoading) return;
    if (msgText.trim().length > 0 && msgText.trim().length < 10) {
      showErrorToast("Message must be at least 10 characters");
      return;
    }
    const ok = await sendMessage({
      conversation_id: activeConv.id,
      content: msgText.trim() || "Sent an attachment",
      attachment: file || undefined,
    });
    if (ok) { setMsgText(""); removeFile(); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { showErrorToast("Max 10MB"); return; }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const r = new FileReader();
      r.onload = (ev) => setPreview(ev.target?.result as string);
      r.readAsDataURL(f);
    } else setPreview(null);
  };

  const removeFile = () => {
    setFile(null);
    if (preview) setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNewConv = async (params: { group: number; title: string; content: string; attachment?: File }) => {
    const conv = await startConversation(params);
    if (conv) {
      setShowNewTopic(false);
      if (activeGroup) await fetchConversations(activeGroup.slug);
      setActiveConv(conv);
      setView("messages");
      stopPolling();
      await fetchMessages(conv.id);
      startPolling(conv.id, 5000);
    }
    return conv;
  };

  // Filter groups
  const filteredGroups = joinedGroups.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConvs = conversations.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase())
  );

  // Date grouping for messages
  const groupedMessages = messages.reduce<{ date: string; msgs: ConversationMessage[] }[]>((acc, msg) => {
    const dateStr = new Date(msg.created_at).toDateString();
    const last = acc[acc.length - 1];
    if (last && last.date === dateStr) {
      last.msgs.push(msg);
    } else {
      acc.push({ date: dateStr, msgs: [msg] });
    }
    return acc;
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-950">
      {/* ============ LEFT SIDEBAR ============ */}
      <div className={`w-full md:w-[340px] lg:w-[380px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 ${mobilePanel === "chat" && (view === "conversations" || view === "messages") ? "hidden md:flex" : "flex"}`}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            {view === "groups" ? (
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chats</h2>
            ) : (
              <button onClick={goBack} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="font-medium">{view === "conversations" ? "Groups" : activeGroup?.name}</span>
              </button>
            )}
            {view === "conversations" && (
              <button onClick={() => setShowNewTopic(true)} className="p-1.5 bg-[#00B5A5] text-white rounded-full hover:bg-[#008F82] transition-colors">
                <PlusIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={view === "groups" ? "Search groups..." : "Search conversations..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-xl focus:ring-2 focus:ring-[#00B5A5] text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">
          {/* Groups list */}
          {view === "groups" && (
            groupsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" /><div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <UserGroupIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {search ? "No groups found" : "No groups joined yet"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Join groups to start chatting</p>
              </div>
            ) : (
              <div>
                {filteredGroups.map((group) => (
                  <button
                    key={group.slug}
                    onClick={() => selectGroup(group)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex items-center justify-center flex-shrink-0">
                      <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{group.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{group.members} members · {group.category}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>
            )
          )}

          {/* Conversations list */}
          {view === "conversations" && (
            convsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" /><div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No conversations yet</p>
                <button onClick={() => setShowNewTopic(true)} className="mt-3 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] rounded-lg hover:bg-[#008F82]">
                  Start a Topic
                </button>
              </div>
            ) : (
              <div>
                {filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => { selectConv(conv); setMobilePanel("chat"); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-100 dark:border-gray-800/50 ${activeConv?.id === conv.id ? "bg-[#00B5A5]/5 dark:bg-[#00B5A5]/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{conv.title[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold truncate ${activeConv?.id === conv.id ? "text-[#00B5A5]" : "text-gray-900 dark:text-white"}`}>{conv.title}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{timeAgo(conv.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.sender?.name || "Unknown"}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {/* Messages also shown in sidebar on conversations view when a conv is selected */}
          {view === "messages" && (
            <div>
              {filteredConvs.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { selectConv(conv); setMobilePanel("chat"); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-gray-100 dark:border-gray-800/50 ${activeConv?.id === conv.id ? "bg-[#00B5A5]/5 dark:bg-[#00B5A5]/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{conv.title[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold truncate ${activeConv?.id === conv.id ? "text-[#00B5A5]" : "text-gray-900 dark:text-white"}`}>{conv.title}</p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{timeAgo(conv.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.sender?.name || "Unknown"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ CHAT PANEL ============ */}
      <div className={`flex-1 flex flex-col min-w-0 ${mobilePanel === "sidebar" ? "hidden md:flex" : "flex"}`}>
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
              <button onClick={() => { goBack(); setMobilePanel("sidebar"); }} className="md:hidden text-gray-500 dark:text-gray-400">
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{activeConv.title[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activeConv.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {typingUsers.length > 0
                    ? <span className="text-[#00B5A5] italic">{typingUsers.join(", ")} typing...</span>
                    : <>{activeGroup?.name} · {activeConv.sender?.name}</>
                  }
                </p>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3"
              style={chatBgStyle.light}
            >
              {msgsLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-8 h-8 border-2 border-[#00B5A5] border-t-transparent rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-8 py-6">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No messages yet</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to respond!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 max-w-3xl mx-auto">
                  {groupedMessages.map((group) => (
                    <React.Fragment key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center justify-center py-2">
                        <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-[10px] font-medium text-gray-500 shadow-sm">
                          {formatDateSeparator(group.msgs[0].created_at)}
                        </span>
                      </div>
                      {group.msgs.map((msg, i) => {
                        const own = isOwn(msg);
                        const prevMsg = i > 0 ? group.msgs[i - 1] : null;
                        const sameSender = prevMsg && prevMsg.sender.id === msg.sender.id;
                        const showAvatar = !own && !sameSender;

                        return (
                          <div key={msg.id} className={`flex ${own ? "justify-end" : "justify-start"} ${sameSender ? "mt-0.5" : "mt-3"}`}>
                            {/* Avatar space */}
                            {!own && (
                              <div className="w-8 mr-1.5 flex-shrink-0">
                                {showAvatar ? (
                                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{msg.sender.name[0]?.toUpperCase()}</span>
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {/* Bubble */}
                            <div className={`max-w-[75%] ${own ? "order-1" : ""}`}>
                              {/* Sender name */}
                              {!own && showAvatar && (
                                <p className="text-[10px] font-semibold text-[#00B5A5] mb-0.5 ml-1">{msg.sender.name}</p>
                              )}
                              <div className={`rounded-2xl shadow-sm relative ${
                                own
                                  ? "bg-[#00B5A5] text-white rounded-br-md"
                                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md"
                              }`}>
                                {/* File attachment */}
                                {msg.file_url && (
                                  <div className="p-1.5">
                                    {isImage(msg.file_url) ? (
                                      <img
                                        src={msg.file_url}
                                        alt=""
                                        className="max-h-52 rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setViewer({ url: msg.file_url!, name: fileName(msg.file_url!) })}
                                      />
                                    ) : (
                                      <button
                                        onClick={() => setViewer({ url: msg.file_url!, name: fileName(msg.file_url!) })}
                                        className={`flex items-center gap-2 p-2.5 rounded-xl w-full text-left transition-colors ${own ? "bg-white/10 hover:bg-white/20" : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
                                      >
                                        <DocumentIcon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-xs truncate">{fileName(msg.file_url!)}</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                                {/* Message text */}
                                {msg.content && (
                                  <div className={`${msg.file_url ? "px-3 pb-1.5 pt-0.5" : "px-3 py-1.5"}`}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                  </div>
                                )}
                                {/* Time + check */}
                                <div className={`flex items-center gap-1 px-3 pb-1.5 ${own ? "justify-end" : "justify-end"}`}>
                                  <span className={`text-[9px] ${own ? "text-white/60" : "text-gray-400"}`}>{formatMsgTime(msg.created_at)}</span>
                                  {own && <CheckCircleIcon className="w-3 h-3 text-white/60" />}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-3 py-2">
              {/* File preview */}
              {file && (
                <div className="mb-2 mx-1 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
                  {preview ? (
                    <img src={preview} alt="" className="w-14 h-14 object-cover rounded-lg" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <DocumentIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-500">{fmtSize(file.size)}</p>
                  </div>
                  <button onClick={removeFile} className="p-1 text-gray-400 hover:text-red-500"><XMarkIcon className="w-4 h-4" /></button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex items-end gap-2">
                <input ref={fileInputRef} type="file" onChange={handleFile} className="hidden" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={msgsLoading} className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <PaperClipIcon className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    onInput={() => sendTyping()}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                    placeholder="Type a message"
                    rows={1}
                    className="w-full px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-3xl focus:ring-2 focus:ring-[#00B5A5] text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                    style={{ minHeight: "42px", maxHeight: "120px" }}
                    disabled={msgsLoading}
                  />
                </div>
                <button type="submit" disabled={(!msgText.trim() && !file) || msgsLoading} className="p-2.5 bg-[#00B5A5] text-white rounded-full hover:bg-[#008F82] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : view === "conversations" ? (
          /* No conversation selected — show prompt */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#00B5A5]/10 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-[#00B5A5]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{activeGroup?.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select a conversation or start a new topic</p>
              <button onClick={() => setShowNewTopic(true)} className="px-5 py-2 text-sm font-medium text-white bg-[#00B5A5] rounded-full hover:bg-[#008F82] transition-colors">
                <PlusIcon className="w-4 h-4 inline mr-1.5" />New Topic
              </button>
            </div>
          </div>
        ) : (
          /* No group selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#00B5A5]/10 flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-[#00B5A5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Komuu Chat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Chat with your groups and community members. Select a group to get started.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StartConversationModal
        isOpen={showNewTopic}
        onClose={() => setShowNewTopic(false)}
        loading={convsLoading}
        onStartConversation={handleNewConv}
        currentGroupId={activeGroup?.id ? parseInt(activeGroup.id) : undefined}
        currentGroupName={activeGroup?.name}
      />

      {viewer && <FileViewer fileUrl={viewer.url} fileName={viewer.name} isOpen={!!viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}
