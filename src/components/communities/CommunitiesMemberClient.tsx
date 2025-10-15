"use client";

import { useState, useEffect } from "react";

interface Group {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
  is_joined?: boolean;
  [key: string]: any;
}

interface ApiResponse {
  status: string;
  message: string;
  data: Group[];
}

export default function CommunitiesMemberClient() {
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allGroupsError, setAllGroupsError] = useState<string | null>(null);
  const [joinedGroupsError, setJoinedGroupsError] = useState<string | null>(
    null
  );

  const fetchAllGroups = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log(
        "Fetching all groups from:",
        `${apiUrl}communication/groups/all`
      );

      const response = await fetch(`${apiUrl}communication/groups/all`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-Company-ID": companyId || "",
        },
      });

      console.log("All groups response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch all groups: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log("All groups raw response:", data);

      // Validate and extract data array
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid response structure from API");
      }

      setAllGroups(data.data);
      setAllGroupsError(null);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Unknown error fetching all groups";
      setAllGroupsError(errorMsg);
      setAllGroups([]);
    }
  };

  const fetchJoinedGroups = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log(
        "Fetching joined groups from:",
        `${apiUrl}communication/groups/all/joined`
      );

      const response = await fetch(`${apiUrl}communication/groups/all/joined`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "X-Company-ID": companyId || "",
        },
      });

      console.log("Joined groups response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch joined groups: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log("Joined groups raw response:", data);

      // Validate and extract data array
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error("Invalid response structure from API");
      }

      setJoinedGroups(data.data);
      setJoinedGroupsError(null);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Unknown error fetching joined groups";
      setJoinedGroupsError(errorMsg);
      setJoinedGroups([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchAllGroups(), fetchJoinedGroups()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchAllGroups(), fetchJoinedGroups()]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading communities...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Communities
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-4">
              {error}
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter available groups (not joined)
  const availableGroups = allGroups.filter(
    (group) => !joinedGroups.some((joined) => joined.id === group.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Communities
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your community memberships
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Joined Communities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-600 px-4 py-3">
              <h2 className="text-white font-semibold">
                Joined Communities ({joinedGroups.length})
              </h2>
            </div>
            <div className="p-4">
              {joinedGroups.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                  You haven't joined any communities yet
                </p>
              ) : (
                <div className="space-y-3">
                  {joinedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {group.description}
                        </p>
                      )}
                      {group.member_count !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {group.member_count} members
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Communities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 px-4 py-3">
              <h2 className="text-white font-semibold">
                Available Communities ({availableGroups.length})
              </h2>
            </div>
            <div className="p-4">
              {availableGroups.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                  No available communities to join
                </p>
              ) : (
                <div className="space-y-3">
                  {availableGroups.map((group) => (
                    <div
                      key={group.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {group.description}
                        </p>
                      )}
                      {group.member_count !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {group.member_count} members
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="mt-8 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-gray-800 dark:text-gray-200 font-medium mb-2 text-sm">
            Debug Information
          </h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 font-mono">
            <p>API URL: {process.env.NEXT_PUBLIC_BACKEND_API_URL}</p>
            <p>
              Token exists: {localStorage.getItem("auth_token") ? "Yes" : "No"}
            </p>
            <p>Company ID: {localStorage.getItem("company_id") || "Not set"}</p>
            <p>All groups count: {allGroups.length}</p>
            <p>Joined groups count: {joinedGroups.length}</p>
            <p>Available groups count: {availableGroups.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
