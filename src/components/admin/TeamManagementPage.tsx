"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  UserCircleIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

export default function TeamManagementPage() {
  const router = useRouter();

  const sections = [
    {
      title: "Teams",
      description: "Manage organizational teams and structures",
      icon: UserCircleIcon,
      href: "/team/teams",
      color: "bg-blue-500",
      stats: { label: "Active Teams", value: "12" },
    },
    {
      title: "Groups",
      description: "Manage member groups and communities",
      icon: UserGroupIcon,
      href: "/team/groups",
      color: "bg-purple-500",
      stats: { label: "Total Groups", value: "24" },
    },
    {
      title: "Conversations",
      description: "Manage discussions and forums",
      icon: ChatBubbleLeftRightIcon,
      href: "/team/conversations",
      color: "bg-green-500",
      stats: { label: "Active Threads", value: "156" },
    },
    {
      title: "Events/Conferences",
      description: "Manage events and conferences",
      icon: VideoCameraIcon,
      href: "/team/events",
      color: "bg-orange-500",
      stats: { label: "Upcoming Events", value: "8" },
    },
    {
      title: "Resources",
      description: "Manage shared resources and documents",
      icon: FolderIcon,
      href: "/team/resources",
      color: "bg-teal-500",
      stats: { label: "Total Resources", value: "342" },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Team Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage community activities, teams, and engagement
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">1,247</p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-[#00B5A5]" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">342</p>
            </div>
            <UserCircleIcon className="h-12 w-12 text-[#00B5A5]" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Engagement Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">87%</p>
            </div>
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-[#00B5A5]" />
          </div>
        </div>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                type: "team",
                message: "New team 'Forensic AI Research' created",
                time: "2 hours ago",
              },
              {
                type: "group",
                message: "5 new members joined 'Digital Forensics' group",
                time: "4 hours ago",
              },
              {
                type: "event",
                message: "Upcoming: Annual Forensics Conference",
                time: "1 day ago",
              },
              {
                type: "resource",
                message: "New resource uploaded: 'Best Practices Guide 2025'",
                time: "2 days ago",
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
                    {activity.time}
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