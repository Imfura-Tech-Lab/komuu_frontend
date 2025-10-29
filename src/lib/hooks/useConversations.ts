// hooks/useConversations.ts
import { useState, useCallback, useEffect } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

export interface Conversation {
  id: number;
  title: string;
  author: string;
  author_id?: string;
  replies: number;
  views: number;
  last_activity: string;
  category: string;
  status: "open" | "closed";
  is_pinned: boolean;
  type?: string;
  content?: string;
  group?: string;
  attachment_url?: string;
}

export interface ConversationsStats {
  total_topics: number;
  total_replies: number;
  total_views: number;
  active_today: number;
}

export interface ConversationType {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface ConversationGroup {
  id: number;
  name: string;
  slug: string;
  description?: string;
  total_members?: number;
}

export interface CreateConversationParams {
  group_id?: number;
  title: string;
  type: string;
  content: string;
  attachment?: File;
}

interface ApiResponse<T = any> {
  status: "success" | "error" | boolean;
  message: string;
  data: T;
}

interface ConversationsResponse {
  data: Conversation[];
  stats: ConversationsStats;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  stats: ConversationsStats | null;
  conversationTypes: ConversationType[];
  conversationGroups: ConversationGroup[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchConversation: (id: number) => Promise<Conversation | null>;
  fetchConversationTypes: () => Promise<void>;
  fetchConversationGroups: () => Promise<void>;
  createConversation: (
    params: CreateConversationParams
  ) => Promise<Conversation | null>;
  deleteConversation: (id: number) => Promise<boolean>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationsStats | null>(null);
  const [conversationTypes, setConversationTypes] = useState<ConversationType[]>([]);
  const [conversationGroups, setConversationGroups] = useState<ConversationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get auth headers helper
  const getAuthHeaders = useCallback(() => {
    if (!isClient) {
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
  }, [isClient]);

  // Base fetch wrapper with centralized error handling
  const apiCall = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
      if (!isClient) {
        return null;
      }

      try {
        const response = await fetch(`${apiUrl}${endpoint}`, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });

        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              `API error: ${response.status} ${response.statusText}`
          );
        }

        if (data.status === "success" || data.status === true) {
          return data.data;
        } else {
          throw new Error(data.message || "API request failed");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      }
    },
    [apiUrl, getAuthHeaders, isClient]
  );

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!isClient) return;

    try {
      setLoading(true);
      setError(null);

      const data = await apiCall<ConversationsResponse>(
        "community/conversations"
      );

      if (data) {
        setConversations(data.data || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      showErrorToast("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [apiCall, isClient]);

  // Fetch single conversation by ID
  const fetchConversation = useCallback(
    async (id: number): Promise<Conversation | null> => {
      if (!isClient) return null;

      try {
        setLoading(true);
        setError(null);

        const data = await apiCall<Conversation>(
          `community/conversations/${id}`
        );

        if (data) {
          return data;
        }

        return null;
      } catch (err) {
        console.error(`Failed to fetch conversation ${id}:`, err);
        showErrorToast("Failed to load conversation details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, isClient]
  );

  // Fetch conversation types from database
  const fetchConversationTypes = useCallback(async () => {
    if (!isClient) return;

    try {
      const data = await apiCall<ConversationType[]>("conversation-types");

      if (data) {
        setConversationTypes(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversation types:", err);
      showErrorToast("Failed to load conversation types");
    }
  }, [apiCall, isClient]);

  // Fetch conversation groups (using existing groups from community)
  const fetchConversationGroups = useCallback(async () => {
    if (!isClient) return;

    try {
      const data = await apiCall<{ data: ConversationGroup[] }>("community/groups");

      if (data && data.data) {
        setConversationGroups(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch conversation groups:", err);
      showErrorToast("Failed to load groups");
    }
  }, [apiCall, isClient]);

  // Create new conversation
  const createConversation = useCallback(
    async (params: CreateConversationParams): Promise<Conversation | null> => {
      if (!isClient) return null;

      try {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        
        // Add group_id if provided
        if (params.group_id) {
          formData.append("group_id", params.group_id.toString());
        }
        
        formData.append("title", params.title);
        formData.append("type", params.type);
        formData.append("content", params.content);
        
        if (params.attachment) {
          formData.append("attachment", params.attachment);
        }

        // Remove Accept header for FormData
        const headers = getAuthHeaders();
        delete (headers as any).Accept;

        const data = await apiCall<Conversation>("community/conversations", {
          method: "POST",
          body: formData,
          headers,
        });

        if (data) {
          showSuccessToast("Conversation created successfully");
          await fetchConversations();
          return data;
        }

        return null;
      } catch (err) {
        console.error("Failed to create conversation:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to create conversation"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchConversations, getAuthHeaders, isClient]
  );

  // Delete conversation by ID
  const deleteConversation = useCallback(
    async (id: number): Promise<boolean> => {
      if (!isClient) return false;

      try {
        setLoading(true);
        setError(null);

        await apiCall<void>(`community/conversations/${id}`, {
          method: "DELETE",
        });

        showSuccessToast("Conversation deleted successfully");
        
        // Remove from local state immediately
        setConversations((prev) => prev.filter((conv) => conv.id !== id));
        
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            total_topics: stats.total_topics - 1,
          });
        }

        return true;
      } catch (err) {
        console.error(`Failed to delete conversation ${id}:`, err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to delete conversation"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, stats, isClient]
  );

  return {
    conversations,
    stats,
    conversationTypes,
    conversationGroups,
    loading,
    error,
    fetchConversations,
    fetchConversation,
    fetchConversationTypes,
    fetchConversationGroups,
    createConversation,
    deleteConversation,
  };
}