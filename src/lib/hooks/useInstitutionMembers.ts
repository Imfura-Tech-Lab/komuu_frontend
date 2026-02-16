import { useState, useCallback, useEffect } from "react";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface InstitutionMember {
  id: number;
  name: string;
  email?: string;
  role?: string;
  status?: string;
  avatar?: string;
}

interface ApiResponse {
  status: "success" | "error" | boolean;
  message: string;
  data: InstitutionMember[];
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on client side only
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Fetch all institution members
  const fetchMembers = useCallback(async () => {
    // Guard: Don't fetch if not initialized
    if (!isInitialized) {
      return;
    }

    const token = localStorage.getItem("auth_token");
    const companyId = localStorage.getItem("company_id");

    if (!token || !companyId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse>("community/institution/members/all", {
        headers: getCompanyHeaders(),
      });

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        setMembers(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to load members";
      setError(errorMessage);
      showErrorToast("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  return {
    members,
    loading,
    error,
    fetchMembers,
  };
}
