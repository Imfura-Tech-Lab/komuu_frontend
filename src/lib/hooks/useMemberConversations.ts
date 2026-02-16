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

export interface StartConversationParams {
  group: number;
  title: string;
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

interface UseMemberConversationsReturn {
  conversations: Conversation[];
  stats: ConversationsStats | null;
  loading: boolean;
  error: string | null;
  fetchConversations: (groupSlug?: string) => Promise<void>;
  fetchConversation: (id: number) => Promise<Conversation | null>;
  startConversation: (
    params: StartConversationParams
  ) => Promise<Conversation | null>;
}

export function useMemberConversations(): UseMemberConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch conversations with optional group filter
   * Member endpoint: GET /conversations?group={slug}
   */
  const fetchConversations = useCallback(async (groupSlug?: string) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = groupSlug
        ? `conversations?group=${groupSlug}`
        : `conversations`;

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
            total_replies: transformedConversations.reduce(
              (sum, conv) => sum + (conv.replies || 0),
              0
            ),
            total_views: transformedConversations.reduce(
              (sum, conv) => sum + (conv.views || 0),
              0
            ),
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

  /**
   * Fetch single conversation details
   * Member endpoint: GET /conversations/{id}
   */
  const fetchConversation = useCallback(async (id: number): Promise<Conversation | null> => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<Conversation>>(
        `conversations/${id}`,
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

  /**
   * Start a new conversation (member-initiated)
   * Member endpoint: POST /conversations/start-conversation
   */
  const startConversation = useCallback(
    async (params: StartConversationParams): Promise<Conversation | null> => {
      try {
        setLoading(true);
        setError(null);

        if (!params.group) {
          throw new Error("Group is required");
        }

        if (!params.title || params.title.trim().length < 5) {
          throw new Error("Title must be at least 5 characters long");
        }

        if (!params.content || params.content.trim().length < 10) {
          throw new Error("Content must be at least 10 characters long");
        }

        if (params.attachment) {
          const maxSize = 10 * 1024 * 1024;
          if (params.attachment.size > maxSize) {
            throw new Error("File size must be less than 10MB");
          }

          const allowedTypes = [
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            "application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ];

          if (!allowedTypes.includes(params.attachment.type)) {
            throw new Error("File type not supported");
          }
        }

        const formData = new FormData();
        formData.append("group", params.group.toString());
        formData.append("title", params.title.trim());
        formData.append("content", params.content.trim());

        if (params.attachment) {
          formData.append("attachment", params.attachment);
        }

        const client = getAuthenticatedClient();
        const response = await client.postFormData<ApiResponse<Conversation>>(
          "conversations/start-conversation",
          formData,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if ((data.status === "success" || data.status === true) && data.data) {
          showSuccessToast("Conversation started successfully");
          await fetchConversations();
          return data.data;
        }

        return null;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to start conversation");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchConversations]
  );

  return {
    conversations,
    stats,
    loading,
    error,
    fetchConversations,
    fetchConversation,
    startConversation,
  };
}
