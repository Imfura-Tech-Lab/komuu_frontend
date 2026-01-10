"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, Combobox } from "@headlessui/react";
import {
  XMarkIcon,
  DocumentIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { Resource } from "@/lib/hooks/useResources";
import { useGroups } from "@/lib/hooks/useGroups";

export interface ResourceFormData {
  title: string;
  description: string;
  link: string;
  type: string;
  visibility: string;
  group: number | null;
  tags: string[];
  file?: File;
}

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  resource?: Resource | null;
  loading: boolean;
}

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  resource,
  loading,
}) => {
  const [formData, setFormData] = useState<ResourceFormData>({
    title: "",
    description: "",
    link: "",
    type: "Document",
    visibility: "Public",
    group: null,
    tags: [],
    file: undefined,
  });
  const [tagInput, setTagInput] = useState("");
  const [fileName, setFileName] = useState("");
  const [groupQuery, setGroupQuery] = useState("");

  // Fetch groups from hook
  const { groups, loading: groupsLoading, fetchGroups } = useGroups();

  // Fetch groups when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen, fetchGroups]);

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description || "",
        link: resource.link || "",
        type: resource.type,
        visibility: resource.visibility,
        group: resource.groupId || null,
        tags: resource.tags || [],
        file: undefined,
      });
      setFileName("");
    } else {
      setFormData({
        title: "",
        description: "",
        link: "",
        type: "Document",
        visibility: "Public",
        group: null,
        tags: [],
        file: undefined,
      });
      setFileName("");
    }
    setGroupQuery("");
  }, [resource, isOpen]);

  // Filter groups based on search query
  const filteredGroups =
    groupQuery === ""
      ? groups
      : groups.filter((group) =>
          group.name.toLowerCase().includes(groupQuery.toLowerCase())
        );

  // Get selected group object
  const selectedGroup = groups.find((g) => g.id === formData.group) || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, file });
      setFileName(file.name);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Omit group field if null to avoid sending empty string
    const { group, ...rest } = formData;
    const submitData = group !== null ? { ...rest, group } : rest;
    await onSubmit(submitData as ResourceFormData);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                  >
                    {resource ? "Edit Resource" : "Create Resource"}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter resource title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter resource description"
                    />
                  </div>

                  {/* Type and Visibility */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Type *
                      </label>
                      <select
                        id="type"
                        required
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Document">Document</option>
                        <option value="PDF">PDF</option>
                        <option value="Video">Video</option>
                        <option value="Image">Image</option>
                        <option value="Link">Link</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="visibility"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Visibility *
                      </label>
                      <select
                        id="visibility"
                        required
                        value={formData.visibility}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            visibility: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Public">Public</option>
                        <option value="Members only">Members Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Link */}
                  <div>
                    <label
                      htmlFor="link"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      External Link
                    </label>
                    <input
                      type="url"
                      id="link"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/document"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {resource ? "Replace File (optional)" : "Upload File"}
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <DocumentIcon className="h-5 w-5 mr-2" />
                        Choose File
                      </label>
                      {fileName && (
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                          {fileName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label
                      htmlFor="tag-input"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Tags
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        id="tag-input"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Add tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-[#00B5A5] text-white rounded-md hover:bg-[#008F82] transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Group - Searchable Combobox */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Group (optional)
                    </label>
                    <Combobox
                      value={selectedGroup}
                      onChange={(group) =>
                        setFormData({ ...formData, group: group?.id || null })
                      }
                      disabled={groupsLoading}
                    >
                      <div className="relative">
                        <div className="relative w-full">
                          <Combobox.Input
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                            displayValue={(group: typeof selectedGroup) =>
                              group?.name || ""
                            }
                            onChange={(e) => setGroupQuery(e.target.value)}
                            placeholder={
                              groupsLoading
                                ? "Loading groups..."
                                : "Search and select a group"
                            }
                          />
                          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </Combobox.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                          afterLeave={() => setGroupQuery("")}
                        >
                          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {/* Clear selection option */}
                            <Combobox.Option
                              value={null}
                              className={({ active }) =>
                                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                  active
                                    ? "bg-[#00B5A5] text-white"
                                    : "text-gray-500 dark:text-gray-400"
                                }`
                              }
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate italic ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    No group
                                  </span>
                                  {selected && (
                                    <span
                                      className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                        active ? "text-white" : "text-[#00B5A5]"
                                      }`}
                                    >
                                      <CheckIcon
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  )}
                                </>
                              )}
                            </Combobox.Option>

                            {filteredGroups.length === 0 &&
                            groupQuery !== "" ? (
                              <div className="relative cursor-default select-none py-2 px-4 text-gray-500 dark:text-gray-400">
                                No groups found.
                              </div>
                            ) : (
                              filteredGroups.map((group) => (
                                <Combobox.Option
                                  key={group.id}
                                  value={group}
                                  className={({ active }) =>
                                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? "bg-[#00B5A5] text-white"
                                        : "text-gray-900 dark:text-white"
                                    }`
                                  }
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected
                                            ? "font-medium"
                                            : "font-normal"
                                        }`}
                                      >
                                        {group.name}
                                      </span>
                                      {selected && (
                                        <span
                                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                            active
                                              ? "text-white"
                                              : "text-[#00B5A5]"
                                          }`}
                                        >
                                          <CheckIcon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                          />
                                        </span>
                                      )}
                                    </>
                                  )}
                                </Combobox.Option>
                              ))
                            )}
                          </Combobox.Options>
                        </Transition>
                      </div>
                    </Combobox>
                    {groups.length === 0 && !groupsLoading && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        No groups available
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-[#00B5A5] text-white rounded-md hover:bg-[#008F82] disabled:opacity-50 flex items-center transition-colors"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {resource ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>{resource ? "Update Resource" : "Create Resource"}</>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
