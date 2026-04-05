"use client";

import { useState, useEffect, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, ApiError } from "@/lib/api-client";

export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  // Flat fields from API
  title?: string;
  message?: string;
}

function mapNotification(raw: Record<string, unknown>): Notification {
  return {
    id: (raw.notification_id || raw.id || "") as string,
    type: (raw.type || "") as string,
    data: {
      title: raw.title,
      message: raw.message,
      record_id: raw.record_id,
    },
    read_at: raw.is_read ? (raw.updated_at as string || raw.created_at as string) : null,
    created_at: raw.created_at as string,
    updated_at: (raw.updated_at || raw.created_at || "") as string,
    title: raw.title as string | undefined,
    message: raw.message as string | undefined,
  };
}

interface NotificationsApiResponse {
  status: string;
  message?: string;
  data: {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface UnreadsResponse {
  status: string;
  data: { count: number };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotifications = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<NotificationsApiResponse>(
        `notifications?page=${page}`
      );

      const data = response.data;
      if (data.status === "success") {
        setNotifications(
          (data.data.data as unknown as Record<string, unknown>[]).map(mapNotification)
        );
        setCurrentPage(data.data.current_page);
        setLastPage(data.data.last_page);
        setTotal(data.data.total);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<UnreadsResponse>("notifications/unreads");

      const data = response.data;
      if (data.status === "success") {
        setUnreadCount(data.data.count);
      }
    } catch {
      // Silent fail
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.patch<{ status: string; message?: string }>(
        "notifications/mark-all-as-read"
      );

      if (response.data.status === "success") {
        showSuccessToast("All notifications marked as read");
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
        );
        return true;
      }
      return false;
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to mark notifications as read");
      return false;
    }
  }, []);

  const deleteAll = useCallback(async (): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.delete<{ status: string; message?: string }>(
        "notifications/delete-all"
      );

      if (response.data.status === "success") {
        showSuccessToast("All notifications deleted");
        setNotifications([]);
        setUnreadCount(0);
        setTotal(0);
        return true;
      }
      return false;
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to delete notifications");
      return false;
    }
  }, []);

  const deleteNotification = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const client = getAuthenticatedClient();
        const response = await client.delete<{ status: string; message?: string }>(
          `notifications/${id}`
        );

        if (response.data.status === "success") {
          showSuccessToast("Notification deleted");
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          setTotal((prev) => prev - 1);
          return true;
        }
        return false;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to delete notification");
        return false;
      }
    },
    []
  );

  const showNotification = useCallback(
    async (id: string): Promise<Notification | null> => {
      try {
        const client = getAuthenticatedClient();
        const response = await client.get<{
          status: string;
          data: Notification;
        }>(`notifications/${id}`);

        if (response.data.status === "success") {
          return response.data.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    deleteAll,
    deleteNotification,
    showNotification,
    handlePageChange: (page: number) => fetchNotifications(page),
  };
}
