"use client";

import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

// Types
export interface SettingsCredentials {
  public_key: string | null;
  secret_key: string | null;
  encryption_key: string | null;
  api_user: string | null;
  api_key: string | null;
  collection_code: string | null;
}

export interface SettingsData {
  id: number;
  president_signature: string | null;
  ngo_stamp: string | null;
  currency: string | null;
  style_config_vars: Record<string, unknown> | null;
  provider: string | null;
  credentials: SettingsCredentials | null;
  is_gateway_enabled: boolean | null;
  mode: string | null;
  webhook_secret: string | null;
  fallback_url: string | null;
  metadata: Record<string, unknown> | null;
}

interface SettingsResponse {
  status: string;
  message: string;
  data: SettingsData | null;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "password" | "checkbox" | "select" | "file" | "url";
  category: string;
  required: boolean;
  placeholder?: string;
}

// Field configurations
export const SETTINGS_FIELDS: FieldConfig[] = [
  // Payment Gateway Configuration
  {
    key: "provider",
    label: "Payment Provider",
    type: "text",
    category: "payment_gateway",
    required: false,
    placeholder: "e.g., DPO Rwanda, Stripe, PayPal",
  },
  {
    key: "mode",
    label: "Gateway Mode",
    type: "select",
    category: "payment_gateway",
    required: false,
  },
  {
    key: "is_gateway_enabled",
    label: "Gateway Enabled",
    type: "checkbox",
    category: "payment_gateway",
    required: false,
  },
  {
    key: "currency",
    label: "Currency",
    type: "text",
    category: "payment_gateway",
    required: false,
    placeholder: "e.g., EUR, USD, RWF",
  },
  // Credentials
  {
    key: "credentials.public_key",
    label: "Public Key",
    type: "text",
    category: "credentials",
    required: false,
  },
  {
    key: "credentials.secret_key",
    label: "Secret Key",
    type: "password",
    category: "credentials",
    required: false,
  },
  {
    key: "credentials.encryption_key",
    label: "Encryption Key",
    type: "password",
    category: "credentials",
    required: false,
  },
  {
    key: "credentials.api_user",
    label: "API User",
    type: "text",
    category: "credentials",
    required: false,
  },
  {
    key: "credentials.api_key",
    label: "API Key",
    type: "password",
    category: "credentials",
    required: false,
  },
  {
    key: "credentials.collection_code",
    label: "Collection Code",
    type: "text",
    category: "credentials",
    required: false,
  },
  // Webhook Configuration
  {
    key: "webhook_secret",
    label: "Webhook Secret",
    type: "password",
    category: "webhooks",
    required: false,
  },
  {
    key: "fallback_url",
    label: "Fallback URL",
    type: "url",
    category: "webhooks",
    required: false,
    placeholder: "https://example.com/fallback",
  },
  // Documents
  {
    key: "president_signature",
    label: "President Signature",
    type: "file",
    category: "documents",
    required: false,
  },
  {
    key: "ngo_stamp",
    label: "Organization Stamp",
    type: "file",
    category: "documents",
    required: false,
  },
];

export const CATEGORY_NAMES: { [key: string]: string } = {
  payment_gateway: "Payment Gateway Configuration",
  credentials: "API Credentials",
  webhooks: "Webhook Configuration",
  documents: "Documents & Stamps",
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        showErrorToast("Authentication required. Please login to continue.");
        setError("Authentication required");
        return;
      }

      const client = getAuthenticatedClient();
      const response = await client.get<SettingsResponse>("settings/details", {
        headers: getCompanyHeaders(),
      });

      const data = response.data;

      // Check JSON status first - backend returns success with null data when settings don't exist
      if (data.status === "success") {
        setError(null);
        if (data.data === null) {
          setSettings(null);
          setIsCreating(true);
        } else {
          setSettings(data.data);
          setIsCreating(false);
        }
        return;
      }

      showErrorToast(data.message || "Failed to fetch settings");
      setError(data.message || "Failed to fetch settings");
    } catch (err) {
      const apiError = err as ApiError;

      const errorMessages: { [key: number]: string } = {
        401: "Session expired. Please login again.",
        403: "You don't have permission to view settings.",
        500: "Server error. Please try again later.",
      };

      const errorMessage = errorMessages[apiError.status] || apiError.message || "Failed to fetch settings";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSetting = useCallback(
    async (fieldKey: string, value: string, file?: File): Promise<boolean> => {
      if (isSaving) return false;

      try {
        setIsSaving(true);
        const fieldConfig = SETTINGS_FIELDS.find((f) => f.key === fieldKey);

        const formData = new FormData();

        if (fieldConfig?.type === "file" && file) {
          formData.append(fieldKey, file);
        } else if (fieldConfig?.type === "checkbox") {
          formData.append(fieldKey, value === "true" ? "1" : "0");
        } else {
          formData.append(fieldKey, value);
        }

        const endpoint = isCreating ? "settings/create" : "settings/update";
        if (!isCreating) {
          formData.append("_method", "PUT");
        }

        const client = getAuthenticatedClient();
        const response = await client.postFormData<SettingsResponse>(endpoint, formData, {
          headers: getCompanyHeaders(),
        });

        const data = response.data;

        if (data.status === "success") {
          showSuccessToast(
            isCreating
              ? "Settings created successfully"
              : "Setting updated successfully"
          );
          setSettings(data.data);
          setIsCreating(false);
          return true;
        }

        showErrorToast(data.message || "Failed to save setting");
        return false;
      } catch (err) {
        const action = isCreating ? "create" : "update";
        const apiError = err as ApiError;
        showErrorToast(apiError.message || `Failed to ${action} setting`);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [isCreating, isSaving]
  );

  const getFieldValue = useCallback(
    (fieldKey: string): string | null => {
      if (!settings) return null;

      // Handle nested fields (e.g., credentials.public_key)
      if (fieldKey.includes(".")) {
        const [parent, child] = fieldKey.split(".");
        const parentObj = settings[parent as keyof SettingsData];
        if (parentObj && typeof parentObj === "object") {
          const value = (parentObj as Record<string, unknown>)[child];
          return value !== null && value !== undefined ? String(value) : null;
        }
        return null;
      }

      const value = settings[fieldKey as keyof SettingsData];
      if (value === null || value === undefined) return null;
      if (typeof value === "boolean") return value ? "true" : "false";
      return value.toString();
    },
    [settings]
  );

  const getImageUrl = useCallback((value: string | null): string | null => {
    if (!value) return null;

    // If already a full URL, return as-is
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }

    // If relative path, construct full URL
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!apiUrl) {
      return null;
    }

    // Remove /api suffix if present to get base domain
    const baseUrl = apiUrl.replace(/\/api\/?$/, "");

    // Ensure value starts with /
    const path = value.startsWith("/") ? value : `/${value}`;

    return `${baseUrl}${path}`;
  }, []);

  const isImageField = useCallback((fieldKey: string): boolean => {
    return (
      fieldKey.includes("signature") ||
      fieldKey.includes("stamp") ||
      fieldKey.includes("logo")
    );
  }, []);

  const getGroupedFields = useCallback(() => {
    return SETTINGS_FIELDS.reduce((groups, field) => {
      const category = field.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(field);
      return groups;
    }, {} as { [key: string]: FieldConfig[] });
  }, []);

  return {
    // State
    settings,
    loading,
    error,
    isCreating,
    isSaving,

    // Actions
    fetchSettings,
    saveSetting,

    // Helpers
    getFieldValue,
    getImageUrl,
    isImageField,
    getGroupedFields,
  };
}
