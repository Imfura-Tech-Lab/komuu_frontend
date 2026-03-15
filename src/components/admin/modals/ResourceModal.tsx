"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, Combobox } from "@headlessui/react";
import {
  XMarkIcon,
  DocumentIcon,
  ChevronUpDownIcon,
  CheckIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  LinkIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Resource } from "@/lib/hooks/useResources";
import { useGroups } from "@/lib/hooks/useGroups";

export interface ResourceFormData {
  title: string;
  description: string;
  link: string;
  type: string;
  visibility: string;
  group: string | null;
  tags: string[];
  file?: File;
}

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceFormData) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  resource?: Resource | null;
  loading: boolean;
  resourceTypes?: string[];
}

const DEFAULT_RESOURCE_TYPES = ["Document", "Video", "Audio", "Image", "Link"];

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  resource,
  loading,
  resourceTypes = DEFAULT_RESOURCE_TYPES,
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
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [groupQuery, setGroupQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const { groups, loading: groupsLoading, fetchGroups } = useGroups();

  // Helper to get error message for a field
  const getFieldError = (fieldName: string): string | null => {
    if (errors[fieldName] && errors[fieldName].length > 0) {
      return errors[fieldName][0];
    }
    return null;
  };

  // Helper to check if field has error
  const hasError = (fieldName: string): boolean => {
    return !!(errors[fieldName] && errors[fieldName].length > 0);
  };

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen, fetchGroups]);

  // Reset form when modal opens/closes or resource changes
  useEffect(() => {
    if (!isOpen) {
      // Clean up preview URL when closing
      if (filePreviewUrl && !resource?.file_url) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      return;
    }

    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description || "",
        link: resource.link || "",
        type: resource.type,
        visibility: resource.visibility,
        group: resource.groupId?.toString() || null,
        tags: resource.tags || [],
        file: undefined,
      });
      setFileName("");
      setFilePreviewUrl(resource.file_url || null);
    } else {
      setFormData({
        title: "",
        description: "",
        link: "",
        type: resourceTypes.length > 0 ? resourceTypes[0] : "Document",
        visibility: "Public",
        group: null,
        tags: [],
        file: undefined,
      });
      setFileName("");
      setFilePreviewUrl(null);
    }
    setGroupQuery("");
    setErrors({});
  }, [resource, isOpen, resourceTypes]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl && !resource?.file_url) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl, resource?.file_url]);

  const filteredGroups =
    groupQuery === ""
      ? groups
      : groups.filter((group) =>
          group.name.toLowerCase().includes(groupQuery.toLowerCase()),
        );

  const selectedGroup =
    groups.find((g) => String(g.id) === formData.group) || null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous blob URL if exists
      if (filePreviewUrl && !resource?.file_url) {
        URL.revokeObjectURL(filePreviewUrl);
      }

      setFormData({ ...formData, file });
      setFileName(file.name);

      // Create preview URL for supported file types
      const previewableTypes = ['image/', 'video/', 'audio/'];
      if (previewableTypes.some(type => file.type.startsWith(type))) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl && !resource?.file_url) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setFormData({ ...formData, file: undefined });
    setFileName("");
    setFilePreviewUrl(resource?.file_url || null);
  };

  const getFileTypeFromName = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'audio';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'document';
    return 'file';
  };

  const renderFilePreview = () => {
    const fileType = fileName ? getFileTypeFromName(fileName) : formData.type.toLowerCase();
    const previewUrl = filePreviewUrl;
    const isNewFile = !!formData.file;

    if (!previewUrl && !fileName && !resource?.file_url) {
      return null;
    }

    return (
      <div className="mt-3 relative">
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Image Preview */}
          {fileType === 'image' && previewUrl && (
            <div className="relative aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 max-w-full object-contain"
              />
            </div>
          )}

          {/* Video Preview */}
          {fileType === 'video' && previewUrl && (
            <div className="relative aspect-video bg-black">
              <video
                src={previewUrl}
                controls
                className="w-full h-48 object-contain"
                preload="metadata"
              />
            </div>
          )}

          {/* Audio Preview */}
          {fileType === 'audio' && previewUrl && (
            <div className="p-4 flex flex-col items-center justify-center bg-gradient-to-br from-amber-500 to-yellow-500">
              <MusicalNoteIcon className="w-12 h-12 text-white mb-3" />
              <audio src={previewUrl} controls className="w-full max-w-xs" />
            </div>
          )}

          {/* PDF/Document Preview */}
          {(fileType === 'pdf' || fileType === 'document' || (!previewUrl && fileName)) && (
            <div className={`p-6 flex flex-col items-center justify-center ${
              fileType === 'pdf'
                ? 'bg-gradient-to-br from-red-500 to-orange-500'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }`}>
              {fileType === 'pdf' ? (
                <DocumentTextIcon className="w-12 h-12 text-white mb-2" />
              ) : (
                <DocumentIcon className="w-12 h-12 text-white mb-2" />
              )}
              <p className="text-white text-sm font-medium text-center truncate max-w-full px-4">
                {fileName || 'Document'}
              </p>
            </div>
          )}

          {/* File Info Bar */}
          <div className="px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mr-2">
                {isNewFile ? 'New File' : 'Current File'}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {fileName || (resource?.file_url ? 'Existing file' : '')}
              </span>
            </div>
            {isNewFile && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Remove file"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
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

    // Clear previous errors
    setErrors({});

    const { group, ...rest } = formData;
    const submitData = group !== null ? { ...rest, group } : rest;
    const result = await onSubmit(submitData as ResourceFormData);

    // If there are backend validation errors, display them
    if (result.errors) {
      setErrors(result.errors);
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
                <Dialog.Panel className="pointer-events-auto w-screen max-w-full sm:max-w-xl md:max-w-2xl">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl overflow-y-auto p-6">
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

                {/* Global Error Message */}
                {Object.keys(errors).length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                    <div className="flex">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                          Please fix the following errors:
                        </h3>
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                          {Object.entries(errors).map(([field, messages]) => (
                            <li key={field}>
                              <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>{' '}
                              {messages[0]}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        hasError('title')
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter resource title"
                    />
                    {getFieldError('title') && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('title')}
                      </p>
                    )}
                  </div>

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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        hasError('description')
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="Enter resource description"
                    />
                    {getFieldError('description') && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('description')}
                      </p>
                    )}
                  </div>

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
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          hasError('type')
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {resourceTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {getFieldError('type') && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {getFieldError('type')}
                        </p>
                      )}
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
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          hasError('visibility')
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <option value="Public">Public</option>
                        <option value="Members only">Members Only</option>
                      </select>
                      {getFieldError('visibility') && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                          <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                          {getFieldError('visibility')}
                        </p>
                      )}
                    </div>
                  </div>

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
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        hasError('link')
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="https://example.com/document"
                    />
                    {getFieldError('link') && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('link')}
                      </p>
                    )}
                  </div>

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
                        className={`cursor-pointer inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                          hasError('file')
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <DocumentIcon className="h-5 w-5 mr-2" />
                        {formData.file ? "Change File" : "Choose File"}
                      </label>
                    </div>
                    {getFieldError('file') && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {getFieldError('file')}
                      </p>
                    )}
                    {/* File Preview */}
                    {renderFilePreview()}
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Group (optional)
                    </label>
                    <Combobox
                      value={selectedGroup}
                      onChange={(group) =>
                        setFormData({
                          ...formData,
                          group: group?.id ? String(group.id) : null,
                        })
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
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </div>
  </Dialog>
</Transition>
  );
};
