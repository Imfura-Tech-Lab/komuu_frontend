import { useState, useEffect, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  secondary_email: string | null;
  alternative_phone: string | null;
  whatsapp_number: string | null;
  role: string;
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth: string | null;
  national_ID: string | null;
  passport: string | null;
  public_profile: string | null;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  lead: string;
  members: number;
  status: string;
  createdAt: string;
  email: string;
  phone: string | null;
  role: string;
  verified: boolean;
  hasChangedPassword: boolean;
}

export interface Pagination {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
}

interface ApiResponse<T> {
  status: "success" | "error" | boolean;
  message?: string;
  data: T;
}

interface PaginatedResponse {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  data: TeamMember[];
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: 0,
    to: 0,
  });

  const fetchTeams = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<PaginatedResponse>>(
        `team-management?page=${page}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        const transformedTeams: Team[] = data.data.data.map(
          (member: TeamMember) => ({
            id: member.id,
            name: member.name,
            description: member.role,
            lead: member.email,
            members: 1,
            status: member.active ? "active" : "inactive",
            createdAt: member.date_of_birth || new Date().toISOString(),
            email: member.email,
            phone: member.phone_number,
            role: member.role,
            verified: member.verified,
            hasChangedPassword: member.has_changed_password,
          })
        );

        setTeams(transformedTeams);

        setPagination({
          currentPage: data.data.current_page,
          lastPage: data.data.last_page,
          perPage: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch teams");
      showErrorToast("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  const addTeamMember = useCallback(async (formData: FormData): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.postFormData<ApiResponse<TeamMember>>(
        "team-management/add-member",
        formData,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast(data.message || "Team member added successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        throw new Error(data.message || "Failed to add team member");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to add team member");
      return false;
    }
  }, [fetchTeams, pagination.currentPage]);

  const getTeamMember = useCallback(async (memberId: number) => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<TeamMember>>(
        `team-management/${memberId}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch team member");
      }
    } catch {
      showErrorToast("Failed to load team member details");
      return null;
    }
  }, []);

  const blockMemberAccess = useCallback(async (memberId: number): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<void>>(
        `team-management/${memberId}/block-access`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast(data.message || "Member access blocked successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        throw new Error(data.message || "Failed to block member access");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to block member access");
      return false;
    }
  }, [fetchTeams, pagination.currentPage]);

  const activateMemberAccess = useCallback(async (memberId: number): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<void>>(
        `team-management/${memberId}/activate-access`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast(data.message || "Member access activated successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        throw new Error(data.message || "Failed to activate member access");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to activate member access");
      return false;
    }
  }, [fetchTeams, pagination.currentPage]);

  const sendPasswordResetLink = useCallback(async (memberId: number): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.put<ApiResponse<void>>(
        `team-management/${memberId}/password-reset-link`,
        undefined,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast(data.message || "Password reset link sent successfully");
        return true;
      } else {
        throw new Error(data.message || "Failed to send password reset link");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to send password reset link");
      return false;
    }
  }, []);

  const deleteTeamMember = useCallback(async (memberId: number): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.delete<ApiResponse<void>>(
        `team-management/${memberId}/destroy`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast(data.message || "Team member deleted successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        throw new Error(data.message || "Failed to delete team member");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to delete team member");
      return false;
    }
  }, [fetchTeams, pagination.currentPage]);

  const createTeam = useCallback(async (_teamData: Record<string, unknown>): Promise<boolean> => {
    showErrorToast("Team creation not implemented in API");
    return false;
  }, []);

  const updateTeam = useCallback(async (
    _teamId: number,
    _teamData: Record<string, unknown>
  ): Promise<boolean> => {
    showErrorToast("Team update not implemented in API");
    return false;
  }, []);

  const deleteTeam = useCallback(async (teamId: number): Promise<boolean> => {
    return await deleteTeamMember(teamId);
  }, [deleteTeamMember]);

  useEffect(() => {
    fetchTeams(1);
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    pagination,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    getTeamMember,
    blockMemberAccess,
    activateMemberAccess,
    sendPasswordResetLink,
    deleteTeamMember,
  };
}
