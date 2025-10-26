import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

export interface Group {
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
}

export interface CreateGroupParams {
  name: string;
  description: string;
}

export interface UpdateGroupParams {
  slug: string;
  name: string;
  description: string;
}

export interface MemberActionParams {
  slug: string;
  memberId: string;
  role?: "Moderator" | "Member";
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

interface UseGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchGroups: (page?: number) => Promise<void>;
  fetchGroup: (slug: string) => Promise<Group | null>;
  createGroup: (params: CreateGroupParams) => Promise<Group | null>;
  updateGroup: (params: UpdateGroupParams) => Promise<Group | null>;
  deleteGroup: (slug: string) => Promise<boolean>;
  addMember: (params: MemberActionParams) => Promise<boolean>;
  removeMember: (params: Omit<MemberActionParams, "role">) => Promise<boolean>;
  blockMember: (params: Omit<MemberActionParams, "role">) => Promise<boolean>;
}

export function useGroups(): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([]);
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

  // Transform Laravel API group to component interface
  const transformGroup = useCallback((apiGroup: any): Group => {
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
    };
  }, []);

  // Get auth headers helper
  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Company-ID": companyId || "",
    };
  };

  // Base fetch wrapper with centralized error handling
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

        // Check both response.ok and data.status for comprehensive error handling
        if (data.status === "success" || data.status === true) {
          return data.data;
        } else {
          throw new Error(data.message || "API request failed");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err; // Re-throw for caller to handle
      }
    },
    [apiUrl, companyId]
  );

  // Fetch all groups
  const fetchGroups = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiCall<LaravelPaginatedResponse>(
          `community/groups?page=${page}`
        );

        if (data) {
          // Transform Laravel paginated response
          const transformedGroups = data.data.map(transformGroup);
          setGroups(transformedGroups);

          // Update pagination with Laravel structure
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
        console.error("Failed to fetch groups:", err);
        showErrorToast("Failed to load groups");
      } finally {
        setLoading(false);
      }
    },
    [apiCall, transformGroup]
  );

  // Fetch single group by slug
  const fetchGroup = useCallback(
    async (slug: string): Promise<Group | null> => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiCall<any>(`community/groups/${slug}`);

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

  // Create new group
  const createGroup = useCallback(
    async (params: CreateGroupParams): Promise<Group | null> => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          name: params.name,
          description: params.description,
        });

        const data = await apiCall<any>(
          `community/groups?${queryParams.toString()}`,
          { method: "POST" }
        );

        if (data) {
          showSuccessToast("Group created successfully");
          // Refetch current page to get updated list
          await fetchGroups(pagination.currentPage);

          return transformGroup(data);
        }

        return null;
      } catch (err) {
        console.error("Failed to create group:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to create group"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchGroups, pagination.currentPage, transformGroup]
  );

  // Update existing group by slug
  const updateGroup = useCallback(
    async (params: UpdateGroupParams): Promise<Group | null> => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          name: params.name,
          description: params.description,
        });

        const data = await apiCall<any>(
          `community/groups/${params.slug}?${queryParams.toString()}`,
          { method: "PUT" }
        );

        if (data) {
          showSuccessToast("Group updated successfully");
          // Refetch current page to get updated list
          await fetchGroups(pagination.currentPage);

          return transformGroup(data);
        }

        return null;
      } catch (err) {
        console.error(`Failed to update group ${params.slug}:`, err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to update group"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchGroups, pagination.currentPage, transformGroup]
  );

  // Delete group by slug
  const deleteGroup = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await apiCall<void>(`community/groups/${slug}`, {
          method: "DELETE",
        });

        showSuccessToast("Group deleted successfully");
        // Refetch current page to get updated list
        await fetchGroups(pagination.currentPage);

        return true;
      } catch (err) {
        console.error(`Failed to delete group ${slug}:`, err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to delete group"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchGroups, pagination.currentPage]
  );

  // Add member to group by slug
  const addMember = useCallback(
    async (params: MemberActionParams): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          role: params.role || "Member",
        });

        await apiCall<void>(
          `community/groups/${params.slug}/add-member/${
            params.memberId
          }?${queryParams.toString()}`,
          { method: "PUT" }
        );

        showSuccessToast("Member added to group successfully");

        // Refetch to update member count
        await fetchGroups(pagination.currentPage);

        return true;
      } catch (err) {
        console.error(`Failed to add member to group ${params.slug}:`, err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to add member to group"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchGroups, pagination.currentPage]
  );

  // Remove member from group by slug
  const removeMember = useCallback(
    async (params: Omit<MemberActionParams, "role">): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await apiCall<void>(
          `community/groups/${params.slug}/remove-member/${params.memberId}`,
          { method: "PUT" }
        );

        showSuccessToast("Member removed from group successfully");

        // Refetch to update member count
        await fetchGroups(pagination.currentPage);

        return true;
      } catch (err) {
        console.error(
          `Failed to remove member from group ${params.slug}:`,
          err
        );
        showErrorToast(
          err instanceof Error
            ? err.message
            : "Failed to remove member from group"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, fetchGroups, pagination.currentPage]
  );

  // Block member access by slug
  const blockMember = useCallback(
    async (params: Omit<MemberActionParams, "role">): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        await apiCall<void>(
          `community/groups/${params.slug}/block-access/${params.memberId}`,
          { method: "PUT" }
        );

        showSuccessToast("Member access blocked successfully");

        return true;
      } catch (err) {
        console.error(
          `Failed to block member in group ${params.slug}:`,
          err
        );
        showErrorToast(
          err instanceof Error ? err.message : "Failed to block member access"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  return {
    groups,
    loading,
    error,
    pagination,
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    blockMember,
  };
}