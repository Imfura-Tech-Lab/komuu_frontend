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
  location?: string;
  attendance_link?: string;
  event_link?: string;
  event_mode: "Online" | "In-Person" | "Hybrid";
  start_time: string;
  start_end?: string;
  is_paid: boolean;
  price?: string;
  capacity?: number;
  status: "Scheduled" | "Ongoing" | "Completed" | "Cancelled" | "Draft";
  thumbnail?: string;
  organizer?: string;
  registrations?: number;
  available_slots?: number;
  is_registered?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EventRegistration {
  id: number;
  event_id: string;
  member_id: number;
  is_paid: boolean;
  amount_paid?: number;
  transaction_number?: string;
  payment_method?: string;
  status: "pending" | "confirmed" | "cancelled" | "failed";
  registered_at: string;
}

export interface RegisterEventParams {
  event_id: string;
  is_paid: boolean;
  amount_paid?: number;
  transaction_number?: string;
  payment_method?: string;
  status?: "pending" | "confirmed" | "cancelled" | "failed";
}

interface ApiResponse<T = any> {
  status: "success" | "error" | boolean;
  message: string;
  data?: T;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface UseMemberEventsReturn {
  events: Event[];
  myRegistrations: EventRegistration[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchEvent: (id: string) => Promise<Event | null>;
  registerForEvent: (params: RegisterEventParams) => Promise<boolean>;
  cancelRegistration: (eventId: string) => Promise<boolean>;
}

const normalizeEvent = (event: any): Event => {
  const capacity = event.capacity || 0;
  const registrations = event.registrations || 0;
  const availableSlots = capacity > 0 ? Math.max(capacity - registrations, 0) : 0;

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.type || "Other",
    location: event.location,
    attendance_link: event.attendance_link,
    event_link: event.event_link,
    event_mode: event.event_mode || "In-Person",
    start_time: event.start_time,
    start_end: event.start_end,
    is_paid: Boolean(event.is_paid),
    price: event.price,
    capacity: event.capacity,
    status: event.status || "Scheduled",
    thumbnail: event.thumbnail,
    organizer: event.organizer,
    registrations: event.registrations || 0,
    available_slots: availableSlots,
    is_registered: Boolean(event.is_registered),
    created_at: event.created_at,
    updated_at: event.updated_at,
  };
};

export function useMemberEvents(): UseMemberEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const getAuthHeaders = useCallback(() => {
    if (typeof window === "undefined") {
      return {
        Accept: "application/json",
        Authorization: "",
        "X-Company-ID": "",
      };
    }

    const authToken = localStorage.getItem("auth_token");
    const companyId = localStorage.getItem("company_id");

    return {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
      "X-Company-ID": companyId || "",
    };
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!apiUrl) {
        showErrorToast("Backend API URL is not configured.");
        setError("Configuration error: Backend API URL missing.");
        return;
      }

      const response = await fetch(`${apiUrl}events/all`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<PaginatedResponse<any>> = await response.json();

      if (data.status === "success" && data.data) {
        const eventsData = data.data.data || [];
        setEvents(
          Array.isArray(eventsData) ? eventsData.map(normalizeEvent) : []
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
  }, [apiUrl, getAuthHeaders]);

  const fetchEvent = useCallback(
    async (id: string): Promise<Event | null> => {
      try {
        setLoading(true);
        setError(null);

        if (!apiUrl) {
          showErrorToast("Configuration error");
          return null;
        }

        const response = await fetch(`${apiUrl}events/all/${id}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          if (response.status === 404) {
            showErrorToast("Event not found");
          } else if (response.status === 403) {
            showErrorToast("You don't have permission to view this event");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return null;
        }

        const data: ApiResponse<any> = await response.json();

        if (data.status === "success" && data.data) {
          return normalizeEvent(data.data);
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
    [apiUrl, getAuthHeaders]
  );

  const registerForEvent = useCallback(
    async (params: RegisterEventParams): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        if (!apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        if (params.is_paid && !params.amount_paid) {
          showErrorToast("Amount paid is required for paid events");
          return false;
        }

        if (params.is_paid && !params.payment_method) {
          showErrorToast("Payment method is required for paid events");
          return false;
        }

        const formData = new FormData();
        formData.append("is_paid", params.is_paid ? "1" : "0");

        if (params.amount_paid) {
          formData.append("amount_paid", params.amount_paid.toString());
        }

        if (params.transaction_number) {
          formData.append("transaction_number", params.transaction_number);
        }

        if (params.payment_method) {
          formData.append("payment_method", params.payment_method);
        }

        if (params.status) {
          formData.append("status", params.status);
        }

        const headers = getAuthHeaders();
        delete (headers as any).Accept;

        const response = await fetch(
          `${apiUrl}events/register/${params.event_id}`,
          {
            method: "POST",
            headers,
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data: ApiResponse<EventRegistration> = await response.json();

        if (data.status === "success" || data.status === true) {
          showSuccessToast(
            params.is_paid
              ? "Registration submitted. Awaiting payment confirmation."
              : "Successfully registered for the event"
          );

          setEvents((prev) =>
            prev.map((event) =>
              event.id === params.event_id
                ? {
                    ...event,
                    is_registered: true,
                    registrations: (event.registrations || 0) + 1,
                    available_slots: event.available_slots
                      ? event.available_slots - 1
                      : 0,
                  }
                : event
            )
          );

          if (data.data) {
            setMyRegistrations((prev) => [...prev, data.data!]);
          }

          return true;
        }

        throw new Error(data.message || "Failed to register for event");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to register for event";
        console.error("Failed to register for event:", err);
        showErrorToast(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  const cancelRegistration = useCallback(
    async (eventId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        if (!apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        const response = await fetch(
          `${apiUrl}events/register/${eventId}/cancel`,
          {
            method: "POST",
            headers: getAuthHeaders(),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data: ApiResponse<void> = await response.json();

        if (data.status === "success" || data.status === true) {
          showSuccessToast("Registration cancelled successfully");

          setEvents((prev) =>
            prev.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    is_registered: false,
                    registrations: Math.max(
                      (event.registrations || 0) - 1,
                      0
                    ),
                    available_slots: event.available_slots
                      ? event.available_slots + 1
                      : (event.capacity || 0),
                  }
                : event
            )
          );

          setMyRegistrations((prev) =>
            prev.filter((reg) => reg.event_id !== eventId)
          );

          return true;
        }

        throw new Error(data.message || "Failed to cancel registration");
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to cancel registration";
        console.error("Failed to cancel registration:", err);
        showErrorToast(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  return {
    events,
    myRegistrations,
    loading,
    error,
    fetchEvents,
    fetchEvent,
    registerForEvent,
    cancelRegistration,
  };
}