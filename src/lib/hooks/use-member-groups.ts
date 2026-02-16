import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

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

interface ApiResponse<T> {
  status: "success" | "error" | boolean;
  message: string;
  data: T;
}

interface LaravelPaginatedResponse {
  current_page: number;
  data: Record<string, unknown>[];
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

function transformGroup(apiGroup: Record<string, unknown>): MemberGroup {
  const createdBy = apiGroup.created_by as { id: number; name: string; role: string } | undefined;
  return {
    id: String(apiGroup.id),
    name: apiGroup.name as string,
    slug: apiGroup.slug as string,
    description: (apiGroup.description as string) || "",
    members: (apiGroup.total_members as number) || 0,
    category: (apiGroup.category as string) || "General",
    privacy: (apiGroup.privacy as "Public" | "Private") || "Public",
    activity: (apiGroup.activity as "High" | "Medium" | "Low") || "Medium",
    created_at: apiGroup.created_at as string,
    created_by: createdBy || { id: 0, name: "", role: "" },
    is_member: apiGroup.is_member as boolean | undefined,
  };
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

  // Fetch all available groups
  const fetchAllGroups = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<LaravelPaginatedResponse>>(
        `communication/groups/all?page=${page}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        const transformedGroups = data.data.data.map(transformGroup);
        setGroups(transformedGroups);

        setPagination({
          currentPage: data.data.current_page,
          lastPage: data.data.last_page,
          perPage: data.data.per_page,
          total: data.data.total,
          from: data.data.from || 0,
          to: data.data.to || 0,
        });
      }
    } catch {
      showErrorToast("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch groups current member has joined
  const fetchJoinedGroups = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<LaravelPaginatedResponse>>(
        `communication/groups/all/joined?page=${page}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        const transformedGroups = data.data.data.map(transformGroup);
        setJoinedGroups(transformedGroups);

        setPagination({
          currentPage: data.data.current_page,
          lastPage: data.data.last_page,
          perPage: data.data.per_page,
          total: data.data.total,
          from: data.data.from || 0,
          to: data.data.to || 0,
        });
      }
    } catch {
      showErrorToast("Failed to load your groups");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single group details by slug
  const fetchGroup = useCallback(async (slug: string): Promise<MemberGroup | null> => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<Record<string, unknown>>>(
        `communication/groups/${slug}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        return transformGroup(data.data);
      }

      return null;
    } catch {
      showErrorToast("Failed to load group details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Join a group
  const joinGroup = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        await client.put(
          `communication/groups/${slug}/join`,
          undefined,
          { headers: getCompanyHeaders() }
        );

        showSuccessToast("Successfully joined the group");

        // Refresh both lists to reflect changes
        await Promise.all([
          fetchAllGroups(pagination.currentPage),
          fetchJoinedGroups(1),
        ]);

        return true;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to join group");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllGroups, fetchJoinedGroups, pagination.currentPage]
  );

  // Leave a group
  const leaveGroup = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        await client.put(
          `communication/groups/${slug}/exit-group`,
          undefined,
          { headers: getCompanyHeaders() }
        );

        showSuccessToast("Successfully left the group");

        // Refresh both lists to reflect changes
        await Promise.all([
          fetchAllGroups(pagination.currentPage),
          fetchJoinedGroups(pagination.currentPage),
        ]);

        return true;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to leave group");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllGroups, fetchJoinedGroups, pagination.currentPage]
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