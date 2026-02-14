import { useState, useCallback } from "react";

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, any>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private isExternalAPI: boolean;

  constructor(
    baseURL: string = "/api",
    defaultHeaders: Record<string, string> = {}
  ) {
    this.baseURL = baseURL.replace(/\/$/, ""); // Remove trailing slash
    this.isExternalAPI = baseURL.startsWith("http");

    this.defaultHeaders = {
      "Content-Type": "application/json",
      // Add CORS headers for external APIs
      ...(this.isExternalAPI && {
        Accept: "application/json",
      }),
      ...defaultHeaders,
    };
    this.defaultTimeout = 15000; // 15 seconds for external APIs
  }

  // Set authorization token
  setAuthToken(token: string) {
    this.defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Remove authorization token
  removeAuthToken() {
    delete this.defaultHeaders["Authorization"];
  }

  // Build full URL
  private buildURL(endpoint: string): string {
    return `${this.baseURL}${
      endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    }`;
  }

  // Handle request with timeout and retries
  private async makeRequest<T>(
    url: string,
    options: RequestInit,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = 0,
      retryDelay = 1000,
    } = config;

    let lastError: ApiError | undefined = undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          // Add CORS mode for external APIs
          mode: this.isExternalAPI ? "cors" : "same-origin",
          credentials: this.isExternalAPI ? "omit" : "same-origin",
          headers: {
            ...this.defaultHeaders,
            ...config.headers,
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          lastError = {
            message:
              errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            errors: errorData.errors,
          };
          throw lastError;
        }

        const data = await response.json();
        return {
          data,
          status: response.status,
          message: data.message,
        };
      } catch (error) {
        // If it's already an ApiError, use it
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          "status" in error
        ) {
          lastError = error as ApiError;
        } else {
          // Handle network errors specifically
          if (error instanceof TypeError && error.message.includes("fetch")) {
            lastError = {
              message: "Network error: Unable to connect to API",
              status: 0,
            };
          } else if (error instanceof Error && error.name === "AbortError") {
            lastError = {
              message: "Request timeout",
              status: 408,
            };
          } else {
            lastError = {
              message:
                (error as Error).message || "An unexpected error occurred",
              status: 500,
            };
          }
        }

        // Don't retry on client errors (4xx) or if it's the last attempt
        if (
          attempt === retries ||
          (lastError.status >= 400 && lastError.status < 500)
        ) {
          break;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    // Throw the ApiError object directly
    if (!lastError) {
      lastError = {
        message: "An unknown error occurred",
        status: 500,
      };
    }
    throw lastError;
  }

  // GET request
  async get<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.makeRequest<T>(url, { method: "GET" }, config);
  }

  // POST request
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.makeRequest<T>(
      url,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async postFormData<T = any>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    const formDataHeaders = {
      ...(this.defaultHeaders["Authorization"] && {
        Authorization: this.defaultHeaders["Authorization"],
      }),
      Accept: "application/json",
    };

    return this.makeRequest<T>(
      url,
      {
        method: "POST",
        body: formData,
        headers: formDataHeaders,
      },
      config
    );
  }

  // PUT request
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.makeRequest<T>(
      url,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  // PATCH request
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.makeRequest<T>(
      url,
      {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  // DELETE request
  async delete<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    return this.makeRequest<T>(url, { method: "DELETE" }, config);
  }

  // Upload file
  async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    config?: Omit<RequestConfig, "headers">
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint);
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === "string" ? value : JSON.stringify(value)
        );
      });
    }

    const headers = { ...this.defaultHeaders };
    delete headers["Content-Type"]; 

    return this.makeRequest<T>(
      url,
      {
        method: "POST",
        body: formData,
        headers,
      },
      config
    );
  }
}

// Environment configuration
const getApiBaseUrl = (): string => {
  // Use environment variable for external API
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL.replace(/\/$/, "");
  }

  // Fallback to local API routes
  return "/api";
};

// Create a default client instance with your backend URL
export const apiClient = new ApiClient(getApiBaseUrl());

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiCall();
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
        return response;
      } catch (error) {
        const apiError = error as ApiError;
        setState({
          data: null,
          loading: false,
          error: apiError,
        });
        throw apiError;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return { ...state, execute, reset };
}

// ============================================================================
// useApiRequest - Enhanced hook for API requests with automatic auth
// ============================================================================

export interface UseApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export interface UseApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  isSuccess: boolean;
  isError: boolean;
}

export interface UseApiRequestReturn<T> extends UseApiRequestState<T> {
  execute: () => Promise<T | null>;
  reset: () => void;
  refetch: () => Promise<T | null>;
}

// Get authenticated API client
export function getAuthenticatedClient(): ApiClient {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const client = new ApiClient(getApiBaseUrl());
  if (token) {
    client.setAuthToken(token);
  }
  return client;
}

// Helper to get company header
export function getCompanyHeaders(): Record<string, string> {
  const companyId = typeof window !== "undefined" ? localStorage.getItem("company_id") : null;
  return companyId ? { "X-Company-ID": companyId } : {};
}

export function useApiRequest<T>(
  apiCall: (client: ApiClient) => Promise<ApiResponse<T>>,
  options: UseApiRequestOptions<T> = {}
): UseApiRequestReturn<T> {
  const [state, setState] = useState<UseApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      isSuccess: false,
      isError: false,
    }));

    try {
      const client = getAuthenticatedClient();
      const response = await apiCall(client);

      // Handle nested data structure from API
      const responseData = response.data?.data ?? response.data;

      setState({
        data: responseData,
        loading: false,
        error: null,
        isSuccess: true,
        isError: false,
      });

      options.onSuccess?.(responseData);

      return responseData;
    } catch (error) {
      const apiError: ApiError = {
        message: (error as ApiError).message || "An unexpected error occurred",
        status: (error as ApiError).status || 500,
        errors: (error as ApiError).errors,
      };

      setState({
        data: null,
        loading: false,
        error: apiError,
        isSuccess: false,
        isError: true,
      });

      options.onError?.(apiError);

      return null;
    }
  }, [apiCall, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  const refetch = useCallback(async (): Promise<T | null> => {
    return execute();
  }, [execute]);

  return {
    ...state,
    execute,
    reset,
    refetch,
  };
}

// ============================================================================
// Utility function for standalone API calls (outside hooks)
// ============================================================================

export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  data?: any,
  config?: RequestConfig
): Promise<T> {
  const client = getAuthenticatedClient();
  const headers = { ...getCompanyHeaders(), ...config?.headers };
  const requestConfig = { ...config, headers };

  let response: ApiResponse<T>;

  switch (method) {
    case "GET":
      response = await client.get<T>(endpoint, requestConfig);
      break;
    case "POST":
      response = await client.post<T>(endpoint, data, requestConfig);
      break;
    case "PUT":
      response = await client.put<T>(endpoint, data, requestConfig);
      break;
    case "PATCH":
      response = await client.patch<T>(endpoint, data, requestConfig);
      break;
    case "DELETE":
      response = await client.delete<T>(endpoint, requestConfig);
      break;
  }

  // Handle nested data structure
  return response.data?.data ?? response.data;
}