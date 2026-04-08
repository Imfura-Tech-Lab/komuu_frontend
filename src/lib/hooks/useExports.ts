"use client";

import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface ExportJob {
  id: number;
  filename: string;
  status: string;
  export_from: string;
  export_until: string;
  generated_by: string;
  generated_at: string;
}

interface ExportApiResponse {
  status: string;
  message?: string;
  data: ExportJob;
}

interface ExportsListResponse {
  status: string;
  message?: string;
  data: {
    data: ExportJob[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export function useExports() {
  const [exports, setExports] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestExport = useCallback(
    async (params: { from: string; until: string }): Promise<ExportJob | null> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.post<{ message: string; job_id: number; status_url: string }>(
          "export/all",
          params,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if (data.job_id) {
          showSuccessToast(data.message || "Export requested successfully");
          return {
            id: data.job_id,
            filename: "",
            status: "pending",
            export_from: params.from,
            export_until: params.until,
            generated_by: "",
            generated_at: new Date().toISOString(),
          };
        }

        showErrorToast("Export request failed");
        return null;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Export request failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkStatus = useCallback(
    async (id: number): Promise<{ status: string } | null> => {
      try {
        const client = getAuthenticatedClient();
        const response = await client.get<{ job_id: number; status: string; download_url?: string }>(
          `export/all/${id}/status`,
          { headers: getCompanyHeaders() }
        );

        return { status: response.data.status === "completed" ? "completed" : response.data.status };
      } catch {
        return null;
      }
    },
    []
  );

  const downloadExport = useCallback(async (id: number): Promise<void> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<{ status: string; message?: string; data?: { download_url: string; filename: string } }>(
        `export/all/${id}/download`,
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success" && response.data.data?.download_url) {
        const a = document.createElement("a");
        a.href = response.data.data.download_url;
        a.download = response.data.data.filename || "export.xlsx";
        a.target = "_blank";
        a.click();
        showSuccessToast("Download started");
      } else {
        showErrorToast(response.data.message || "Download not available");
      }
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to download — may need more approvals");
    }
  }, []);

  const approveExport = useCallback(async (id: number, approved: boolean): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.post<{ status: string; message?: string }>(
        `export/all/${id}/approve`,
        { approved },
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success") {
        showSuccessToast(approved ? "Export approved" : "Export rejected");
        return true;
      }
      showErrorToast(response.data.message || "Failed");
      return false;
    } catch (err) {
      showErrorToast((err as ApiError).message || "Failed to approve");
      return false;
    }
  }, []);

  const fetchExports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const client = getAuthenticatedClient();
      const response = await client.get<ExportsListResponse>("exports", {
        headers: getCompanyHeaders(),
      });

      if (response.data.status === "success") {
        setExports(response.data.data.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch exports");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExport = useCallback(async (id: number): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.delete<{ status: string; message?: string }>(
        `exports/${id}`,
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success") {
        showSuccessToast("Export deleted");
        setExports((prev) => prev.filter((e) => e.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to delete export");
      return false;
    }
  }, []);

  return {
    exports,
    loading,
    error,
    requestExport,
    checkStatus,
    downloadExport,
    approveExport,
    fetchExports,
    deleteExport,
  };
}
