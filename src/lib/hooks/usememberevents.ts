import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";

export interface Event {
  id: string; // UUID format
  title: string;
  description?: string;
  event_type?: string;
  location?: string;
  venue?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  capacity?: number;
  available_slots?: number;
  registration_deadline?: string;
  is_paid: boolean;
  ticket_price?: number;
  currency?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  visibility: "public" | "private" | "members_only";
  banner_url?: string;
  organizer?: string;
  organizer_contact?: string;
  registration_count?: number;
  is_registered?: boolean;
  created_at: string;
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

// Utility: Normalize API event to frontend type
const normalizeEvent = (event: any): Event => ({
  id: event.id,
  title: event.title,
  description: event.description,
  event_type: event.event_type || event.type,
  location: event.location,
  venue: event.venue,
  start_date: event.start_date,
  end_date: event.end_date,
  start_time: event.start_time,
  end_time: event.end_time,
  capacity: event.capacity,
  available_slots: event.available_slots,
  registration_deadline: event.registration_deadline,
  is_paid: Boolean(event.is_paid),
  ticket_price: event.ticket_price,
  currency: event.currency || "RWF",
  status: event.status || "upcoming",
  visibility: event.visibility || "public",
  banner_url: event.banner_url,
  organizer: event.organizer,
  organizer_contact: event.organizer_contact,
  registration_count: event.registration_count || 0,
  is_registered: Boolean(event.is_registered),
  created_at: event.created_at,
  updated_at: event.updated_at,
});

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

  /**
   * Fetch all available events (member view)
   * Member endpoint: GET /events/all
   * 
   * Returns events visible to members based on visibility settings
   */
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

      const data: ApiResponse<PaginatedResponse<any> | any[]> = await response.json();

      if (data.status === "success") {
        let eventsData: any[] = [];

        // Handle different response structures
        if (data.data) {
          if (Array.isArray(data.data)) {
            eventsData = data.data;
          } else if (data.data.data && Array.isArray(data.data.data)) {
            eventsData = data.data.data;
          }
        }

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

  /**
   * Fetch single event details
   * Member endpoint: GET /events/all/{id}
   * 
   * @param id - Event UUID
   */
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

  /**
   * Register for an event
   * Member endpoint: POST /events/register/{id}
   * 
   * Required fields:
   * - is_paid: boolean (1 or 0)
   * 
   * Optional fields (for paid events):
   * - amount_paid: number
   * - transaction_number: string
   * - payment_method: string ("Credit/Debit Card", "Mobile Money", "Bank Transfer", etc.)
   * - status: string ("pending", "confirmed", "failed")
   * 
   * @param params - Registration parameters
   */
  const registerForEvent = useCallback(
    async (params: RegisterEventParams): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        if (!apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        // Validate required fields
        if (params.is_paid && !params.amount_paid) {
          showErrorToast("Amount paid is required for paid events");
          return false;
        }

        if (params.is_paid && !params.payment_method) {
          showErrorToast("Payment method is required for paid events");
          return false;
        }

        // Build FormData
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

        // Remove Accept header for FormData
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

          // Update event registration status locally
          setEvents((prev) =>
            prev.map((event) =>
              event.id === params.event_id
                ? {
                    ...event,
                    is_registered: true,
                    registration_count: (event.registration_count || 0) + 1,
                    available_slots: event.available_slots
                      ? event.available_slots - 1
                      : undefined,
                  }
                : event
            )
          );

          // Add to my registrations if data is returned
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

  /**
   * Cancel event registration
   * Member endpoint: POST /events/register/{id}/cancel
   * (Assuming this endpoint exists based on common patterns)
   * 
   * @param eventId - Event UUID
   */
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

          // Update event registration status locally
          setEvents((prev) =>
            prev.map((event) =>
              event.id === eventId
                ? {
                    ...event,
                    is_registered: false,
                    registration_count: Math.max(
                      (event.registration_count || 0) - 1,
                      0
                    ),
                    available_slots: event.available_slots
                      ? event.available_slots + 1
                      : undefined,
                  }
                : event
            )
          );

          // Remove from my registrations
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