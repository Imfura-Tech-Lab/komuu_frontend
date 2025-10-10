"use client";

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
  data: SettingsData;
}

import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

interface FieldConfig {
  key: string;
  label: string;
  type: string;
  category: string;
  required: boolean;
}

const SETTINGS_FIELDS: FieldConfig[] = [
  {
    key: "ngo_name",
    label: "Organization Name",
    type: "text",
    category: "organization",
    required: true,
  },
  {
    key: "ngo_address",
    label: "Organization Address",
    type: "text",
    category: "organization",
    required: true,
  },
  {
    key: "ngo_email",
    label: "Organization Email",
    type: "email",
    category: "organization",
    required: true,
  },
  {
    key: "contact_phone",
    label: "Contact Phone",
    type: "text",
    category: "contact",
    required: false,
  },
  {
    key: "website",
    label: "Website",
    type: "url",
    category: "contact",
    required: false,
  },
  {
    key: "logo",
    label: "Organization Logo",
    type: "file",
    category: "branding",
    required: false,
  },
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

export default function SettingsDetailsClient() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [fileUploads, setFileUploads] = useState<{ [key: string]: File }>({});
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>(
    {}
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cleanup preview URLs on unmount or when previews change
  useEffect(() => {
    return () => {
      Object.values(filePreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviews]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      if (!token) {
        showErrorToast("Authentication required. Please login to continue.");
        return;
      }

      const response = await fetch(`${apiUrl}settings/details`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-Company-ID": companyId || "",
        },
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
        showErrorToast(errorMessage);
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      if (data.status === "success") {
        setSettings(data.data);
        setIsCreating(!data.data.id);
      } else {
        showErrorToast(data.message || "Failed to load settings");
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch settings";
      setError(errorMessage);

      if (err instanceof Error && !err.message.includes("HTTP error")) {
        showErrorToast("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const resetEditState = useCallback(() => {
    setEditingField(null);
    setEditValue("");
    setFileUploads({});
    Object.values(filePreviews).forEach((url) => URL.revokeObjectURL(url));
    setFilePreviews({});
  }, [filePreviews]);

  const handleEdit = (fieldKey: string) => {
    setEditingField(fieldKey);
    setEditValue((settings?.[fieldKey as keyof SettingsData] as string) || "");
  };

  const handleFileChange = (fieldKey: string, file: File) => {
    // Validate file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      showErrorToast("File size exceeds 5MB limit");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showErrorToast("Only image files are allowed");
      return;
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
    setEditValue(file.name);
  };

  const handleSave = async (fieldKey: string) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      const formData = new FormData();
      const fieldConfig = SETTINGS_FIELDS.find((f) => f.key === fieldKey);

      if (isCreating) {
        // CREATE: Send all fields with values
        if (settings) {
          Object.entries(settings).forEach(([key, value]) => {
            if (value !== null && key !== "id") {
              formData.append(key, value as string);
            }
          });
        }

        // Override with edited field
        if (fieldConfig?.type === "file" && fileUploads[fieldKey]) {
          formData.append(fieldKey, fileUploads[fieldKey]);
        } else {
          formData.append(fieldKey, editValue);
        }

        const response = await fetch(`${apiUrl}settings/create`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "X-Company-ID": companyId || "",
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        if (data.status === "success") {
          showSuccessToast("Settings created successfully");
          setIsCreating(false);

          // Optimistically update local state
          setSettings(data.data);
          resetEditState();

          // Reconcile with backend
          await fetchSettings();
        } else {
          showErrorToast(data.message || "Failed to create settings");
        }
      } else {
        // UPDATE: Send only the changed field
        if (fieldConfig?.type === "file" && fileUploads[fieldKey]) {
          formData.append(fieldKey, fileUploads[fieldKey]);
        } else {
          formData.append(fieldKey, editValue);
        }
        formData.append("_method", "PUT");

        const response = await fetch(`${apiUrl}settings/update`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "X-Company-ID": companyId || "",
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}`);
        }

        if (data.status === "success") {
          showSuccessToast("Setting updated successfully");

          // Optimistically update local state
          setSettings((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              [fieldKey]:
                fieldConfig?.type === "file"
                  ? data.data[fieldKey as keyof SettingsData]
                  : editValue,
            };
          });

          resetEditState();

          // Reconcile with backend
          await fetchSettings();
        } else {
          showErrorToast(data.message || "Failed to update setting");
        }
      }
    } catch (err) {
      const action = isCreating ? "create" : "update";
      showErrorToast(
        err instanceof Error ? err.message : `Failed to ${action} setting`
      );
      console.error(`${action} error:`, err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetEditState();
  };

  const getFieldValue = (fieldKey: string): string => {
    const value = settings?.[fieldKey as keyof SettingsData];
    if (value === null || value === undefined) return "";
    return value.toString();
  };

  const isImageField = (fieldKey: string): boolean => {
    return (
      fieldKey.includes("signature") ||
      fieldKey.includes("stamp") ||
      fieldKey.includes("logo")
    );
  };

  const renderFieldInput = (fieldKey: string, fieldConfig: FieldConfig) => {
    if (fieldConfig.type === "file") {
      const currentValue = settings?.[fieldKey as keyof SettingsData] as string;
      const previewUrl =
        filePreviews[fieldKey] ||
        (currentValue?.startsWith("http") ? currentValue : null);

      return (
        <div className="space-y-4">
          {/* Current Image Preview */}
          {currentValue && currentValue.startsWith("http") && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Image:
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-shrink-0">
                  <img
                    src={currentValue}
                    alt={fieldConfig.label}
                    className="h-32 w-32 object-contain border border-gray-200 dark:border-gray-600 rounded-lg bg-white p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                    {currentValue.split("/").pop()}
                  </p>
                  <a
                    href={currentValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Open in new tab
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* New Image Preview */}
          {filePreviews[fieldKey] && (
            <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                New Image Preview:
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-shrink-0">
                  <img
                    src={filePreviews[fieldKey]}
                    alt={`New ${fieldConfig.label}`}
                    className="h-32 w-32 object-contain border border-blue-200 dark:border-blue-600 rounded-lg bg-white p-2"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {fileUploads[fieldKey]?.name}
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                    This image will replace the current one when you save.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload new {fieldConfig.label}:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] &&
                handleFileChange(fieldKey, e.target.files[0])
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB.
            </p>
          </div>
        </div>
      );
    }

    return (
      <input
        type={fieldConfig.type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
      />
    );
  };

  const renderFieldDisplay = (fieldKey: string, fieldConfig: FieldConfig) => {
    const value = getFieldValue(fieldKey);

    if (isImageField(fieldKey) && value && value.startsWith("http")) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-shrink-0">
            <div className="relative group">
              <img
                src={value}
                alt={fieldConfig.label}
                className="h-24 w-24 object-contain border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-white p-2 hover:shadow-lg transition-shadow"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
              {value.split("/").pop()}
            </p>
            <div className="flex gap-2 mt-2">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View Full Size
              </a>
              <button
                onClick={() => handleEdit(fieldKey)}
                className="inline-flex items-center text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Replace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-900 dark:text-white break-all">
            {value || <span className="text-gray-400 italic">Not set</span>}
          </span>
        </div>
        <button
          onClick={() => handleEdit(fieldKey)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          title="Edit setting"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </div>
    );
  };

  const groupedFields = SETTINGS_FIELDS.reduce((groups, field) => {
    const category = field.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(field);
    return groups;
  }, {} as { [key: string]: FieldConfig[] });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading settings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              ⚠️
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Settings
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchSettings}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Organization Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your organization's configuration and branding
              </p>
              {isCreating && (
                <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    ⚠️ Settings not configured yet. Please fill in the required
                    fields to create your organization settings.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={fetchSettings}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedFields).map(([category, fields]) => (
            <div
              key={category}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {category} Settings
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {field.label}
                          </h3>
                          {field.required && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              Required
                            </span>
                          )}
                        </div>

                        {editingField === field.key ? (
                          <div className="space-y-3">
                            {renderFieldInput(field.key, field)}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSave(field.key)}
                                disabled={
                                  isSaving ||
                                  (field.required &&
                                    !editValue &&
                                    !fileUploads[field.key])
                                }
                                className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors inline-flex items-center gap-2"
                              >
                                {isSaving && (
                                  <svg
                                    className="animate-spin h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                )}
                                {isSaving
                                  ? "Saving..."
                                  : isCreating
                                  ? "Create"
                                  : "Save"}
                              </button>
                              <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          renderFieldDisplay(field.key, field)
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
