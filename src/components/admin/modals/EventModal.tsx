"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, PhotoIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Event } from "@/lib/hooks/useEvents";

export interface EventFormData {
  title: string;
  description?: string;
  type: string;
  location: string;
  event_mode: "In-Person" | "Online" | "Hybrid";
  attendance_link?: string;
  event_link?: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  is_paid: boolean;
  price?: number;
  capacity: number;
  status?: "Scheduled" | "Ongoing" | "Completed" | "Cancelled" | "Draft";
  thumbnail?: File;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  event?: Event | null;
  loading?: boolean;
}

const EVENT_TYPES = [
  "Conference",
  "Workshop",
  "Training",
  "Webinar",
  "Seminar",
  "Meeting",
  "Other",
];

const EVENT_MODES = ["In-Person", "Online","Hybrid"] as const;

const EVENT_STATUSES = [
 "Draft",
 "Scheduled",
 "Ongoing",
 "Completed",
 "Cancelled"
] as const;

export function EventModal({
  isOpen,
  onClose,
  onSubmit,
  event,
  loading = false,
}: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    type: "Conference",
    location: "",
    event_mode: "In-Person",
    attendance_link: "",
    event_link: "",
    start_time: "",
    end_time: "",
    registration_deadline: "",
    is_paid: false,
    price: undefined,
    capacity: 100,
    status: "Scheduled",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      const formatDateTime = (dateString: string) => {
        try {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        } catch {
          return "";
        }
      };

      setFormData({
        title: event.title,
        description: event.description || "",
        type: event.type,
        location: event.location,
        event_mode: event.event_mode,
        attendance_link: event.attendance_link || "",
        event_link: event.event_link || "",
        start_time: formatDateTime(event.start_time),
        end_time: formatDateTime(event.end_time),
        registration_deadline: formatDateTime(event.registration_deadline || event.start_time),
        is_paid: event.is_paid,
        price: event.price,
        capacity: event.capacity,
        status: event.status,
      });
      if (event.thumbnail) {
        setThumbnailPreview(event.thumbnail);
      }
    } else {
      setFormData({
        title: "",
        description: "",
        type: "Conference",
        location: "",
        event_mode: "In-Person",
        attendance_link: "",
        event_link: "",
        start_time: "",
        end_time: "",
        registration_deadline: "",
        is_paid: false,
        price: undefined,
        capacity: 100,
        status: "Scheduled",
      });
      setThumbnailPreview("");
    }
    setErrors({});
    setClientErrors({});
  }, [event, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    // Location is only required for In-Person and Hybrid events
    if (formData.event_mode !== "Online" && !formData.location.trim()) {
      newErrors.location = "Location is required for in-person and hybrid events";
    }

    if (!formData.start_time) {
      newErrors.start_time = "Start date & time is required";
    }

    if (!formData.end_time) {
      newErrors.end_time = "End date & time is required";
    }

    if (!formData.registration_deadline) {
      newErrors.registration_deadline = "Registration deadline is required";
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      if (end <= start) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    if (formData.start_time && formData.registration_deadline) {
      const start = new Date(formData.start_time);
      const deadline = new Date(formData.registration_deadline);
      if (deadline > start) {
        newErrors.registration_deadline = "Registration deadline must be before event start time";
      }
    }

    if (formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    if (formData.is_paid && (!formData.price || formData.price <= 0)) {
      newErrors.price = "Price must be greater than 0 for paid events";
    }

    if (
      (formData.event_mode === "Online" || formData.event_mode === "Hybrid") &&
      !formData.attendance_link &&
      !formData.event_link
    ) {
      newErrors.attendance_link =
        "At least one link is required for online/hybrid events";
    }

    setClientErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});
    setClientErrors({});

    if (!validateForm()) {
      return;
    }

    const formatForAPI = (dateString: string) => {
      try {
        if (!dateString) return "";
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${month}/${day}/${year} ${hours}:${minutes}`;
      } catch {
        return dateString;
      }
    };

    const submissionData = {
      ...formData,
      // Clear location for online events
      location: formData.event_mode === "Online" ? "" : formData.location,
      start_time: formatForAPI(formData.start_time),
      end_time: formatForAPI(formData.end_time),
      registration_deadline: formatForAPI(formData.registration_deadline),
    };

    console.log("Submission data:", submissionData);

    const result = await onSubmit(submissionData);
    
    // If there are backend validation errors, display them
    if (result.errors) {
      setErrors(result.errors);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setClientErrors({ ...clientErrors, thumbnail: "File size must be less than 5MB" });
        return;
      }

      if (!file.type.startsWith("image/")) {
        setClientErrors({ ...clientErrors, thumbnail: "File must be an image" });
        return;
      }

      setFormData({ ...formData, thumbnail: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setClientErrors({ ...clientErrors, thumbnail: "" });
    }
  };

  const removeThumbnail = () => {
    setFormData({ ...formData, thumbnail: undefined });
    setThumbnailPreview("");
  };

  // Helper to get error message for a field
  const getFieldError = (fieldName: string): string | null => {
    // Check client-side errors first
    if (clientErrors[fieldName]) {
      return clientErrors[fieldName];
    }
    // Then check backend errors
    if (errors[fieldName] && errors[fieldName].length > 0) {
      return errors[fieldName][0];
    }
    return null;
  };

  // Helper to check if field has error
  const hasError = (fieldName: string): boolean => {
    return !!(clientErrors[fieldName] || (errors[fieldName] && errors[fieldName].length > 0));
  };

  // Helper to determine if location field should be shown
  const shouldShowLocation = () => {
    return formData.event_mode === "In-Person" || formData.event_mode === "Hybrid";
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={loading ? () => {} : onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl transition-all max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-gray-900 dark:text-white"
                    >
                      {event ? "Edit Event" : "Create New Event"}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {event
                        ? "Update event details and settings"
                        : "Fill in the details to create a new event"}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                {/* Global Error Message */}
                {Object.keys(errors).length > 0 && (
                  <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Please fix the following errors:
                        </h3>
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                          {Object.entries(errors).map(([field, messages]) => (
                            <li key={field}>
                              <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>{' '}
                              {messages[0]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="flex-1 overflow-y-auto p-6 space-y-6"
                >
                  {/* Thumbnail Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Event Thumbnail
                    </label>
                    {thumbnailPreview ? (
                      <div className="relative group">
                        <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                              Change
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={loading}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={removeThumbnail}
                              disabled={loading}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-[#00B5A5] dark:hover:border-[#00B5A5] transition-colors">
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                    )}
                    {getFieldError('thumbnail') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('thumbnail')}
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                        hasError('title')
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter event title"
                      disabled={loading}
                    />
                    {getFieldError('title') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('title')}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-colors ${
                        hasError('description')
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Describe your event..."
                      disabled={loading}
                    />
                    {getFieldError('description') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('description')}
                      </p>
                    )}
                  </div>

                  {/* Type and Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                        disabled={loading}
                      >
                        {EVENT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Event Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.event_mode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            event_mode: e.target.value as typeof EVENT_MODES[number],
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                        disabled={loading}
                      >
                        {EVENT_MODES.map((mode) => (
                          <option key={mode} value={mode}>
                            {mode}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location - Only show for In-Person and Hybrid */}
                  {shouldShowLocation() && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={shouldShowLocation()}
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                          hasError('location')
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter event location or venue"
                        disabled={loading}
                      />
                      {getFieldError('location') && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {getFieldError('location')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Virtual Links */}
                  {(formData.event_mode === "Online" ||
                    formData.event_mode === "Hybrid") && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-4">
                        Online Event Links {formData.event_mode === "Online" && <span className="text-red-500">*</span>}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attendance Link
                          </label>
                          <input
                            type="url"
                            value={formData.attendance_link}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                attendance_link: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                              hasError('attendance_link')
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                            placeholder="https://zoom.us/..."
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Event Link
                          </label>
                          <input
                            type="url"
                            value={formData.event_link}
                            onChange={(e) =>
                              setFormData({ ...formData, event_link: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="https://..."
                            disabled={loading}
                          />
                        </div>
                      </div>
                      {getFieldError('attendance_link') && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {getFieldError('attendance_link')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.start_time}
                        onChange={(e) =>
                          setFormData({ ...formData, start_time: e.target.value })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                          hasError('start_time')
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        disabled={loading}
                      />
                      {getFieldError('start_time') && (
                        <p className="mt-2 text-sm text-sm text-red-600 dark:text-red-400 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {getFieldError('start_time')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Date & Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.end_time}
                        onChange={(e) =>
                          setFormData({ ...formData, end_time: e.target.value })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                          hasError('end_time')
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        disabled={loading}
                      />
                      {getFieldError('end_time') && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {getFieldError('end_time')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Registration Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Registration Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.registration_deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, registration_deadline: e.target.value })
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                        hasError('registration_deadline')
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      disabled={loading}
                    />
                    {getFieldError('registration_deadline') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('registration_deadline')}
                      </p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_paid"
                        checked={formData.is_paid}
                        onChange={(e) =>
                          setFormData({ ...formData, is_paid: e.target.checked })
                        }
                        className="h-4 w-4 text-[#00B5A5] focus:ring-[#00B5A5] border-gray-300 rounded"
                        disabled={loading}
                      />
                      <label
                        htmlFor="is_paid"
                        className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        This is a paid event
                      </label>
                    </div>

                    {formData.is_paid && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Price (USD) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                            $
                          </span>
                          <input
                            type="number"
                            required={formData.is_paid}
                            min="0"
                            step="0.01"
                            value={formData.price || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: parseFloat(e.target.value),
                              })
                            }
                            className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                              hasError('price')
                                ? "border-red-500 dark:border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                            placeholder="0.00"
                            disabled={loading}
                          />
                        </div>
                        {getFieldError('price') && (
                          <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                            {getFieldError('price')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                        hasError('capacity')
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Maximum number of attendees"
                      disabled={loading}
                    />
                    {getFieldError('capacity') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('capacity')}
                      </p>
                    )}
                  </div>

                  {/* Status (edit mode only) */}
                  {event && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as typeof EVENT_STATUSES[number],
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                        disabled={loading}
                      >
                        {EVENT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </form>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {event ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>{event ? "Update Event" : "Create Event"}</>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}