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

export interface CreateMessageParams {
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

interface PaginatedMessagesResponse {
  current_page: number;
  data: ConversationMessage[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
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

  const fetchMessages = useCallback(
    async (conversationId: number) => {
      if (typeof window === "undefined") return;

      try {
        setLoading(true);
        setError(null);
        setCurrentConversationId(conversationId);

        console.log(`Fetching messages for conversation: ${conversationId}`);

        const endpoint = `community/messages?conversation_id=${conversationId}`;

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        // Check if response is ok first
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<PaginatedMessagesResponse> = await response.json();

        console.log('API Response:', data);

        // Check API response status
        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to fetch messages");
        }

        // Handle the paginated response structure correctly
        if (data.status === "success" || data.status === true) {
          let messagesData: ConversationMessage[] = [];
          
          // Check if data exists and has the paginated structure
          if (data.data && data.data.data && Array.isArray(data.data.data)) {
            messagesData = data.data.data;
          } 
          // Fallback: if data is directly an array
          else if (Array.isArray(data.data)) {
            messagesData = data.data;
          }

          console.log('Processed messages:', messagesData);
          
          // Sort messages by created_at in descending order (newest first)
          const sortedMessages = messagesData.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          setMessages(sortedMessages);
        } else {
          throw new Error(data.message || "Failed to fetch messages");
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load messages";
        setError(errorMessage);
        showErrorToast(errorMessage);
        // Clear messages on error
        setMessages([]);
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  const fetchMessage = useCallback(
    async (id: number): Promise<ConversationMessage | null> => {
      if (typeof window === "undefined") return null;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}community/messages/${id}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<ConversationMessage> = await response.json();

        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to fetch message");
        }

        if (data.status === "success" || data.status === true) {
          return data.data;
        }

        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load message details";
        console.error('Error fetching message:', err);
        showErrorToast(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  const createMessage = useCallback(
    async (params: CreateMessageParams): Promise<boolean> => {
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

        const headers = getAuthHeaders();
        // Remove Accept header for FormData to let browser set multipart boundary
        delete (headers as any).Accept;

        const response = await fetch(`${apiUrl}community/messages`, {
          method: "POST",
          body: formData,
          headers,
        });

        // Check HTTP status first
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<ConversationMessage> = await response.json();

        // Check API response status
        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to create message");
        }

        if (data.status === "success" || data.status === true) {
          const successMessage = params.parent_id
            ? "Reply posted successfully"
            : "Message posted successfully";
          
          showSuccessToast(successMessage);

          // Add the new message to the current messages list
          if (data.data) {
            setMessages((prev) => {
              const newMessages = [...prev, data.data!];
              // Sort by created_at in descending order
              return newMessages.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          }

          return true;
        }

        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to post message";
        console.error('Error creating message:', err);
        showErrorToast(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  const deleteMessage = useCallback(
    async (id: number): Promise<boolean> => {
      if (typeof window === "undefined") return false;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}community/messages/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<void> = await response.json();

        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to delete message");
        }

        showSuccessToast("Message deleted successfully");

        // Remove the deleted message from the current messages list
        setMessages((prev) => prev.filter((msg) => msg.id !== id));

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete message";
        console.error('Error deleting message:', err);
        showErrorToast(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

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