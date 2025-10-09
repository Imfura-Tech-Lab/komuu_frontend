"use client";

import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";

interface SettingDetail {
  id: number;
  key: string;
  value: string;
  description?: string;
  category?: string;
  updated_at?: string;
}

interface SettingsResponse {
  status: string;
  message: string;
  data: SettingDetail[];
}

export default function SettingsDetailsClient() {
  const [settings, setSettings] = useState<SettingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id"); // Or however you store it

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
        if (response.status === 401) {
          showErrorToast("Session expired. Please login again.");
        } else if (response.status === 403) {
          showErrorToast("You don't have permission to view settings.");
        } else if (response.status >= 500) {
          showErrorToast("Server error. Please try again later.");
        } else {
          showErrorToast(data.message || `Error: ${response.status}`);
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        setSettings(Array.isArray(data.data) ? data.data : []);
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
  };

  const handleEdit = (setting: SettingDetail) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
  };

  const handleSave = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      const response = await fetch(`${apiUrl}settings/details/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-Company-ID": companyId || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: editValue }),
      });

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Setting updated successfully");
        setEditingId(null);
        fetchSettings();
      } else {
        showErrorToast(data.message || "Failed to update setting");
      }
    } catch (err) {
      showErrorToast("Failed to update setting");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">⚠️</div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage system configuration and preferences
              </p>
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

        {/* Settings List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {settings.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {setting.key}
                        </h3>
                        {setting.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {setting.category}
                          </span>
                        )}
                      </div>

                      {setting.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {setting.description}
                        </p>
                      )}

                      {editingId === setting.id ? (
                        <div className="flex items-center gap-2 mt-3">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleSave(setting.id)}
                            className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
                            <span className="text-sm font-mono text-gray-900 dark:text-white">
                              {setting.value}
                            </span>
                          </div>
                          <button
                            onClick={() => handleEdit(setting)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
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
                      )}

                      {setting.updated_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Last updated: {formatDate(setting.updated_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No settings found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}