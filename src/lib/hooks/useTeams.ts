import { useState, useEffect, useCallback } from "react";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";

export interface TeamMember {
  id: number;
  title: string;
  role: string;
  first_name: string;
  middle_name: string;
  surname: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
  status: "active" | "blocked";
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  members: number;
  lead: string;
  status: "active" | "inactive";
  createdAt: string;
  team_members?: TeamMember[];
}

export interface AddMemberData {
  title: string;
  role: string;
  first_name: string;
  middle_name: string;
  surname: string;
  email: string;
  phone_number: string;
  profile_picture?: File;
}

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 10,
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    const companyId = localStorage.getItem("company_id");

    if (!token) {
      showErrorToast("Authentication required. Please login to continue.");
      return null;
    }

    if (!companyId) {
      showErrorToast("Company ID is required.");
      return null;
    }

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Company-ID": companyId,
    };
  }, []);

  const fetchTeams = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return;

      const response = await fetch(`${apiUrl}team-management?page=${page}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        const teamsData = data.data;
        
        if (Array.isArray(teamsData.data)) {
          setTeams(teamsData.data);
          setPagination({
            currentPage: teamsData.current_page,
            lastPage: teamsData.last_page,
            total: teamsData.total,
            perPage: teamsData.per_page,
          });
        } else if (Array.isArray(teamsData)) {
          setTeams(teamsData);
          setPagination({
            currentPage: 1,
            lastPage: 1,
            total: teamsData.length,
            perPage: teamsData.length,
          });
        } else {
          setTeams([]);
        }
      } else {
        showErrorToast(data.message || "Failed to load teams");
        throw new Error(data.message || "Failed to fetch teams");
      }
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch teams";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Get single team details
  const fetchTeam = useCallback(async (teamId: number) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return null;

      const response = await fetch(`${apiUrl}team-management/${teamId}`, {
        method: "GET",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        return data.data;
      } else {
        showErrorToast(data.message || "Failed to load team details");
        throw new Error(data.message || "Failed to fetch team");
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch team";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Add member to team
  const addTeamMember = useCallback(async (memberData: AddMemberData) => {
    try {
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return false;

      const formData = new FormData();
      formData.append('title', memberData.title);
      formData.append('role', memberData.role);
      formData.append('first_name', memberData.first_name);
      formData.append('middle_name', memberData.middle_name);
      formData.append('surname', memberData.surname);
      formData.append('email', memberData.email);
      formData.append('phone_number', memberData.phone_number);
      
      if (memberData.profile_picture) {
        formData.append('profile_picture', memberData.profile_picture);
      }

      const response = await fetch(`${apiUrl}team-management/add-member`, {
        method: "POST",
        headers: {
          ...headers,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        showSuccessToast("Team member added successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        showErrorToast(data.message || "Failed to add team member");
        return false;
      }
    } catch (err) {
      console.error("Failed to add team member:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add team member";
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders, fetchTeams, pagination.currentPage]);

  // Block member access
  const blockMemberAccess = useCallback(async (memberId: number) => {
    try {
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return false;

      const response = await fetch(`${apiUrl}team-management/${memberId}/block-access`, {
        method: "POST",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        showSuccessToast("Member access blocked successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        showErrorToast(data.message || "Failed to block member access");
        return false;
      }
    } catch (err) {
      console.error("Failed to block member access:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to block member access";
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders, fetchTeams, pagination.currentPage]);

  // Activate member access
  const activateMemberAccess = useCallback(async (memberId: number) => {
    try {
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return false;

      const response = await fetch(`${apiUrl}team-management/${memberId}/activate-access`, {
        method: "POST",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        showSuccessToast("Member access activated successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        showErrorToast(data.message || "Failed to activate member access");
        return false;
      }
    } catch (err) {
      console.error("Failed to activate member access:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to activate member access";
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders, fetchTeams, pagination.currentPage]);

  // Send password reset link
  const sendPasswordResetLink = useCallback(async (memberId: number) => {
    try {
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return false;

      const response = await fetch(`${apiUrl}team-management/${memberId}/password-reset-link`, {
        method: "PUT",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        showSuccessToast("Password reset link sent successfully");
        return true;
      } else {
        showErrorToast(data.message || "Failed to send password reset link");
        return false;
      }
    } catch (err) {
      console.error("Failed to send password reset link:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send password reset link";
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders]);

  // Delete team member
  const deleteTeamMember = useCallback(async (memberId: number) => {
    try {
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return false;

      const response = await fetch(`${apiUrl}team-management/${memberId}/destroy`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        showSuccessToast("Team member deleted successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        showErrorToast(data.message || "Failed to delete team member");
        return false;
      }
    } catch (err) {
      console.error("Failed to delete team member:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete team member";
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders, fetchTeams, pagination.currentPage]);

  // Create a new team
  const createTeam = useCallback(async (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    try {
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return false;

      const response = await fetch(`${apiUrl}team-management`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        showSuccessToast("Team created successfully");
        await fetchTeams(pagination.currentPage);
        return true;
      } else {
        showErrorToast(data.message || "Failed to create team");
        return false;
      }
    } catch (err) {
      console.error("Failed to create team:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create team";
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders, fetchTeams, pagination.currentPage]);

  // Update a team
  const updateTeam = useCallback(async (teamId: number, teamData: Partial<Team>) => {
    try {
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return false;

      const response = await fetch(`${apiUrl}team-management/${teamId}`, {
        method: "PUT",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamData),
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        showSuccessToast("Team updated successfully");
        setTeams(prevTeams => 
          prevTeams.map(team => 
            team.id === teamId ? { ...team, ...teamData } : team
          )
        );
        return true;
      } else {
        showErrorToast(data.message || "Failed to update team");
        return false;
      }
    } catch (err) {
      console.error("Failed to update team:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update team";
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders]);

  // Delete a team
  const deleteTeam = useCallback(async (teamId: number) => {
    try {
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const headers = getAuthHeaders();
      
      if (!headers) return false;

      const response = await fetch(`${apiUrl}team-management/${teamId}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        handleApiError(response, data);
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        showSuccessToast("Team deleted successfully");
        setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
        return true;
      } else {
        showErrorToast(data.message || "Failed to delete team");
        return false;
      }
    } catch (err) {
      console.error("Failed to delete team:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete team";
      setError(errorMessage);
      return false;
    }
  }, [getAuthHeaders]);

  // Error handler utility
  const handleApiError = useCallback((response: Response, data: any) => {
    if (response.status === 401) {
      showErrorToast("Session expired. Please login again.");
    } else if (response.status === 403) {
      showErrorToast("You don't have permission to perform this action.");
    } else if (response.status === 404) {
      showErrorToast("Resource not found.");
    } else if (response.status >= 500) {
      showErrorToast("Server error. Please try again later.");
    } else {
      showErrorToast(data.message || `Error: ${response.status}`);
    }
  }, []);

  // Initialize teams on component mount
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    pagination,
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    blockMemberAccess,
    activateMemberAccess,
    sendPasswordResetLink,
    deleteTeamMember,
    setTeams,
  };
};