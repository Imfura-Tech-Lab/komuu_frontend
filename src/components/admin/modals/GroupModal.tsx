"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface GroupFormData {
  name: string;
  description: string;
  category: string;
  privacy: "Public" | "Private";
}

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GroupFormData) => Promise<void>;
  mode: "create" | "edit";
  initialData?: GroupFormData;
  loading?: boolean;
}

export function GroupModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  loading = false,
}: GroupModalProps) {
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    category: "General",
    privacy: "Public",
  });
  const [errors, setErrors] = useState<Partial<GroupFormData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "General",
        privacy: "Public",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof GroupFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GroupFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Group name must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Sheet Container */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-full sm:max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                        {mode === "create" ? "Create New Group" : "Edit Group"}
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                      {/* Group Name */}
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Group Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={loading}
                          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.name
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Enter group name"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Description *
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          disabled={loading}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.description
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="Describe the purpose of this group"
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                            {errors.description}
                          </p>
                        )}
                      </div>

                      {/* Category */}
                      <div>
                        <label
                          htmlFor="category"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="General">General</option>
                          <option value="Professional">Professional</option>
                          <option value="Special Interest">Special Interest</option>
                        </select>
                      </div>

                      {/* Privacy */}
                      <div>
                        <label
                          htmlFor="privacy"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Privacy
                        </label>
                        <select
                          id="privacy"
                          name="privacy"
                          value={formData.privacy}
                          onChange={handleChange}
                          disabled={loading}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                          <option value="Public">Public</option>
                          <option value="Private">Private</option>
                        </select>
                      </div>
                    </form>

                    {/* Footer Actions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {mode === "create" ? "Creating..." : "Updating..."}
                          </>
                        ) : mode === "create" ? (
                          "Create Group"
                        ) : (
                          "Update Group"
                        )}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
