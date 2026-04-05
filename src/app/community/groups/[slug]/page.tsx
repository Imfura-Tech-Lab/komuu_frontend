"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  PaperClipIcon,
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useMemberGroups, MemberGroup } from "@/lib/hooks/use-member-groups";
import { showSuccessToast, showErrorToast } from "@/components/layouts/auth-layer-out";
import { FileViewer } from "@/components/ui/FileViwer";
import { Conversation, useMemberConversations } from "@/lib/hooks/useMemberConversations";
import { useMemberConversationMessages, ConversationMessage } from "@/lib/hooks/useMemberConversationMessages";
import StartConversationModal from "@/components/community/Startconversationmodal";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

// ============================================================================
// HELPERS
// ============================================================================

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(ts).toLocaleDateString();
}

function fileNameFromUrl(url: string, id: number) {
  return url.split("/").pop() || `attachment-${id}`;
}

function isImage(url: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ============================================================================
// SKELETONS
// ============================================================================

const SidebarSkeleton = () => (
  <div className="animate-pulse p-4 space-y-4">
    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}
  </div>
);

const MessagesSkeleton = () => (
  <div className="flex-1 p-6 space-y-4 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// MESSAGE BUBBLE
// ============================================================================

const MessageBubble = ({ message, isOwn, onFileClick }: {
  message: ConversationMessage;
  isOwn: boolean;
  onFileClick: (url: string, name: string) => void;
}) => (
  <div className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[70%] ${isOwn ? "ml-auto flex-row-reverse" : ""}`}>
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-xs font-medium text-gray-600 dark:text-gray-300">
      {message.sender.name[0]?.toUpperCase() || "?"}
    </div>
    <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
      <div className={`flex items-baseline gap-2 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
        <span className="text-xs font-medium text-gray-900 dark:text-white">{isOwn ? "You" : message.sender.name}</span>
        {!isOwn && message.sender.role && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{message.sender.role}</span>
        )}
        <span className="text-[10px] text-gray-400">{timeAgo(message.created_at)}</span>
      </div>
      <div className={`rounded-2xl shadow-sm ${isOwn ? "bg-[#00B5A5] text-white rounded-br-md" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-md"}`}>
        {message.file_url && (
          <div className="p-1.5">
            {isImage(message.file_url) ? (
              <img
                src={message.file_url}
                alt="Attachment"
                className="max-h-48 rounded-xl cursor-pointer hover:opacity-90"
                onClick={() => onFileClick(message.file_url!, fileNameFromUrl(message.file_url!, message.id))}
              />
            ) : (
              <button
                onClick={() => onFileClick(message.file_url!, fileNameFromUrl(message.file_url!, message.id))}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-colors ${isOwn ? "bg-white/10 hover:bg-white/20" : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"}`}
              >
                <DocumentIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs truncate max-w-[150px]">{fileNameFromUrl(message.file_url!, message.id)}</span>
              </button>
            )}
          </div>
        )}
        {message.content && (
          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${message.file_url ? "px-3 pb-2.5 pt-1" : "px-3.5 py-2.5"}`}>
            {message.content}
          </p>
        )}
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN PAGE
// ============================================================================

function GroupChatContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [group, setGroup] = useState<MemberGroup | null>(null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [msgText, setMsgText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [sidebar, setSidebar] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [viewer, setViewer] = useState<{ url: string; name: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { fetchGroup } = useMemberGroups();
  const { conversations, loading: convsLoading, fetchConversations, startConversation } = useMemberConversations();
  const { messages, loading: msgsLoading, fetchMessages, sendMessage, clearMessages, startPolling, stopPolling } = useMemberConversationMessages();

  // Get user ID
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem("user_data") || "{}");
      if (d.id) setUserId(d.id);
    } catch { /* */ }
  }, []);

  // Load group
  useEffect(() => {
    (async () => {
      setLoadingGroup(true);
      clearMessages();
      const g = await fetchGroup(slug);
      if (g) setGroup(g);
      await fetchConversations(slug);
      setLoadingGroup(false);
    })();
  }, [slug]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup polling on unmount
  useEffect(() => () => stopPolling(), [stopPolling]);

  const isOwn = useCallback((msg: ConversationMessage) => {
    if (!userId) return false;
    const sid = typeof msg.sender.id === "string" ? parseInt(msg.sender.id) : msg.sender.id;
    return sid === userId;
  }, [userId]);

  const handleSelectConv = async (conv: Conversation) => {
    if (selectedConv?.id !== conv.id) {
      clearMessages();
      stopPolling();
      removeFile();
    }
    setSelectedConv(conv);
    if (window.innerWidth < 768) setSidebar(false);
    await fetchMessages(conv.id);
    startPolling(conv.id, 5000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!msgText.trim() && !file) || !selectedConv || msgsLoading) return;
    if (msgText.trim().length > 0 && msgText.trim().length < 10) {
      showErrorToast("Message must be at least 10 characters");
      return;
    }
    const ok = await sendMessage({
      conversation_id: selectedConv.id,
      content: msgText.trim() || "Sent an attachment",
      attachment: file || undefined,
    });
    if (ok) { setMsgText(""); removeFile(); }
  };

  const handleNewConv = async (params: { group: number; title: string; content: string; attachment?: File }) => {
    const conv = await startConversation(params);
    if (conv) {
      setShowModal(false);
      await fetchConversations(slug);
      setSelectedConv(conv);
      stopPolling();
      await fetchMessages(conv.id);
      startPolling(conv.id, 5000);
    }
    return conv;
  };

  const handleRefresh = async () => {
    await fetchConversations(slug);
    if (selectedConv) await fetchMessages(selectedConv.id);
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
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Loading state
  if (loadingGroup) {
    return (
      <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
        <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
          <SidebarSkeleton />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B5A5] mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading group...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Group not found</p>
          <button onClick={() => router.push("/community/groups")} className="text-[#00B5A5] hover:underline">Back to Groups</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay */}
      {sidebar && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebar(false)} />}

      {/* Sidebar */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform md:translate-x-0 ${sidebar ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Group header */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.push("/community/groups")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeftIcon className="w-3.5 h-3.5" />Back
            </button>
            <button onClick={() => setSidebar(false)} className="md:hidden text-gray-500"><XMarkIcon className="w-4 h-4" /></button>
          </div>
          <div className="bg-gradient-to-br from-[#00B5A5] to-[#008F82] rounded-lg p-3 text-white mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><UserGroupIcon className="w-5 h-5" /></div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{group.name}</p>
                <p className="text-xs text-white/70">{group.members} members</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} disabled={convsLoading} className="flex-1 flex items-center justify-center py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-xs">
              <ArrowPathIcon className={`w-3.5 h-3.5 ${convsLoading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowModal(true)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] text-xs">
              <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />New Topic
            </button>
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading && conversations.length === 0 ? (
            <SidebarSkeleton />
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a new topic!</p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full text-left p-2.5 rounded-lg transition-colors ${
                    selectedConv?.id === conv.id
                      ? "bg-[#00B5A5]/10 border-l-3 border-[#00B5A5]"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{conv.title[0]?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{conv.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{conv.sender?.name || "Unknown"}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{timeAgo(conv.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            {/* Chat header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => { setSelectedConv(null); stopPolling(); removeFile(); if (window.innerWidth < 768) setSidebar(true); }} className="md:hidden text-gray-500"><ArrowLeftIcon className="w-4 h-4" /></button>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white truncate">{selectedConv.title}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedConv.sender?.name} · {timeAgo(selectedConv.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => fetchMessages(selectedConv.id)} disabled={msgsLoading} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <ArrowPathIcon className={`w-4 h-4 ${msgsLoading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={() => setSidebar(true)} className="md:hidden p-1.5 text-gray-500"><Bars3Icon className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Messages */}
            {msgsLoading && messages.length === 0 ? <MessagesSkeleton /> : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No messages yet</p>
                      <p className="text-xs text-gray-400 mt-1">Be the first to respond!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={isOwn(msg)}
                        onFileClick={(url, name) => setViewer({ url, name })}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}

            {/* Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
              {file && (
                <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center gap-3">
                  {preview ? (
                    <img src={preview} alt="" className="h-12 w-12 object-cover rounded-lg" />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <DocumentIcon className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-gray-500">{fmtSize(file.size)}</p>
                  </div>
                  <button onClick={removeFile} className="text-red-500 hover:text-red-700 p-1"><XMarkIcon className="w-4 h-4" /></button>
                </div>
              )}
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <input ref={fileInputRef} type="file" onChange={handleFile} className="hidden" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" />
                <div className="flex-1 relative">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={msgsLoading} className="absolute left-3 bottom-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50">
                    <PaperClipIcon className="w-4 h-4" />
                  </button>
                  <textarea
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    style={{ minHeight: "40px", maxHeight: "100px" }}
                    disabled={msgsLoading}
                  />
                </div>
                <button type="submit" disabled={(!msgText.trim() && !file) || msgsLoading} className="p-2.5 bg-[#00B5A5] text-white rounded-xl hover:bg-[#008F82] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-gray-400 mt-1.5 px-1">Enter to send · Shift+Enter for new line · Max 10MB attachments</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <button onClick={() => setSidebar(true)} className="md:hidden px-4 py-2 bg-[#00B5A5] text-white rounded-lg text-sm mb-4">
              <Bars3Icon className="w-4 h-4 inline mr-2" />Show Topics
            </button>
            <div className="hidden md:block text-center">
              <ChatBubbleLeftRightIcon className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StartConversationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        loading={convsLoading}
        onStartConversation={handleNewConv}
        currentGroupId={group?.id ? parseInt(group.id) : undefined}
        currentGroupName={group?.name}
      />
      {viewer && <FileViewer fileUrl={viewer.url} fileName={viewer.name} isOpen={!!viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}

export default function MemberGroupChatPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member", "Board", "President", "Administrator"]}>
      <GroupChatContent />
    </SecureDashboardLayout>
  );
}
