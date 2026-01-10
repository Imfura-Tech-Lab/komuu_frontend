"use client";

import { useState, useEffect } from "react";
import { showSuccessToast } from "@/components/layouts/auth-layer-out";
import { BaseTable, BaseTableColumn } from "../ui/BaseTable";
import {
  useFieldsOfPractice,
  FieldOfPractice,
  SubField,
} from "./hooks/useFieldsOfPractice";
import { CreateFieldModal } from "./modals/CreateFieldModal";
import { EditFieldModal } from "./modals/EditFieldModal";
import { DeleteFieldModal } from "./modals/DeleteFieldModal";
import { FieldsStats } from "./FieldsStats";

export default function FieldsOfPracticeClient() {
  const {
    fields,
    loading,
    error,
    pagination,
    fetchFields,
    createField,
    updateField,
    deleteField,
  } = useFieldsOfPractice();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSubFieldsModal, setShowSubFieldsModal] = useState(false);
  const [selectedField, setSelectedField] = useState<FieldOfPractice | null>(
    null
  );
  const [editingField, setEditingField] = useState<FieldOfPractice | null>(
    null
  );
  const [deletingField, setDeletingField] = useState<FieldOfPractice | null>(
    null
  );

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const handleEdit = (field: FieldOfPractice) => {
    setEditingField(field);
    setShowEditModal(true);
  };

  const handleDelete = (field: FieldOfPractice) => {
    setDeletingField(field);
    setShowDeleteModal(true);
  };

  const handleViewSubFields = (field: FieldOfPractice) => {
    setSelectedField(field);
    setShowSubFieldsModal(true);
  };

  // Table columns configuration
  const columns: BaseTableColumn<FieldOfPractice>[] = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      filterable: true,
      width: 120,
      render: (field, value) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-medium text-gray-700 dark:text-gray-300">
          {value}
        </span>
      ),
    },
    {
      key: "field",
      label: "Field of Practice",
      sortable: true,
      filterable: true,
      width: 280,
      render: (field, value) => (
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {value}
          </div>
        </div>
      ),
      exportRender: (field, value) => value,
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      filterable: true,
      width: 300,
      render: (field, value) => (
        <div
          className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate"
          title={field?.description || ""}
        >
          {field?.description || (
            <span className="italic text-gray-400 dark:text-gray-500">
              No description
            </span>
          )}
        </div>
      ),
      exportRender: (field) => field?.description || "No description",
    },
    {
      key: "total_applications",
      label: "Applications",
      sortable: true,
      filterable: false,
      width: 120,
      render: (field) => {
        const count = field.total_applications || 0;
        const hasApplications = count > 0;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-semibold ${
                hasApplications
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {count}
            </span>
          </div>
        );
      },
      exportRender: (field) => `${field.total_applications || 0}`,
    },
    {
      key: "sub_fields",
      label: "Sub-fields",
      sortable: false,
      filterable: false,
      width: 120,
      render: (field) => {
        const count = field.sub_fields?.length || 0;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              count > 0
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {count}
          </span>
        );
      },
      exportRender: (field) => `${field.sub_fields?.length || 0}`,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      filterable: false,
      width: 140,
      render: (field) => (
        <div className="flex items-center gap-1">
          {field.sub_fields && field.sub_fields.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewSubFields(field);
              }}
              className="p-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              title="View sub-fields"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(field);
            }}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
              handleDelete(field);
            }}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

  // Calculate stats from fields data
  const stats = {
    totalFields: fields.length,
    totalSubFields: fields.reduce(
      (acc, f) => acc + (f.sub_fields?.length || 0),
      0
    ),
    totalApplications: fields.reduce(
      (acc, f) => acc + (f.total_applications || 0),
      0
    ),
    fieldsWithApplications: fields.filter(
      (f) => (f.total_applications || 0) > 0
    ).length,
  };

  // ============================================================================
  // SKELETON LOADER
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md w-64 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-96 animate-pulse"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-center gap-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 flex-1"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                  <div className="flex gap-1">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Fields of Practice
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-6">
              {error}
            </p>
            <button
              onClick={() => fetchFields()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN CONTENT
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Fields of Practice
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage forensic science practice specializations
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fetchFields()}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
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
                className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors text-sm font-medium"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Fields
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalFields}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sub-fields
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalSubFields}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Applications
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalApplications}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Active Fields
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.fieldsWithApplications}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  with applications
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600 dark:text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
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
          searchFields={["field", "code", "description"]}
          pagination={true}
          pageSize={25}
          emptyMessage="No fields of practice found"
          enableExcelExport={true}
          enablePDFExport={true}
          enableBulkSelection={true}
          bulkActions={bulkActions}
          enableColumnManagement={true}
          stickyHeader={true}
          className="shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl"
        />
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateFieldModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createField}
          existingFields={fields}
        />
      )}

      {showEditModal && editingField && (
        <EditFieldModal
          field={editingField}
          onClose={() => {
            setShowEditModal(false);
            setEditingField(null);
          }}
          onSubmit={updateField}
          existingFields={fields}
        />
      )}

      {showDeleteModal && deletingField && (
        <DeleteFieldModal
          field={deletingField}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingField(null);
          }}
          onConfirm={deleteField}
        />
      )}

      {/* Sub-fields Modal */}
      {showSubFieldsModal && selectedField && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSubFieldsModal(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full transform transition-all">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Sub-fields
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                        {selectedField.code}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedField.field}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSubFieldsModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {selectedField.sub_fields &&
                selectedField.sub_fields.length > 0 ? (
                  <div className="space-y-3">
                    {selectedField.sub_fields.map((subField, index) => (
                      <div
                        key={subField.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                                {subField.code}
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {subField.field}
                              </span>
                            </div>
                            {subField.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md truncate">
                                {subField.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              handleEdit({
                                id: subField.id,
                                field: subField.field,
                                code: subField.code,
                                description: subField.description,
                                main_field: selectedField.id,
                                sub_fields: [],
                                total_applications: 0,
                              } as FieldOfPractice);
                              setShowSubFieldsModal(false);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
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
                            onClick={() => {
                              handleDelete({
                                id: subField.id,
                                field: subField.field,
                                code: subField.code,
                                main_field: selectedField.id,
                                sub_fields: [],
                                total_applications: 0,
                              } as FieldOfPractice);
                              setShowSubFieldsModal(false);
                            }}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No sub-fields found
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setShowSubFieldsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
