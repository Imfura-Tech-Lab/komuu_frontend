import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

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

interface ApiResponse<T = any> {
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

  /**
   * Fetch all messages for a conversation
   * Member endpoint: GET /conversations/{conversation_id}/messages
   * 
   * Note: This endpoint returns the conversation with nested messages
   * Same as admin endpoint for fetching conversation details
   */
  const fetchMessages = useCallback(
    async (conversationId: number) => {
      if (typeof window === "undefined") return;

      try {
        setLoading(true);
        setError(null);
        setCurrentConversationId(conversationId);

        const endpoint = `conversations/${conversationId}`;

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<ConversationDetailResponse> = await response.json();

        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to fetch messages");
        }

        if (data.status === "success" || data.status === true) {
          let messagesData: ConversationMessage[] = [];
          
          // Handle different response structures
          if (data.data && data.data.messages && Array.isArray(data.data.messages)) {
            messagesData = data.data.messages;
          } else if (Array.isArray(data.data)) {
            messagesData = data.data;
          }

          // Sort by creation time (oldest first for chat display)
          const sortedMessages = messagesData.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          setMessages(sortedMessages);
        } else {
          throw new Error(data.message || "Failed to fetch messages");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load messages";
        setError(errorMessage);
        showErrorToast(errorMessage);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

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

        const endpoint = `conversations/${conversationId}/messages/${messageId}/details`;

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<ConversationMessage> = await response.json();

        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to fetch message details");
        }

        if (data.status === "success" || data.status === true) {
          return data.data;
        }

        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load message details";
        console.error("Error fetching message details:", err);
        showErrorToast(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  /**
   * Send a new message or reply to a conversation
   * Member endpoint: POST /conversations/{conversation_id}/send-message
   * 
   * Required fields:
   * - content: string (min 10 characters)
   * Optional fields:
   * - parent_id: number (for replies)
   * - attachment: File (images, PDFs, docs)
   */
  const sendMessage = useCallback(
    async (params: SendMessageParams): Promise<boolean> => {
      if (typeof window === "undefined") return false;

      try {
        setLoading(true);
        setError(null);

        // Validate content
        if (!params.content || params.content.trim().length < 10) {
          throw new Error("Message must be at least 10 characters long");
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
        
        if (params.parent_id) {
          formData.append("parent_id", params.parent_id.toString());
        }

        formData.append("content", params.content.trim());

        if (params.attachment) {
          formData.append("attachment", params.attachment);
        }

        // Remove Accept header for FormData
        const headers = getAuthHeaders();
        delete (headers as any).Accept;

        const endpoint = `conversations/${params.conversation_id}/send-message`;

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: "POST",
          body: formData,
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<ConversationMessage> = await response.json();

        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to send message");
        }

        if (data.status === "success" || data.status === true) {
          const successMessage = params.parent_id
            ? "Reply posted successfully"
            : "Message sent successfully";
          
          showSuccessToast(successMessage);

          // Optimistic update: Add new message to state
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
        const errorMessage = err instanceof Error ? err.message : "Failed to send message";
        console.error("Error sending message:", err);
        showErrorToast(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  /**
   * Delete a message (member can only delete their own messages)
   * Member endpoint: DELETE /conversations/messages/{message_id}/delete
   */
  const deleteMessage = useCallback(
    async (conversationId: number, messageId: number): Promise<boolean> => {
      if (typeof window === "undefined") return false;

      try {
        setLoading(true);
        setError(null);

        const endpoint = `conversations/messages/${messageId}/delete`;

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<void> = await response.json();

        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to delete message");
        }

        showSuccessToast("Message deleted successfully");

        // Optimistic update: Remove message from state
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete message";
        console.error("Error deleting message:", err);
        showErrorToast(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
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