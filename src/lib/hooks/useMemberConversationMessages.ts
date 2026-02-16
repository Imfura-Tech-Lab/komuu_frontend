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

export interface SendMessageParams {
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

interface UseMemberConversationMessagesReturn {
  messages: ConversationMessage[];
  loading: boolean;
  error: string | null;
  currentConversationId: number | null;
  fetchMessages: (conversationId: number) => Promise<void>;
  fetchMessageDetails: (conversationId: number, messageId: number) => Promise<ConversationMessage | null>;
  sendMessage: (params: SendMessageParams) => Promise<boolean>;
  deleteMessage: (conversationId: number, messageId: number) => Promise<boolean>;
  clearMessages: () => void;
}

export function useMemberConversationMessages(): UseMemberConversationMessagesReturn {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);

  /**
   * Fetch all messages for a conversation
   * Member endpoint: GET /conversations/{conversation_id}/messages
   */
  const fetchMessages = useCallback(async (conversationId: number) => {
    if (typeof window === "undefined") return;

    try {
      setLoading(true);
      setError(null);
      setCurrentConversationId(conversationId);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<ConversationDetailResponse>>(
        `conversations/${conversationId}`,
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

  /**
   * Fetch details of a specific message
   * Member endpoint: GET /conversations/{conversation_id}/messages/{message_id}/details
   */
  const fetchMessageDetails = useCallback(
    async (conversationId: number, messageId: number): Promise<ConversationMessage | null> => {
      if (typeof window === "undefined") return null;

      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        const response = await client.get<ApiResponse<ConversationMessage>>(
          `conversations/${conversationId}/messages/${messageId}/details`,
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
    },
    []
  );

  /**
   * Send a new message or reply to a conversation
   * Member endpoint: POST /conversations/{conversation_id}/send-message
   */
  const sendMessage = useCallback(async (params: SendMessageParams): Promise<boolean> => {
    if (typeof window === "undefined") return false;

    try {
      setLoading(true);
      setError(null);

      if (!params.content || params.content.trim().length < 10) {
        throw new Error("Message must be at least 10 characters long");
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
      if (params.parent_id) {
        formData.append("parent_id", params.parent_id.toString());
      }
      formData.append("content", params.content.trim());
      if (params.attachment) {
        formData.append("attachment", params.attachment);
      }

      const client = getAuthenticatedClient();
      const response = await client.postFormData<ApiResponse<ConversationMessage>>(
        `conversations/${params.conversation_id}/send-message`,
        formData,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        const successMessage = params.parent_id
          ? "Reply posted successfully"
          : "Message sent successfully";

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
      showErrorToast(apiError.message || "Failed to send message");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a message (member can only delete their own messages)
   * Member endpoint: DELETE /conversations/messages/{message_id}/delete
   */
  const deleteMessage = useCallback(
    async (_conversationId: number, messageId: number): Promise<boolean> => {
      if (typeof window === "undefined") return false;

      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        const response = await client.delete<ApiResponse<void>>(
          `conversations/messages/${messageId}/delete`,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if (data.status === "success" || data.status === true) {
          showSuccessToast("Message deleted successfully");
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
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
    },
    []
  );

  /**
   * Clear messages from state (used when switching conversations)
   */
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
    fetchMessageDetails,
    sendMessage,
    deleteMessage,
    clearMessages,
  };
}