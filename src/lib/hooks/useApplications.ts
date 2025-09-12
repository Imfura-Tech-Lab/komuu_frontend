import { useState, useEffect } from "react";
import { Application } from "@/types";
import { showErrorToast } from "@/components/layouts/auth-layer-out";

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.role);
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");

      if (!token) {
        showErrorToast("Please login to view applications");
        return;
      }

      const parsedUserData = userData ? JSON.parse(userData) : null;
      const isMember = parsedUserData?.role === "Member";
      const endpoint = isMember ? "my-application" : "applications";

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        if (isMember) {
          setApplications(data.data ? [data.data] : []);
        } else {
          const applicationsData = data.data?.data || [];
          setApplications(Array.isArray(applicationsData) ? applicationsData : []);
        }
      } else {
        throw new Error(data.message || "Failed to fetch applications");
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch applications");
      showErrorToast("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  return {
    applications,
    loading,
    error,
    userRole,
    fetchApplications,
    setApplications
  };
};
