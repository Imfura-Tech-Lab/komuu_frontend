"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { BaseTable, BaseTableColumn } from "../ui/BaseTable";

interface FieldOfPractice {
  id: number;
  field_of_practice: string;
  code: string;
  description: string;
  main_field: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateFieldOfPractice {
  field_of_practice: string;
  code: string;
  description: string;
  main_field: number;
}

export default function FieldsOfPracticeClient() {
  const [fields, setFields] = useState<FieldOfPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingField, setEditingField] = useState<FieldOfPractice | null>(
    null
  );
  const [formData, setFormData] = useState<CreateFieldOfPractice>({
    field_of_practice: "",
    code: "",
    description: "",
    main_field: 1,
  });
  const [formLoading, setFormLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view fields of practice");
        return;
      }

      const response = await fetch(`${apiUrl}fields-of-practice`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const fieldsData = data.data?.data || data.data || [];
        setFields(Array.isArray(fieldsData) ? fieldsData : []);
      } else {
        throw new Error(data.message || "Failed to fetch fields of practice");
      }
    } catch (err) {
      console.error("Failed to fetch fields of practice:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch fields of practice"
      );
      showErrorToast("Failed to load fields of practice");
    } finally {
      setLoading(false);
    }
  };

  const createField = async () => {
    try {
      setFormLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      const params = new URLSearchParams({
        field_of_practice: formData.field_of_practice,
        code: formData.code,
        description: formData.description,
        main_field: formData.main_field.toString(),
      });

      const response = await fetch(`${apiUrl}fields-of-practice?${params}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Field of practice created successfully");
        setShowCreateModal(false);
        resetForm();
        fetchFields();
      } else {
        throw new Error(data.message || "Failed to create field of practice");
      }
    } catch (err) {
      console.error("Failed to create field of practice:", err);
      showErrorToast(
        err instanceof Error
          ? err.message
          : "Failed to create field of practice"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const updateField = async (id: number) => {
    try {
      setFormLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      const params = new URLSearchParams({
        field_of_practice: formData.field_of_practice,
        code: formData.code,
        description: formData.description,
        main_field: formData.main_field.toString(),
      });

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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Field of practice updated successfully");
        setShowEditModal(false);
        setEditingField(null);
        resetForm();
        fetchFields();
      } else {
        throw new Error(data.message || "Failed to update field of practice");
      }
    } catch (err) {
      console.error("Failed to update field of practice:", err);
      showErrorToast(
        err instanceof Error
          ? err.message
          : "Failed to update field of practice"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const deleteField = async (id: number) => {
    if (!confirm("Are you sure you want to delete this field of practice?")) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${apiUrl}fields-of-practice/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Field of practice deleted successfully");
        fetchFields();
      } else {
        throw new Error(data.message || "Failed to delete field of practice");
      }
    } catch (err) {
      console.error("Failed to delete field of practice:", err);
      showErrorToast(
        err instanceof Error
          ? err.message
          : "Failed to delete field of practice"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      field_of_practice: "",
      code: "",
      description: "",
      main_field: 1,
    });
  };

  const handleEdit = (field: FieldOfPractice) => {
    setEditingField(field);
    setFormData({
      field_of_practice: field.field_of_practice,
      code: field.code,
      description: field.description,
      main_field: field.main_field,
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Table columns configuration
  const columns: BaseTableColumn<FieldOfPractice>[] = [
    {
      key: "field_of_practice",
      label: "Field of Practice",
      sortable: true,
      filterable: true,
      width: 300,
      render: (field, value) => (
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Code: {field.code}
          </div>
        </div>
      ),
      exportRender: (field, value) => value,
    },
    {
      key: "code",
      label: "Code",
      sortable: true,
      filterable: true,
      width: 120,
      render: (field, value) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      filterable: true,
      width: 400,
      render: (field, value) => (
        <div
          className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate"
          title={value}
        >
          {value || "No description"}
        </div>
      ),
      exportRender: (field, value) => value || "No description",
    },
    {
      key: "main_field",
      label: "Main Field ID",
      sortable: true,
      filterable: true,
      width: 120,
      render: (field, value) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {value}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      filterable: true,
      filterComponent: { type: "date" },
      width: 120,
      render: (field, value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? formatDate(value) : "-"}
        </span>
      ),
      exportRender: (field, value) => (value ? formatDate(value) : ""),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      filterable: false,
      width: 120,
      render: (field) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(field);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Edit"
          >
            <svg
              className="h-4 w-4"
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteField(field.id);
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  // Statistics
  const stats = useMemo(() => {
    return {
      total: fields.length,
      mainFields: new Set(fields.map((f) => f.main_field)).size,
    };
  }, [fields]);

  // Bulk actions
  const bulkActions = [
    {
      label: "Export Selected",
      action: (selectedFields: FieldOfPractice[]) => {
        console.log("Exporting selected fields:", selectedFields);
        showSuccessToast(`Exporting ${selectedFields.length} fields`);
      },
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading fields of practice...
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
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              ⚠️
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Fields of Practice
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchFields}
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
        {/* Header with Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Fields of Practice
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage forensic science practice specializations
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={fetchFields}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Field
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.total}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Total Fields of Practice
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stats.mainFields}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Unique Main Fields
            </p>
          </div>
        </div>

        {/* Table */}
        <BaseTable
          data={fields}
          columns={columns}
          loading={loading}
          title="Fields of Practice"
          exportFileName="fields-of-practice"
          searchable={true}
          searchFields={["field_of_practice", "code", "description"]}
          pagination={true}
          pageSize={25}
          emptyMessage="No fields of practice found"
          enableExcelExport={true}
          enablePDFExport={true}
          enableBulkSelection={true}
          bulkActions={bulkActions}
          enableColumnManagement={true}
          stickyHeader={true}
          className="shadow-lg"
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Field of Practice
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field of Practice
                </label>
                <input
                  type="text"
                  value={formData.field_of_practice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      field_of_practice: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Forensic Pathology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., PATHOLOGY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Description of the field of practice..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Main Field ID
                </label>
                <input
                  type="number"
                  value={formData.main_field}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      main_field: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createField}
                disabled={
                  formLoading || !formData.field_of_practice || !formData.code
                }
                className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Edit Field of Practice
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field of Practice
                </label>
                <input
                  type="text"
                  value={formData.field_of_practice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      field_of_practice: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Main Field ID
                </label>
                <input
                  type="number"
                  value={formData.main_field}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      main_field: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingField(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateField(editingField.id)}
                disabled={
                  formLoading || !formData.field_of_practice || !formData.code
                }
                className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
