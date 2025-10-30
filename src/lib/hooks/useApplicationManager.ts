import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { Application, UserData } from "@/types/application.types";

// ============================================================================
// CUSTOM HOOK: useApplicationManager
// ============================================================================

export interface UseApplicationManagerProps {
  applicationId: string;
}

interface UseApplicationManagerReturn {
  application: Application | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  isUpdating: boolean;
  isDeleting: boolean;
  showDeleteModal: boolean;
  deleteType: "soft" | "force";
  showActionsDropdown: boolean;
  setShowDeleteModal: (show: boolean) => void;
  setDeleteType: (type: "soft" | "force") => void;
  setShowActionsDropdown: (show: boolean) => void;
  fetchApplication: () => Promise<void>;
  handleRefresh: () => Promise<void>;
  approveApplication: () => Promise<void>;
  signCertificate: () => Promise<void>;
  deleteApplication: (forceDelete: boolean) => Promise<boolean>;
}

export function useApplicationManager({
  applicationId,
}: UseApplicationManagerProps): UseApplicationManagerReturn {
  const [application, setApplication] = useState<Application | null>(null);
  const [userData, setUserData] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_data");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"soft" | "force">("soft");
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  const router = useRouter();

  // ============================================================================
  // FETCH APPLICATION
  // ============================================================================

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      setError("No application ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError("Authentication required");
        showErrorToast("Please login to view application");
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}applications/${applicationId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError("Application not found. It may have been deleted or you don't have permission to view it.");
          setApplication(null);
        } else if (response.status === 403) {
          setError("You don't have permission to view this application.");
          setApplication(null);
        } else if (response.status === 401) {
          setError("Your session has expired. Please login again.");
          setApplication(null);
        } else {
          setError(`Failed to load application (Status: ${response.status})`);
          setApplication(null);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.status === "success" && data.data) {
        setApplication(data.data);
        setError(null);
      } else {
        setError("Invalid response format from server");
        setApplication(null);
      }
    } catch (err) {
      console.error("Failed to fetch application:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to load application. Please try again."
      );
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  // ============================================================================
  // REFRESH
  // ============================================================================

  const handleRefresh = useCallback(async () => {
    showSuccessToast("Refreshing application data...");
    await fetchApplication();
  }, [fetchApplication]);

  // ============================================================================
  // APPROVE APPLICATION
  // ============================================================================

  const approveApplication = useCallback(async () => {
    try {
      setIsUpdating(true);
      setShowActionsDropdown(false);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to approve application");
        return;
      }

      const params = new URLSearchParams({
        status: "1",
        note: "Application approved by admin",
      });

      const response = await fetch(
        `${apiUrl}applications/${applicationId}?${params.toString()}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "X-Company-ID": localStorage.getItem("company_id") || "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Application approved successfully");
        await fetchApplication();
      } else {
        throw new Error(data.message || "Failed to approve application");
      }
    } catch (err) {
      console.error("Failed to approve application:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to approve application"
      );
    } finally {
      setIsUpdating(false);
    }
  }, [applicationId, fetchApplication]);

  // ============================================================================
  // SIGN CERTIFICATE
  // ============================================================================

  const signCertificate = useCallback(async () => {
    try {
      setIsUpdating(true);
      setShowActionsDropdown(false);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      if (!token) {
        showErrorToast("Please login to sign certificate");
        return;
      }

      if (!companyId) {
        showErrorToast("Company ID not found. Please re-login.");
        return;
      }

      const formData = new FormData();
      formData.append(`applications[0][id]`, applicationId);

      const response = await fetch(`${apiUrl}applications/sign-certificates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Company-ID": companyId,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Certificate signed successfully");
        await fetchApplication();
      } else {
        throw new Error(data.message || "Failed to sign certificate");
      }
    } catch (err) {
      console.error("Failed to sign certificate:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to sign certificate"
      );
    } finally {
      setIsUpdating(false);
    }
  }, [applicationId, fetchApplication]);

  // ============================================================================
  // DELETE APPLICATION
  // ============================================================================

  const deleteApplication = useCallback(async (forceDelete = false): Promise<boolean> => {
    try {
      setIsDeleting(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to delete application");
        return false;
      }

      const endpoint = forceDelete
        ? `${apiUrl}applications/${applicationId}/force-delete`
        : `${apiUrl}applications/${applicationId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast(
          forceDelete
            ? "Application permanently deleted"
            : "Application deleted successfully"
        );
        router.push("/applications");
        return true;
      } else {
        throw new Error(data.message || "Failed to delete application");
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to delete application"
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [applicationId, router]);

  return {
    application,
    userData,
    loading,
    error,
    isUpdating,
    isDeleting,
    showDeleteModal,
    deleteType,
    showActionsDropdown,
    setShowDeleteModal,
    setDeleteType,
    setShowActionsDropdown,
    fetchApplication,
    handleRefresh,
    approveApplication,
    signCertificate,
    deleteApplication,
  };
}