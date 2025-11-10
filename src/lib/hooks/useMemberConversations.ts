import { useState, useCallback } from "react";
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

export interface StartConversationParams {
  group: number;
  title: string;
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

  /**
   * Fetch conversations with optional group filter
   * Member endpoint: GET /conversations?group={slug}
   */
  const fetchConversations = useCallback(
    async (groupSlug?: string) => {
      try {
        setLoading(true);
        setError(null);

        const endpoint = groupSlug
          ? `conversations?group=${groupSlug}`
          : `conversations`;

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

          // Set stats from pagination metadata
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
              active_today: 0, // Backend should provide this
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

  /**
   * Fetch single conversation details
   * Member endpoint: GET /conversations/{id}
   */
  const fetchConversation = useCallback(
    async (id: number): Promise<Conversation | null> => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiCall<Conversation>(`conversations/${id}`);

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

  /**
   * Start a new conversation (member-initiated)
   * Member endpoint: POST /conversations/start-conversation
   * 
   * Required fields:
   * - group: number (group ID)
   * - title: string
   * - content: string
   * - attachment: File (optional)
   */
  const startConversation = useCallback(
    async (params: StartConversationParams): Promise<Conversation | null> => {
      try {
        setLoading(true);
        setError(null);

        // Validate required fields
        if (!params.group) {
          throw new Error("Group is required");
        }

        if (!params.title || params.title.trim().length < 5) {
          throw new Error("Title must be at least 5 characters long");
        }

        if (!params.content || params.content.trim().length < 10) {
          throw new Error("Content must be at least 10 characters long");
        }

        // Validate attachment if provided
        if (params.attachment) {
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (params.attachment.size > maxSize) {
            throw new Error("File size must be less than 10MB");
          }

          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ];

          if (!allowedTypes.includes(params.attachment.type)) {
            throw new Error("File type not supported");
          }
        }

        // Build FormData
        const formData = new FormData();
        formData.append("group", params.group.toString());
        formData.append("title", params.title.trim());
        formData.append("content", params.content.trim());

        if (params.attachment) {
          formData.append("attachment", params.attachment);
        }

        // Remove Accept header for FormData
        const headers = getAuthHeaders();
        delete (headers as any).Accept;

        const data = await apiCall<Conversation>(
          "conversations/start-conversation",
          {
            method: "POST",
            body: formData,
            headers,
          }
        );

        if (data) {
          showSuccessToast("Conversation started successfully");
          
          // Refresh conversations list
          await fetchConversations();
          
          return data;
        }

        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start conversation";
        showErrorToast(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchConversations, getAuthHeaders]
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