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
  UserIcon,
} from "@heroicons/react/24/outline";
import { useMemberGroups, MemberGroup } from "@/lib/hooks/use-member-groups";
import { Conversation, useMemberConversations } from "@/lib/hooks/useMemberConversations";
import { ConversationMessage } from "@/lib/hooks/useMemberConversationMessages";
import { useRealtimeMessages, useTypingIndicator } from "@/lib/hooks/useRealtimeMessages";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { useChatBgStyle } from "@/components/community/chat-doodle";
import { getAuthenticatedClient } from "@/lib/api-client";
import { useOfflineChat } from "@/lib/hooks/useOfflineChat";
import { getCached, setCache } from "@/lib/chat-store";

// ============================================================================
// TYPES
// ============================================================================

interface Peer {
  id: number;
  name: string;
  role: string;
}

interface DmThread {
  id: number;
  peer: Peer;
  last_message: string | null;
  last_message_at: string;
}

type Tab = "groups" | "peers";
type View = "list" | "chat";

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

// ============================================================================
// CHAT WIDGET
// ============================================================================

export default function ChatWidget() {
  const chatBg = useChatBgStyle();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("groups");
  const [view, setView] = useState<View>("list");
  const [activeGroup, setActiveGroup] = useState<MemberGroup | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [chatTitle, setChatTitle] = useState("");
  const [chatSubtitle, setChatSubtitle] = useState("");
  const [search, setSearch] = useState("");
  const [msgText, setMsgText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  // Cached data
  const [groups, setGroups] = useState<MemberGroup[]>([]);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [dmThreads, setDmThreads] = useState<DmThread[]>([]);

  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { joinedGroups, fetchJoinedGroups } = useMemberGroups();
  const { conversations, loading: convLoading, fetchConversations, startConversation } = useMemberConversations();

  // Offline-first chat — cached messages, optimistic sends, offline queue
  const { messages, online, sending, send: offlineSend, retry: retryMessage } = useOfflineChat(activeConv?.id ?? null, userId);

  useRealtimeMessages({
    conversationId: activeConv?.id ?? null,
    onNewMessage: useCallback((_: ConversationMessage) => {}, []),
    onMessageDeleted: useCallback((_: number) => {}, []),
  });

  const { typingUsers, sendTyping } = useTypingIndicator(activeConv?.id ?? null);

  // Sync hook groups to local state + cache
  useEffect(() => {
    if (joinedGroups.length > 0) {
      setGroups(joinedGroups);
      setCache("chat_groups", joinedGroups);
    }
  }, [joinedGroups]);

  // Load cached data immediately on mount (before opening)
  useEffect(() => {
    try { const d = JSON.parse(localStorage.getItem("user_data") || "{}"); if (d.id) setUserId(d.id); } catch {}
    // Hydrate from cache instantly
    (async () => {
      const [cGroups, cPeers, cDms] = await Promise.all([
        getCached<MemberGroup[]>("chat_groups"),
        getCached<Peer[]>("peers"),
        getCached<DmThread[]>("dm_threads"),
      ]);
      if (cGroups?.length) setGroups(cGroups);
      if (cPeers?.length) setPeers(cPeers);
      if (cDms?.length) setDmThreads(cDms);
    })();
  }, []);

  // Fetch fresh data when chat opens
  useEffect(() => {
    if (open && view === "list") {
      refreshAllData();
    }
  }, [open]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Fetch fresh from server and update cache
  const refreshAllData = async () => {
    // Fetch groups
    await fetchJoinedGroups(1);

    if (online) {
      try {
        const client = getAuthenticatedClient();
        const [peersRes, dmsRes] = await Promise.all([
          client.get<{ status: string; data: Peer[] }>("conversations/peers"),
          client.get<{ status: string; data: DmThread[] }>("conversations/direct-messages"),
        ]);
        if (peersRes.data.data) { setPeers(peersRes.data.data); await setCache("peers", peersRes.data.data); }
        if (dmsRes.data.data) { setDmThreads(dmsRes.data.data); await setCache("dm_threads", dmsRes.data.data); }
      } catch {}
    }
  };

  // Start DM with a peer
  const startDm = async (peerId: number, peerName: string) => {
    try {
      const client = getAuthenticatedClient();
      const res = await client.post<{ status: string; data: { conversation_id: number } }>("conversations/start-dm", { peer_id: peerId });
      if (res.data.data?.conversation_id) {
        const convId = res.data.data.conversation_id;
        setActiveConv({ id: convId, title: "DM", created_at: new Date().toISOString() });
        setChatTitle(peerName);
        setChatSubtitle("Direct message");
        setView("chat");
        // useOfflineChat will auto-load messages for this conversation
      }
    } catch {
      showErrorToast("Failed to start conversation");
    }
  };

  const isOwn = useCallback((msg: ConversationMessage) => {
    if (!userId) return false;
    return (typeof msg.sender.id === "string" ? parseInt(msg.sender.id as unknown as string) : msg.sender.id) === userId;
  }, [userId]);

  // Select a group → open its chatroom
  const selectGroup = async (group: MemberGroup) => {
    setActiveGroup(group);
    setChatTitle(group.name);
    setChatSubtitle(`${group.members} members`);
    setSearch("");
    await fetchConversations(group.slug);
  };

  // Auto-open group chat once conversations load
  useEffect(() => {
    if (!activeGroup || convLoading || view === "chat") return;
    const openChat = (conv: Conversation) => {
      setActiveConv(conv);
      setView("chat");
    };
    if (conversations.length > 0) {
      openChat(conversations[0]);
    } else {
      (async () => {
        const conv = await startConversation({ group: parseInt(activeGroup.id), title: activeGroup.name, content: `Welcome to ${activeGroup.name}!` });
        if (conv) { await fetchConversations(activeGroup.slug); openChat(conv); }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroup?.id, convLoading]);

  // Select a DM thread
  const selectDm = (dm: DmThread) => {
    setActiveConv({ id: dm.id, title: "DM", created_at: dm.last_message_at });
    setChatTitle(dm.peer.name);
    setChatSubtitle(dm.peer.role);
    setView("chat");
  };

  const goBack = () => {
    setActiveGroup(null);
    setActiveConv(null);
    setChatTitle("");
    setChatSubtitle("");
    setView("list");
    removeFile();
    setMsgText("");
    setSearch("");
    refreshAllData();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!msgText.trim() && !file) || !activeConv || sending) return;
    const ok = await offlineSend(msgText.trim(), file || undefined);
    if (ok) { setMsgText(""); removeFile(); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10485760) { showErrorToast("Max 10MB"); return; }
    setFile(f);
    if (f.type.startsWith("image/")) { const r = new FileReader(); r.onload = (ev) => setPreview(ev.target?.result as string); r.readAsDataURL(f); } else setPreview(null);
  };

  const removeFile = () => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; };

  const filteredGroups = groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()));
  const filteredPeers = peers.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredDms = dmThreads.filter(d => !search || d.peer.name.toLowerCase().includes(search.toLowerCase()));

  const groupedMsgs = messages.reduce<{ date: string; msgs: ConversationMessage[] }[]>((acc, msg) => {
    const k = new Date(msg.created_at).toDateString();
    const last = acc[acc.length - 1];
    if (last?.date === k) last.msgs.push(msg); else acc.push({ date: k, msgs: [msg] });
    return acc;
  }, []);

  // ===== CLOSED =====
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#00B5A5] hover:bg-[#008F82] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group">
        <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  // ===== OPEN =====
  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setOpen(false)} />

      <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-48px)] md:w-[400px] h-[calc(100vh-120px)] md:h-[600px] max-h-[700px] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden bg-white dark:bg-gray-900">

        {/* HEADER */}
        <div className="bg-[#00B5A5] px-4 py-3 flex items-center gap-3 flex-shrink-0">
          {view === "chat" && <button onClick={goBack} className="text-white/80 hover:text-white"><ArrowLeftIcon className="w-5 h-5" /></button>}
          <div className="flex-1 min-w-0">
            {view === "chat" ? (
              <>
                <h3 className="text-white font-semibold text-sm truncate">{chatTitle}</h3>
                <p className="text-white/60 text-[10px] truncate">
                  {typingUsers.length > 0 ? <span className="text-white/90 italic">{typingUsers.join(", ")} typing...</span> : chatSubtitle}
                </p>
              </>
            ) : (
              <h3 className="text-white font-semibold text-sm">Chats</h3>
            )}
          </div>
          <button onClick={() => setOpen(false)} className="p-1 text-white/80 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        {/* TABS (only in list view) */}
        {view === "list" && (
          <div className="flex bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100/50">
            <button onClick={() => { setTab("groups"); setSearch(""); }} className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${tab === "groups" ? "border-[#00B5A5] text-[#00B5A5]" : "border-transparent text-gray-500"}`}>
              <UserGroupIcon className="w-4 h-4 mx-auto mb-0.5" />Groups
            </button>
            <button onClick={() => { setTab("peers"); setSearch(""); }} className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${tab === "peers" ? "border-[#00B5A5] text-[#00B5A5]" : "border-transparent text-gray-500"}`}>
              <UserIcon className="w-4 h-4 mx-auto mb-0.5" />Messages
            </button>
          </div>
        )}

        {/* SEARCH */}
        {view !== "chat" && (
          <div className="px-3 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" placeholder={tab === "groups" ? "Search groups..." : "Search members..."} value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-1 focus:ring-[#00B5A5] text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
          </div>
        )}

        {/* OFFLINE BANNER */}
        {!online && (
          <div className="px-3 py-1.5 bg-amber-500/90 text-white text-[10px] text-center font-medium flex-shrink-0">
            You're offline — messages will be sent when you reconnect
          </div>
        )}

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">

          {/* === GROUPS LIST === */}
          {view === "list" && tab === "groups" && (
            filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <UserGroupIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-xs text-gray-500">{search ? "No groups found" : "No groups joined"}</p>
              </div>
            ) : filteredGroups.map(g => (
              <button key={g.slug} onClick={() => selectGroup(g)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex items-center justify-center flex-shrink-0">
                  <UserGroupIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{g.name}</p>
                  <p className="text-[10px] text-gray-500">{g.members} members · {g.category}</p>
                </div>
              </button>
            ))
          )}

          {/* === DM THREADS === */}
          {view === "list" && tab === "peers" && (() => {
            // Merge peers with their DM threads: show all peers, with last message if exists
            const dmByPeerId = new Map(dmThreads.map(d => [d.peer.id, d]));
            const allPeers = filteredPeers.map(p => ({ ...p, dm: dmByPeerId.get(p.id) || null }));
            // Sort: peers with active DMs first (by last message time), then alphabetical
            allPeers.sort((a, b) => {
              if (a.dm && !b.dm) return -1;
              if (!a.dm && b.dm) return 1;
              if (a.dm && b.dm) return new Date(b.dm.last_message_at).getTime() - new Date(a.dm.last_message_at).getTime();
              return a.name.localeCompare(b.name);
            });

            return allPeers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-xs text-gray-500">{search ? "No members found" : "No members available"}</p>
              </div>
            ) : allPeers.map(p => (
              <button key={p.id} onClick={() => p.dm ? selectDm(p.dm) : startDm(p.id, p.name)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors">
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{p.name[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                    {p.dm && <span className="text-[9px] text-gray-400 ml-2 flex-shrink-0">{timeAgo(p.dm.last_message_at)}</span>}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">{p.dm?.last_message || p.role}</p>
                </div>
              </button>
            ));
          })()}

          {/* === CHAT MESSAGES === */}
          {view === "chat" && (
            <div className="px-3 py-2 space-y-0.5" style={chatBg}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-5">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No messages yet</p>
                    <p className="text-[10px] text-gray-400 mt-1">Say hello!</p>
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
                                    {isImage(msg.file_url) ? <img src={msg.file_url} alt="" className="max-h-36 rounded-xl" /> : (
                                      <div className={`flex items-center gap-1.5 p-2 rounded-xl text-xs ${own ? "bg-white/10" : "bg-gray-50 dark:bg-gray-700"}`}>
                                        <DocumentIcon className="w-4 h-4" /><span className="truncate">{fName(msg.file_url)}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {msg.content && <p className={`text-[12px] leading-relaxed whitespace-pre-wrap break-words ${msg.file_url ? "px-2.5 pb-1 pt-0.5" : "px-2.5 py-1.5"}`}>{msg.content}</p>}
                                <div className="flex items-center justify-end gap-0.5 px-2.5 pb-1">
                                  <span className={`text-[8px] ${own ? "text-white/50" : "text-gray-400"}`}>{formatMsgTime(msg.created_at)}</span>
                                  {own && !(msg as unknown as { _pending?: boolean })._pending && <CheckCircleIcon className="w-2.5 h-2.5 text-white/50" />}
                                  {(msg as unknown as { _pending?: boolean })._pending && !(msg as unknown as { _failed?: boolean })._failed && (
                                    <svg className="w-2.5 h-2.5 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                  )}
                                  {(msg as unknown as { _failed?: boolean })._failed && (
                                    <button onClick={(e) => { e.stopPropagation(); retryMessage((msg as unknown as { _tempId: string })._tempId); }} className="text-[8px] text-red-300 hover:text-red-100 underline ml-1">retry</button>
                                  )}
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
          )}
        </div>

        {/* TYPING */}
        {view === "chat" && typingUsers.length > 0 && (
          <div className="px-4 py-1 text-[10px] text-[#00B5A5] italic bg-white dark:bg-gray-900">{typingUsers.join(", ")} typing...</div>
        )}

        {/* INPUT */}
        {view === "chat" && (
          <div className="px-2 py-2 bg-white dark:bg-gray-900 flex-shrink-0">
            {file && (
              <div className="mb-1.5 mx-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2">
                {preview ? <img src={preview} alt="" className="w-10 h-10 object-cover rounded" /> : <DocumentIcon className="w-5 h-5 text-gray-500" />}
                <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate flex-1">{file.name}</span>
                <button onClick={removeFile} className="text-gray-400 hover:text-red-500"><XMarkIcon className="w-3.5 h-3.5" /></button>
              </div>
            )}
            <form onSubmit={handleSend} className="flex items-end gap-1.5">
              <input ref={fileRef} type="file" onChange={handleFile} className="hidden" accept="image/*,application/pdf,.doc,.docx" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={sending} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <PaperClipIcon className="w-4 h-4" />
              </button>
              <textarea
                value={msgText} onChange={e => setMsgText(e.target.value)} onInput={() => sendTyping()}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                placeholder="Message..." rows={1} disabled={sending}
                className="flex-1 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-2xl focus:ring-1 focus:ring-[#00B5A5] text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                style={{ minHeight: "36px", maxHeight: "80px" }}
              />
              <button type="submit" disabled={(!msgText.trim() && !file) || sending} className="p-2 bg-[#00B5A5] text-white rounded-full hover:bg-[#008F82] disabled:opacity-40 transition-colors">
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
