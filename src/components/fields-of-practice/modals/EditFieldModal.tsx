import React, { useState } from "react";
import {
  FieldOfPractice,
  CreateFieldOfPractice,
} from "../hooks/useFieldsOfPractice";

interface EditFieldModalProps {
  field: any;
  onClose: () => void;
  onSubmit: (
    id: number,
    formData: CreateFieldOfPractice | Omit<CreateFieldOfPractice, "main_field">
  ) => Promise<boolean>;
  existingFields: FieldOfPractice[];
}

export function EditFieldModal({
  field,
  onClose,
  onSubmit,
  existingFields,
}: EditFieldModalProps) {
  const [formData, setFormData] = useState({
    field_of_practice: field.field,
    code: field.code,
    description: field.description || "",
  });
  const [isSubField, setIsSubField] = useState(!!field.main_field);
  const [selectedMainField, setSelectedMainField] = useState<number | null>(
    field.main_field || null
  );
  const [loading, setLoading] = useState(false);
  const availableParentFields = existingFields.filter((f) => {
    if (f.id === field.id) return false;
    if (!field.main_field && field.sub_fields && field.sub_fields.length > 0) {
      return false;
    }

    return true;
  });

  const handleSubmit = async () => {
    setLoading(true);

    let submitData: any = {
      field_of_practice: formData.field_of_practice,
      code: formData.code,
    };

    if (formData.description) {
      submitData.description = formData.description;
    }

    if (isSubField && selectedMainField) {
      submitData.main_field = selectedMainField;
    }

    const success = await onSubmit(field.id, submitData);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  const isValid =
    formData.field_of_practice &&
    formData.code &&
    (!isSubField || selectedMainField);
  const hasSubFields = field.sub_fields && field.sub_fields.length > 0;
  const canConvertToSub = !hasSubFields;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Edit Field of Practice
        </h2>

        <div className="space-y-4">
          {/* Field Type Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Is this a sub-field?
              </span>
              {!canConvertToSub && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Cannot convert: has {field.sub_fields.length} sub-field(s)
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                if (canConvertToSub) {
                  setIsSubField(!isSubField);
                  setSelectedMainField(null);
                }
              }}
              disabled={!canConvertToSub}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isSubField ? "bg-[#00B5A5]" : "bg-gray-300 dark:bg-gray-600"
              } ${!canConvertToSub ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isSubField ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Parent Field Selection (only if subfield) */}
          {isSubField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Parent Field <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedMainField || ""}
                onChange={(e) => setSelectedMainField(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a parent field</option>
                {availableParentFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.field} ({f.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select the main field this sub-field belongs to
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Field of Practice <span className="text-red-500">*</span>
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
              Code <span className="text-red-500">*</span>
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
              placeholder="Optional description..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
