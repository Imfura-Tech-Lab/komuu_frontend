"use client";

import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface ExportJob {
  id: number;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  file_path: string | null;
  created_at: string;
  updated_at: string;
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
    async (params?: { type?: string }): Promise<ExportJob | null> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.post<ExportApiResponse>(
          "export/all",
          params,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          showSuccessToast(response.data.message || "Export requested successfully");
          return response.data.data;
        }

        showErrorToast(response.data.message || "Export request failed");
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
    async (id: number): Promise<ExportJob | null> => {
      try {
        const client = getAuthenticatedClient();
        const response = await client.get<ExportApiResponse>(
          `export/all/${id}/status`,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          return response.data.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const downloadExport = useCallback(async (id: number): Promise<string | null> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<{ status: string; data: { url: string } }>(
        `export/all/${id}/download`,
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success") {
        return response.data.data.url;
      }
      return null;
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Download failed");
      return null;
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
    fetchExports,
    deleteExport,
  };
}
