"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  LinkIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  TicketIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useEvents, Event } from "@/lib/hooks/useEvents";
import { EventModal, EventFormData } from "@/components/admin/modals/EventModal";
import { useRoleAccess } from "@/lib/hooks/useRoleAccess";

interface EventDetailClientProps {
  eventId: string;
}

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  const router = useRouter();
  const { fetchEvent, updateEvent, deleteEvent, eventTypes, eventStatuses, fetchEventTypes, fetchEventStatuses, loading } = useEvents();
  const { hasRole } = useRoleAccess();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = hasRole("Administrator") || hasRole("President") || hasRole("Board");

  useEffect(() => {
    const loadEvent = async () => {
      setIsLoading(true);
      const eventData = await fetchEvent(eventId);
      setEvent(eventData);
      setIsLoading(false);
    };
    loadEvent();
    fetchEventTypes();
    fetchEventStatuses();
  }, [eventId, fetchEvent, fetchEventTypes, fetchEventStatuses]);

  const handleRefresh = async () => {
    setIsLoading(true);
    const eventData = await fetchEvent(eventId);
    setEvent(eventData);
    setIsLoading(false);
  };

  const handleEdit = async (formData: EventFormData) => {
    if (!event) return { success: false };
    const result = await updateEvent({
      id: event.id,
      ...formData,
    });
    if (result.success) {
      await handleRefresh();
      setShowEditModal(false);
    }
    return result;
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    const success = await deleteEvent(event.id);
    if (success) {
      router.push("/events");
    }
    setIsDeleting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "Ongoing":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getEventModeIcon = (mode: string) => {
    switch (mode) {
      case "Online":
        return <VideoCameraIcon className="h-5 w-5" />;
      case "In-Person":
        return <MapPinIcon className="h-5 w-5" />;
      case "Hybrid":
        return <GlobeAltIcon className="h-5 w-5" />;
      default:
        return <MapPinIcon className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl mb-6"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Event Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/events")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/events")}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Events
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="h-5 w-5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Event Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Thumbnail */}
          {event.thumbnail && (
            <div className="relative h-72 md:h-96 w-full">
              <Image
                src={event.thumbnail}
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white mt-3">
                  {event.title}
                </h1>
              </div>
            </div>
          )}

          {/* Content without thumbnail */}
          {!event.thumbnail && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-3">
                {event.title}
              </h1>
            </div>
          )}

          {/* Event Details */}
          <div className="p-6 md:p-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <CalendarIcon className="h-5 w-5" />
                  <span className="text-sm">Date</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(event.start_time)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <ClockIcon className="h-5 w-5" />
                  <span className="text-sm">Time</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  {getEventModeIcon(event.event_mode)}
                  <span className="text-sm">Mode</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {event.event_mode}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                  <UserGroupIcon className="h-5 w-5" />
                  <span className="text-sm">Capacity</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {event.attendees_count || 0} / {event.capacity}
                </p>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  About This Event
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                  <MapPinIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Location</h3>
                  <p className="text-gray-600 dark:text-gray-400">{event.location}</p>
                </div>
              </div>

              {/* Event Type */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <TicketIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Event Type</h3>
                  <p className="text-gray-600 dark:text-gray-400">{event.type}</p>
                </div>
              </div>

              {/* Registration Deadline */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Registration Deadline</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(event.registration_deadline)} at {formatTime(event.registration_deadline)}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Price</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {event.is_paid ? `$${event.price}` : "Free"}
                  </p>
                </div>
              </div>
            </div>

            {/* Links */}
            {(event.attendance_link || event.event_link) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Event Links
                </h2>
                <div className="flex flex-wrap gap-4">
                  {event.attendance_link && (
                    <a
                      href={event.attendance_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <VideoCameraIcon className="h-5 w-5" />
                      Join Event
                    </a>
                  )}
                  {event.event_link && (
                    <a
                      href={event.event_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LinkIcon className="h-5 w-5" />
                      Event Website
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Registration CTA for Members */}
            {!isAdmin && event.status === "Scheduled" && (
              <div className="mt-8 p-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Ready to Join?</h3>
                    <p className="text-teal-100">
                      Register now to secure your spot at this event.
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors">
                    <CheckBadgeIcon className="h-5 w-5" />
                    Register Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isAdmin && (
        <EventModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEdit}
          event={event}
          loading={loading}
          eventTypes={eventTypes}
          eventStatuses={eventStatuses}
        />
      )}
    </div>
  );
}
