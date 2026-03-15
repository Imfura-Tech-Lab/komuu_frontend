// @/hooks/useApplicationActions.ts
import { useState, useCallback } from "react";
import { Application } from "@/types";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

type LoadingAction = "approving" | "signing" | "deleting" | null;

interface ApiResponse {
  status: "success" | "error" | boolean;
  message?: string;
}

interface UseApplicationActionsReturn {
  approveApplication: (application: Application) => Promise<void>;
  signCertificate: (application: Application) => Promise<void>;
  deleteApplication: (application: Application) => Promise<void>;
  loadingActions: Record<string, LoadingAction>;
  isLoading: (applicationId: string) => boolean;
}

export function useApplicationActions(): UseApplicationActionsReturn {
  const [loadingActions, setLoadingActions] = useState<Record<string, LoadingAction>>({});

  const isLoading = useCallback(
    (applicationId: string) => !!loadingActions[applicationId],
    [loadingActions]
  );

  const approveApplication = useCallback(async (application: Application) => {
    if (application.application_status.toLowerCase() === "approved") {
      showErrorToast("Application is already approved");
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [application.id]: "approving" }));

      const params = new URLSearchParams({
        status: "1",
        note: "Application approved by admin",
      });

      const client = getAuthenticatedClient();
      const response = await client.put<ApiResponse>(
        `applications/${application.id}?${params.toString()}`,
        undefined,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast("Application approved successfully");
        window.location.reload();
      } else {
        throw new Error(data.message || "Failed to approve application");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to approve application");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [application.id]: null }));
    }
  }, []);

  const signCertificate = useCallback(async (application: Application) => {
    if (application.application_status.toLowerCase() !== "approved") {
      showErrorToast("Only approved applications can be signed");
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [application.id]: "signing" }));

      const formData = new FormData();
      formData.append("applications[1][id]", application.id);

      const client = getAuthenticatedClient();
      const response = await client.postFormData<ApiResponse>(
        "applications/sign-certificates",
        formData,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast("Certificate signed successfully");
        window.location.reload();
      } else {
        const errorMsg = data.message || "Failed to sign certificate";
        showErrorToast(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (!apiError.message?.includes("Server error")) {
        showErrorToast("An unexpected error occurred while signing the certificate");
      }
    } finally {
      setLoadingActions((prev) => ({ ...prev, [application.id]: null }));
    }
  }, []);

  const deleteApplication = useCallback(async (application: Application) => {
    if (
      !confirm(
        `Are you sure you want to delete the application for ${application.member_details?.full_name}?`
      )
    ) {
      return;
    }

    try {
      setLoadingActions((prev) => ({ ...prev, [application.id]: "deleting" }));

      const client = getAuthenticatedClient();
      const response = await client.delete<ApiResponse>(
        `applications/${application.id}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        showSuccessToast("Application deleted successfully");
        window.location.reload();
      } else {
        throw new Error(data.message || "Failed to delete application");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to delete application");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [application.id]: null }));
    }
  }, []);

  return {
    approveApplication,
    signCertificate,
    deleteApplication,
    loadingActions,
    isLoading,
  };
}
