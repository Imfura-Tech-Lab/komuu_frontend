"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useGroups, Group } from "@/lib/hooks/useGroups";
import { useConversations, Conversation } from "@/lib/hooks/useConversations";
import { useConversationMessages } from "@/lib/hooks/useConversationMessages";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import CreateConversationModal from "@/components/conversations/CreateConversationModal";

const GroupHeaderSkeleton = () => (
  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
        </div>
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
  </div>
);

const ConversationItemSkeleton = () => (
  <div className="p-3 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="flex items-center space-x-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
        </div>
      </div>
    </div>
  </div>
);

const ConversationsListSkeleton = () => (
  <div className="p-2 space-y-2">
    {[...Array(5)].map((_, i) => (
      <ConversationItemSkeleton key={i} />
    ))}
  </div>
);

const ChatHeaderSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div className="animate-pulse space-y-2">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="flex items-center space-x-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const MessageSkeleton = () => (
  <div className="flex items-start space-x-3 animate-pulse">
    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

const MessagesListSkeleton = () => (
  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
    {[...Array(4)].map((_, i) => (
      <MessageSkeleton key={i} />
    ))}
  </div>
);

export default function GroupChatPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [group, setGroup] = useState<Group | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesError, setTypesError] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const { fetchGroup } = useGroups();
  const {
    conversations,
    conversationTypes,
    conversationGroups,
    loading: conversationsLoading,
    error: conversationsError,
    fetchConversations,
    fetchConversationTypes,
    fetchConversationGroups,
    createConversation,
  } = useConversations();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    fetchMessages,
    createMessage,
    clearMessages,
  } = useConversationMessages();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_data");
      const userId = localStorage.getItem("user_id");
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log("Current user loaded from user_data:", user);
          setCurrentUserId(user.id);
        } catch (error) {
          console.error("Error parsing user_data:", error);
        }
      } else if (userId) {
        console.log("Current user loaded from user_id:", userId);
        setCurrentUserId(parseInt(userId));
      } else {
        console.warn("No user data found in localStorage");
        console.log("localStorage keys:", Object.keys(localStorage));
      }
    }
  }, []);

  useEffect(() => {
    loadGroupData();
  }, [slug]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  useEffect(() => {
    if (selectedConversation && window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, [selectedConversation]);

  const loadGroupData = async () => {
    try {
      setIsLoadingGroup(true);
      clearMessages();
      const groupData = await fetchGroup(slug);
      if (groupData) {
        setGroup(groupData);
      }

      await fetchConversations(slug);
      await loadTypesAndGroups();
    } catch (error) {
      console.error("Error loading group data:", error);
      showErrorToast("Failed to load group data");
    } finally {
      setIsLoadingGroup(false);
    }
  };

  const loadTypesAndGroups = async () => {
    setTypesLoading(true);
    setTypesError(false);
    try {
      await Promise.all([fetchConversationTypes(), fetchConversationGroups()]);
    } catch (err) {
      console.error("Failed to load types/groups:", err);
      setTypesError(true);
    } finally {
      setTypesLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isOwnMessage = useCallback(
    (message: any) => {
      if (currentUserId === null) return false;
      
      const senderId = typeof message.sender.id === 'string' 
        ? parseInt(message.sender.id) 
        : message.sender.id;
      
      const isOwn = senderId === currentUserId;
      
      console.log(`Message ${message.id} check:`, {
        senderId,
        senderIdType: typeof message.sender.id,
        currentUserId,
        currentUserIdType: typeof currentUserId,
        isOwn,
        senderName: message.sender.name,
      });
      
      return isOwn;
    },
    [currentUserId]
  );

  const handleConversationClick = async (conversation: Conversation) => {
    console.log("Selecting conversation:", conversation.id, conversation.title);

    if (selectedConversation?.id !== conversation.id) {
      clearMessages();
    }

    setSelectedConversation(conversation);

    try {
      await fetchMessages(conversation.id);
    } catch (error) {
      console.error("Error loading messages:", error);
      showErrorToast("Failed to load messages");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || messagesLoading) return;

    if (messageText.trim().length < 10) {
      showErrorToast("Message must be at least 10 characters long");
      return;
    }

    try {
      const success = await createMessage({
        conversation_id: selectedConversation.id,
        content: messageText.trim(),
      });

      if (success) {
        setMessageText("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showErrorToast("Failed to send message");
    }
  };

  const handleCreateConversation = async (params: any) => {
    const newConv = await createConversation(params);

    if (newConv) {
      setShowNewConversationModal(false);
      await fetchConversations(slug);
      setSelectedConversation(newConv);
      await fetchMessages(newConv.id);
      return newConv;
    }

    return null;
  };

  const handleRefresh = async () => {
    await fetchConversations(slug);
    if (selectedConversation) {
      await fetchMessages(selectedConversation.id);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    if (window.innerWidth < 768) {
      setShowSidebar(true);
    }
  };

  if (isLoadingGroup) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col md:flex">
          <GroupHeaderSkeleton />
          <ConversationsListSkeleton />
        </div>

        <div className="flex-1 flex flex-col">
          <ChatHeaderSkeleton />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading group...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Group not found</p>
          <button
            onClick={() => router.push("/team/groups")}
            className="text-[#00B5A5] hover:text-[#008f82]"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:flex
      `}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push("/team/groups")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Groups
            </button>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#00B5A5] to-[#008f82] rounded-lg p-3 text-white mb-3">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{group.name}</p>
                <p className="text-sm text-white/80">{group.members} members</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={conversationsLoading}
              className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh conversations"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${conversationsLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowNewConversationModal(true)}
              disabled={conversationsLoading}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008f82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">New Topic</span>
            </button>
          </div>
        </div>

        {conversationsError && conversations.length === 0 && (
          <div className="m-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-xs text-red-800 dark:text-red-200">
              Failed to load conversations
            </p>
            <button
              onClick={handleRefresh}
              disabled={conversationsLoading}
              className="mt-2 w-full px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading && conversations.length === 0 ? (
            <ConversationsListSkeleton />
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new topic!</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`w-full p-3 rounded-lg transition-colors text-left mb-2 ${
                    selectedConversation?.id === conversation.id
                      ? "bg-[#00B5A5]/10 border-l-4 border-[#00B5A5]"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {conversation.title[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {conversation.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {conversation.type && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {conversation.type}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(conversation.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToConversations}
                    className="md:hidden flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-none">
                      {selectedConversation.title}
                    </h2>
                    <div className="flex items-center space-x-2 md:space-x-4 mt-1 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                      <span className="truncate max-w-[120px] md:max-w-none">
                        {selectedConversation.sender?.name || "Unknown"}
                      </span>
                      <span>•</span>
                      <span>{formatTimeAgo(selectedConversation.created_at)}</span>
                      {selectedConversation.type && (
                        <>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs">
                            {selectedConversation.type}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchMessages(selectedConversation.id)}
                    disabled={messagesLoading}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    title="Refresh messages"
                  >
                    <ArrowPathIcon
                      className={`h-4 w-4 ${messagesLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    onClick={toggleSidebar}
                    className="md:hidden flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Bars3Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {messagesError && messages.length === 0 && (
              <div className="mx-4 md:mx-6 mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Failed to load messages
                </p>
                <button
                  onClick={() => fetchMessages(selectedConversation.id)}
                  disabled={messagesLoading}
                  className="mt-2 px-3 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            )}

            {messagesLoading && messages.length === 0 ? (
              <MessagesListSkeleton />
            ) : (
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
                      <p className="text-sm text-gray-400 mt-1">Be the first to respond!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages
                      .sort(
                        (a, b) =>
                          new Date(a.created_at).getTime() -
                          new Date(b.created_at).getTime()
                      )
                      .map((message) => {
                        const ownMessage = isOwnMessage(message);
                        return (
                          <div
                            key={message.id}
                            className={`flex items-start space-x-3 ${
                              ownMessage ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {message.sender.name[0]?.toUpperCase() || "?"}
                              </span>
                            </div>

                            <div
                              className={`flex-1 ${
                                ownMessage ? "flex flex-col items-end" : ""
                              }`}
                            >
                              <div
                                className={`flex items-baseline space-x-2 ${
                                  ownMessage ? "flex-row-reverse space-x-reverse" : ""
                                }`}
                              >
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                  {ownMessage ? "You" : message.sender.name}
                                </span>
                                {message.sender.role && !ownMessage && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                    {message.sender.role}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatTimeAgo(message.created_at)}
                                </span>
                              </div>
                              <div
                                className={`
                                mt-1 rounded-lg p-3 shadow-sm max-w-[85%] md:max-w-[70%]
                                ${
                                  ownMessage
                                    ? "bg-[#00B5A5] text-white rounded-br-none"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-none"
                                }
                              `}
                              >
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </p>
                                {message.file_url && (
                                  <div className="mt-2">
                                    {message.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                      <img
                                        src={message.file_url}
                                        alt="Attachment"
                                        className="max-w-full rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(message.file_url, "_blank")}
                                      />
                                    ) : (
                                      
                                        <a href={message.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center text-xs ${
                                          ownMessage
                                            ? "text-white/80 hover:text-white"
                                            : "text-[#00B5A5] hover:underline"
                                        }`}
                                      >
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                        View Attachment
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message (min 10 characters)..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                    disabled={messagesLoading}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {messageText.trim().length}/10 characters minimum
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={
                    !messageText.trim() ||
                    messageText.trim().length < 10 ||
                    messagesLoading
                  }
                  className="p-3 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008f82] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="md:hidden p-4">
              <button
                onClick={toggleSidebar}
                className="flex items-center justify-center px-6 py-3 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008f82] transition-colors"
              >
                <Bars3Icon className="h-5 w-5 mr-2" />
                Show Conversations
              </button>
            </div>

            <div className="hidden md:flex flex-col items-center justify-center h-full">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      <CreateConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        conversationTypes={conversationTypes}
        conversationGroups={conversationGroups}
        typesLoading={typesLoading}
        typesError={typesError}
        loading={conversationsLoading}
        onLoadTypes={loadTypesAndGroups}
        onCreateConversation={handleCreateConversation}
        currentGroupId={group?.id ? parseInt(group.id) : undefined}
        currentGroupName={group?.name}
      />
    </div>
  );
}