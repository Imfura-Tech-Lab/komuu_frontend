"use client";

import React, { useState } from "react";
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FireIcon,
  ClockIcon,
  HandThumbUpIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

export default function CommunityConversationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const conversations = [
    {
      id: 1,
      title: "Best Practices for Digital Evidence Collection",
      author: "Dr. Sarah Johnson",
      replies: 45,
      likes: 89,
      views: 1234,
      lastActivity: "2 hours ago",
      category: "Digital Forensics",
      isHot: true,
      excerpt: "Looking for community input on the latest standards...",
    },
    {
      id: 2,
      title: "Career Advice for New Forensic Scientists",
      author: "Michael Brown",
      replies: 89,
      likes: 156,
      views: 3421,
      lastActivity: "5 hours ago",
      category: "Career Development",
      isHot: true,
      excerpt: "What advice would you give to someone starting out?",
    },
    {
      id: 3,
      title: "DNA Analysis Software Recommendations",
      author: "Dr. Emily Chen",
      replies: 67,
      likes: 78,
      views: 2156,
      lastActivity: "1 day ago",
      category: "DNA Analysis",
      isHot: false,
      excerpt: "Which software do you recommend for DNA analysis?",
    },
    {
      id: 4,
      title: "Crime Scene Photography Equipment",
      author: "John Smith",
      replies: 34,
      likes: 45,
      views: 876,
      lastActivity: "2 days ago",
      category: "Equipment",
      isHot: false,
      excerpt: "Discussion about the best cameras and lighting...",
    },
    {
      id: 5,
      title: "Attending International Forensics Conference",
      author: "Admin Team",
      replies: 23,
      likes: 67,
      views: 543,
      lastActivity: "3 days ago",
      category: "Events",
      isHot: false,
      excerpt: "Who's planning to attend? Let's coordinate!",
    },
  ];

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "hot") return matchesSearch && conv.isHot;
    if (activeTab === "my") return matchesSearch; // Filter by user's topics
    
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
            Join discussions and share knowledge with the community
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          Start Discussion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Topics</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {conversations.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Your Posts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Replies Received</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">34</p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex space-x-4 px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "all", label: "All Discussions" },
            { id: "hot", label: "🔥 Hot Topics" },
            { id: "my", label: "My Topics" },
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
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-[#00B5A5] flex items-center justify-center text-white font-bold">
                    {conversation.author.charAt(0)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    {conversation.isHot && (
                      <FireIcon className="h-5 w-5 text-orange-500" />
                    )}
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-[#00B5A5] transition-colors">
                      {conversation.title}
                    </h3>
                  </div>

                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                    {conversation.excerpt}
                  </p>

                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>by <span className="font-medium">{conversation.author}</span></span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {conversation.category}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-1" />
                      {conversation.replies} replies
                    </span>
                    <span className="flex items-center">
                      <HandThumbUpIcon className="h-4 w-4 mr-1" />
                      {conversation.likes} likes
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
            No discussions found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or start a new discussion
          </p>
          <button className="mt-4 px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors">
            Start Discussion
          </button>
        </div>
      )}
    </div>
  );
}