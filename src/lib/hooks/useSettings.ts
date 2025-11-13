import { useState, useEffect, useCallback } from "react";

interface SettingsData {
  id: number;
  ngo_name: string | null;
  ngo_address: string | null;
  ngo_email: string | null;
  president_signature: string | null;
  ngo_stamp: string | null;
  logo: string | null;
  contact_phone?: string | null;
  website?: string | null;
}

interface SettingsResponse {
  status: string;
  message: string;
  data: SettingsData | null;
}

interface UseSettingsOptions {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  autoFetch?: boolean;
}

interface FileUploadData {
  [key: string]: File;
}

interface FilePreviewData {
  [key: string]: string;
}

export function useSettings(options: UseSettingsOptions = {}) {
  const {
    onSuccess,
    onError,
    autoFetch = true,
  } = options;

  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auth helpers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    const companyId = localStorage.getItem("company_id");

    if (!token) {
      throw new Error("Authentication required. Please login to continue.");
    }

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Company-ID": companyId || "",
    };
  }, []);

  const getApiUrl = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!apiUrl) {
      throw new Error("API URL not configured");
    }
    return apiUrl;
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = getApiUrl();
      const headers = getAuthHeaders();

      const response = await fetch(`${apiUrl}settings/details`, {
        method: "GET",
        headers,
      });

      const data: SettingsResponse = await response.json();

      if (!response.ok) {
        const errorMessages: { [key: number]: string } = {
          401: "Session expired. Please login again.",
          403: "You don't have permission to view settings.",
          500: "Server error. Please try again later.",
        };

        const errorMessage =
          errorMessages[response.status] ||
          data.message ||
          `Error: ${response.status}`;
        
        throw new Error(errorMessage);
      }

      if (data.status === "success") {
        // Handle null data - set null and flag for creation mode
        if (data.data === null) {
          setSettings(null);
          setIsCreating(true);
        } else {
          setSettings(data.data);
          setIsCreating(false);
        }
        return data.data;
      } else {
        throw new Error(data.message || "Failed to load settings");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch settings";
      setError(errorMessage);
      onError?.(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getApiUrl, getAuthHeaders, onError]);

  // Create settings
  const createSettings = useCallback(
    async (fieldKey: string, value: string | File) => {
      try {
        setIsSaving(true);

        const apiUrl = getApiUrl();
        const headers = getAuthHeaders();

        const formData = new FormData();

        // Only send the field being edited (partial create)
        if (value instanceof File) {
          formData.append(fieldKey, value);
        } else {
          formData.append(fieldKey, value);
        }

        const response = await fetch(`${apiUrl}settings/create`, {
          method: "POST",
          headers: {
            ...headers,
            // Remove Content-Type to let browser set it with boundary for FormData
            Accept: headers.Accept,
            Authorization: headers.Authorization,
            "X-Company-ID": headers["X-Company-ID"],
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        if (data.status === "success") {
          setSettings(data.data);
          setIsCreating(false);
          onSuccess?.("Settings created successfully");
          return data.data;
        } else {
          throw new Error(data.message || "Failed to create settings");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create settings";
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [getApiUrl, getAuthHeaders, onSuccess, onError]
  );

  // Update settings
  const updateSettings = useCallback(
    async (fieldKey: string, value: string | File) => {
      try {
        setIsSaving(true);

        const apiUrl = getApiUrl();
        const headers = getAuthHeaders();

        const formData = new FormData();
        
        if (value instanceof File) {
          formData.append(fieldKey, value);
        } else {
          formData.append(fieldKey, value);
        }
        formData.append("_method", "PUT");

        const response = await fetch(`${apiUrl}settings/update`, {
          method: "POST",
          headers: {
            Accept: headers.Accept,
            Authorization: headers.Authorization,
            "X-Company-ID": headers["X-Company-ID"],
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        if (data.status === "success") {
          // Optimistically update local state
          setSettings((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              [fieldKey]: data.data[fieldKey as keyof SettingsData],
            };
          });
          onSuccess?.("Setting updated successfully");
          return data.data;
        } else {
          throw new Error(data.message || "Failed to update setting");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update settings";
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [getApiUrl, getAuthHeaders, onSuccess, onError]
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchSettings();
    }
  }, [autoFetch, fetchSettings]);

  return {
    settings,
    loading,
    error,
    isCreating,
    isSaving,
    fetchSettings,
    createSettings,
    updateSettings,
    refetch: fetchSettings,
  };
}

// File upload helper hook
export function useFileUpload() {
  const [fileUploads, setFileUploads] = useState<FileUploadData>({});
  const [filePreviews, setFilePreviews] = useState<FilePreviewData>({});

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  const handleFileChange = useCallback(
    (fieldKey: string, file: File, options?: { maxSize?: number }) => {
      const MAX_FILE_SIZE = options?.maxSize || 5 * 1024 * 1024; // 5MB default

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }

      // Revoke previous preview URL if exists
      if (filePreviews[fieldKey]) {
        URL.revokeObjectURL(filePreviews[fieldKey]);
      }

      const previewUrl = URL.createObjectURL(file);
      
      setFilePreviews((prev) => ({
        ...prev,
        [fieldKey]: previewUrl,
      }));

      setFileUploads((prev) => ({
        ...prev,
        [fieldKey]: file,
      }));

      return { file, previewUrl };
    },
    [filePreviews]
  );

  const clearFile = useCallback((fieldKey: string) => {
    if (filePreviews[fieldKey]) {
      URL.revokeObjectURL(filePreviews[fieldKey]);
    }

    setFilePreviews((prev) => {
      const { [fieldKey]: _, ...rest } = prev;
      return rest;
    });

    setFileUploads((prev) => {
      const { [fieldKey]: _, ...rest } = prev;
      return rest;
    });
  }, [filePreviews]);

  const clearAllFiles = useCallback(() => {
    Object.values(filePreviews).forEach((url) => URL.revokeObjectURL(url));
    setFilePreviews({});
    setFileUploads({});
  }, [filePreviews]);

  return {
    fileUploads,
    filePreviews,
    handleFileChange,
    clearFile,
    clearAllFiles,
  };
}