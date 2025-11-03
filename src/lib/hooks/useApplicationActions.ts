// @/hooks/useApplicationActions.ts
import { useState, useCallback } from "react";
import { Application } from "@/types";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";

type LoadingAction = "approving" | "signing" | "deleting" | null;

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

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      if (!token) {
        showErrorToast("Please login to approve application");
        return;
      }

      if (!companyId) {
        showErrorToast("Company ID not found. Please re-login.");
        return;
      }

      const params = new URLSearchParams({
        status: "1",
        note: "Application approved by admin",
      });

      const response = await fetch(
        `${apiUrl}applications/${application.id}?${params.toString()}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "X-Company-ID": companyId,
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
        window.location.reload();
      } else {
        throw new Error(data.message || "Failed to approve application");
      }
    } catch (err) {
      console.error("Approve application error:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to approve application"
      );
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

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    const token = localStorage.getItem("auth_token");

    if (!token) {
      showErrorToast("Please login to sign certificate");
      return;
    }

    // Check for company_id and show helpful error if missing
    const companyId = localStorage.getItem("company_id");
    if (!companyId) {
      showErrorToast("Company ID not found. Please logout and login again.");
      return;
    }

    const formData = new FormData();
    formData.append("applications[1][id]", application.id);

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
      const errorMessage = errorData?.message || `Server error: ${response.status}`;
      showErrorToast(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.status === "success") {
      showSuccessToast("Certificate signed successfully");
      window.location.reload();
    } else {
      const errorMsg = data.message || "Failed to sign certificate";
      showErrorToast(errorMsg);
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error("Sign certificate error:", err);
    // Only show toast if we haven't already shown one above
    if (err instanceof Error && !err.message.includes("Server error")) {
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

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to delete application");
        return;
      }

      const response = await fetch(`${apiUrl}applications/${application.id}`, {
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
        showSuccessToast("Application deleted successfully");
        window.location.reload();
      } else {
        throw new Error(data.message || "Failed to delete application");
      }
    } catch (err) {
      console.error("Delete application error:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to delete application"
      );
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