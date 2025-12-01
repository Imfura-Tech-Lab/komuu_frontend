import { useState, useEffect } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

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

export interface ApiResponse<T = any> {
  status: "success" | "error" | boolean;
  message: string;
  data: T;
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

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  const companyId =
    typeof window !== "undefined" ? localStorage.getItem("company_id") : null;

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Company-ID": companyId || "",
    };
  };

  // Fetch all team members
  const fetchTeams = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}team-management?page=${page}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.status === "success") {
        // Transform API data to match component expectations
        const transformedTeams: Team[] = data.data.data.map(
          (member: TeamMember) => ({
            id: member.id,
            name: member.name,
            description: member.role,
            lead: member.email,
            members: 1, // Individual member count
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

        // Update pagination with actual API structure
        setPagination({
          currentPage: data.data.current_page,
          lastPage: data.data.last_page,
          perPage: data.data.per_page,
          total: data.data.total,
          from: data.data.from,
          to: data.data.to,
        });
      } else {
        throw new Error(data.message || "Failed to fetch teams");
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch teams");
      showErrorToast("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  // Add team member
  const addTeamMember = async (formData: FormData): Promise<boolean> => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${apiUrl}team-management/add-member`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Company-ID": companyId || "",
        },
        body: formData,
      });

      const data: ApiResponse = await response.json();

      // Check both response.ok and data.status for comprehensive error handling
      if (response.ok && (data.status === "success" || data.status === true)) {
        showSuccessToast(data.message || "Team member added successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        throw new Error(data.message || "Failed to add team member");
      }
    } catch (err) {
      console.error("Failed to add team member:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to add team member"
      );
      return false;
    }
  };

  // Get single team member details
  const getTeamMember = async (memberId: number) => {
    try {
      const response = await fetch(`${apiUrl}team-management/${memberId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && (data.status === "success" || data.status === true)) {
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch team member");
      }
    } catch (err) {
      console.error("Failed to fetch team member:", err);
      showErrorToast("Failed to load team member details");
      return null;
    }
  };

  // Block member access
  const blockMemberAccess = async (memberId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${apiUrl}team-management/${memberId}/block-access`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      const data: ApiResponse = await response.json();

      if (response.ok && (data.status === "success" || data.status === true)) {
        showSuccessToast(data.message || "Member access blocked successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        throw new Error(data.message || "Failed to block member access");
      }
    } catch (err) {
      console.error("Failed to block member access:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to block member access"
      );
      return false;
    }
  };

  // Activate member access
  const activateMemberAccess = async (memberId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${apiUrl}team-management/${memberId}/activate-access`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );

      const data: ApiResponse = await response.json();

      if (response.ok && (data.status === "success" || data.status === true)) {
        showSuccessToast(
          data.message || "Member access activated successfully"
        );
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        throw new Error(data.message || "Failed to activate member access");
      }
    } catch (err) {
      console.error("Failed to activate member access:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to activate member access"
      );
      return false;
    }
  };

  // Send password reset link
  const sendPasswordResetLink = async (memberId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${apiUrl}team-management/${memberId}/password-reset-link`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      const data: ApiResponse = await response.json();

      if (response.ok && (data.status === "success" || data.status === true)) {
        showSuccessToast(
          data.message || "Password reset link sent successfully"
        );
        return true;
      } else {
        throw new Error(data.message || "Failed to send password reset link");
      }
    } catch (err) {
      console.error("Failed to send password reset link:", err);
      showErrorToast(
        err instanceof Error
          ? err.message
          : "Failed to send password reset link"
      );
      return false;
    }
  };

  // Delete team member (permanent)
  const deleteTeamMember = async (memberId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${apiUrl}team-management/${memberId}/destroy`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data: ApiResponse = await response.json();

      if (response.ok && (data.status === "success" || data.status === true)) {
        showSuccessToast(data.message || "Team member deleted successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        throw new Error(data.message || "Failed to delete team member");
      }
    } catch (err) {
      console.error("Failed to delete team member:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to delete team member"
      );
      return false;
    }
  };

  // Placeholder functions for team operations (not in API)
  const createTeam = async (teamData: any): Promise<boolean> => {
    showErrorToast("Team creation not implemented in API");
    return false;
  };

  const updateTeam = async (
    teamId: number,
    teamData: any
  ): Promise<boolean> => {
    showErrorToast("Team update not implemented in API");
    return false;
  };

  const deleteTeam = async (teamId: number): Promise<boolean> => {
    // Use deleteTeamMember for individual members
    return await deleteTeamMember(teamId);
  };

  useEffect(() => {
    fetchTeams(1);
  }, []);

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
