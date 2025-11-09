import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";

export interface Resource {
  id: number;
  title: string;
  description?: string;
  type: string;
  category?: string;
  visibility: string;
  file_url?: string;
  link?: string;
  file_size?: string;
  downloads?: number;
  likes_count?: number;
  dislikes_count?: number;
  comments_count?: number;
  tags?: string[];
  group?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at?: string;
}

export type ResourceType = string;

interface UseMemberResourcesReturn {
  resources: Resource[];
  resourceTypes: ResourceType[];
  loading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
  fetchResourceTypes: () => Promise<void>;
  fetchResource: (id: number) => Promise<Resource | null>;
  downloadResource: (id: number) => Promise<boolean>;
  likeResource: (id: number) => Promise<boolean>;
  dislikeResource: (id: number) => Promise<boolean>;
}

// Utility: Force HTTPS on Cloudinary URLs
const sanitizeFileUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url.replace(/^http:\/\//i, "https://");
};

// Utility: Normalize API resource to frontend type
const normalizeResource = (resource: any): Resource => ({
  id: resource.id,
  title: resource.title,
  description: resource.description,
  type: resource.type,
  category: resource.category,
  visibility: resource.visibility,
  file_url: sanitizeFileUrl(resource.file_url),
  link: resource.link,
  file_size: resource.file_size,
  downloads: resource.downloads || 0,
  likes_count: resource.likes_count || 0,
  dislikes_count: resource.dislikes_count || 0,
  comments_count: resource.comments_count || 0,
  tags: resource.tags
    ? typeof resource.tags === "string"
      ? JSON.parse(resource.tags)
      : resource.tags
    : [],
  group: resource.group,
  uploaded_by: resource.uploaded_by,
  created_at: resource.created_at,
  updated_at: resource.updated_at,
});

export function useMemberResources(): UseMemberResourcesReturn {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    if (typeof window === "undefined") {
      return {
        Accept: "application/json",
        Authorization: "",
        "X-Company-ID": "",
      };
    }

    const token = localStorage.getItem("auth_token");
    const companyId = localStorage.getItem("company_id");

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Company-ID": companyId || "",
    };
  }, []);

  /**
   * Fetch available resource types
   * Member endpoint: GET /resource-types (same as admin)
   */
  const fetchResourceTypes = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token || !apiUrl) {
        return;
      }

      const response = await fetch(`${apiUrl}resource-types`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success" && data.types) {
        setResourceTypes(Array.isArray(data.types) ? data.types : []);
      }
    } catch (err) {
      console.error("Failed to fetch resource types:", err);
      // Silent fail - types are optional for filtering UI
    }
  }, [getHeaders]);

  /**
   * Fetch all community resources (member view)
   * Member endpoint: GET /resources
   * 
   * Returns only resources visible to members based on visibility settings
   */
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view resources");
        return;
      }

      if (!apiUrl) {
        showErrorToast("Backend API URL is not configured.");
        setError("Configuration error: Backend API URL missing.");
        return;
      }

      const response = await fetch(`${apiUrl}resources`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const resourcesData = data.data?.data || data.data || [];
        setResources(
          Array.isArray(resourcesData)
            ? resourcesData.map(normalizeResource)
            : []
        );
      } else {
        throw new Error(data.message || "Failed to fetch resources");
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch resources";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  /**
   * Fetch single resource details
   * Member endpoint: GET /resources/{id}
   */
  const fetchResource = useCallback(
    async (id: number): Promise<Resource | null> => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return null;
        }

        const response = await fetch(`${apiUrl}resources/${id}`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          if (response.status === 404) {
            showErrorToast("Resource not found");
          } else if (response.status === 403) {
            showErrorToast("You don't have permission to view this resource");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return null;
        }

        const data = await response.json();

        if (data.status === "success" && data.data) {
          return normalizeResource(data.data);
        }

        return null;
      } catch (err) {
        console.error("Failed to fetch resource:", err);
        showErrorToast("Failed to load resource details");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getHeaders]
  );

  /**
   * Download/access a resource (increments download count)
   * Member endpoint: GET /resources/{id}/download
   * 
   * This tracks downloads and may enforce access permissions
   */
  const downloadResource = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        const response = await fetch(`${apiUrl}resources/${id}/download`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          if (response.status === 403) {
            showErrorToast("You don't have permission to download this resource");
          } else if (response.status === 404) {
            showErrorToast("Resource not found");
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return false;
        }

        const data = await response.json();

        if (data.status === "success") {
          // Update local download count
          setResources((prev) =>
            prev.map((r) =>
              r.id === id ? { ...r, downloads: (r.downloads || 0) + 1 } : r
            )
          );

          // If there's a direct file URL, trigger download
          if (data.download_url || data.file_url) {
            const downloadUrl = data.download_url || data.file_url;
            const link = document.createElement("a");
            link.href = sanitizeFileUrl(downloadUrl) || "";
            link.download = data.filename || `resource-${id}`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

          showSuccessToast("Download started");
          return true;
        }

        throw new Error(data.message || "Failed to download resource");
      } catch (err) {
        console.error("Failed to download resource:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to download resource"
        );
        return false;
      }
    },
    [getHeaders]
  );

  /**
   * Like a resource
   * Member endpoint: POST /resources/{id}/like
   */
  const likeResource = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        const response = await fetch(`${apiUrl}resources/${id}/like`, {
          method: "POST",
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          // Optimistic update
          setResources((prev) =>
            prev.map((r) =>
              r.id === id
                ? { ...r, likes_count: (r.likes_count || 0) + 1 }
                : r
            )
          );

          showSuccessToast("Resource liked");
          return true;
        }

        throw new Error(data.message || "Failed to like resource");
      } catch (err) {
        console.error("Failed to like resource:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to like resource"
        );
        return false;
      }
    },
    [getHeaders]
  );

  /**
   * Dislike a resource
   * Member endpoint: POST /resources/{id}/dislike
   */
  const dislikeResource = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        const response = await fetch(`${apiUrl}resources/${id}/dislike`, {
          method: "POST",
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          // Optimistic update
          setResources((prev) =>
            prev.map((r) =>
              r.id === id
                ? { ...r, dislikes_count: (r.dislikes_count || 0) + 1 }
                : r
            )
          );

          showSuccessToast("Feedback recorded");
          return true;
        }

        throw new Error(data.message || "Failed to record feedback");
      } catch (err) {
        console.error("Failed to dislike resource:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to record feedback"
        );
        return false;
      }
    },
    [getHeaders]
  );

  return {
    resources,
    resourceTypes,
    loading,
    error,
    fetchResources,
    fetchResourceTypes,
    fetchResource,
    downloadResource,
    likeResource,
    dislikeResource,
  };
}