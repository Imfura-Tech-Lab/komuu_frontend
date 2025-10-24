"use client";

import React, { useState } from "react";
import {
  FolderIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";

export default function CommunityResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const resources = [
    {
      id: 1,
      title: "Forensic Best Practices Guide 2025",
      type: "PDF",
      category: "Guidelines",
      size: "2.4 MB",
      downloads: 342,
      uploadedAt: "2025-10-15",
      isSaved: true,
    },
    {
      id: 2,
      title: "Digital Evidence Collection Handbook",
      type: "PDF",
      category: "Training Materials",
      size: "5.1 MB",
      downloads: 256,
      uploadedAt: "2025-10-10",
      isSaved: false,
    },
    {
      id: 3,
      title: "Crime Scene Photography Tutorial",
      type: "Video",
      category: "Tutorials",
      size: "124 MB",
      downloads: 189,
      uploadedAt: "2025-09-28",
      isSaved: true,
    },
    {
      id: 4,
      title: "DNA Analysis Templates",
      type: "DOCX",
      category: "Templates",
      size: "1.2 MB",
      downloads: 167,
      uploadedAt: "2025-09-15",
      isSaved: false,
    },
    {
      id: 5,
      title: "Forensic Equipment Catalog 2025",
      type: "PDF",
      category: "Reference",
      size: "8.7 MB",
      downloads: 423,
      uploadedAt: "2025-08-20",
      isSaved: false,
    },
    {
      id: 6,
      title: "AFSA Membership Application Form",
      type: "PDF",
      category: "Forms",
      size: "0.8 MB",
      downloads: 891,
      uploadedAt: "2025-07-01",
      isSaved: false,
    },
  ];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "saved") return matchesSearch && resource.isSaved;
    return matchesSearch && resource.type.toLowerCase() === activeTab.toLowerCase();
  });

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <DocumentTextIcon className="h-6 w-6 text-red-500" />;
      case "docx":
      case "doc":
        return <DocumentIcon className="h-6 w-6 text-blue-500" />;
      case "video":
        return <VideoCameraIcon className="h-6 w-6 text-purple-500" />;
      case "image":
        return <PhotoIcon className="h-6 w-6 text-green-500" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Resources
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Access shared documents, guides, and materials
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Available Resources</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {resources.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Saved Resources</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {resources.filter((r) => r.isSaved).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Your Downloads</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">23</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white">
              <option>All Categories</option>
              <option>Guidelines</option>
              <option>Training Materials</option>
              <option>Templates</option>
              <option>Forms</option>
              <option>Reference</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-4 px-4 pt-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "all", label: "All" },
            { id: "saved", label: "Saved" },
            { id: "pdf", label: "PDFs" },
            { id: "docx", label: "Documents" },
            { id: "video", label: "Videos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#00B5A5] text-[#00B5A5]"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resources List */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {getFileIcon(resource.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                      {resource.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {resource.category}
                      </span>
                      <span>{resource.type}</span>
                      <span>{resource.size}</span>
                      <span>·</span>
                      <span>{resource.downloads} downloads</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Added {new Date(resource.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-[#00B5A5] transition-colors">
                    {resource.isSaved ? (
                      <BookmarkSolidIcon className="h-5 w-5 text-[#00B5A5]" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No resources found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
