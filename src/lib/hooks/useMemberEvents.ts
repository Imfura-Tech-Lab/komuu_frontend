import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, ApiError } from "@/lib/api-client";

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

export interface Pagination {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

interface ApiResponse<T> {
  status: "success" | "error" | boolean;
  message: string;
  data?: T;
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

function normalizeEvent(event: Record<string, unknown>): Event {
  const capacity = (event.capacity as number) || 0;
  const registrations = (event.registrations as number) || 0;
  const availableSlots = capacity > 0 ? Math.max(capacity - registrations, 0) : 0;

  return {
    id: event.id as string,
    title: event.title as string,
    description: event.description as string | undefined,
    type: (event.type as string) || "Other",
    location: event.location as string | undefined,
    attendance_link: event.attendance_link as string | undefined,
    event_link: event.event_link as string | undefined,
    event_mode: (event.event_mode as "Online" | "In-Person" | "Hybrid") || "In-Person",
    start_time: event.start_time as string,
    start_end: event.start_end as string | undefined,
    is_paid: Boolean(event.is_paid),
    price: event.price as string | undefined,
    capacity: event.capacity as number | undefined,
    status: (event.status as Event["status"]) || "Scheduled",
    thumbnail: event.thumbnail as string | undefined,
    organizer: event.organizer as string | undefined,
    registrations,
    available_slots: availableSlots,
    is_registered: Boolean(event.is_registered),
    created_at: event.created_at as string | undefined,
    updated_at: event.updated_at as string | undefined,
  };
}

export function useMemberEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  const fetchEvents = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<PaginatedResponse<Record<string, unknown>>>>(
        `events/all?page=${page}`
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        const eventsData = data.data.data || [];
        setEvents(Array.isArray(eventsData) ? eventsData.map(normalizeEvent) : []);
        setPagination({
          currentPage: data.data.current_page,
          lastPage: data.data.last_page,
          total: data.data.total,
          perPage: data.data.per_page,
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401 || apiError.status === 403) {
        showErrorToast("Unauthorized. Please log in again.");
        return;
      }
      setError(apiError.message || "Failed to fetch events");
      showErrorToast(apiError.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvent = useCallback(async (id: string): Promise<Event | null> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<Record<string, unknown>>>(`events/all/${id}`);
      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        return normalizeEvent(data.data);
      }
      return null;
    } catch {
      showErrorToast("Failed to load event details");
      return null;
    }
  }, []);

  const registerForEvent = useCallback(async (params: RegisterEventParams): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append("is_paid", params.is_paid ? "1" : "0");
      if (params.amount_paid) formData.append("amount_paid", params.amount_paid.toString());
      if (params.transaction_number) formData.append("transaction_number", params.transaction_number);
      if (params.payment_method) formData.append("payment_method", params.payment_method);

      const client = getAuthenticatedClient();
      const response = await client.postFormData<ApiResponse<EventRegistration>>(
        `events/register/${params.event_id}`,
        formData
      );

      if (response.data.status === "success" || response.data.status === true) {
        showSuccessToast("Successfully registered for the event");
        setEvents((prev) =>
          prev.map((event) =>
            event.id === params.event_id
              ? { ...event, is_registered: true, registrations: (event.registrations || 0) + 1, available_slots: event.available_slots ? event.available_slots - 1 : 0 }
              : event
          )
        );
        return true;
      }
      throw new Error(response.data.message || "Failed to register");
    } catch (err) {
      showErrorToast((err as ApiError).message || "Failed to register for event");
      return false;
    }
  }, []);

  const cancelRegistration = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.post<ApiResponse<void>>(`events/register/${eventId}/cancel`);
      if (response.data.status === "success" || response.data.status === true) {
        showSuccessToast("Registration cancelled");
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? { ...event, is_registered: false, registrations: Math.max((event.registrations || 0) - 1, 0), available_slots: event.available_slots ? event.available_slots + 1 : (event.capacity || 0) }
              : event
          )
        );
        return true;
      }
      throw new Error(response.data.message || "Failed to cancel");
    } catch (err) {
      showErrorToast((err as ApiError).message || "Failed to cancel registration");
      return false;
    }
  }, []);

  return {
    events,
    loading,
    error,
    pagination,
    fetchEvents,
    fetchEvent,
    registerForEvent,
    cancelRegistration,
  };
}
