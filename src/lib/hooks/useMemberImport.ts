"use client";

import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
}

interface ImportResponse {
  status: string;
  message?: string;
  data?: ImportResult;
  errors?: Record<string, string[]>;
}

export function useMemberImport() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const importMembers = useCallback(
    async (
      file: File
    ): Promise<{ success: boolean; data?: ImportResult; errors?: Record<string, string[]> }> => {
      try {
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        const client = getAuthenticatedClient();
        const response = await client.postFormData<ImportResponse>(
          "members/import",
          formData,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if (data.status === "success") {
          showSuccessToast(data.message || "Members imported successfully");
          if (data.data) setResult(data.data);
          return { success: true, data: data.data ?? undefined };
        }

        if (data.errors) {
          return { success: false, errors: data.errors };
        }

        showErrorToast(data.message || "Import failed");
        return { success: false };
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.errors) {
          return { success: false, errors: apiError.errors };
        }
        const msg = apiError.message || "Import failed";
        setError(msg);
        showErrorToast(msg);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    result,
    error,
    importMembers,
  };
}
