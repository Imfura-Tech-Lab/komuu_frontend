"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  VideoCameraIcon,
  FolderIcon,
  FireIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function CommunityPage() {
  const router = useRouter();

  const sections = [
    {
      title: "Conversations",
      description: "Join discussions and share knowledge",
      icon: ChatBubbleLeftRightIcon,
      href: "/community/conversations",
      color: "bg-green-500",
      stats: { label: "Active Topics", value: "156" },
    },
    {
      title: "Groups",
      description: "Connect with members who share your interests",
      icon: UserGroupIcon,
      href: "/community/groups",
      color: "bg-purple-500",
      stats: { label: "Available Groups", value: "24" },
    },
    {
      title: "Events/Conferences",
      description: "Attend upcoming events and conferences",
      icon: VideoCameraIcon,
      href: "/community/events",
      color: "bg-orange-500",
      stats: { label: "Upcoming Events", value: "8" },
    },
    {
      title: "Resources",
      description: "Access shared documents and materials",
      icon: FolderIcon,
      href: "/community/resources",
      color: "bg-teal-500",
      stats: { label: "Resources Available", value: "342" },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Community
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Connect, learn, and grow with fellow forensic science professionals
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00B5A5] to-[#008F82] rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome to the Community!</h2>
            <p className="mt-2 text-teal-100">
              Engage with 1,247 members, join discussions, and stay updated with the latest in forensic science.
            </p>
          </div>
          <UserGroupIcon className="h-20 w-20 opacity-50" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">1,247</p>
            </div>
            <UserIcon className="h-12 w-12 text-[#00B5A5]" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Online Now</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">84</p>
            </div>
            <FireIcon className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your Groups</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">5</p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-[#00B5A5]" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Events Attended</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <VideoCameraIcon className="h-12 w-12 text-[#00B5A5]" />
          </div>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.href}
              onClick={() => router.push(section.href)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 text-left group"
            >
              <div className="flex items-start justify-between">
                <div className={`${section.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {section.stats.label}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#00B5A5] transition-colors">
                {section.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {section.description}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {section.stats.value}
                </span>
                <svg
                  className="h-5 w-5 text-gray-400 group-hover:text-[#00B5A5] transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Community Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                type: "conversation",
                message: "New discussion: Best Practices for Digital Evidence",
                author: "Dr. Sarah Johnson",
                time: "10 minutes ago",
              },
              {
                type: "group",
                message: "You were added to 'DNA Analysis Experts' group",
                author: "System",
                time: "1 hour ago",
              },
              {
                type: "event",
                message: "Reminder: Annual Conference starts in 3 days",
                author: "Events Team",
                time: "2 hours ago",
              },
              {
                type: "resource",
                message: "New resource: Forensic Standards Update 2025",
                author: "Admin Team",
                time: "1 day ago",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-[#00B5A5] rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.author} · {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
