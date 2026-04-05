"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getEcho } from "@/lib/echo";
import { ConversationMessage } from "@/lib/hooks/useMemberConversationMessages";

interface RealtimeMessageEvent {
  id: number;
  conversation_id: number;
  content: string;
  file_url?: string;
  created_at: string;
  sender: {
    id: number;
    name: string;
    role?: string;
  };
  parent_id?: number;
}

interface UseRealtimeMessagesOptions {
  conversationId: number | null;
  onNewMessage?: (message: ConversationMessage) => void;
  onMessageDeleted?: (messageId: number) => void;
}

export function useRealtimeMessages({
  conversationId,
  onNewMessage,
  onMessageDeleted,
}: UseRealtimeMessagesOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    const echo = getEcho();
    if (!echo) return;

    // Leave previous channel
    if (channelRef.current) {
      echo.leave(`conversation.${conversationId}`);
    }

    const channel = echo.private(`conversation.${conversationId}`);
    channelRef.current = channel;

    channel.listen(".message.sent", (event: RealtimeMessageEvent) => {
      const msg: ConversationMessage = {
        id: event.id,
        conversation_id: event.conversation_id,
        content: event.content,
        file_url: event.file_url || null,
        created_at: event.created_at,
        sender: event.sender,
        parent_id: event.parent_id,
      };
      onNewMessage?.(msg);
    });

    channel.listen(".message.deleted", (event: { id: number }) => {
      onMessageDeleted?.(event.id);
    });

    return () => {
      echo.leave(`conversation.${conversationId}`);
      channelRef.current = null;
    };
  }, [conversationId, onNewMessage, onMessageDeleted]);
}

export function useTypingIndicator(conversationId: number | null) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const lastSentRef = useRef(0);

  // Listen for typing events
  useEffect(() => {
    if (!conversationId) return;
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.private(`conversation.${conversationId}`);
    channel.listen(".user.typing", (event: { user_id: number; user_name: string }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(event.user_name)) return [...prev, event.user_name];
        return prev;
      });

      // Clear after 4 seconds
      const existingTimeout = timeoutsRef.current.get(event.user_id);
      if (existingTimeout) clearTimeout(existingTimeout);

      timeoutsRef.current.set(
        event.user_id,
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((n) => n !== event.user_name));
          timeoutsRef.current.delete(event.user_id);
        }, 4000)
      );
    });

    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
      setTypingUsers([]);
    };
  }, [conversationId]);

  // Send typing indicator (debounced — max once per 3 seconds)
  const sendTyping = useCallback(async () => {
    if (!conversationId) return;
    const now = Date.now();
    if (now - lastSentRef.current < 3000) return;
    lastSentRef.current = now;

    try {
      const { getAuthenticatedClient } = await import("@/lib/api-client");
      const client = getAuthenticatedClient();
      await client.post(`conversations/${conversationId}/typing`, {});
    } catch {
      // Silent — typing is best-effort
    }
  }, [conversationId]);

  return { typingUsers, sendTyping };
}
