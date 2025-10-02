import React, { useState, useEffect } from "react";
import {
  FieldOfPractice,
  CreateFieldOfPractice,
} from "../hooks/useFieldsOfPractice";

interface EditFieldModalProps {
  field: FieldOfPractice;
  onClose: () => void;
  onSubmit: (id: number, formData: CreateFieldOfPractice) => Promise<boolean>;
}

export function EditFieldModal({
  field,
  onClose,
  onSubmit,
}: EditFieldModalProps) {
  const [formData, setFormData] = useState<CreateFieldOfPractice>({
    field_of_practice: field.field,
    code: field.code,
    description: field.description,
    main_field: field.main_field,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const success = await onSubmit(field.id, formData);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  const isValid = formData.field_of_practice && formData.code;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl">
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
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
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
