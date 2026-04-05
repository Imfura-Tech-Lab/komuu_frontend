"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCachedMessages,
  cacheMessages,
  addPendingMessage,
  getPendingMessages,
  removePendingMessage,
  updatePendingMessage,
  getCached,
  setCache,
  isOnline,
  onOnlineChange,
} from "@/lib/chat-store";
import { getAuthenticatedClient } from "@/lib/api-client";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { ConversationMessage } from "@/lib/hooks/useMemberConversationMessages";

interface OfflineMessage extends ConversationMessage {
  _pending?: boolean;
  _failed?: boolean;
  _tempId?: string;
}

/**
 * Offline-first chat hook.
 * 1. Shows cached messages immediately
 * 2. Fetches from server in background and merges
 * 3. Queues outgoing messages when offline
 * 4. Flushes queue when back online
 */
export function useOfflineChat(conversationId: number | null, userId: number | null) {
  const [messages, setMessages] = useState<OfflineMessage[]>([]);
  const [online, setOnline] = useState(isOnline());
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flushingRef = useRef(false);

  // Track online/offline
  useEffect(() => {
    const cleanup = onOnlineChange((status) => {
      setOnline(status);
      if (status) flushQueue();
    });
    return cleanup;
  }, []);

  // Load cached messages immediately, then fetch from server
  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }

    // 1. Show cache instantly
    (async () => {
      const cached = await getCachedMessages(conversationId);
      if (cached.length > 0) {
        setMessages(cached as OfflineMessage[]);
      }

      // 2. Also load pending messages for this conversation
      const pending = await getPendingMessages();
      const convPending = pending.filter(p => p.conversation_id === conversationId);
      if (convPending.length > 0 && userId) {
        const pendingMsgs: OfflineMessage[] = convPending.map(p => ({
          id: p.id as unknown as number,
          conversation_id: p.conversation_id,
          content: p.content,
          created_at: p.created_at,
          sender: { id: userId, name: "You" },
          _pending: true,
          _failed: p.status === "failed",
          _tempId: p.id,
        }));
        setMessages(prev => {
          const merged = [...prev.filter(m => !m._pending), ...pendingMsgs];
          merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return merged;
        });
      }

      // 3. Fetch fresh from server
      if (isOnline()) {
        await fetchFromServer(conversationId);
      }
    })();

    // 4. Start polling
    startPolling(conversationId);

    return () => stopPolling();
  }, [conversationId]);

  const fetchFromServer = async (convId: number) => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<{ status: string; data: { messages?: ConversationMessage[] } }>(`conversations/${convId}`);
      const data = response.data;

      if (data.status === "success" && data.data?.messages) {
        const serverMsgs = data.data.messages.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Cache for offline use
        await cacheMessages(convId, serverMsgs.map(m => ({ ...m, conversation_id: m.conversation_id || convId })));

        // Merge with pending
        const pending = await getPendingMessages();
        const convPending = pending.filter(p => p.conversation_id === convId);

        setMessages(prev => {
          const pendingMsgs = prev.filter(m => m._pending);
          // Remove pending messages that now exist in server response
          const stillPending = pendingMsgs.filter(pm =>
            !serverMsgs.some(sm => sm.content === pm.content && Math.abs(new Date(sm.created_at).getTime() - new Date(pm.created_at).getTime()) < 30000)
          );

          const merged = [...serverMsgs as OfflineMessage[], ...stillPending];
          merged.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          return merged;
        });

        // Clean up confirmed pending messages
        for (const p of convPending) {
          const confirmed = serverMsgs.some(sm =>
            sm.content === p.content && Math.abs(new Date(sm.created_at).getTime() - new Date(p.created_at).getTime()) < 30000
          );
          if (confirmed) await removePendingMessage(p.id);
        }
      }
    } catch {
      // Silent — we have cache
    }
  };

  const startPolling = (convId: number) => {
    stopPolling();
    pollRef.current = setInterval(() => {
      if (isOnline()) fetchFromServer(convId);
    }, 5000);
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  // Send message — optimistic + offline queue
  const send = useCallback(async (content: string, attachment?: File) => {
    if (!conversationId || !userId || sending) return false;
    if (content.trim().length > 0 && content.trim().length < 10) {
      showErrorToast("Min 10 characters");
      return false;
    }

    const tempId = `pending_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const now = new Date().toISOString();

    // Optimistic: add to UI immediately
    const optimisticMsg: OfflineMessage = {
      id: tempId as unknown as number,
      conversation_id: conversationId,
      content: content.trim() || "Sent an attachment",
      created_at: now,
      sender: { id: userId, name: "You" },
      _pending: true,
      _tempId: tempId,
    };

    setMessages(prev => [...prev, optimisticMsg]);

    if (!isOnline()) {
      // Queue for later
      await addPendingMessage({
        id: tempId,
        conversation_id: conversationId,
        content: content.trim() || "Sent an attachment",
        file: attachment,
        created_at: now,
        status: "pending",
        retries: 0,
      });
      return true;
    }

    // Try to send immediately
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("content", content.trim() || "Sent an attachment");
      if (attachment) formData.append("attachment", attachment);

      const client = getAuthenticatedClient();
      const response = await client.postFormData<{ status: string; data: ConversationMessage }>(`conversations/${conversationId}/send-message`, formData);

      if (response.data.status === "success") {
        // Replace optimistic with real message
        const realMsg = response.data.data;
        setMessages(prev =>
          prev.map(m => m._tempId === tempId ? { ...realMsg, _pending: false } as OfflineMessage : m)
        );
        // Update cache
        if (conversationId) await fetchFromServer(conversationId);
        return true;
      }
      throw new Error("Failed");
    } catch {
      // Mark as failed in UI
      setMessages(prev =>
        prev.map(m => m._tempId === tempId ? { ...m, _failed: true } : m)
      );
      // Save to queue for retry
      await addPendingMessage({
        id: tempId,
        conversation_id: conversationId,
        content: content.trim() || "Sent an attachment",
        created_at: now,
        status: "failed",
        retries: 0,
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [conversationId, userId, sending]);

  // Flush pending queue when back online
  const flushQueue = useCallback(async () => {
    if (flushingRef.current || !isOnline()) return;
    flushingRef.current = true;

    try {
      const pending = await getPendingMessages();
      for (const msg of pending) {
        if (msg.retries >= 3) {
          await updatePendingMessage(msg.id, { status: "failed" });
          continue;
        }

        try {
          const formData = new FormData();
          formData.append("content", msg.content);

          const client = getAuthenticatedClient();
          await client.postFormData(`conversations/${msg.conversation_id}/send-message`, formData);

          await removePendingMessage(msg.id);

          // Remove from UI pending state
          setMessages(prev => prev.filter(m => m._tempId !== msg.id));

          // Refresh messages
          if (msg.conversation_id) await fetchFromServer(msg.conversation_id);
        } catch {
          await updatePendingMessage(msg.id, { retries: msg.retries + 1, status: "failed" });
        }
      }
    } finally {
      flushingRef.current = false;
    }
  }, []);

  // Retry a failed message
  const retry = useCallback(async (tempId: string) => {
    const pending = await getPendingMessages();
    const msg = pending.find(p => p.id === tempId);
    if (!msg || !isOnline()) return;

    setMessages(prev => prev.map(m => m._tempId === tempId ? { ...m, _failed: false, _pending: true } : m));

    try {
      const formData = new FormData();
      formData.append("content", msg.content);

      const client = getAuthenticatedClient();
      await client.postFormData(`conversations/${msg.conversation_id}/send-message`, formData);

      await removePendingMessage(tempId);
      setMessages(prev => prev.filter(m => m._tempId !== tempId));
      if (msg.conversation_id) await fetchFromServer(msg.conversation_id);
    } catch {
      setMessages(prev => prev.map(m => m._tempId === tempId ? { ...m, _failed: true } : m));
      await updatePendingMessage(tempId, { retries: msg.retries + 1 });
    }
  }, []);

  return { messages, online, sending, send, retry };
}

// ============================================================================
// CACHED GROUPS & PEERS
// ============================================================================

export function useCachedGroups() {
  const [groups, setGroups] = useState<unknown[]>([]);

  useEffect(() => {
    (async () => {
      const cached = await getCached<unknown[]>("joined_groups");
      if (cached) setGroups(cached);
    })();
  }, []);

  const updateCache = useCallback(async (data: unknown[]) => {
    setGroups(data);
    await setCache("joined_groups", data);
  }, []);

  return { groups, updateCache };
}

export function useCachedPeers() {
  const [peers, setPeers] = useState<unknown[]>([]);

  useEffect(() => {
    (async () => {
      const cached = await getCached<unknown[]>("peers");
      if (cached) setPeers(cached);
    })();
  }, []);

  const updateCache = useCallback(async (data: unknown[]) => {
    setPeers(data);
    await setCache("peers", data);
  }, []);

  return { peers, updateCache };
}
