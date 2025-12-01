"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  PaperClipIcon,
  DocumentIcon,
  PhotoIcon,
  XMarkIcon as XIcon,
} from "@heroicons/react/24/outline";

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  onStartConversation: (params: {
    group: number;
    title: string;
    content: string;
    attachment?: File;
  }) => Promise<any>;
  currentGroupId?: number;
  currentGroupName?: string;
}

export default function StartConversationModal({
  isOpen,
  onClose,
  loading,
  onStartConversation,
  currentGroupId,
  currentGroupName,
}: StartConversationModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    file?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setContent("");
      setSelectedFile(null);
      setFilePreview(null);
      setErrors({});
    }
  }, [isOpen]);

  // Cleanup file preview
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const getFileExtension = (filename: string): string => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

    if (imageExts.includes(ext)) {
      return <PhotoIcon className="h-8 w-8" />;
    }
    return <DocumentIcon className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        file: "File size must be less than 10MB",
      }));
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        file: "File type not supported. Please upload images, PDFs, or Office documents.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, file: undefined }));
    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string; content?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
    } else if (title.trim().length > 200) {
      newErrors.title = "Title must not exceed 200 characters";
    }

    if (!content.trim()) {
      newErrors.content = "Content is required";
    } else if (content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentGroupId) {
      setErrors({ title: "Group information is missing" });
      return;
    }

    try {
      await onStartConversation({
        group: currentGroupId,
        title: title.trim(),
        content: content.trim(),
        attachment: selectedFile || undefined,
      });

      // Modal will be closed by parent component on success
    } catch (error) {
      // Error handling is done in the hook
      console.error("Failed to start conversation:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Start a New Conversation
              </h3>
              {currentGroupName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  in {currentGroupName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title Input */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                placeholder="What's your conversation about?"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                  errors.title
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                disabled={loading}
                maxLength={200}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.title && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.title}
                  </p>
                )}
                <p
                  className={`text-xs ml-auto ${
                    title.length > 180
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {title.length}/200
                </p>
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) {
                    setErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }}
                placeholder="Share your thoughts, questions, or ideas..."
                rows={6}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-colors ${
                  errors.content
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.content && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.content}
                  </p>
                )}
                <p
                  className={`text-xs ml-auto ${
                    content.length < 10
                      ? "text-gray-500 dark:text-gray-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {content.length} characters {content.length < 10 && "(min 10)"}
                </p>
              </div>
            </div>

            {/* File Attachment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachment (Optional)
              </label>

              {selectedFile ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start space-x-3">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex flex-col items-center justify-center">
                        {getFileIcon(selectedFile.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          disabled={loading}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0 disabled:opacity-50"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-[#00B5A5] dark:hover:border-[#00B5A5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                      <PaperClipIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        Click to attach a file
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Images, PDFs, or Office documents (max 10MB)
                    </p>
                  </button>
                </div>
              )}

              {errors.file && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  {errors.file}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Conversation Guidelines
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Be respectful and constructive</li>
                      <li>Stay on topic</li>
                      <li>Search for similar topics before posting</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !content.trim()}
              className="px-6 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008f82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
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
                  <span>Starting...</span>
                </>
              ) : (
                <span>Start Conversation</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}