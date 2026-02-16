import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface ConversationMessage {
  id: number;
  conversation_id?: number;
  parent_id?: number;
  content: string;
  file_url?: string | null;
  created_at: string;
  updated_at?: string;
  sender: {
    id: number;
    name: string;
    role?: string;
  };
  replies?: ConversationMessage[];
  replies_count?: number;
}

export interface CreateMessageParams {
  conversation_id: number;
  parent_id?: number;
  content: string;
  attachment?: File;
}

interface ApiResponse<T> {
  status: "success" | "error" | boolean;
  message: string;
  data: T;
}

interface ConversationDetailResponse {
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
  messages?: ConversationMessage[];
}

interface UseConversationMessagesReturn {
  messages: ConversationMessage[];
  loading: boolean;
  error: string | null;
  currentConversationId: number | null;
  fetchMessages: (conversationId: number) => Promise<void>;
  fetchMessage: (id: number) => Promise<ConversationMessage | null>;
  createMessage: (params: CreateMessageParams) => Promise<boolean>;
  deleteMessage: (id: number) => Promise<boolean>;
  clearMessages: () => void;
}

export function useConversationMessages(): UseConversationMessagesReturn {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  const fetchMessages = useCallback(async (conversationId: number) => {
    if (typeof window === "undefined") return;

    try {
      setLoading(true);
      setError(null);
      setCurrentConversationId(conversationId);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<ConversationDetailResponse>>(
        `community/conversations/${conversationId}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        let messagesData: ConversationMessage[] = [];

        if (data.data && data.data.messages && Array.isArray(data.data.messages)) {
          messagesData = data.data.messages;
        } else if (Array.isArray(data.data)) {
          messagesData = data.data as unknown as ConversationMessage[];
        }

        const sortedMessages = messagesData.sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        setMessages(sortedMessages);
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to load messages";
      setError(errorMessage);
      showErrorToast(errorMessage);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessage = useCallback(async (id: number): Promise<ConversationMessage | null> => {
    if (typeof window === "undefined") return null;

    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<ConversationMessage>>(
        `community/messages/${id}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        return data.data;
      }

      return null;
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to load message details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMessage = useCallback(async (params: CreateMessageParams): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("conversation_id", params.conversation_id.toString());
      formData.append("conversation", params.conversation_id.toString());

      if (params.parent_id) {
        formData.append("parent_id", params.parent_id.toString());
      }

      formData.append("content", params.content);

      if (params.attachment) {
        formData.append("attachment", params.attachment);
      }

      const client = getAuthenticatedClient();
      const response = await client.postFormData<ApiResponse<ConversationMessage>>(
        "community/messages",
        formData,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        const successMessage = params.parent_id
          ? "Reply posted successfully"
          : "Message posted successfully";

        showSuccessToast(successMessage);

        if (data.data) {
          setMessages((prev) => {
            const newMessages = [...prev, data.data!];
            return newMessages.sort((a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }

        return true;
      }

      return false;
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to post message");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMessage = useCallback(async (id: number): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.delete<ApiResponse<void>>(
        `community/messages/${id}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast("Message deleted successfully");
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        return true;
      }

      return false;
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to delete message");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    currentConversationId,
    fetchMessages,
    fetchMessage,
    createMessage,
    deleteMessage,
    clearMessages,
  };
}
