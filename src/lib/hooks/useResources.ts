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

interface CreateResourceParams {
  title: string;
  description?: string;
  link?: string;
  type: string;
  visibility: string;
  group?: string;
  tags?: string[];
  file?: File;
}

interface UpdateResourceParams extends CreateResourceParams {
  id: number;
}

interface UseResourcesReturn {
  resources: Resource[];
  resourceTypes: ResourceType[];
  loading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
  fetchResourceTypes: () => Promise<void>;
  fetchResource: (id: number) => Promise<Resource | null>;
  createResource: (params: CreateResourceParams) => Promise<boolean>;
  updateResource: (params: UpdateResourceParams) => Promise<boolean>;
  deleteResource: (id: number) => Promise<boolean>;
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

export function useResources(): UseResourcesReturn {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    const institutionId = localStorage.getItem("institution_id");

    return {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Company-ID": institutionId || "",
    };
  }, []);

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
      // Silent fail - types are optional for UI
    }
  }, [getHeaders]);

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

      const response = await fetch(`${apiUrl}community/resources`, {
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

        const response = await fetch(`${apiUrl}community/resources/${id}`, {
          method: "GET",
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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

  const createResource = useCallback(
    async (params: CreateResourceParams): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        const formData = new FormData();
        formData.append("title", params.title);
        if (params.description)
          formData.append("description", params.description);
        if (params.link) formData.append("link", params.link);
        formData.append("type", params.type);
        formData.append("visibility", params.visibility);
        if (params.group) formData.append("group", params.group);
        if (params.tags && params.tags.length > 0)
          formData.append("tags", JSON.stringify(params.tags));
        if (params.file) formData.append("file", params.file);

        const headers = getHeaders();
        delete (headers as any)["Content-Type"];

        const response = await fetch(`${apiUrl}community/resources`, {
          method: "POST",
          headers,
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          showSuccessToast("Resource created successfully");
          await fetchResources();
          return true;
        }

        throw new Error(data.message || "Failed to create resource");
      } catch (err) {
        console.error("Failed to create resource:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to create resource"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, fetchResources]
  );

  const updateResource = useCallback(
    async (params: UpdateResourceParams): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        const formData = new FormData();
        formData.append("title", params.title);
        if (params.description)
          formData.append("description", params.description);
        if (params.link) formData.append("link", params.link);
        formData.append("type", params.type);
        formData.append("visibility", params.visibility);
        if (params.group) formData.append("group", params.group);
        if (params.tags && params.tags.length > 0)
          formData.append("tags", JSON.stringify(params.tags));
        if (params.file) formData.append("file", params.file);
        formData.append("_method", "PUT");

        const headers = getHeaders();
        delete (headers as any)["Content-Type"];

        const response = await fetch(
          `${apiUrl}community/resources/${params.id}`,
          {
            method: "POST",
            headers,
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          showSuccessToast("Resource updated successfully");
          await fetchResources();
          return true;
        }

        throw new Error(data.message || "Failed to update resource");
      } catch (err) {
        console.error("Failed to update resource:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to update resource"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, fetchResources]
  );

  const deleteResource = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token || !apiUrl) {
          showErrorToast("Configuration error");
          return false;
        }

        const response = await fetch(`${apiUrl}community/resources/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "success") {
          showSuccessToast("Resource deleted successfully");
          await fetchResources();
          return true;
        }

        throw new Error(data.message || "Failed to delete resource");
      } catch (err) {
        console.error("Failed to delete resource:", err);
        showErrorToast(
          err instanceof Error ? err.message : "Failed to delete resource"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, fetchResources]
  );

  return {
    resources,
    resourceTypes,
    loading,
    error,
    fetchResources,
    fetchResourceTypes,
    fetchResource,
    createResource,
    updateResource,
    deleteResource,
  };
}