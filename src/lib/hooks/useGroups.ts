import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

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

export interface BulkAddMemberParams {
  slug: string;
  members: Array<{
    id: number;
    role: "Moderator" | "Member";
  }>;
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
  addMembers: (params: BulkAddMemberParams) => Promise<boolean>;
  removeMember: (params: Omit<MemberActionParams, "role">) => Promise<boolean>;
  blockMember: (params: Omit<MemberActionParams, "role">) => Promise<boolean>;
}

function transformGroup(apiGroup: Record<string, unknown>): Group {
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
  };
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

  const fetchGroups = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<LaravelPaginatedResponse>>(
        `community/groups?page=${page}`,
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

  const fetchGroup = useCallback(async (slug: string): Promise<Group | null> => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<Record<string, unknown>>>(
        `community/groups/${slug}`,
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

  const createGroup = useCallback(
    async (params: CreateGroupParams): Promise<Group | null> => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          name: params.name,
          description: params.description,
        });

        const client = getAuthenticatedClient();
        const response = await client.post<ApiResponse<Record<string, unknown>>>(
          `community/groups?${queryParams.toString()}`,
          undefined,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if ((data.status === "success" || data.status === true) && data.data) {
          showSuccessToast("Group created successfully");
          await fetchGroups(pagination.currentPage);
          return transformGroup(data.data);
        }

        return null;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to create group");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchGroups, pagination.currentPage]
  );

  const updateGroup = useCallback(
    async (params: UpdateGroupParams): Promise<Group | null> => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          name: params.name,
          description: params.description,
        });

        const client = getAuthenticatedClient();
        const response = await client.put<ApiResponse<Record<string, unknown>>>(
          `community/groups/${params.slug}?${queryParams.toString()}`,
          undefined,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if ((data.status === "success" || data.status === true) && data.data) {
          showSuccessToast("Group updated successfully");
          await fetchGroups(pagination.currentPage);
          return transformGroup(data.data);
        }

        return null;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to update group");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchGroups, pagination.currentPage]
  );

  const deleteGroup = useCallback(
    async (slug: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        await client.delete(`community/groups/${slug}`, { headers: getCompanyHeaders() });

        showSuccessToast("Group deleted successfully");
        await fetchGroups(pagination.currentPage);

        return true;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to delete group");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchGroups, pagination.currentPage]
  );

  const addMembers = useCallback(
    async (params: BulkAddMemberParams): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        params.members.forEach((member, index) => {
          queryParams.append(`member[${index}][id]`, member.id.toString());
          queryParams.append(`member[${index}][role]`, member.role);
        });

        const client = getAuthenticatedClient();
        await client.put(
          `community/groups/add-member/${params.slug}?${queryParams.toString()}`,
          undefined,
          { headers: getCompanyHeaders() }
        );

        const memberText = params.members.length === 1 ? "Member" : "Members";
        showSuccessToast(`${memberText} added to group successfully`);
        await fetchGroups(pagination.currentPage);

        return true;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to add members to group");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchGroups, pagination.currentPage]
  );

  const addMember = useCallback(
    async (params: MemberActionParams): Promise<boolean> => {
      return addMembers({
        slug: params.slug,
        members: [{
          id: parseInt(params.memberId),
          role: params.role || "Member"
        }]
      });
    },
    [addMembers]
  );

  const removeMember = useCallback(
    async (params: Omit<MemberActionParams, "role">): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        await client.put(
          `community/groups/${params.slug}/remove-member/${params.memberId}`,
          undefined,
          { headers: getCompanyHeaders() }
        );

        showSuccessToast("Member removed from group successfully");
        await fetchGroups(pagination.currentPage);

        return true;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to remove member from group");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchGroups, pagination.currentPage]
  );

  const blockMember = useCallback(
    async (params: Omit<MemberActionParams, "role">): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        await client.put(
          `community/groups/${params.slug}/block-access/${params.memberId}`,
          undefined,
          { headers: getCompanyHeaders() }
        );

        showSuccessToast("Member access blocked successfully");

        return true;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to block member access");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
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
    addMembers,
    removeMember,
    blockMember,
  };
}
