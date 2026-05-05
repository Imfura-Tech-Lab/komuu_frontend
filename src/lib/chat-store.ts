/**
 * Offline-first chat storage using IndexedDB.
 * Caches messages, groups, peers, and queues outgoing messages.
 */

const DB_VERSION = 1;

function getDbName(): string {
  if (typeof window === "undefined") return "afsa_chat_0";
  try {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.id) return `afsa_chat_${parsed.id}`;
    }
  } catch {}
  return "afsa_chat_0";
}

interface PendingMessage {
  id: string; // temp client ID
  conversation_id: number;
  content: string;
  file?: File;
  created_at: string;
  status: "pending" | "failed";
  retries: number;
}

interface CachedMessage {
  id: number | string;
  conversation_id: number;
  content: string;
  file_url?: string | null;
  created_at: string;
  sender: { id: number; name: string; role?: string };
  parent_id?: number;
  _pending?: boolean; // true if not yet confirmed by server
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(getDbName(), DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("messages")) {
        const msgStore = db.createObjectStore("messages", { keyPath: "id" });
        msgStore.createIndex("conversation_id", "conversation_id", { unique: false });
      }
      if (!db.objectStoreNames.contains("pending")) {
        db.createObjectStore("pending", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function getCachedMessages(conversationId: number): Promise<CachedMessage[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction("messages", "readonly");
      const store = tx.objectStore("messages");
      const index = store.index("conversation_id");
      const request = index.getAll(conversationId);
      request.onsuccess = () => {
        const msgs = (request.result || []) as CachedMessage[];
        msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        resolve(msgs);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function cacheMessages(conversationId: number, messages: CachedMessage[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("messages", "readwrite");
    const store = tx.objectStore("messages");

    // Remove old messages for this conversation
    const index = store.index("conversation_id");
    const existingRequest = index.getAllKeys(conversationId);
    existingRequest.onsuccess = () => {
      for (const key of existingRequest.result) {
        store.delete(key);
      }
      // Add new messages
      for (const msg of messages) {
        store.put({ ...msg, conversation_id: conversationId });
      }
    };
  } catch {
    // Silent fail
  }
}

// ============================================================================
// PENDING MESSAGES (offline queue)
// ============================================================================

export async function addPendingMessage(msg: PendingMessage): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("pending", "readwrite");
    tx.objectStore("pending").put(msg);
  } catch {}
}

export async function getPendingMessages(): Promise<PendingMessage[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction("pending", "readonly");
      const request = tx.objectStore("pending").getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function removePendingMessage(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("pending", "readwrite");
    tx.objectStore("pending").delete(id);
  } catch {}
}

export async function updatePendingMessage(id: string, updates: Partial<PendingMessage>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("pending", "readwrite");
    const store = tx.objectStore("pending");
    const request = store.get(id);
    request.onsuccess = () => {
      if (request.result) {
        store.put({ ...request.result, ...updates });
      }
    };
  } catch {}
}

// ============================================================================
// GENERIC CACHE (groups, peers, dm threads)
// ============================================================================

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction("cache", "readonly");
      const request = tx.objectStore("cache").get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          // Check if expired (1 hour TTL)
          if (result.timestamp && Date.now() - result.timestamp > 3600000) {
            resolve(null);
          } else {
            resolve(result.data as T);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("cache", "readwrite");
    tx.objectStore("cache").put({ key, data, timestamp: Date.now() });
  } catch {}
}

// ============================================================================
// CLEANUP — call on logout
// ============================================================================

export async function clearChatStore(): Promise<void> {
  try {
    const dbName = getDbName();
    // Delete the entire database for this user
    if (typeof indexedDB !== "undefined") {
      indexedDB.deleteDatabase(dbName);
    }
  } catch {}
}

// ============================================================================
// ONLINE STATUS
// ============================================================================

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function onOnlineChange(callback: (online: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
