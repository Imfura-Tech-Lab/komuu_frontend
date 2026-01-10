import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";

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

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchEvent: (id: string) => Promise<Event | null>;
  createEvent: (params: CreateEventParams) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  updateEvent: (params: UpdateEventParams) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  deleteEvent: (id: string) => Promise<boolean>;
}

export function useEvents(): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    const companyId = localStorage.getItem("company_id");

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Company-ID": institutionId || "",
    };
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view events");
        return;
      }

      if (!apiUrl) {
        showErrorToast("Backend API URL is not configured.");
        setError("Configuration error: Backend API URL missing.");
        return;
      }

      const response = await fetch(`${apiUrl}community/events`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const eventsData = data.data?.data || data.data || [];
        setEvents(
          Array.isArray(eventsData)
            ? eventsData.map((event: any) => ({
                id: event.id,
                title: event.title,
                description: event.description,
                type: event.type,
                location: event.location,
                event_mode: event.event_mode,
                attendance_link: event.attendance_link,
                event_link: event.event_link,
                start_time: event.start_time,
                end_time: event.end_time || event.start_end,
                is_paid: event.is_paid === 1 || event.is_paid === true,
                price: event.price,
                capacity: event.capacity,
                attendees_count: event.attendees_count || 0,
                status: event.status || "Scheduled",
                thumbnail: event.thumbnail,
                registration_deadline: event.registration_deadline,
                organizer: event.organizer,
                created_at: event.created_at,
                updated_at: event.updated_at,
              }))
            : []
        );
      } else {
        throw new Error(data.message || "Failed to fetch events");
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch events";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const fetchEvent = useCallback(
    async (id: string): Promise<Event | null> => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return null;
        }

        const response = await fetch(`${apiUrl}community/events/${id}`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success" && data.data) {
          const event = data.data;
          return {
            id: event.id,
            title: event.title,
            description: event.description,
            type: event.type,
            location: event.location,
            event_mode: event.event_mode,
            attendance_link: event.attendance_link,
            event_link: event.event_link,
            start_time: event.start_time,
            end_time: event.end_time || event.start_end,
            is_paid: event.is_paid === 1 || event.is_paid === true,
            price: event.price,
            capacity: event.capacity,
            registration_deadline: event.registration_deadline,
            attendees_count: event.attendees_count || 0,
            status: event.status || "Scheduled",
            thumbnail: event.thumbnail,
            organizer: event.organizer,
            created_at: event.created_at,
            updated_at: event.updated_at,
          };
        }

        return null;
      } catch (err) {
        console.error("Failed to fetch event:", err);
        showErrorToast("Failed to load event details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getHeaders]
  );

  const createEvent = useCallback(
    async (params: CreateEventParams): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return { success: false };
        }

        const formData = new FormData();
        formData.append("title", params.title);
        if (params.description)
          formData.append("description", params.description);
        formData.append("type", params.type);
        formData.append("location", params.location);
        formData.append("event_mode", params.event_mode);
        if (params.attendance_link)
          formData.append("attendance_link", params.attendance_link);
        if (params.event_link) formData.append("event_link", params.event_link);
        formData.append("start_time", params.start_time);
        formData.append("start_end", params.end_time);
        formData.append("registration_deadline", params.registration_deadline);
        formData.append("is_paid", params.is_paid ? "1" : "0");
        if (params.price) formData.append("price", params.price.toString());
        formData.append("capacity", params.capacity.toString());
        if (params.thumbnail) formData.append("thumbnail", params.thumbnail);

        const headers = getHeaders();
        delete (headers as any)["Content-Type"];

        const response = await fetch(`${apiUrl}community/events`, {
          method: "POST",
          headers,
          body: formData,
        });

        const data = await response.json();

        if (data.status === "success") {
          showSuccessToast(data.message || "Event created successfully");
          await fetchEvents();
          return { success: true };
        }

        // Handle validation errors
        if (data.status === "error" && data.errors) {
          return { success: false, errors: data.errors };
        }

        throw new Error(data.message || "Failed to create event");
      } catch (err) {
        console.error("Failed to create event:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to create event"
        );
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, fetchEvents]
  );

  const updateEvent = useCallback(
    async (params: UpdateEventParams): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return { success: false };
        }

        const formData = new FormData();
        formData.append("title", params.title);
        if (params.description)
          formData.append("description", params.description);
        formData.append("type", params.type);
        formData.append("location", params.location);
        formData.append("event_mode", params.event_mode);
        if (params.attendance_link)
          formData.append("attendance_link", params.attendance_link);
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

        const headers = getHeaders();
        delete (headers as any)["Content-Type"];

        const response = await fetch(`${apiUrl}community/events/${params.id}`, {
          method: "POST",
          headers,
          body: formData,
        });

        const data = await response.json();

        if (data.status === "success") {
          showSuccessToast(data.message || "Event updated successfully");
          await fetchEvents();
          return { success: true };
        }

        // Handle validation errors
        if (data.status === "error" && data.errors) {
          return { success: false, errors: data.errors };
        }

        throw new Error(data.message || "Failed to update event");
      } catch (err) {
        console.error("Failed to update event:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to update event"
        );
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, fetchEvents]
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        const response = await fetch(`${apiUrl}community/events/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          showSuccessToast(data.message || "Event deleted successfully");
          await fetchEvents();
          return true;
        }

        throw new Error(data.message || "Failed to delete event");
      } catch (err) {
        console.error("Failed to delete event:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to delete event"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, fetchEvents]
  );

  return {
    events,
    loading,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}