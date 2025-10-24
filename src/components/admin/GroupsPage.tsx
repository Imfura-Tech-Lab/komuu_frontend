"use client";

import React, { useState } from "react";
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const groups = [
    {
      id: 1,
      name: "Digital Forensics Enthusiasts",
      description: "Community for digital forensics professionals and enthusiasts",
      members: 156,
      category: "Professional",
      privacy: "Public",
      activity: "High",
    },
    {
      id: 2,
      name: "Crime Scene Photography",
      description: "Sharing best practices in forensic photography",
      members: 89,
      category: "Special Interest",
      privacy: "Public",
      activity: "Medium",
    },
    {
      id: 3,
      name: "Ballistics Experts",
      description: "Discussion and knowledge sharing on ballistics analysis",
      members: 67,
      category: "Professional",
      privacy: "Private",
      activity: "Medium",
    },
    {
      id: 4,
      name: "New Members",
      description: "Welcome group for new AFSA members",
      members: 234,
      category: "General",
      privacy: "Public",
      activity: "High",
    },
  ];

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Groups
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage member groups and communities
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Group
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Groups</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {groups.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {groups.reduce((sum, group) => sum + group.members, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Public Groups</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {groups.filter((g) => g.privacy === "Public").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">High Activity</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {groups.filter((g) => g.activity === "High").length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white">
            <option>All Categories</option>
            <option>Professional</option>
            <option>Special Interest</option>
            <option>General</option>
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start justify-between">
              <div className="bg-[#00B5A5] p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              {group.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {group.description}
            </p>

            <div className="mt-4 flex items-center space-x-4 text-sm">
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                {group.members} members
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  group.privacy === "Public"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {group.privacy}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {group.category}
              </span>
              <span
                className={`text-xs font-medium ${
                  group.activity === "High"
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {group.activity} Activity
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No groups found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}