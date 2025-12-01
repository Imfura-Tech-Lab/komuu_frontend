"use client";

import React, { useState, useEffect } from "react";
import {
  VideoCameraIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useEvents, Event } from "@/lib/hooks/useEvents";
import { EventFormData, EventModal } from "./modals/EventModal";
import { DeleteConfirmModal } from "./modals/DeleteConfirmModal";

// ============================================================================
// SKELETON LOADERS
// ============================================================================

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const EventCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="h-2 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
    </div>
  </div>
);

const EventsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
      <EventCardSkeleton key={i} />
    ))}
  </div>
);

// ============================================================================
// EVENT CARD COMPONENT
// ============================================================================

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      Conference: "bg-purple-500",
      Workshop: "bg-blue-500",
      Training: "bg-green-500",
      Webinar: "bg-orange-500",
      Seminar: "bg-pink-500",
      Meeting: "bg-indigo-500",
      Other: "bg-gray-500",
    };
    return colors[type] || "bg-gray-500";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Scheduled:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      Ongoing:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      Completed:
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      Cancelled:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      Draft:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    };
    return colors[status] || colors.Scheduled;
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "Online":
        return <GlobeAltIcon className="h-4 w-4" />;
      case "In-Person":
        return <BuildingOfficeIcon className="h-4 w-4" />;
      case "Hybrid":
        return (
          <>
            <BuildingOfficeIcon className="h-4 w-4" />
            <GlobeAltIcon className="h-4 w-4" />
          </>
        );
      default:
        return <MapPinIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const attendancePercentage = event.capacity
    ? ((event.attendees_count || 0) / event.capacity) * 100
    : 0;

  return (
    <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Color bar */}
      <div className={`h-2 ${getEventColor(event.type)}`}></div>

      {/* Thumbnail */}
      {event.thumbnail && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                event.status
              )}`}
            >
              {event.status}
            </span>
            {event.is_paid && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                <CurrencyDollarIcon className="h-3 w-3" />
                ${event.price}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {!event.thumbnail && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    event.status
                  )}`}
                >
                  {event.status}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {event.type}
                </span>
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
              {event.title}
            </h3>
          </div>

          {/* Actions dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>

            {showActions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
                  <button
                    onClick={() => {
                      onEdit(event);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4 mr-3" />
                    Edit Event
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={() => {
                      onDelete(event);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4 mr-3" />
                    Delete Event
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {formatDate(event.start_time)} · {formatTime(event.start_time)}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1 mr-2">
              {getModeIcon(event.event_mode)}
            </div>
            <span className="truncate">
              {event.event_mode} · {event.location}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {event.attendees_count || 0} / {event.capacity} attendees
            </span>
          </div>
        </div>

        {/* Attendance Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Attendance</span>
            <span>{Math.round(attendancePercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                attendancePercentage >= 90
                  ? "bg-red-500"
                  : attendancePercentage >= 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {event.organizer && `By ${event.organizer}`}
          </span>
          <button className="text-[#00B5A5] hover:text-[#008F82] text-sm font-medium transition-colors">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN EVENTS PAGE COMPONENT
// ============================================================================

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
  };

  const handleCreateEvent = async (formData: EventFormData) => {
    setModalLoading(true);
    const result = await createEvent({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      location: formData.location,
      event_mode: formData.event_mode,
      attendance_link: formData.attendance_link,
      event_link: formData.event_link,
      start_time: formData.start_time,
      end_time: formData.end_time,
      registration_deadline: formData.registration_deadline,
      is_paid: formData.is_paid,
      price: formData.price,
      capacity: formData.capacity,
      thumbnail: formData.thumbnail,
    });
    setModalLoading(false);

    if (result.success) {
      setShowCreateModal(false);
    }

    return result;
  };

  const handleUpdateEvent = async (formData: EventFormData) => {
    if (!selectedEvent) return { success: false, errors: {} };

    setModalLoading(true);
    const result = await updateEvent({
      id: selectedEvent.id,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      location: formData.location,
      event_mode: formData.event_mode,
      attendance_link: formData.attendance_link,
      event_link: formData.event_link,
      start_time: formData.start_time,
      end_time: formData.end_time,
      registration_deadline: formData.registration_deadline,
      is_paid: formData.is_paid,
      price: formData.price,
      capacity: formData.capacity,
      status: formData.status,
      thumbnail: formData.thumbnail,
    });
    setModalLoading(false);

    if (result.success) {
      setShowEditModal(false);
      setSelectedEvent(null);
    }

    return result;
  };

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    setModalLoading(true);
    const success = await deleteEvent(selectedEvent.id);
    setModalLoading(false);

    if (success) {
      setShowDeleteModal(false);
      setSelectedEvent(null);
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      typeFilter === "all" ||
      event.type.toLowerCase() === typeFilter.toLowerCase();

    if (activeTab === "upcoming") {
      return (
        matchesSearch &&
        matchesType &&
        (event.status === "Scheduled" || event.status === "Ongoing")
      );
    }

    if (activeTab === "past") {
      return (
        matchesSearch &&
        matchesType &&
        (event.status === "Completed" || event.status === "Cancelled")
      );
    }

    return matchesSearch && matchesType;
  });

  const upcomingEvents = events.filter(
    (e) => e.status === "Scheduled" || e.status === "Ongoing"
  );
  const pastEvents = events.filter(
    (e) => e.status === "Completed" || e.status === "Cancelled"
  );

  const totalAttendees = upcomingEvents.reduce(
    (sum, event) => sum + (event.attendees_count || 0),
    0
  );

  const availableSeats = upcomingEvents.reduce(
    (sum, event) => sum + (event.capacity - (event.attendees_count || 0)),
    0
  );

  const eventTypes = Array.from(new Set(events.map((e) => e.type))).sort();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8 p-6 sm:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Events & Conferences
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Manage and organize community events
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <ArrowPathIcon
              className={`h-5 w-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-5 py-2.5 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors shadow-md text-sm font-medium"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading && !isRefreshing ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upcoming Events
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {upcomingEvents.length}
              </p>
            </div>
            <CalendarIcon className="h-10 w-10 text-[#00B5A5]/60 dark:text-[#00B5A5]/40" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Attendees
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalAttendees.toLocaleString()}
              </p>
            </div>
            <UserGroupIcon className="h-10 w-10 text-blue-500/60 dark:text-blue-400/40" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available Seats
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {availableSeats.toLocaleString()}
              </p>
            </div>
            <ClockIcon className="h-10 w-10 text-green-500/60 dark:text-green-400/40" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Past Events
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {pastEvents.length}
              </p>
            </div>
            <VideoCameraIcon className="h-10 w-10 text-purple-500/60 dark:text-purple-400/40" />
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title, type, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white w-full md:w-auto transition-colors"
            >
              <option value="all">All Types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "upcoming", label: "Upcoming", count: upcomingEvents.length },
            { id: "past", label: "Past", count: pastEvents.length },
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
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="p-6">
          {loading && !isRefreshing ? (
            <EventsGridSkeleton />
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <VideoCameraIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                No events found
              </h3>
              <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                {events.length === 0
                  ? "Create your first event to get started."
                  : "Try adjusting your search or filters."}
              </p>
              {events.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#00B5A5] hover:bg-[#008F82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5]"
                  >
                    <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                    Create Event
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
        loading={modalLoading}
      />

      <EventModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleUpdateEvent}
        event={selectedEvent}
        loading={modalLoading}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedEvent(null);
        }}
        onConfirm={handleDeleteConfirm}
        eventTitle={selectedEvent?.title || ""}
        loading={modalLoading}
      />
    </div>
  );
}