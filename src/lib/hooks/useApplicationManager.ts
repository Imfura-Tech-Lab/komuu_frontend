import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { Application, UserData } from "@/types/application.types";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface UseApplicationManagerProps {
  applicationId: string;
}

interface ApiResponse<T> {
  status: "success" | "error" | boolean;
  message?: string;
  data?: T;
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

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      setError("No application ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<Application>>(
        `applications/${applicationId}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        setApplication(data.data);
        setError(null);
      } else {
        setError("Invalid response format from server");
        setApplication(null);
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 404) {
        setError("Application not found. It may have been deleted or you don't have permission to view it.");
      } else if (apiError.status === 403) {
        setError("You don't have permission to view this application.");
      } else if (apiError.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError(apiError.message || "Failed to load application. Please try again.");
      }
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  const handleRefresh = useCallback(async () => {
    showSuccessToast("Refreshing application data...");
    await fetchApplication();
  }, [fetchApplication]);

  const approveApplication = useCallback(async () => {
    try {
      setIsUpdating(true);
      setShowActionsDropdown(false);

      const params = new URLSearchParams({
        status: "1",
        note: "Application approved by admin",
      });

      const client = getAuthenticatedClient();
      const response = await client.put<ApiResponse<Application>>(
        `applications/${applicationId}?${params.toString()}`,
        undefined,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast("Application approved successfully");
        await fetchApplication();
      } else {
        throw new Error(data.message || "Failed to approve application");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to approve application");
    } finally {
      setIsUpdating(false);
    }
  }, [applicationId, fetchApplication]);

  const signCertificate = useCallback(async () => {
    try {
      setIsUpdating(true);
      setShowActionsDropdown(false);

      const formData = new FormData();
      formData.append(`applications[0][id]`, applicationId);

      const client = getAuthenticatedClient();
      const response = await client.postFormData<ApiResponse<void>>(
        "applications/sign-certificates",
        formData,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast("Certificate signed successfully");
        await fetchApplication();
      } else {
        throw new Error(data.message || "Failed to sign certificate");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to sign certificate");
    } finally {
      setIsUpdating(false);
    }
  }, [applicationId, fetchApplication]);

  const deleteApplication = useCallback(async (forceDelete = false): Promise<boolean> => {
    try {
      setIsDeleting(true);

      const endpoint = forceDelete
        ? `applications/${applicationId}/force-delete`
        : `applications/${applicationId}`;

      const client = getAuthenticatedClient();
      const response = await client.delete<ApiResponse<void>>(
        endpoint,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
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
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to delete application");
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
