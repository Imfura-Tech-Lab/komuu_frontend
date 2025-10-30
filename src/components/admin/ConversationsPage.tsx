"use client";

import React, { useState, useEffect } from "react";
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FireIcon,
  ClockIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  XMarkIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { useConversations } from "@/lib/hooks/useConversations";
import type { CreateConversationParams } from "@/lib/hooks/useConversations";
import { showErrorToast } from "../layouts/auth-layer-out";

// Skeleton Loader Components
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse"
      >
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    ))}
  </div>
);

const ConversationSkeleton = () => (
  <div className="p-6 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
        </div>
        <div className="mt-2 flex items-center space-x-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
        </div>
        <div className="mt-3 flex items-center space-x-6">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg ml-4"></div>
    </div>
  </div>
);

const ConversationsListSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {[...Array(5)].map((_, i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    group_id: undefined as number | undefined,
    title: "",
    type: "",
    content: "",
  });

  const {
    conversations,
    stats,
    conversationTypes,
    conversationGroups,
    loading,
    error,
    fetchConversations,
    fetchConversationTypes,
    fetchConversationGroups,
    createConversation,
    deleteConversation,
  } = useConversations();

  // Fetch conversations, types, and groups on mount
  useEffect(() => {
    fetchConversations();
    fetchConversationTypes();
    fetchConversationGroups();
  }, [fetchConversations, fetchConversationTypes, fetchConversationGroups]);

  // Set default type when types are loaded
  useEffect(() => {
    if (conversationTypes.length > 0 && !formData.type) {
      setFormData((prev) => ({
        ...prev,
        type: conversationTypes[0].slug,
      }));
    }
  }, [conversationTypes, formData.type]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActionMenuOpen(null);
    if (actionMenuOpen !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [actionMenuOpen]);

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Format relative time
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Handle delete with confirmation
  const handleDelete = async (id: number, title: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      await deleteConversation(id);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await fetchConversations();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !formData.type) {
      showErrorToast("Please fill in all required fields");
      return;
    }

    const params: CreateConversationParams = {
      group_id: formData.group_id,
      title: formData.title,
      type: formData.type,
      content: formData.content,
      attachment: selectedFile || undefined,
    };

    const result = await createConversation(params);

    if (result) {
      // Reset form
      setFormData({
        group_id: undefined,
        title: "",
        type: conversationTypes[0]?.slug || "",
        content: "",
      });
      setSelectedFile(null);
      setShowCreateModal(false);
    }
  };

  // Reset form when modal closes
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      group_id: undefined,
      title: "",
      type: conversationTypes[0]?.slug || "",
      content: "",
    });
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Conversations
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage community discussions and forums
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh conversations"
          >
            <ArrowPathIcon
              className={`h-5 w-5 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Topic
          </button>
        </div>
      </div>

      {/* Error Alert - Shows above content if there's an error */}
      {error && conversations.length === 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">
              Failed to load conversations. Please try again.
            </p>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="ml-4 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Show skeleton loaders when loading and no data */}
      {loading && conversations.length === 0 && !error ? (
        <>
          <StatsSkeleton />
          <ConversationsListSkeleton />
        </>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Topics
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total_topics || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Replies
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total_replies || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Views
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.total_views?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Today
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.active_today || 0}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        {conversation.is_pinned && (
                          <CheckBadgeIcon className="h-5 w-5 text-[#00B5A5]" />
                        )}
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-[#00B5A5] transition-colors">
                          {conversation.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            conversation.status === "open"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {conversation.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>by {conversation.author}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {conversation.category}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          {conversation.replies} replies
                        </span>
                        <span className="flex items-center">
                          <FireIcon className="h-4 w-4 mr-1" />
                          {conversation.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatTimeAgo(conversation.last_activity)}
                        </span>
                      </div>
                    </div>

                    {/* Action Menu */}
                    <div className="relative ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuOpen(
                            actionMenuOpen === conversation.id
                              ? null
                              : conversation.id
                          );
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>

                      {actionMenuOpen === conversation.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(conversation.id, conversation.title);
                              setActionMenuOpen(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center rounded-lg"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredConversations.length === 0 && !error && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No conversations found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search or create a new conversation
              </p>
            </div>
          )}
        </>
      )}

      {/* Create Conversation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Conversation
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateConversation} className="p-6 space-y-4">
              {/* Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group (Optional)
                </label>
                <select
                  value={formData.group_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      group_id: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a group (optional)</option>
                  {conversationGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.total_members || 0} members)
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter conversation title"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {conversationTypes.length === 0 ? (
                    <option value="">Loading types...</option>
                  ) : (
                    conversationTypes.map((type) => (
                      <option key={type.id} value={type.slug}>
                        {type.name}
                      </option>
                    ))
                  )}
                </select>
                {conversationTypes.length > 0 && formData.type && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {conversationTypes.find((t) => t.slug === formData.type)?.description}
                  </p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter conversation content"
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attachment (Optional)
                </label>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <PaperClipIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Choose File
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || conversationTypes.length === 0}
                  className="px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Conversation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}