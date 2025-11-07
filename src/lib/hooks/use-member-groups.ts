import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

export interface MemberGroup {
  id: string;
  name: string;
  slug: string;
  description: string;
  members: number;
  category: string;
  privacy: "Public" | "Private";
  activity: "High" | "Medium" | "Low";
  created_at: string;
  created_by: {
    id: number;
    name: string;
    role: string;
  };
  is_member?: boolean;
}

interface Pagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

interface ApiResponse<T = any> {
  status: "success" | "error" | boolean;
  message: string;
  data: T;
}

interface LaravelPaginatedResponse {
  current_page: number;
  data: any[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface UseMemberGroupsReturn {
  groups: MemberGroup[];
  joinedGroups: MemberGroup[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchAllGroups: (page?: number) => Promise<void>;
  fetchJoinedGroups: (page?: number) => Promise<void>;
  fetchGroup: (slug: string) => Promise<MemberGroup | null>;
  joinGroup: (slug: string) => Promise<boolean>;
  leaveGroup: (slug: string) => Promise<boolean>;
}

export function useMemberGroups(): UseMemberGroupsReturn {
  const [groups, setGroups] = useState<MemberGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<MemberGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("company_id") : null;

  // Transform API group to component interface
  const transformGroup = useCallback((apiGroup: any): MemberGroup => {
    return {
      id: apiGroup.id.toString(),
      name: apiGroup.name,
      slug: apiGroup.slug,
      description: apiGroup.description || "",
      members: apiGroup.total_members || 0,
      category: apiGroup.category || "General",
      privacy: apiGroup.privacy || "Public",
      activity: apiGroup.activity || "Medium",
      created_at: apiGroup.created_at,
      created_by: apiGroup.created_by,
      is_member: apiGroup.is_member,
    };
  }, []);

  // Get auth headers
  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Company-ID": companyId || "",
    };
  };

  // Base fetch wrapper with error handling
  const apiCall = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T | null> => {
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
    [apiUrl, companyId]
  );

  // Fetch all available groups
  const fetchAllGroups = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiCall<LaravelPaginatedResponse>(
          `communication/groups/all?page=${page}`
        );

        if (data) {
          const transformedGroups = data.data.map(transformGroup);
          setGroups(transformedGroups);

          setPagination({
            currentPage: data.current_page,
            lastPage: data.last_page,
            perPage: data.per_page,
            total: data.total,
            from: data.from || 0,
            to: data.to || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch all groups:", err);
        showErrorToast("Failed to load groups");
      } finally {
        setLoading(false);
      }
    },
    [apiCall, transformGroup]
  );

  // Fetch groups current member has joined
  const fetchJoinedGroups = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiCall<LaravelPaginatedResponse>(
          `communication/groups/all/joined?page=${page}`
        );

        if (data) {
          const transformedGroups = data.data.map(transformGroup);
          setJoinedGroups(transformedGroups);

          setPagination({
            currentPage: data.current_page,
            lastPage: data.last_page,
            perPage: data.per_page,
            total: data.total,
            from: data.from || 0,
            to: data.to || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch joined groups:", err);
        showErrorToast("Failed to load your groups");
      } finally {
        setLoading(false);
      }
    },
    [apiCall, transformGroup]
  );

  // Fetch single group details by slug
  const fetchGroup = useCallback(
    async (slug: string): Promise<MemberGroup | null> => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiCall<any>(`communication/groups/${slug}`);

        if (data) {
          return transformGroup(data);
        }

        return null;
      } catch (err) {
        console.error(`Failed to fetch group ${slug}:`, err);
        showErrorToast("Failed to load group details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, transformGroup]
  );

  // Join a group
  const joinGroup = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await apiCall<void>(`communication/groups/${slug}/join`, {
          method: "PUT",
        });

        showSuccessToast("Successfully joined the group");

        // Refresh both lists to reflect changes
        await Promise.all([
          fetchAllGroups(pagination.currentPage),
          fetchJoinedGroups(1),
        ]);

        return true;
      } catch (err) {
        console.error(`Failed to join group ${slug}:`, err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to join group"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchAllGroups, fetchJoinedGroups, pagination.currentPage]
  );

  // Leave a group
  const leaveGroup = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await apiCall<void>(`communication/groups/${slug}/exit-group`, {
          method: "PUT",
        });

        showSuccessToast("Successfully left the group");

        // Refresh both lists to reflect changes
        await Promise.all([
          fetchAllGroups(pagination.currentPage),
          fetchJoinedGroups(pagination.currentPage),
        ]);

        return true;
      } catch (err) {
        console.error(`Failed to leave group ${slug}:`, err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to leave group"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchAllGroups, fetchJoinedGroups, pagination.currentPage]
  );

  return {
    groups,
    joinedGroups,
    loading,
    error,
    pagination,
    fetchAllGroups,
    fetchJoinedGroups,
    fetchGroup,
    joinGroup,
    leaveGroup,
  };
}