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

        console.log(`🔵 Fetching messages for conversation: ${conversationId}`);

        const endpoint = `community/conversations/${conversationId}`;

        const response = await fetch(`${apiUrl}${endpoint}`, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<ConversationDetailResponse> = await response.json();

        console.log("📦 API Response:", data);

        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to fetch messages");
        }

        if (data.status === "success" || data.status === true) {
          let messagesData: ConversationMessage[] = [];
          
          if (data.data && data.data.messages && Array.isArray(data.data.messages)) {
            messagesData = data.data.messages;
          } else if (Array.isArray(data.data)) {
            messagesData = data.data;
          }

          console.log("✅ Processed messages:", messagesData.length);
          
          const sortedMessages = messagesData.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          setMessages(sortedMessages);
        } else {
          throw new Error(data.message || "Failed to fetch messages");
        }
      } catch (err) {
        console.error("❌ Error fetching messages:", err);
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
        console.error("❌ Error fetching message:", err);
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
        delete (headers as any).Accept;

        console.log("🔵 Creating message for conversation:", params.conversation_id);

        const response = await fetch(`${apiUrl}community/messages`, {
          method: "POST",
          body: formData,
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse<ConversationMessage> = await response.json();

        console.log("📦 Create message response:", data);

        if (data.status === "error" || data.status === false) {
          throw new Error(data.message || "Failed to create message");
        }

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
        const errorMessage = err instanceof Error ? err.message : "Failed to post message";
        console.error("❌ Error creating message:", err);
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

        console.log("🔵 Deleting message:", id);

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
        console.log("✅ Message deleted:", id);

        setMessages((prev) => prev.filter((msg) => msg.id !== id));

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete message";
        console.error("❌ Error deleting message:", err);
        showErrorToast(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, getAuthHeaders]
  );

  const clearMessages = useCallback(() => {
    console.log("🔵 Clearing messages");
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