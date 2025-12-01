import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { DashboardResponse } from "@/types/dashboard";

const BOARD_ROLES = ["Administrator", "President", "Board"];

export function useDashboardData() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const isMounted = useRef(true);

  const fetchDashboard = useCallback(
    async (showLoadingState = true) => {
      try {
        if (showLoadingState) {
          setLoading(true);
        }
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");
        const cachedUserData = localStorage.getItem("user_data");

        if (!token) {
          showErrorToast("Please login to view dashboard");
          router.push("/login");
          return;
        }

        if (!apiUrl) {
          showErrorToast("Backend API URL is not configured.");
          setError(new Error("Configuration error: Backend API URL missing."));
          return;
        }

        let userRole = "Member";
        if (cachedUserData) {
          try {
            const parsed = JSON.parse(cachedUserData);
            userRole = parsed.role;
          } catch (parseErr) {
            console.warn("Failed to parse cached user data:", parseErr);
          }
        }

        const isBoard = BOARD_ROLES.includes(userRole);
        const endpoint = isBoard
          ? `${apiUrl}board/dashboard`
          : `${apiUrl}dashboard`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            showErrorToast("Unauthorized. Please log in again.");
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            router.push("/login");
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!isMounted.current) return;

        if (result.status === "success") {
          // Tag response with role for type discrimination
          setData({
            ...result,
            role: isBoard ? "board" : "member",
          } as DashboardResponse);
        } else {
          throw new Error(result.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        if (!isMounted.current) return;

        console.error("Failed to fetch dashboard:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch dashboard")
        );

        if (!showLoadingState) {
          showErrorToast("Failed to refresh dashboard");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [router]
  ); // Fixed dependency array

  useEffect(() => {
    isMounted.current = true;
    fetchDashboard(true);

    return () => {
      isMounted.current = false;
    };
  }, [fetchDashboard]);

  const refetch = useCallback(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  return { data, loading, error, refetch };
}
