"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  PaperClipIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
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

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

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
                <Dialog.Panel className="pointer-events-auto w-screen max-w-lg">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#00B5A5] to-[#008f82] px-6 py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <Dialog.Title className="text-xl font-bold text-white">
                              New Conversation
                            </Dialog.Title>
                            <p className="text-sm text-white/80 mt-0.5">
                              Start a new discussion topic
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleClose}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                      <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                            >
                              <option value="">General (Available to all members)</option>
                              {conversationGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                  {group.name} ({group.total_members || 0} members)
                                </option>
                              ))}
                            </select>
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                              {formData.group
                                ? "This conversation will only be visible to group members"
                                : "This conversation will be visible to all members"}
                            </p>
                          </div>
                        )}

                        {currentGroupId && currentGroupName && (
                          <div className="bg-[#00B5A5]/10 border border-[#00B5A5]/20 rounded-lg p-4">
                            <p className="text-sm text-[#00B5A5] dark:text-[#00B5A5]">
                              Creating conversation in:{" "}
                              <span className="font-semibold">{currentGroupName}</span>
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                              {
                                conversationTypes.find((t) => t.name === formData.type)
                                  ?.description
                              }
                            </p>
                          )}
                          {typesLoading && (
                            <p className="mt-1.5 text-xs text-[#00B5A5] flex items-center">
                              <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                              Loading conversation types...
                            </p>
                          )}
                          {typesError && (
                            <div className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Attachment (Optional)
                          </label>
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
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
                      </form>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleClose}
                          disabled={loading}
                          className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          onClick={handleSubmit}
                          disabled={loading || typesLoading || conversationTypes.length === 0}
                          className="px-5 py-2.5 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          {loading ? (
                            <span className="flex items-center">
                              <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </span>
                          ) : (
                            "Create Conversation"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
