"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  DocumentTextIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  LinkIcon,
  FolderIcon,
  CalendarIcon,
  UserCircleIcon,
  EyeIcon,
  TagIcon,
  GlobeAltIcon,
  LockClosedIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Resource } from "@/lib/hooks/useResources";

interface ResourceDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onView: (fileUrl: string, fileName: string) => void;
  onDownload: (fileUrl: string, fileName: string) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
}

export const ResourceDetailSheet: React.FC<ResourceDetailSheetProps> = ({
  isOpen,
  onClose,
  resource,
  onView,
  onDownload,
  onEdit,
  onDelete,
}) => {
  if (!resource) return null;

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === "pdf" || t === "document") return DocumentTextIcon;
    if (t === "video") return VideoCameraIcon;
    if (t === "image") return PhotoIcon;
    if (t === "link") return LinkIcon;
    if (t === "audio") return VideoCameraIcon;
    return FolderIcon;
  };

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t === "pdf") return "from-red-500 to-orange-500";
    if (t === "document") return "from-blue-500 to-cyan-500";
    if (t === "video") return "from-purple-500 to-pink-500";
    if (t === "image") return "from-green-500 to-emerald-500";
    if (t === "link") return "from-indigo-500 to-violet-500";
    if (t === "audio") return "from-amber-500 to-yellow-500";
    return "from-gray-500 to-slate-500";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes?: string | number): string => {
    if (!bytes) return "Unknown";
    const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (isNaN(numBytes)) return "Unknown";
    if (numBytes === 0) return "0 B";
    if (numBytes < 1024) return `${numBytes} B`;
    if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} KB`;
    return `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const TypeIcon = getTypeIcon(resource.type);

  const renderPreview = () => {
    const type = resource.type.toLowerCase();

    if (type === "image" && resource.file_url) {
      return (
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden">
          <img
            src={resource.file_url}
            alt={resource.title}
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    if (type === "video" && resource.file_url) {
      return (
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
          <video
            src={resource.file_url}
            controls
            className="w-full h-full"
            preload="metadata"
          />
        </div>
      );
    }

    if (type === "audio" && resource.file_url) {
      return (
        <div className={`relative aspect-video bg-gradient-to-br ${getTypeColor(type)} rounded-xl overflow-hidden flex flex-col items-center justify-center p-8`}>
          <TypeIcon className="w-20 h-20 text-white/80 mb-4" />
          <audio src={resource.file_url} controls className="w-full max-w-md" />
        </div>
      );
    }

    // For PDF, documents, and other file types - show icon with view button
    if (resource.file_url) {
      return (
        <div className={`relative aspect-video bg-gradient-to-br ${getTypeColor(type)} rounded-xl overflow-hidden flex flex-col items-center justify-center`}>
          <TypeIcon className="w-24 h-24 text-white/80 mb-4" />
          <p className="text-white/90 font-medium text-lg mb-4">{resource.type}</p>
          <button
            onClick={() => onView(resource.file_url!, resource.title)}
            className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full font-medium transition-all"
          >
            <EyeIcon className="w-5 h-5 mr-2" />
            View File
          </button>
        </div>
      );
    }

    // For links
    if (resource.link) {
      return (
        <div className={`relative aspect-video bg-gradient-to-br ${getTypeColor(type)} rounded-xl overflow-hidden flex flex-col items-center justify-center`}>
          <LinkIcon className="w-24 h-24 text-white/80 mb-4" />
          <p className="text-white/90 font-medium text-lg mb-4">External Link</p>
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full font-medium transition-all"
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5 mr-2" />
            Open Link
          </a>
        </div>
      );
    }

    return (
      <div className="relative aspect-video bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl overflow-hidden flex items-center justify-center">
        <FolderIcon className="w-24 h-24 text-white/80" />
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
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
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-2xl">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${getTypeColor(resource.type)}`}>
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            Resource Details
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{resource.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {/* Preview */}
                      {renderPreview()}

                      {/* Title and Description */}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {resource.title}
                        </h2>
                        {resource.description && (
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {resource.description}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {resource.tags && resource.tags.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <TagIcon className="w-4 h-4 mr-2" />
                            Tags
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {resource.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Visibility */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                            {resource.visibility === "Public" ? (
                              <GlobeAltIcon className="w-4 h-4 mr-2" />
                            ) : (
                              <LockClosedIcon className="w-4 h-4 mr-2" />
                            )}
                            <span className="text-xs font-medium uppercase">Visibility</span>
                          </div>
                          <p className={`font-semibold ${
                            resource.visibility === "Public"
                              ? "text-green-600 dark:text-green-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }`}>
                            {resource.visibility}
                          </p>
                        </div>

                        {/* File Size */}
                        {resource.file_size && (
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                              <DocumentIcon className="w-4 h-4 mr-2" />
                              <span className="text-xs font-medium uppercase">File Size</span>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatFileSize(resource.file_size)}
                            </p>
                          </div>
                        )}

                        {/* Downloads */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                            <span className="text-xs font-medium uppercase">Downloads</span>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {resource.downloads || 0}
                          </p>
                        </div>

                        {/* Created */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            <span className="text-xs font-medium uppercase">Created</span>
                          </div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {formatDate(resource.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <HeartIcon className="w-5 h-5" />
                          <span className="font-medium">{resource.likes_count || 0} likes</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <ChatBubbleLeftIcon className="w-5 h-5" />
                          <span className="font-medium">{resource.comments_count || 0} comments</span>
                        </div>
                      </div>

                      {/* Uploader */}
                      {resource.uploaded_by && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#00B5A5]/10 flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-[#00B5A5]" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded by</p>
                            <p className="font-medium text-gray-900 dark:text-white">{resource.uploaded_by}</p>
                          </div>
                        </div>
                      )}

                      {/* Link URL */}
                      {resource.link && (
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">External URL</p>
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00B5A5] hover:underline break-all text-sm"
                          >
                            {resource.link}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(resource)}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <PencilIcon className="w-4 h-4 mr-2" />
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(resource)}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Delete
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.file_url && (
                            <>
                              <button
                                onClick={() => onView(resource.file_url!, resource.title)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <EyeIcon className="w-4 h-4 mr-2" />
                                View
                              </button>
                              <button
                                onClick={() => onDownload(resource.file_url!, resource.title)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] rounded-lg hover:bg-[#008F82] transition-colors"
                              >
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                Download
                              </button>
                            </>
                          )}
                          {resource.link && (
                            <a
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] rounded-lg hover:bg-[#008F82] transition-colors"
                            >
                              <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2" />
                              Open Link
                            </a>
                          )}
                        </div>
                      </div>
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
};
