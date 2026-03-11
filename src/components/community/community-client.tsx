"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  NewspaperIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  UsersIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isJoined: boolean;
}

interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  attendees: number;
  type: string;
}

export default function CommunityClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const featuredGroups: CommunityGroup[] = [
    {
      id: "1",
      name: "Forensic Pathology",
      description: "Connect with fellow forensic pathology professionals",
      memberCount: 156,
      category: "Specialization",
      isJoined: true,
    },
    {
      id: "2",
      name: "Digital Forensics",
      description: "Discussions on cybersecurity and digital evidence",
      memberCount: 234,
      category: "Specialization",
      isJoined: false,
    },
    {
      id: "3",
      name: "Research & Publications",
      description: "Collaborate on research papers and publications",
      memberCount: 89,
      category: "Interest",
      isJoined: true,
    },
  ];

  const upcomingEvents: CommunityEvent[] = [
    {
      id: "1",
      title: "Monthly Webinar: Advances in DNA Analysis",
      date: "2024-02-15",
      attendees: 45,
      type: "Webinar",
    },
    {
      id: "2",
      title: "Regional Meetup - East Africa",
      date: "2024-02-20",
      attendees: 28,
      type: "Meetup",
    },
    {
      id: "3",
      title: "Workshop: Expert Witness Testimony",
      date: "2024-03-01",
      attendees: 62,
      type: "Workshop",
    },
  ];

  const stats = [
    { label: "Total Members", value: "1,234", icon: UsersIcon },
    { label: "Active Groups", value: "24", icon: UserGroupIcon },
    { label: "Countries", value: "45", icon: GlobeAltIcon },
    { label: "Discussions", value: "567", icon: ChatBubbleLeftRightIcon },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Community
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Connect with fellow AFSA members across Africa
          </p>
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full md:w-80 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#00B5A5]/10 rounded-lg">
                <stat.icon className="h-6 w-6 text-[#00B5A5]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/community/groups"
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-[#00B5A5] dark:hover:border-[#00B5A5] transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-[#00B5A5] transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
            Browse Groups
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Join specialized groups based on your interests
          </p>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
            Discussions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Participate in community discussions
          </p>
          <span className="inline-block mt-3 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <NewspaperIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
            Member Directory
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Find and connect with other members
          </p>
          <span className="inline-block mt-3 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Groups */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Featured Groups
            </h2>
            <Link
              href="/community/groups"
              className="text-sm text-[#00B5A5] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {featuredGroups.map((group) => (
              <div key={group.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {group.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {group.memberCount} members
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {group.category}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      group.isJoined
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        : "bg-[#00B5A5] text-white hover:bg-[#008F82]"
                    }`}
                  >
                    {group.isJoined ? "Joined" : "Join"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Community Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Community Events
            </h2>
            <Link
              href="/my-events"
              className="text-sm text-[#00B5A5] hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#00B5A5]/10 rounded-lg flex items-center justify-center">
                    <CalendarDaysIcon className="h-6 w-6 text-[#00B5A5]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {event.attendees} attending
                      </span>
                    </div>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {event.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
