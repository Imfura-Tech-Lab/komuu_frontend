import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { DashboardResponse } from "@/types/dashboard";
import { getAuthenticatedClient, ApiError } from "@/lib/api-client";

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

        const token = localStorage.getItem("auth_token");
        const cachedUserData = localStorage.getItem("user_data");

        if (!token) {
          showErrorToast("Please login to view dashboard");
          router.push("/login");
          return;
        }

        let userRole = "Member";
        if (cachedUserData) {
          try {
            const parsed = JSON.parse(cachedUserData);
            userRole = parsed.role;
          } catch {
            // Invalid cached user data
          }
        }

        const isBoard = BOARD_ROLES.includes(userRole);
        const endpoint = isBoard ? "board/dashboard" : "dashboard";

        const client = getAuthenticatedClient();
        const response = await client.get<{ status: string; data: unknown; message?: string }>(endpoint);
        const result = response.data;

        if (!isMounted.current) return;

        if (result.status === "success" && result.data) {
          const dashboardData = {
            status: "success",
            message: result.message || "Dashboard Data",
            data: result.data,
            role: isBoard ? "board" : "member",
          } as unknown as DashboardResponse;
          setData(dashboardData);
        } else {
          throw new Error(result.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        if (!isMounted.current) return;

        const apiError = err as ApiError;

        // Handle auth errors
        if (apiError.status === 401 || apiError.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          router.push("/login");
          return;
        }

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
  );

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
