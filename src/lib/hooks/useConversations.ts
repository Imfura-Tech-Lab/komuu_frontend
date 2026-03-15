import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

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

interface ApiResponse<T> {
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

  const fetchConversations = useCallback(async (groupSlug?: string) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = groupSlug
        ? `community/conversations?group=${groupSlug}`
        : `community/conversations`;

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<PaginatedResponse<Conversation>>>(
        endpoint,
        { headers: getCompanyHeaders() }
      );

      const result = response.data;
      if ((result.status === "success" || result.status === true) && result.data) {
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
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load conversations");
      showErrorToast("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversation = useCallback(async (id: number): Promise<Conversation | null> => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<Conversation>>(
        `community/conversations/${id}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        return {
          ...data.data,
          author: data.data.sender?.name || data.data.author || "Unknown",
          author_id: data.data.sender?.id?.toString() || data.data.author_id,
          last_activity: data.data.updated_at || data.data.created_at,
          category: data.data.type || data.data.category || "General",
        };
      }

      return null;
    } catch {
      showErrorToast("Failed to load conversation details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversationTypes = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      setTypesLoading(true);
      setTypesError(false);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<string[]>>(
        "conversation-types",
        { headers: getCompanyHeaders() }
      );

      const result = response.data;
      if (
        (result.status === "success" || result.status === true) &&
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
    } catch {
      setTypesError(true);
      setConversationTypes([]);
      showErrorToast("Failed to load conversation types");
    } finally {
      setTypesLoading(false);
    }
  }, []);

  const fetchConversationGroups = useCallback(async () => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<{ data: ConversationGroup[] }>>(
        "community/groups",
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        if (Array.isArray((data.data as { data?: ConversationGroup[] }).data)) {
          setConversationGroups((data.data as { data: ConversationGroup[] }).data);
        } else if (Array.isArray(data.data)) {
          setConversationGroups(data.data as unknown as ConversationGroup[]);
        } else {
          setConversationGroups([]);
        }
      }
    } catch {
      setConversationGroups([]);
    }
  }, []);

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

        const client = getAuthenticatedClient();
        const response = await client.postFormData<ApiResponse<Conversation>>(
          "community/conversations",
          formData,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if ((data.status === "success" || data.status === true) && data.data) {
          showSuccessToast("Conversation created successfully");
          await fetchConversations();
          return data.data;
        }

        return null;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to create conversation");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchConversations]
  );

  const deleteConversation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        const response = await client.delete<ApiResponse<void>>(
          `community/conversations/${id}`,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if (data.status === "success" || data.status === true) {
          showSuccessToast("Conversation deleted successfully");

          setConversations((prev) => prev.filter((conv) => conv.id !== id));

          if (stats) {
            setStats({
              ...stats,
              total_topics: stats.total_topics - 1,
            });
          }

          return true;
        }

        return false;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to delete conversation");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [stats]
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
