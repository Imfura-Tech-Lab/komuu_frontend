"use client";

import React, { useState } from "react";
import {
  VideoCameraIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function CommunityEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const events = [
    {
      id: 1,
      title: "Annual Forensic Science Conference 2025",
      date: "2025-11-15",
      time: "09:00 AM - 05:00 PM",
      location: "Kigali Convention Centre",
      type: "Conference",
      attendees: 342,
      capacity: 500,
      status: "upcoming",
      isRegistered: true,
    },
    {
      id: 2,
      title: "Digital Evidence Workshop",
      date: "2025-11-08",
      time: "02:00 PM - 04:00 PM",
      location: "Online (Zoom)",
      type: "Workshop",
      attendees: 89,
      capacity: 100,
      status: "upcoming",
      isRegistered: false,
    },
    {
      id: 3,
      title: "Crime Scene Investigation Training",
      date: "2025-11-20",
      time: "10:00 AM - 03:00 PM",
      location: "Training Center, Kigali",
      type: "Training",
      attendees: 45,
      capacity: 50,
      status: "upcoming",
      isRegistered: false,
    },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "upcoming") return matchesSearch && event.status === "upcoming";
    if (activeTab === "registered") return matchesSearch && event.isRegistered;
    
    return matchesSearch;
  });

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      Conference: "bg-purple-500",
      Workshop: "bg-blue-500",
      Training: "bg-green-500",
      Webinar: "bg-orange-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Events & Conferences
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Discover and register for upcoming events
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Events</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {events.filter((e) => e.status === "upcoming").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Your Registrations</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {events.filter((e) => e.isRegistered).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Events Attended</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white">
              <option>All Types</option>
              <option>Conference</option>
              <option>Workshop</option>
              <option>Training</option>
              <option>Webinar</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4 px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "upcoming", label: "Upcoming" },
            { id: "registered", label: "My Registrations" },
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

        {/* Events Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className={`h-2 ${getEventColor(event.type)}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {event.type}
                    </span>
                    {event.isRegistered && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Registered
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </h3>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" · "}
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      {event.attendees} / {event.capacity} attendees
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    {event.isRegistered ? (
                      <>
                        <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          View Details
                        </button>
                        <button className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button className="w-full px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors">
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <VideoCameraIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No events found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Check back later for upcoming events
          </p>
        </div>
      )}
    </div>
  );
}
