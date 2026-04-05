"use client";

import { useState, useEffect, useCallback } from "react";
import { getEcho } from "@/lib/echo";

export type ConnectionState = "connected" | "connecting" | "disconnected";

export function useConnectionStatus() {
  const [state, setState] = useState<ConnectionState>("connecting");

  const checkConnection = useCallback(() => {
    const echo = getEcho();
    if (!echo) {
      setState("disconnected");
      return;
    }

    try {
      const connector = (echo as unknown as { connector?: { pusher?: { connection?: { state?: string } } } }).connector;
      const pusherState = connector?.pusher?.connection?.state;

      if (pusherState === "connected") {
        setState("connected");
      } else if (pusherState === "connecting" || pusherState === "initialized") {
        setState("connecting");
      } else {
        setState("disconnected");
      }
    } catch {
      setState("disconnected");
    }
  }, []);

  useEffect(() => {
    // Initial check
    const timeout = setTimeout(checkConnection, 2000);

    // Poll connection state every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    // Also listen to browser online/offline
    const handleOnline = () => checkConnection();
    const handleOffline = () => setState("disconnected");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [checkConnection]);

  return state;
}
