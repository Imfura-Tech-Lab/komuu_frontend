"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ChevronDown, ExternalLink, Edit2, Lock, CreditCard, Key, Webhook, FileText } from "lucide-react";
import {
  useSettings,
  FieldConfig,
  CATEGORY_NAMES,
} from "@/lib/hooks/useSettings";

const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  payment_gateway: <CreditCard className="w-5 h-5" />,
  credentials: <Key className="w-5 h-5" />,
  webhooks: <Webhook className="w-5 h-5" />,
  documents: <FileText className="w-5 h-5" />,
};

export default function SettingsDetailsClient() {
  const {
    settings,
    loading,
    error,
    isCreating,
    isSaving,
    fetchSettings,
    saveSetting,
    getFieldValue,
    getImageUrl,
    isImageField,
    getGroupedFields,
  } = useSettings();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("payment_gateway");

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const resetEditState = useCallback(() => {
    setEditingField(null);
    setEditValue("");
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(null);
    setFileUpload(null);
  }, [filePreview]);

  const handleEdit = (fieldKey: string) => {
    setEditingField(fieldKey);
    const currentValue = getFieldValue(fieldKey);
    setEditValue(currentValue !== null ? String(currentValue) : "");
  };

  const handleFileChange = (file: File) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }

    setFilePreview(URL.createObjectURL(file));
    setFileUpload(file);
    setEditValue(file.name);
  };

  const handleSave = async (fieldKey: string) => {
    const success = await saveSetting(fieldKey, editValue, fileUpload || undefined);
    if (success) {
      resetEditState();
    }
  };

  const handleCancel = () => {
    resetEditState();
  };

  const groupedFields = getGroupedFields();
  const categories = Object.keys(groupedFields);

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (error && !isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Configuration Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage payment gateway, credentials, and document configuration
              </p>
              {isCreating && (
                <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    ⚠️ Settings not configured yet. Please fill in the required fields to create your configuration.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={fetchSettings}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
              {categories.map((category) => {
                const isActive = activeTab === category;
                const fields = groupedFields[category];
                
                return (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-[#00B5A5] text-[#00B5A5]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    {CATEGORY_ICONS[category]}
                    <span>{CATEGORY_NAMES[category] || category}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      isActive
                        ? "bg-[#00B5A5]/10 text-[#00B5A5]"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}>
                      {fields.length}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {groupedFields[activeTab]?.map((field) => (
              <SettingsField
                key={field.key}
                field={field}
                isEditing={editingField === field.key}
                editValue={editValue}
                filePreview={filePreview}
                fileUpload={fileUpload}
                isSaving={isSaving}
                isCreating={isCreating}
                currentValue={getFieldValue(field.key)}
                imageUrl={
                  isImageField(field.key)
                    ? getImageUrl(getFieldValue(field.key))
                    : null
                }
                onEdit={() => handleEdit(field.key)}
                onSave={() => handleSave(field.key)}
                onCancel={handleCancel}
                onValueChange={setEditValue}
                onFileChange={handleFileChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingsFieldProps {
  field: FieldConfig;
  isEditing: boolean;
  editValue: string;
  filePreview: string | null;
  fileUpload: File | null;
  isSaving: boolean;
  isCreating: boolean;
  currentValue: string | null;
  imageUrl: string | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onValueChange: (value: string) => void;
  onFileChange: (file: File) => void;
}

function SettingsField({
  field,
  isEditing,
  editValue,
  filePreview,
  fileUpload,
  isSaving,
  isCreating,
  currentValue,
  imageUrl,
  onEdit,
  onSave,
  onCancel,
  onValueChange,
  onFileChange,
}: SettingsFieldProps) {
  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {field.label}
            </h3>
            {field.required && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                Required
              </span>
            )}
            {field.type === "password" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                <Lock className="w-3 h-3" />
                <span>Sensitive</span>
              </span>
            )}
          </div>

          {isEditing ? (
            <FieldEditor
              field={field}
              value={editValue}
              filePreview={filePreview}
              fileUpload={fileUpload}
              currentImageUrl={imageUrl}
              isSaving={isSaving}
              isCreating={isCreating}
              onValueChange={onValueChange}
              onFileChange={onFileChange}
              onSave={onSave}
              onCancel={onCancel}
            />
          ) : (
            <FieldDisplay
              field={field}
              value={currentValue}
              imageUrl={imageUrl}
              onEdit={onEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldEditorProps {
  field: FieldConfig;
  value: string;
  filePreview: string | null;
  fileUpload: File | null;
  currentImageUrl: string | null;
  isSaving: boolean;
  isCreating: boolean;
  onValueChange: (value: string) => void;
  onFileChange: (file: File) => void;
  onSave: () => void;
  onCancel: () => void;
}

function FieldEditor({
  field,
  value,
  filePreview,
  fileUpload,
  currentImageUrl,
  isSaving,
  isCreating,
  onValueChange,
  onFileChange,
  onSave,
  onCancel,
}: FieldEditorProps) {
  const renderInput = () => {
    if (field.type === "file") {
      return (
        <div className="space-y-4">
          {currentImageUrl && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Image:
              </h4>
              <img
                src={currentImageUrl}
                alt={field.label}
                className="h-32 w-32 object-contain border border-gray-200 dark:border-gray-600 rounded-lg bg-white p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          {filePreview && (
            <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                New Image Preview:
              </h4>
              <img
                src={filePreview}
                alt={`New ${field.label}`}
                className="h-32 w-32 object-contain border border-blue-200 dark:border-blue-600 rounded-lg bg-white p-2"
              />
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                {fileUpload?.name}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload new {field.label}:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB.
            </p>
          </div>
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onValueChange(e.target.checked ? "true" : "false")}
            className="w-5 h-5 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Enable payment gateway
          </span>
        </label>
      );
    }

    if (field.type === "select" && field.key === "mode") {
      return (
        <select
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Select mode</option>
          <option value="test">Test</option>
          <option value="live">Live</option>
        </select>
      );
    }

    return (
      <input
        type={field.type}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={field.placeholder}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    );
  };

  return (
    <div className="space-y-3">
      {renderInput()}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving || (field.required && !value && !fileUpload)}
          className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors inline-flex items-center gap-2"
        >
          {isSaving && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          <span>{isSaving ? "Saving..." : isCreating ? "Create" : "Save"}</span>
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
        >
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}

interface FieldDisplayProps {
  field: FieldConfig;
  value: string | null;
  imageUrl: string | null;
  onEdit: () => void;
}

function FieldDisplay({ field, value, imageUrl, onEdit }: FieldDisplayProps) {
  if (imageUrl) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <img
          src={imageUrl}
          alt={field.label}
          className="h-24 w-24 object-contain border border-gray-200 dark:border-gray-600 rounded-lg bg-white p-2"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ef4444' width='100' height='100' opacity='0.1'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23dc2626' font-size='10'%3ELoad Failed%3C/text%3E%3C/svg%3E";
          }}
        />
        <div className="flex gap-2">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >

            <ExternalLink className="w-3 h-3 mr-1" />
            <span>View Full Size</span>
          </a>
          <button
            onClick={onEdit}
            className="inline-flex items-center text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            <span>Replace</span>
          </button>
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const isEnabled = value === "true" || value === "1";
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              isEnabled
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {isEnabled ? "✓ Enabled" : "✗ Disabled"}
          </span>
        </div>
        <EditButton onClick={onEdit} />
      </div>
    );
  }

  if (field.type === "password") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-900 dark:text-white">
            {value ? "••••••••••••" : <NotSet />}
          </span>
        </div>
        <EditButton onClick={onEdit} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-900 dark:text-white break-all">
          {value || <NotSet />}
        </span>
      </div>
      <EditButton onClick={onEdit} />
    </div>
  );
}

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      title="Edit setting"
    >
      <Edit2 className="h-5 w-5" />
    </button>
  );
}

function NotSet() {
  return <span className="text-gray-400 italic">Not set</span>;
}

function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
            </div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4 p-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3].map((j) => (
              <div key={j} className="p-6 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-3"></div>
                <div className="flex items-center gap-3">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}