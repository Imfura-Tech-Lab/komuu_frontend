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
  XMarkIcon as XIcon,
  DocumentIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useMemberGroups, MemberGroup } from "@/lib/hooks/use-member-groups";

import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { FileViewer } from "@/components/ui/FileViwer";
import { Conversation, useMemberConversations } from "@/lib/hooks/usememberconversations";
import { useMemberConversationMessages } from "@/lib/hooks/usememberconversationmessages";
import StartConversationModal from "@/components/community/Startconversationmodal";

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

export default function MemberGroupChatPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [group, setGroup] = useState<MemberGroup | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showStartConversationModal, setShowStartConversationModal] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [viewerFile, setViewerFile] = useState<{ url: string; name: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { fetchGroup } = useMemberGroups();
  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    fetchConversations,
    startConversation,
  } = useMemberConversations();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    fetchMessages,
    sendMessage,
    clearMessages,
  } = useMemberConversationMessages();

  // Get current user ID from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userDataString = localStorage.getItem("user_data");
      
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          setCurrentUserId(userData.id);
        } catch (error) {
          console.error("Error parsing user_data:", error);
        }
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
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [clearMessages, filePreview]);

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
    } catch (error) {
      console.error("Error loading group data:", error);
      showErrorToast("Failed to load group data");
    } finally {
      setIsLoadingGroup(false);
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
      
      return senderId === currentUserId;
    },
    [currentUserId]
  );

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    
    if (imageExts.includes(ext)) {
      return <PhotoIcon className="h-8 w-8" />;
    }
    return <DocumentIcon className="h-8 w-8" />;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorToast("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      showErrorToast("File type not supported");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConversationClick = async (conversation: Conversation) => {
    if (selectedConversation?.id !== conversation.id) {
      clearMessages();
      handleRemoveFile();
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
    if ((!messageText.trim() && !selectedFile) || !selectedConversation || messagesLoading) return;

    if (messageText.trim().length > 0 && messageText.trim().length < 10) {
      showErrorToast("Message must be at least 10 characters long");
      return;
    }

    if (!messageText.trim() && !selectedFile) {
      showErrorToast("Please enter a message or attach a file");
      return;
    }

    try {
      const success = await sendMessage({
        conversation_id: selectedConversation.id,
        content: messageText.trim() || "Sent an attachment",
        attachment: selectedFile || undefined,
      });

      if (success) {
        setMessageText("");
        handleRemoveFile();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showErrorToast("Failed to send message");
    }
  };

  const handleStartConversation = async (params: any) => {
    const newConv = await startConversation(params);

    if (newConv) {
      setShowStartConversationModal(false);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
    handleRemoveFile();
    if (window.innerWidth < 768) {
      setShowSidebar(true);
    }
  };

  const getFileNameFromUrl = (url: string, messageId: number) => {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    return filename || `attachment-${messageId}`;
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
            onClick={() => router.push("/community/groups")}
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
      {/* Mobile Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - Conversations List */}
      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col transform transition-transform duration-300 ease-in-out
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:flex
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => router.push("/community/groups")}
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

          {/* Group Info Card */}
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

          {/* Action Buttons */}
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
              onClick={() => setShowStartConversationModal(true)}
              disabled={conversationsLoading}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008f82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
              <span className="text-sm">Start Topic</span>
            </button>
          </div>
        </div>

        {/* Error State */}
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

        {/* Conversations List */}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
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

            {/* Messages Error */}
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

            {/* Messages List */}
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
                                mt-1 rounded-lg shadow-sm max-w-[85%] md:max-w-[70%]
                                ${
                                  ownMessage
                                    ? "bg-[#00B5A5] text-white rounded-br-none"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-none"
                                }
                              `}
                              >
                                {message.file_url && (
                                  <div className="p-2">
                                    {message.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                      <img
                                        src={message.file_url}
                                        alt="Attachment"
                                        className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setViewerFile({
                                          url: message.file_url!,
                                          name: getFileNameFromUrl(message.file_url!, message.id)
                                        })}
                                      />
                                    ) : (
                                      <div
                                        onClick={() => setViewerFile({
                                          url: message.file_url!,
                                          name: getFileNameFromUrl(message.file_url!, message.id)
                                        })}
                                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                          ownMessage
                                            ? "bg-white/10 hover:bg-white/20"
                                            : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                      >
                                        <div className={`p-2 rounded-lg ${
                                          ownMessage ? "bg-white/20" : "bg-[#00B5A5]/10"
                                        }`}>
                                          {getFileIcon(getFileNameFromUrl(message.file_url!, message.id))}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-sm font-medium truncate ${
                                            ownMessage ? "text-white" : "text-gray-900 dark:text-white"
                                          }`}>
                                            {getFileNameFromUrl(message.file_url!, message.id)}
                                          </p>
                                          <p className={`text-xs ${
                                            ownMessage ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                                          }`}>
                                            Document
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {message.content && (
                                  <p className={`text-sm whitespace-pre-wrap ${message.file_url ? 'p-3 pt-0' : 'p-3'}`}>
                                    {message.content}
                                  </p>
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

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex flex-col items-center justify-center">
                        {getFileIcon(selectedFile.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      </div>
                      {filePreview && (
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Add a caption..."
                          rows={2}
                          className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-600 dark:text-white resize-none"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                />
                
                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={messagesLoading}
                    className="absolute left-3 bottom-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Attach file"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                  
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={
                      selectedFile && !filePreview
                        ? "Add a message (optional)..."
                        : "Type your message..."
                    }
                    rows={1}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    style={{ minHeight: "48px", maxHeight: "120px" }}
                    disabled={messagesLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    (!messageText.trim() && !selectedFile) ||
                    (messageText.trim().length > 0 && messageText.trim().length < 10 && !selectedFile) ||
                    messagesLoading
                  }
                  className="p-3 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008f82] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-2">
                {!selectedFile && `${messageText.trim().length}/10 characters minimum • `}
                Press Enter to send • Max file size: 10MB
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

      {/* Start Conversation Modal */}
      <StartConversationModal
        isOpen={showStartConversationModal}
        onClose={() => setShowStartConversationModal(false)}
        loading={conversationsLoading}
        onStartConversation={handleStartConversation}
        currentGroupId={group?.id ? parseInt(group.id) : undefined}
        currentGroupName={group?.name}
      />

      {/* File Viewer */}
      {viewerFile && (
        <FileViewer
          fileUrl={viewerFile.url}
          fileName={viewerFile.name}
          isOpen={!!viewerFile}
          onClose={() => setViewerFile(null)}
        />
      )}
    </div>
  );
}