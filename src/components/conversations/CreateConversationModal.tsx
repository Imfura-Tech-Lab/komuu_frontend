"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PaperClipIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import type { 
  ConversationType, 
  ConversationGroup, 
  CreateConversationParams 
} from "@/lib/hooks/useConversations";
import { showErrorToast } from "@/components/layouts/auth-layer-out";

interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationTypes: ConversationType[];
  conversationGroups: ConversationGroup[];
  typesLoading: boolean;
  typesError: boolean;
  loading: boolean;
  onLoadTypes: () => Promise<void>;
  onCreateConversation: (params: CreateConversationParams) => Promise<any>;
  currentGroupId?: number;
  currentGroupName?: string;
}

export default function CreateConversationModal({
  isOpen,
  onClose,
  conversationTypes,
  conversationGroups,
  typesLoading,
  typesError,
  loading,
  onLoadTypes,
  onCreateConversation,
  currentGroupId,
  currentGroupName,
}: CreateConversationModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    group: currentGroupId || undefined,
    title: "",
    type: "",
    content: "",
  });

  useEffect(() => {
    if (conversationTypes.length > 0 && !formData.type) {
      setFormData((prev) => ({
        ...prev,
        type: conversationTypes[0].name,
      }));
    }
  }, [conversationTypes, formData.type]);

  useEffect(() => {
    if (currentGroupId) {
      setFormData((prev) => ({
        ...prev,
        group: currentGroupId,
      }));
    }
  }, [currentGroupId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !formData.type) {
      showErrorToast("Please fill in all required fields");
      return;
    }

    const params: CreateConversationParams = {
      group: formData.group,
      title: formData.title,
      type: formData.type,
      content: formData.content,
      attachment: selectedFile || undefined,
    };

    const result = await onCreateConversation(params);

    if (result) {
      handleReset();
      onClose();
    }
  };

  const handleReset = () => {
    setFormData({
      group: currentGroupId || undefined,
      title: "",
      type: conversationTypes[0]?.name || "",
      content: "",
    });
    setSelectedFile(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Create New Conversation
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!currentGroupId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group
              </label>
              <select
                value={formData.group || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    group: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">General (Available to all members)</option>
                {conversationGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.total_members || 0} members)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.group
                  ? "This conversation will only be visible to group members"
                  : "This conversation will be visible to all members"}
              </p>
            </div>
          )}

          {currentGroupId && currentGroupName && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Creating conversation in:{" "}
                <span className="font-medium">{currentGroupName}</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter conversation title"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              required
              disabled={typesLoading}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {typesLoading ? (
                <option value="">Loading types...</option>
              ) : typesError ? (
                <option value="">Failed to load types</option>
              ) : conversationTypes.length === 0 ? (
                <option value="">No types available</option>
              ) : (
                <>
                  {!formData.type && <option value="">Select a type</option>}
                  {conversationTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </>
              )}
            </select>
            {conversationTypes.length > 0 && formData.type && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {
                  conversationTypes.find((t) => t.name === formData.type)
                    ?.description
                }
              </p>
            )}
            {typesLoading && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                Loading conversation types...
              </p>
            )}
            {typesError && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
                <span className="flex items-center">
                  <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                  Failed to load types from database
                </span>
                <button
                  type="button"
                  onClick={onLoadTypes}
                  className="text-xs underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Enter conversation content"
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attachment (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <label className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <PaperClipIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Choose File
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>
              {selectedFile && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                    title="Remove file"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || typesLoading || conversationTypes.length === 0}
              className="px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Conversation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}