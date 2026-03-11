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
  groupId?: number;
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
  group?: number;
  tags?: string[];
  file?: File;
}

interface UpdateResourceParams extends CreateResourceParams {
  id: number;
}

interface ApiResponse<T> {
  status: "success" | "error" | boolean;
  message?: string;
  data?: T;
  types?: string[];
  errors?: Record<string, string[]>;
}

interface ResourceResult {
  success: boolean;
  errors?: Record<string, string[]>;
}

interface UseResourcesReturn {
  resources: Resource[];
  resourceTypes: ResourceType[];
  loading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
  fetchResourceTypes: () => Promise<void>;
  fetchResource: (id: number) => Promise<Resource | null>;
  createResource: (params: CreateResourceParams) => Promise<ResourceResult>;
  updateResource: (params: UpdateResourceParams) => Promise<ResourceResult>;
  deleteResource: (id: number) => Promise<boolean>;
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

  const group = resource.group as { name?: string; id?: number } | string | undefined;

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
    group: typeof group === "object" ? group?.name : group,
    groupId: typeof group === "object" ? group?.id : (resource.group_id as number | undefined),
    uploaded_by: resource.uploaded_by as string | undefined,
    created_at: resource.created_at as string,
    updated_at: resource.updated_at as string | undefined,
  };
}

export function useResources(): UseResourcesReturn {
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
      // Silent fail - types are optional for UI
    }
  }, []);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<ApiResponse<{ data?: Record<string, unknown>[] } | Record<string, unknown>[]>>(
        "community/resources",
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
        `community/resources/${id}`,
        { headers: getCompanyHeaders() }
      );

      const data = response.data;
      if ((data.status === "success" || data.status === true) && data.data) {
        return normalizeResource(data.data);
      }

      return null;
    } catch {
      showErrorToast("Failed to load resource details");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createResource = useCallback(
    async (params: CreateResourceParams): Promise<ResourceResult> => {
      try {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("title", params.title);
        if (params.description) formData.append("description", params.description);
        if (params.link) formData.append("link", params.link);
        formData.append("type", params.type);
        formData.append("visibility", params.visibility);
        if (params.group != null) formData.append("group", params.group.toString());
        if (params.tags && params.tags.length > 0)
          formData.append("tags", JSON.stringify(params.tags));
        if (params.file) formData.append("file", params.file);

        const client = getAuthenticatedClient();
        const response = await client.postFormData<ApiResponse<Resource>>(
          "community/resources",
          formData,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if (data.status === "success" || data.status === true) {
          showSuccessToast(data.message || "Resource created successfully");
          await fetchResources();
          return { success: true };
        }

        if (data.status === "error" && data.errors) {
          return { success: false, errors: data.errors };
        }

        throw new Error(data.message || "Failed to create resource");
      } catch (err) {
        const apiError = err as ApiError;

        // Check if it's a validation error with field errors
        if (apiError.errors && Object.keys(apiError.errors).length > 0) {
          return { success: false, errors: apiError.errors };
        }

        showErrorToast(apiError.message || "Failed to create resource");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchResources]
  );

  const updateResource = useCallback(
    async (params: UpdateResourceParams): Promise<ResourceResult> => {
      try {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("title", params.title);
        if (params.description) formData.append("description", params.description);
        if (params.link) formData.append("link", params.link);
        formData.append("type", params.type);
        formData.append("visibility", params.visibility);
        if (params.group != null) formData.append("group", params.group.toString());
        if (params.tags && params.tags.length > 0)
          formData.append("tags", JSON.stringify(params.tags));
        if (params.file) formData.append("file", params.file);
        formData.append("_method", "PUT");

        const client = getAuthenticatedClient();
        const response = await client.postFormData<ApiResponse<Resource>>(
          `community/resources/${params.id}`,
          formData,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if (data.status === "success" || data.status === true) {
          showSuccessToast(data.message || "Resource updated successfully");
          await fetchResources();
          return { success: true };
        }

        if (data.status === "error" && data.errors) {
          return { success: false, errors: data.errors };
        }

        throw new Error(data.message || "Failed to update resource");
      } catch (err) {
        const apiError = err as ApiError;

        // Check if it's a validation error with field errors
        if (apiError.errors && Object.keys(apiError.errors).length > 0) {
          return { success: false, errors: apiError.errors };
        }

        showErrorToast(apiError.message || "Failed to update resource");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [fetchResources]
  );

  const deleteResource = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const client = getAuthenticatedClient();
        const response = await client.delete<ApiResponse<void>>(
          `community/resources/${id}`,
          { headers: getCompanyHeaders() }
        );

        const data = response.data;
        if (data.status === "success" || data.status === true) {
          showSuccessToast(data.message || "Resource deleted successfully");
          await fetchResources();
          return true;
        }

        throw new Error(data.message || "Failed to delete resource");
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Failed to delete resource");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchResources]
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
