import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: string;
  location: string;
  event_mode: "In-Person" | "Online" | "Hybrid";
  attendance_link?: string;
  event_link?: string;
  start_time: string;
  end_time: string;
  is_paid: boolean;
  price?: number;
  capacity: number;
  registration_deadline: string;
  attendees_count?: number;
  status: "Scheduled" | "Ongoing" | "Completed" | "Cancelled" | "Draft";
  thumbnail?: string;
  organizer?: string;
  created_at: string;
  updated_at?: string;
}

interface CreateEventParams {
  title: string;
  description?: string;
  type: string;
  location: string;
  event_mode: "In-Person" | "Online" | "Hybrid";
  attendance_link?: string;
  event_link?: string;
  start_time: string;
  end_time: string;
  is_paid: boolean;
  registration_deadline: string;
  price?: number;
  capacity: number;
  thumbnail?: File;
}

interface UpdateEventParams extends CreateEventParams {
  id: string;
  status?: "Scheduled" | "Ongoing" | "Completed" | "Cancelled" | "Draft";
}

interface EventApiResponse {
  status: string;
  message?: string;
  data?: Event | Event[] | { data: Event[] };
  errors?: Record<string, string[]>;
}

interface UseEventsReturn {
  events: Event[];
  eventTypes: string[];
  eventStatuses: string[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchEvent: (id: string) => Promise<Event | null>;
  fetchEventTypes: () => Promise<void>;
  fetchEventStatuses: () => Promise<void>;
  createEvent: (params: CreateEventParams) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  updateEvent: (params: UpdateEventParams) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  deleteEvent: (id: string) => Promise<boolean>;
}

function mapEventData(event: Record<string, unknown>): Event {
  return {
    id: event.id as string,
    title: event.title as string,
    description: event.description as string | undefined,
    type: event.type as string,
    location: event.location as string,
    event_mode: event.event_mode as "In-Person" | "Online" | "Hybrid",
    attendance_link: event.attendance_link as string | undefined,
    event_link: event.event_link as string | undefined,
    start_time: event.start_time as string,
    end_time: (event.end_time || event.start_end) as string,
    is_paid: event.is_paid === 1 || event.is_paid === true,
    price: event.price as number | undefined,
    capacity: event.capacity as number,
    registration_deadline: event.registration_deadline as string,
    attendees_count: (event.attendees_count as number) || 0,
    status: (event.status as Event["status"]) || "Scheduled",
    thumbnail: event.thumbnail as string | undefined,
    organizer: event.organizer as string | undefined,
    created_at: event.created_at as string,
    updated_at: event.updated_at as string | undefined,
  };
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [eventStatuses, setEventStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        showErrorToast("Please login to view events");
        return;
      }

      const client = getAuthenticatedClient();
      const response = await client.get<EventApiResponse>("community/events", {
        headers: getCompanyHeaders(),
      });

      const data = response.data;
      if (data.status === "success") {
        const eventsData = (data.data as { data?: Event[] })?.data || data.data || [];
        setEvents(
          Array.isArray(eventsData)
            ? eventsData.map((event) => mapEventData(event as unknown as Record<string, unknown>))
            : []
        );
      } else {
        throw new Error(data.message || "Failed to fetch events");
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to fetch events";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvent = useCallback(async (id: string): Promise<Event | null> => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<EventApiResponse>(`community/events/${id}`, {
        headers: getCompanyHeaders(),
      });

      const data = response.data;
      if (data.status === "success" && data.data) {
        return mapEventData(data.data as unknown as Record<string, unknown>);
      }

      return null;
    } catch {
      showErrorToast("Failed to load event details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventTypes = useCallback(async () => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<{ status: string; types?: string[] }>(
        "event-types",
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" && data.types) {
        setEventTypes(data.types);
      }
    } catch {
      // Silent fail - use defaults in component
    }
  }, []);

  const fetchEventStatuses = useCallback(async () => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<{ status: string; types?: string[] }>(
        "event-status",
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" && data.types) {
        setEventStatuses(data.types);
      }
    } catch {
      // Silent fail - use defaults in component
    }
  }, []);

  const createEvent = useCallback(
    async (params: CreateEventParams): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      try {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("title", params.title);
        if (params.description) formData.append("description", params.description);
        formData.append("type", params.type);
        formData.append("location", params.location);
        formData.append("event_mode", params.event_mode);
        if (params.attendance_link) formData.append("attendance_link", params.attendance_link);
        if (params.event_link) formData.append("event_link", params.event_link);
        formData.append("start_time", params.start_time);
        formData.append("start_end", params.end_time);
        formData.append("registration_deadline", params.registration_deadline);
        formData.append("is_paid", params.is_paid ? "1" : "0");
        if (params.price) formData.append("price", params.price.toString());
        formData.append("capacity", params.capacity.toString());
        if (params.thumbnail) formData.append("thumbnail", params.thumbnail);

        const client = getAuthenticatedClient();
        const response = await client.postFormData<EventApiResponse>("community/events", formData, {
          headers: getCompanyHeaders(),
        });

        const data = response.data;
        if (data.status === "success") {
          showSuccessToast(data.message || "Event created successfully");
          await fetchEvents();
          return { success: true };
        }

        if (data.status === "error" && data.errors) {
          return { success: false, errors: data.errors };
        }

        throw new Error(data.message || "Failed to create event");
      } catch (err) {
        const apiError = err as ApiError;

        // Check if it's a validation error with field errors
        if (apiError.errors && Object.keys(apiError.errors).length > 0) {
          // Don't show generic toast, let the form display field-level errors
          return { success: false, errors: apiError.errors };
        }

        showErrorToast(apiError.message || "Failed to create event");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchEvents]
  );

  const updateEvent = useCallback(
    async (params: UpdateEventParams): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      try {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("title", params.title);
        if (params.description) formData.append("description", params.description);
        formData.append("type", params.type);
        formData.append("location", params.location);
        formData.append("event_mode", params.event_mode);
        if (params.attendance_link) formData.append("attendance_link", params.attendance_link);
        if (params.event_link) formData.append("event_link", params.event_link);
        formData.append("start_time", params.start_time);
        formData.append("start_end", params.end_time);
        formData.append("registration_deadline", params.registration_deadline);
        formData.append("is_paid", params.is_paid ? "1" : "0");
        if (params.price) formData.append("price", params.price.toString());
        formData.append("capacity", params.capacity.toString());
        if (params.status) formData.append("status", params.status);
        if (params.thumbnail) formData.append("thumbnail", params.thumbnail);
        formData.append("_method", "PUT");

        const client = getAuthenticatedClient();
        const response = await client.postFormData<EventApiResponse>(`community/events/${params.id}`, formData, {
          headers: getCompanyHeaders(),
        });

        const data = response.data;
        if (data.status === "success") {
          showSuccessToast(data.message || "Event updated successfully");
          await fetchEvents();
          return { success: true };
        }

        if (data.status === "error" && data.errors) {
          return { success: false, errors: data.errors };
        }

        throw new Error(data.message || "Failed to update event");
      } catch (err) {
        const apiError = err as ApiError;

        // Check if it's a validation error with field errors
        if (apiError.errors && Object.keys(apiError.errors).length > 0) {
          // Don't show generic toast, let the form display field-level errors
          return { success: false, errors: apiError.errors };
        }

        showErrorToast(apiError.message || "Failed to update event");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchEvents]
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        const response = await client.delete<EventApiResponse>(`community/events/${id}`, {
          headers: getCompanyHeaders(),
        });

        const data = response.data;
        if (data.status === "success") {
          showSuccessToast(data.message || "Event deleted successfully");
          await fetchEvents();
          return true;
        }

        throw new Error(data.message || "Failed to delete event");
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to delete event");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchEvents]
  );

  return {
    events,
    eventTypes,
    eventStatuses,
    loading,
    error,
    fetchEvents,
    fetchEvent,
    fetchEventTypes,
    fetchEventStatuses,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
