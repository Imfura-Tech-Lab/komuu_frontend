"use client";

import React, { useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FireIcon,
  ClockIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export default function ConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const conversations = [
    {
      id: 1,
      title: "Best Practices for Digital Evidence Collection",
      author: "Dr. Sarah Johnson",
      replies: 45,
      views: 1234,
      lastActivity: "2 hours ago",
      category: "Digital Forensics",
      status: "open",
      isPinned: true,
    },
    {
      id: 2,
      title: "Upcoming Changes to Forensic Standards",
      author: "Admin Team",
      replies: 28,
      views: 892,
      lastActivity: "5 hours ago",
      category: "Announcements",
      status: "open",
      isPinned: true,
    },
    {
      id: 3,
      title: "DNA Analysis Software Recommendations",
      author: "Dr. Emily Chen",
      replies: 67,
      views: 2156,
      lastActivity: "1 day ago",
      category: "DNA Analysis",
      status: "open",
      isPinned: false,
    },
    {
      id: 4,
      title: "Career Advice for New Forensic Scientists",
      author: "Michael Brown",
      replies: 89,
      views: 3421,
      lastActivity: "2 days ago",
      category: "Career Development",
      status: "open",
      isPinned: false,
    },
    {
      id: 5,
      title: "Crime Scene Photography Equipment",
      author: "John Smith",
      replies: 34,
      views: 876,
      lastActivity: "3 days ago",
      category: "Equipment",
      status: "closed",
      isPinned: false,
    },
  ];

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pinned") return matchesSearch && conv.isPinned;
    if (activeTab === "open") return matchesSearch && conv.status === "open";
    if (activeTab === "closed")
      return matchesSearch && conv.status === "closed";

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Conversations
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage community discussions and forums
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Topic
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Topics
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {conversations.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Replies
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {conversations.reduce((sum, conv) => sum + conv.replies, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Views
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {conversations
              .reduce((sum, conv) => sum + conv.views, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Active Today
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
        </div>
      </div>

      {/* Search and Tabs */}
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

        <div className="flex space-x-4 px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "all", label: "All" },
            { id: "pinned", label: "Pinned" },
            { id: "open", label: "Open" },
            { id: "closed", label: "Closed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#00B5A5] text-[#00B5A5]"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {conversation.isPinned && (
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
                      {conversation.lastActivity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No conversations found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}