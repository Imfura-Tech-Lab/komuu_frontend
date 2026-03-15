import { useState, useEffect, useCallback } from "react";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { Application } from "@/types";
import { getAuthenticatedClient, ApiError } from "@/lib/api-client";

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
      } catch {
        // Invalid JSON in localStorage
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

      // Handle response - use raw data if validation fails
      const responseData = response.data as { status?: string; data?: any; message?: string };

      if (responseData.status === "success" || responseData.data) {
        if (isMember) {
          // For member: my-application returns single object
          const applicationData = responseData.data;
          setApplications(applicationData ? [applicationData] : []);
        } else {
          // For admin: applications returns paginated data
          const paginatedData = responseData.data || {};
          const applicationsData = Array.isArray(paginatedData.data)
            ? paginatedData.data
            : Array.isArray(paginatedData)
            ? paginatedData
            : [];

          setApplications(applicationsData);
          if (paginatedData.current_page) {
            setPagination({
              currentPage: paginatedData.current_page,
              lastPage: paginatedData.last_page,
              total: paginatedData.total,
              perPage: paginatedData.per_page,
            });
          }
        }
      } else {
        throw new Error(responseData.message || "Failed to fetch applications");
      }
    } catch (err) {
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
