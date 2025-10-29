import { useState, useCallback, useEffect } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

export interface InstitutionMember {
  id: number;
  name: string;
  email?: string;
  role?: string;
  status?: string;
  avatar?: string;
}

interface ApiResponse<T = any> {
  status: "success" | "error" | boolean;
  message: string;
  data: T;
}

interface UseInstitutionMembersReturn {
  members: InstitutionMember[];
  loading: boolean;
  error: string | null;
  fetchMembers: () => Promise<void>;
}

export function useInstitutionMembers(): UseInstitutionMembersReturn {
  const [members, setMembers] = useState<InstitutionMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  // Initialize auth values on client side only
  useEffect(() => {
    setCompanyId(localStorage.getItem("company_id"));
    setAuthToken(localStorage.getItem("auth_token"));
    setIsInitialized(true);
  }, []);

  // Get auth headers helper
  const getAuthHeaders = useCallback(() => {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
      "X-Company-ID": companyId || "",
    };
  }, [authToken, companyId]);

  // Base fetch wrapper with centralized error handling
  const apiCall = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
      // Guard: Don't make API calls until auth is initialized
      if (!isInitialized || !authToken || !companyId) {
        console.warn("API call skipped: Auth not initialized");
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
    [apiUrl, getAuthHeaders, isInitialized, authToken, companyId]
  );

  // Fetch all institution members
  const fetchMembers = useCallback(async () => {
    // Guard: Don't fetch if not initialized
    if (!isInitialized || !authToken || !companyId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiCall<InstitutionMember[]>(
        "community/institution/members/all"
      );

      if (data) {
        setMembers(data);
      }
    } catch (err) {
      console.error("Failed to fetch institution members:", err);
      showErrorToast("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [apiCall, isInitialized, authToken, companyId]);

  return {
    members,
    loading,
    error,
    fetchMembers,
  };
}