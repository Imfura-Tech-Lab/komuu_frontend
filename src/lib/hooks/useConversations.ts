import { useState, useCallback, useEffect } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

export interface Conversation {
  id: number;
  title: string;
  type?: string;
  content?: string;
  created_at: string;
  updated_at?: string;
  sender?: {
    id: number;
    name: string;
    role?: string;
  };
  author?: string;
  author_id?: string;
  replies?: number;
  views?: number;
  last_activity?: string;
  category?: string;
  status?: "open" | "closed";
  is_pinned?: boolean;
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
  group?: number;
  title: string;
  type: string;
  content: string;
  attachment?: File;
}

interface ApiResponse<T = any> {
  status: "success" | "error" | boolean;
  message: string;
  data?: T;
  types?: string[];
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  stats: ConversationsStats | null;
  conversationTypes: ConversationType[];
  conversationGroups: ConversationGroup[];
  loading: boolean;
  error: string | null;
  typesLoading: boolean;
  typesError: boolean;
  fetchConversations: (groupSlug?: string) => Promise<void>;
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
  const [typesLoading, setTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState(false);

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

  const apiCall = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
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
          return data.data || (data as any);
        } else {
          throw new Error(data.message || "API request failed");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        throw new Error(errorMessage);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  const fetchConversations = useCallback(
    async (groupSlug?: string) => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = groupSlug
          ? `community/conversations?group=${groupSlug}`
          : `community/conversations`;

        const response = await fetch(`${apiUrl}${endpoint}`, {
          headers: getAuthHeaders(),
        });

        const result: ApiResponse<PaginatedResponse<Conversation>> =
          await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch conversations");
        }

        if (result.status === "success" && result.data) {
          const conversationsData = result.data.data || [];

          const transformedConversations = conversationsData.map((conv) => ({
            ...conv,
            author: conv.sender?.name || conv.author || "Unknown",
            author_id: conv.sender?.id?.toString() || conv.author_id,
            replies: conv.replies || 0,
            views: conv.views || 0,
            last_activity: conv.updated_at || conv.created_at,
            category: conv.type || conv.category || "General",
            status: (conv.status || "open") as "open" | "closed",
            is_pinned: conv.is_pinned || false,
          }));

          setConversations(transformedConversations);

          if (result.data.total !== undefined) {
            setStats({
              total_topics: result.data.total,
              total_replies: 0,
              total_views: 0,
              active_today: 0,
            });
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load conversations"
        );
        showErrorToast("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  const fetchConversation = useCallback(
    async (id: number): Promise<Conversation | null> => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiCall<Conversation>(
          `community/conversations/${id}`
        );

        if (data) {
          return {
            ...data,
            author: data.sender?.name || data.author || "Unknown",
            author_id: data.sender?.id?.toString() || data.author_id,
            last_activity: data.updated_at || data.created_at,
            category: data.type || data.category || "General",
          };
        }

        return null;
      } catch (err) {
        showErrorToast("Failed to load conversation details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const fetchConversationTypes = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      setTypesLoading(true);
      setTypesError(false);

      const authToken = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      const response = await fetch(`${apiUrl}conversation-types`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
          "X-Company-ID": companyId || "",
        },
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch types");
      }

      if (
        result.status === "success" &&
        result.types &&
        Array.isArray(result.types)
      ) {
        const formattedTypes: ConversationType[] = result.types.map(
          (type: string, index: number) => ({
            id: index + 1,
            name: type,
            slug: type.toLowerCase().replace(/\s+/g, "-"),
            description: `${type} conversation type`,
          })
        );

        setConversationTypes(formattedTypes);
      } else {
        setConversationTypes([]);
        setTypesError(true);
      }
    } catch (err) {
      setTypesError(true);
      setConversationTypes([]);
      showErrorToast("Failed to load conversation types");
    } finally {
      setTypesLoading(false);
    }
  }, [apiUrl]);

  const fetchConversationGroups = useCallback(async () => {
    try {
      const data = await apiCall<{ data: ConversationGroup[] }>(
        "community/groups"
      );

      if (data && data.data && Array.isArray(data.data)) {
        setConversationGroups(data.data);
      } else if (data && Array.isArray(data)) {
        setConversationGroups(data as any);
      } else {
        setConversationGroups([]);
      }
    } catch (err) {
      setConversationGroups([]);
    }
  }, [apiCall]);

  const createConversation = useCallback(
    async (params: CreateConversationParams): Promise<Conversation | null> => {
      try {
        setLoading(true);
        setError(null);

        const formData = new FormData();

        if (params.group) {
          formData.append("group", params.group.toString());
        }

        formData.append("title", params.title);
        formData.append("type", params.type);
        formData.append("content", params.content);

        if (params.attachment) {
          formData.append("attachment", params.attachment);
        }

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
        showErrorToast(
          err instanceof Error ? err.message : "Failed to create conversation"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchConversations, getAuthHeaders]
  );

  const deleteConversation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await apiCall<void>(`community/conversations/${id}`, {
          method: "DELETE",
        });

        showSuccessToast("Conversation deleted successfully");

        setConversations((prev) => prev.filter((conv) => conv.id !== id));

        if (stats) {
          setStats({
            ...stats,
            total_topics: stats.total_topics - 1,
          });
        }

        return true;
      } catch (err) {
        showErrorToast(
          err instanceof Error ? err.message : "Failed to delete conversation"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, stats]
  );

  return {
    conversations,
    stats,
    conversationTypes,
    conversationGroups,
    loading,
    error,
    typesLoading,
    typesError,
    fetchConversations,
    fetchConversation,
    fetchConversationTypes,
    fetchConversationGroups,
    createConversation,
    deleteConversation,
  };
}