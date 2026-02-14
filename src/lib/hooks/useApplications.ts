import { useState, useEffect, useCallback } from "react";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { Application } from "@/types";
import { getAuthenticatedClient, ApiError } from "@/lib/api-client";
import { ApplicationSchema, safeParseWithFallback } from "@/lib/validations/api-schemas";
import { z } from "zod";

interface PaginationState {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

interface UseApplicationsReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  userRole: string;
  pagination: PaginationState;
  fetchApplications: (page?: number) => Promise<void>;
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

// Response schema for validation
const ApplicationsResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string().optional(),
  data: z.union([
    // Single application (member view)
    ApplicationSchema,
    // Paginated response (admin view)
    z.object({
      data: z.array(ApplicationSchema),
      current_page: z.number(),
      last_page: z.number(),
      total: z.number(),
      per_page: z.number(),
    }),
  ]).optional(),
});

export const useApplications = (): UseApplicationsReturn => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUserRole(parsedData.role || "");
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
    fetchApplications();
  }, []);

  const fetchApplications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");

      if (!token) {
        showErrorToast("Authentication required. Please login to continue.");
        return;
      }

      const parsedUserData = userData ? JSON.parse(userData) : null;
      const isMember = parsedUserData?.role === "Member";
      const endpoint = isMember ? "my-application" : `applications?page=${page}`;

      // Use centralized API client
      const client = getAuthenticatedClient();
      const response = await client.get(endpoint);

      // Validate response structure
      const validatedResponse = safeParseWithFallback(
        ApplicationsResponseSchema,
        response.data,
        { status: "error", data: undefined }
      );

      if (validatedResponse.status === "success" && validatedResponse.data) {
        if (isMember) {
          // For member: my-application returns single object
          const applicationData = validatedResponse.data as Application;
          setApplications(applicationData ? [applicationData] : []);
        } else {
          // For admin: applications returns paginated data
          const paginatedData = validatedResponse.data as {
            data: Application[];
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
          };

          setApplications(paginatedData.data || []);
          setPagination({
            currentPage: paginatedData.current_page,
            lastPage: paginatedData.last_page,
            total: paginatedData.total,
            perPage: paginatedData.per_page,
          });
        }
      } else {
        throw new Error(validatedResponse.message || "Failed to fetch applications");
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);

      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to fetch applications";
      setError(errorMessage);

      // Show appropriate error message based on status
      if (apiError.status === 401) {
        showErrorToast("Session expired. Please login again.");
      } else if (apiError.status === 403) {
        showErrorToast("You don't have permission to view applications.");
      } else if (apiError.status === 404) {
        showErrorToast("Applications endpoint not found.");
      } else if (apiError.status >= 500) {
        showErrorToast("Server error. Please try again later.");
      } else if (apiError.status === 0) {
        showErrorToast("Network error. Please check your connection.");
      } else {
        showErrorToast(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    applications,
    loading,
    error,
    userRole,
    pagination,
    fetchApplications,
    setApplications,
  };
};
