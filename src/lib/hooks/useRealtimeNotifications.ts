"use client";

import { useEffect, useState, useRef } from "react";
import { getEcho } from "@/lib/echo";

interface RealtimeNotification {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export function useRealtimeNotifications(userId: number | null) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!userId) return;
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`user.${userId}`);
    channelRef.current = channel;

    // Listen for any notification
    channel.listen(".notification", (event: { type: string; data: Record<string, unknown> }) => {
      setNotifications((prev) => [
        { type: event.type, data: event.data, timestamp: new Date().toISOString() },
        ...prev.slice(0, 49), // Keep last 50
      ]);
      setUnreadCount((prev) => prev + 1);
    });

    // Listen for new DM messages
    channel.listen(".message.sent", (event: RealtimeNotification) => {
      setNotifications((prev) => [
        { type: "dm", data: event.data || event as unknown as Record<string, unknown>, timestamp: new Date().toISOString() },
        ...prev.slice(0, 49),
      ]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      echo.leave(`user.${userId}`);
      channelRef.current = null;
    };
  }, [userId]);

  const clearUnread = () => setUnreadCount(0);

  return { notifications, unreadCount, clearUnread };
}
