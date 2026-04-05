import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

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

interface ApiResponse<T> {
  status: "success" | "error" | boolean;
  message?: string;
  data?: T;
  types?: string[];
  download_url?: string;
  file_url?: string;
  filename?: string;
}

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
  commentResource: (id: number, comment: string) => Promise<boolean>;
}

const sanitizeFileUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url.replace(/^http:\/\//i, "https://");
};

function normalizeResource(resource: Record<string, unknown>): Resource {
  const tags = resource.tags;
  let parsedTags: string[] = [];
  if (tags) {
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    } else if (Array.isArray(tags)) {
      parsedTags = tags as string[];
    }
  }

  return {
    id: resource.id as number,
    title: resource.title as string,
    description: resource.description as string | undefined,
    type: resource.type as string,
    category: resource.category as string | undefined,
    visibility: resource.visibility as string,
    file_url: sanitizeFileUrl(resource.file_url as string | null),
    link: resource.link as string | undefined,
    file_size: resource.file_size as string | undefined,
    downloads: (resource.downloads as number) || 0,
    likes_count: (resource.likes_count as number) || 0,
    dislikes_count: (resource.dislikes_count as number) || 0,
    comments_count: (resource.comments_count as number) || 0,
    tags: parsedTags,
    group: resource.group as string | undefined,
    uploaded_by: resource.uploaded_by as string | undefined,
    created_at: resource.created_at as string,
    updated_at: resource.updated_at as string | undefined,
  };
}

export function useMemberResources(): UseMemberResourcesReturn {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResourceTypes = useCallback(async () => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<string[]>>(
        "resource-types",
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.types) {
        setResourceTypes(Array.isArray(data.types) ? data.types : []);
      }
    } catch {
      // Silent fail - types are optional for filtering UI
    }
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<{ data?: Record<string, unknown>[] } | Record<string, unknown>[]>>(
        "resources/all",
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        const resourcesData = (data.data as { data?: Record<string, unknown>[] })?.data || data.data || [];
        setResources(
          Array.isArray(resourcesData)
            ? resourcesData.map(normalizeResource)
            : []
        );
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 401 || apiError.status === 403) {
        showErrorToast("Unauthorized. Please log in again.");
        return;
      }
      const errorMessage = apiError.message || "Failed to fetch resources";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResource = useCallback(async (id: number): Promise<Resource | null> => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<Record<string, unknown>>>(
        `resources/all/${id}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        return normalizeResource(data.data);
      }

      return null;
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 404) {
        showErrorToast("Resource not found");
      } else if (apiError.status === 403) {
        showErrorToast("You don't have permission to view this resource");
      } else {
        showErrorToast("Failed to load resource details");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadResource = useCallback(async (id: number): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<{ downloads: number; file_url: string; filename: string }>>(
        `resources/${id}/download`
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, downloads: (data.data as { downloads: number })?.downloads || (r.downloads || 0) + 1 } : r
          )
        );

        // Trigger file download
        const fileUrl = (data.data as { file_url: string })?.file_url;
        if (fileUrl) {
          const link = document.createElement("a");
          link.href = sanitizeFileUrl(fileUrl) || fileUrl;
          link.download = (data.data as { filename: string })?.filename || `resource-${id}`;
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        showSuccessToast("Download started");
        return true;
      }
      throw new Error(data.message || "Failed to download");
    } catch (err) {
      showErrorToast((err as ApiError).message || "Failed to download resource");
      return false;
    }
  }, []);

  const likeResource = useCallback(async (id: number): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<void>>(
        `resources/${id}/like`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
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
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to like resource");
      return false;
    }
  }, []);

  const dislikeResource = useCallback(async (id: number): Promise<boolean> => {
    try {
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<void>>(
        `resources/${id}/dislike`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
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
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to record feedback");
      return false;
    }
  }, []);

  const commentResource = useCallback(async (id: number, comment: string): Promise<boolean> => {
    try {
      const encodedComment = encodeURIComponent(comment);
      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<void>>(
        `resources/comment/${id}?comment=${encodedComment}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if (data.status === "success" || data.status === true) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, comments_count: (r.comments_count || 0) + 1 }
              : r
          )
        );

        showSuccessToast("Comment added");
        return true;
      }

      throw new Error(data.message || "Failed to add comment");
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Failed to add comment");
      return false;
    }
  }, []);

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
    commentResource,
  };
}
