"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  EllipsisVerticalIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useResources, Resource } from "@/lib/hooks/useResources";
import { FileViewer } from "@/components/ui/FileViwer";
import { ResourceFormData, ResourceModal } from "./modals/Resourcemodal";
import { DeleteConfirmModal } from "./modals/DeleteConfirmModal";

// ============================================================================
// SKELETON LOADERS
// ============================================================================

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const ResourceCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    </div>
  </div>
);

const ResourcesGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <ResourceCardSkeleton key={i} />
    ))}
  </div>
);

// ============================================================================
// RESOURCE CARD COMPONENT
// ============================================================================

interface ResourceCardProps {
  resource: Resource;
  onView: (fileUrl: string, fileName: string) => void;
  onDownload: (fileUrl: string, fileName: string) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onView,
  onDownload,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActions]);

  const getPreviewContent = () => {
    const type = resource.type.toLowerCase();

    // Image preview
    if (type === "image" && resource.file_url) {
      return (
        <img
          src={resource.file_url}
          alt={resource.title}
          className="w-full h-full object-cover"
        />
      );
    }

    // Video preview with play overlay
    if (type === "video" && resource.file_url) {
      return (
        <div className="relative w-full h-full bg-black">
          <video
            src={resource.file_url}
            className="w-full h-full object-contain"
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
              <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-gray-900 border-b-[12px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      );
    }

    // Link preview
    if (type === "link") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-8">
          <LinkIcon className="h-24 w-24 text-white/90 mb-4" />
          <p className="text-white/80 text-sm font-medium text-center">
            External Link
          </p>
        </div>
      );
    }

    // PDF preview
    if (type === "pdf") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-red-500 via-red-600 to-orange-600 flex flex-col items-center justify-center p-8">
          <DocumentTextIcon className="h-24 w-24 text-white/90 mb-4" />
          <p className="text-white/80 text-sm font-medium">PDF Document</p>
        </div>
      );
    }

    // Document preview
    if (["document", "docx", "doc"].includes(type)) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 flex flex-col items-center justify-center p-8">
          <DocumentIcon className="h-24 w-24 text-white/90 mb-4" />
          <p className="text-white/80 text-sm font-medium">Document</p>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 flex flex-col items-center justify-center p-8">
        <FolderIcon className="h-24 w-24 text-white/90 mb-4" />
        <p className="text-white/80 text-sm font-medium">Resource</p>
      </div>
    );
  };

  const formatFileSize = (bytes?: string | number): string => {
    if (!bytes) return "";
    const numBytes = typeof bytes === "string" ? parseInt(bytes) : bytes;
    if (isNaN(numBytes)) return "";
    if (numBytes === 0) return "0 B";
    if (numBytes < 1024) return `${numBytes} B`;
    if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} KB`;
    return `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateRelative = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return formatDate(dateString);
    }
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-[#00B5A5] dark:hover:border-[#00B5A5] flex flex-col">
      {/* Preview Section */}
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-900 rounded-t-2xl overflow-hidden">
        {getPreviewContent()}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Overlay with quick actions on hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {resource.file_url && (
            <>
              <button
                onClick={() => onView(resource.file_url!, resource.title)}
                className="p-4 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-lg transform hover:scale-110 active:scale-95"
                title="View"
              >
                <EyeIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={() => onDownload(resource.file_url!, resource.title)}
                className="p-4 bg-[#00B5A5] rounded-full hover:bg-[#008F82] transition-all shadow-lg transform hover:scale-110 active:scale-95"
                title="Download"
              >
                <ArrowDownTrayIcon className="h-6 w-6 text-white" />
              </button>
            </>
          )}
          {resource.link && (
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-blue-500 rounded-full hover:bg-blue-600 transition-all shadow-lg transform hover:scale-110 active:scale-95"
              title="Open Link"
            >
              <ArrowTopRightOnSquareIcon className="h-6 w-6 text-white" />
            </a>
          )}
        </div>

        {/* Type badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-white/95 dark:bg-gray-800/95 text-gray-700 dark:text-gray-300 backdrop-blur-sm shadow-lg uppercase tracking-wide">
            {resource.type}
          </span>
        </div>
      </div>

      {/* Actions dropdown button - positioned relative to card */}
      <div className="absolute top-4 right-4 z-20" ref={dropdownRef}>
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
        >
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Dropdown menu */}
        {showActions && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {resource.file_url && (
              <>
                <button
                  onClick={() => {
                    onView(resource.file_url!, resource.title);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <EyeIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                  View File
                </button>
                <button
                  onClick={() => {
                    onDownload(resource.file_url!, resource.title);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Download
                </button>
              </>
            )}
            {resource.link && (
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowActions(false)}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                Open Link
              </a>
            )}
            <button
              onClick={() => {
                onEdit(resource);
                setShowActions(false);
              }}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <PencilIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
              Edit Resource
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
            <button
              onClick={() => {
                onDelete(resource);
                setShowActions(false);
              }}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <TrashIcon className="h-5 w-5 mr-3" />
              Delete Resource
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          {resource.title}
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                {tag}
              </span>
            ))}
            {resource.tags.length > 4 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                +{resource.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Spacer to push footer to bottom */}
        <div className="flex-1"></div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-[#00B5A5] dark:hover:text-[#00B5A5] transition-colors"
          >
            {isLiked ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span className="font-medium">
              {(resource.likes_count || 0) + (isLiked ? 1 : 0)}
            </span>
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span className="font-medium">{resource.comments_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 ml-auto">
            <ArrowDownTrayIcon className="h-5 w-5" />
            <span className="font-medium">{resource.downloads || 0}</span>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="space-y-2">
          {/* Uploader */}
          {resource.uploaded_by && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <UserCircleIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span className="font-medium">{resource.uploaded_by}</span>
            </div>
          )}

          {/* Date and Size */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span title={formatDate(resource.created_at)}>
                {formatDateRelative(resource.created_at)}
              </span>
            </div>
            {resource.file_size && (
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {formatFileSize(resource.file_size)}
              </span>
            )}
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-md font-medium ${
                resource.visibility === "Public"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
              }`}
            >
              {resource.visibility}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN RESOURCES PAGE COMPONENT
// ============================================================================

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [modalLoading, setModalLoading] = useState(false);

  // File Viewer State
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");

  const {
    resources,
    loading,
    error,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
  } = useResources();

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchResources();
    setIsRefreshing(false);
  };

  const handleCreateResource = async (formData: ResourceFormData) => {
    setModalLoading(true);
    const success = await createResource({
      title: formData.title,
      description: formData.description,
      link: formData.link,
      type: formData.type,
      visibility: formData.visibility,
      group: formData.group,
      tags: formData.tags,
      file: formData.file,
    });
    setModalLoading(false);

    if (success) {
      setShowCreateModal(false);
    }
  };

  const handleUpdateResource = async (formData: ResourceFormData) => {
    if (!selectedResource) return;

    setModalLoading(true);
    const success = await updateResource({
      id: selectedResource.id,
      title: formData.title,
      description: formData.description,
      link: formData.link,
      type: formData.type,
      visibility: formData.visibility,
      group: formData.group,
      tags: formData.tags,
      file: formData.file,
    });
    setModalLoading(false);

    if (success) {
      setShowEditModal(false);
      setSelectedResource(null);
    }
  };

  const handleDeleteClick = (resource: Resource) => {
    setSelectedResource(resource);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedResource) return;

    setModalLoading(true);
    const success = await deleteResource(selectedResource.id);
    setModalLoading(false);

    if (success) {
      setShowDeleteModal(false);
      setSelectedResource(null);
    }
  };

  const handleEditClick = (resource: Resource) => {
    setSelectedResource(resource);
    setShowEditModal(true);
  };

  const handleViewFile = (fileUrl: string, fileName: string) => {
    setCurrentFileUrl(fileUrl);
    setCurrentFileName(fileName);
    setFileViewerOpen(true);
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" ||
      resource.tags?.some(
        (tag) => tag.toLowerCase() === categoryFilter.toLowerCase()
      );

    const matchesType =
      activeTab === "all" ||
      (activeTab === "pdf" && resource.type.toLowerCase() === "pdf") ||
      (activeTab === "docx" &&
        ["docx", "doc", "document"].includes(resource.type.toLowerCase())) ||
      (activeTab === "video" && resource.type.toLowerCase() === "video") ||
      (activeTab === "image" && resource.type.toLowerCase() === "image") ||
      (activeTab === "link" && resource.type.toLowerCase() === "link");

    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = Array.from(
    new Set(resources.flatMap((r) => r.tags || []))
  ).sort();

  const typeCounts = {
    all: resources.length,
    pdf: resources.filter((r) => r.type.toLowerCase() === "pdf").length,
    docx: resources.filter((r) =>
      ["docx", "doc", "document"].includes(r.type.toLowerCase())
    ).length,
    video: resources.filter((r) => r.type.toLowerCase() === "video").length,
    image: resources.filter((r) => r.type.toLowerCase() === "image").length,
    link: resources.filter((r) => r.type.toLowerCase() === "link").length,
  };

  const typeTabs = [
    { id: "all", label: "All", icon: <FolderIcon />, count: typeCounts.all },
    {
      id: "pdf",
      label: "PDFs",
      icon: <DocumentTextIcon />,
      count: typeCounts.pdf,
    },
    {
      id: "docx",
      label: "Docs",
      icon: <DocumentIcon />,
      count: typeCounts.docx,
    },
    {
      id: "video",
      label: "Videos",
      icon: <VideoCameraIcon />,
      count: typeCounts.video,
    },
    {
      id: "image",
      label: "Images",
      icon: <PhotoIcon />,
      count: typeCounts.image,
    },
    {
      id: "link",
      label: "Links",
      icon: <LinkIcon />,
      count: typeCounts.link,
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-8 p-6 sm:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Resource Library
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Organize, share, and manage all your team's essential resources.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <ArrowPathIcon
              className={`h-5 w-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-5 py-2.5 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors shadow-md text-sm font-medium"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Upload New Resource
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading && !isRefreshing ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Resources
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {resources.length}
              </p>
            </div>
            <FolderIcon className="h-10 w-10 text-[#00B5A5]/60 dark:text-[#00B5A5]/40" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Downloads
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {resources
                  .reduce(
                    (sum, resource) => sum + (resource.downloads || 0),
                    0
                  )
                  .toLocaleString()}
              </p>
            </div>
            <ArrowDownTrayIcon className="h-10 w-10 text-blue-500/60 dark:text-blue-400/40" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                PDF Documents
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {typeCounts.pdf}
              </p>
            </div>
            <DocumentTextIcon className="h-10 w-10 text-red-500/60 dark:text-red-400/40" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Video Tutorials
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {typeCounts.video}
              </p>
            </div>
            <VideoCameraIcon className="h-10 w-10 text-purple-500/60 dark:text-purple-400/40" />
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex-1 relative w-full md:w-auto">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white w-full md:w-auto transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
          {typeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#00B5A5] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {React.cloneElement(tab.icon, {
                className: `h-5 w-5 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`,
              })}
              <span>{tab.label}</span>
              <span
                className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? "bg-white text-[#00B5A5]"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-200"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {loading && !isRefreshing ? (
        <ResourcesGridSkeleton />
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onView={handleViewFile}
              onDownload={handleDownload}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <FolderIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            No resources match your criteria
          </h3>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
            {resources.length === 0
              ? "Upload your first resource to get started."
              : "Try adjusting your search query, filters, or active tab."}
          </p>
          {resources.length === 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#00B5A5] hover:bg-[#008F82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5]"
              >
                <PlusIcon className="h-5 w-5 mr-2 -ml-1" />
                Upload Resource
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <FileViewer
        fileUrl={currentFileUrl}
        fileName={currentFileName}
        isOpen={fileViewerOpen}
        onClose={() => setFileViewerOpen(false)}
      />

      <ResourceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateResource}
        loading={modalLoading}
      />

      <ResourceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedResource(null);
        }}
        onSubmit={handleUpdateResource}
        resource={selectedResource}
        loading={modalLoading}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedResource(null);
        }}
        onConfirm={handleDeleteConfirm}
        eventTitle={selectedResource?.title || ""}
        loading={modalLoading}
      />
    </div>
  );
}