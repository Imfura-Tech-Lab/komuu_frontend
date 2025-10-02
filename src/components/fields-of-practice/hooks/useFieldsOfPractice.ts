import { useState, useCallback } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

export interface SubField {
  id: number;
  field: string;
  code: string;
}

export interface FieldOfPractice {
  id: number;
  field: string;
  code: string;
  sub_fields: SubField[];
}

export interface CreateFieldOfPractice {
  field_of_practice: string;
  code: string;
  description?: string;
  main_field?: number;
}

export function useFieldsOfPractice() {
  const [fields, setFields] = useState<FieldOfPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Authentication required. Please login to continue.");
        return;
      }

      const response = await fetch(`${apiUrl}fields-of-practice`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          showErrorToast("Session expired. Please login again.");
        } else if (response.status === 403) {
          showErrorToast("You don't have permission to view fields of practice.");
        } else if (response.status === 404) {
          showErrorToast("Fields of practice endpoint not found.");
        } else if (response.status >= 500) {
          showErrorToast("Server error. Please try again later.");
        } else {
          showErrorToast(data.message || `Error: ${response.status}`);
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.status === "success") {
        const fieldsData = data.data?.data || data.data || [];
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
      } else {
        showErrorToast(data.message || "Failed to load fields of practice");
        throw new Error(data.message || "Failed to fetch fields of practice");
      }
    } catch (err) {
      console.error("Failed to fetch fields of practice:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch fields of practice";
      setError(errorMessage);
      
      if (err instanceof Error && !err.message.includes("HTTP error")) {
        showErrorToast("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createField = useCallback(
    async (formData: CreateFieldOfPractice | Omit<CreateFieldOfPractice, 'main_field'>): Promise<boolean> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token) {
          showErrorToast("Authentication required. Please login to continue.");
          return false;
        }

        const params = new URLSearchParams({
          field_of_practice: formData.field_of_practice,
          code: formData.code,
        });

        // Only add description if provided
        if (formData.description) {
          params.append('description', formData.description);
        }

        // Only add main_field if it's a sub-field
        if ('main_field' in formData && formData.main_field) {
          params.append('main_field', formData.main_field.toString());
        }

        const response = await fetch(`${apiUrl}fields-of-practice?${params}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            showErrorToast("Session expired. Please login again.");
          } else if (response.status === 403) {
            showErrorToast("You don't have permission to create fields.");
          } else if (response.status === 422) {
            showErrorToast(data.message || "Validation error. Please check your input.");
          } else if (response.status === 409) {
            showErrorToast("A field with this code already exists.");
          } else if (response.status >= 500) {
            showErrorToast("Server error. Please try again later.");
          } else {
            showErrorToast(data.message || `Error: ${response.status}`);
          }
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (data.status === "success") {
          showSuccessToast(
            data.message || "Field of practice created successfully"
          );
          await fetchFields();
          return true;
        } else {
          showErrorToast(data.message || "Failed to create field of practice");
          throw new Error(data.message || "Failed to create field of practice");
        }
      } catch (err) {
        console.error("Failed to create field of practice:", err);
        
        if (err instanceof Error && !err.message.includes("HTTP error")) {
          showErrorToast("Network error. Please check your connection.");
        }
        return false;
      }
    },
    [fetchFields]
  );

  const updateField = useCallback(
    async (id: number, formData: CreateFieldOfPractice | Omit<CreateFieldOfPractice, 'main_field'>): Promise<boolean> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token) {
          showErrorToast("Authentication required. Please login to continue.");
          return false;
        }

        const params = new URLSearchParams({
          field_of_practice: formData.field_of_practice,
          code: formData.code,
        });

        if (formData.description) {
          params.append('description', formData.description);
        }

        if ('main_field' in formData && formData.main_field) {
          params.append('main_field', formData.main_field.toString());
        }

        const response = await fetch(
          `${apiUrl}fields-of-practice/${id}?${params}`,
          {
            method: "PUT",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            showErrorToast("Session expired. Please login again.");
          } else if (response.status === 403) {
            showErrorToast("You don't have permission to update this field.");
          } else if (response.status === 404) {
            showErrorToast("Field of practice not found. It may have been deleted.");
          } else if (response.status === 422) {
            showErrorToast(data.message || "Validation error. Please check your input.");
          } else if (response.status === 409) {
            showErrorToast("A field with this code already exists.");
          } else if (response.status >= 500) {
            showErrorToast("Server error. Please try again later.");
          } else {
            showErrorToast(data.message || `Error: ${response.status}`);
          }
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (data.status === "success") {
          showSuccessToast(
            data.message || "Field of practice updated successfully"
          );
          await fetchFields();
          return true;
        } else {
          showErrorToast(data.message || "Failed to update field of practice");
          throw new Error(data.message || "Failed to update field of practice");
        }
      } catch (err) {
        console.error("Failed to update field of practice:", err);
        
        if (err instanceof Error && !err.message.includes("HTTP error")) {
          showErrorToast("Network error. Please check your connection.");
        }
        return false;
      }
    },
    [fetchFields]
  );

  const deleteField = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const token = localStorage.getItem("auth_token");

        if (!token) {
          showErrorToast("Authentication required. Please login to continue.");
          return false;
        }

        const response = await fetch(`${apiUrl}fields-of-practice/${id}`, {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            showErrorToast("Session expired. Please login again.");
          } else if (response.status === 403) {
            showErrorToast("You don't have permission to delete this field.");
          } else if (response.status === 404) {
            showErrorToast("Field of practice not found. It may have been deleted already.");
          } else if (response.status === 409) {
            showErrorToast("Cannot delete. This field is being used by other records.");
          } else if (response.status >= 500) {
            showErrorToast("Server error. Please try again later.");
          } else {
            showErrorToast(data.message || `Error: ${response.status}`);
          }
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        if (data.status === "success") {
          showSuccessToast(
            data.message || "Field of practice deleted successfully"
          );
          await fetchFields();
          return true;
        } else {
          showErrorToast(data.message || "Failed to delete field of practice");
          throw new Error(data.message || "Failed to delete field of practice");
        }
      } catch (err) {
        console.error("Failed to delete field of practice:", err);
        
        if (err instanceof Error && !err.message.includes("HTTP error")) {
          showErrorToast("Network error. Please check your connection.");
        }
        return false;
      }
    },
    [fetchFields]
  );

  return {
    fields,
    loading,
    error,
    fetchFields,
    createField,
    updateField,
    deleteField,
  };
}