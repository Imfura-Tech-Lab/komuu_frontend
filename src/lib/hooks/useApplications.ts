import { useState, useEffect, useCallback } from "react";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { Application } from "@/types";

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [pagination, setPagination] = useState({
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

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");

      if (!token) {
        showErrorToast("Authentication required. Please login to continue.");
        return;
      }

      const parsedUserData = userData ? JSON.parse(userData) : null;
      const isMember = parsedUserData?.role === "Member";
      const endpoint = isMember ? "my-application" : "applications";

      const response = await fetch(`${apiUrl}${endpoint}?page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          showErrorToast("Session expired. Please login again.");
        } else if (response.status === 403) {
          showErrorToast("You don't have permission to view applications.");
        } else if (response.status === 404) {
          showErrorToast("Applications endpoint not found.");
        } else if (response.status >= 500) {
          showErrorToast("Server error. Please try again later.");
        } else {
          showErrorToast(data.message || `Error: ${response.status}`);
        }
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      if (data.status === "success") {
        if (isMember) {
          // For member: my-application returns single object
          setApplications(data.data ? [data.data] : []);
        } else {
          // For admin: applications returns paginated data
          const paginatedData = data.data;
          const applicationsData = Array.isArray(paginatedData.data)
            ? paginatedData.data
            : [];

          setApplications(applicationsData);
          setPagination({
            currentPage: paginatedData.current_page,
            lastPage: paginatedData.last_page,
            total: paginatedData.total,
            perPage: paginatedData.per_page,
          });
        }
      } else {
        showErrorToast(data.message || "Failed to load applications");
        throw new Error(data.message || "Failed to fetch applications");
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch applications";
      setError(errorMessage);

      if (err instanceof Error && !err.message.includes("HTTP error")) {
        showErrorToast("Network error. Please check your connection.");
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
