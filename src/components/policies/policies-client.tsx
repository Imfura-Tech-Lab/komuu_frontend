"use client";

import { useState } from "react";
import {
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  version: string;
  effectiveDate: string;
  lastReviewed: string;
  status: "active" | "under_review" | "archived";
  documentUrl?: string;
}

export default function PoliciesClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "All Policies" },
    { id: "governance", label: "Governance" },
    { id: "membership", label: "Membership" },
    { id: "ethics", label: "Ethics & Conduct" },
    { id: "financial", label: "Financial" },
    { id: "operational", label: "Operational" },
  ];

  const policies: Policy[] = [
    {
      id: "1",
      title: "Code of Professional Conduct",
      description: "Guidelines for professional behavior and ethical standards for all members.",
      category: "ethics",
      version: "3.2",
      effectiveDate: "2024-01-01",
      lastReviewed: "2023-12-15",
      status: "active",
    },
    {
      id: "2",
      title: "Membership Eligibility Criteria",
      description: "Requirements and qualifications for membership categories.",
      category: "membership",
      version: "2.1",
      effectiveDate: "2023-06-01",
      lastReviewed: "2023-11-20",
      status: "active",
    },
    {
      id: "3",
      title: "Board Governance Policy",
      description: "Roles, responsibilities, and procedures for board members.",
      category: "governance",
      version: "4.0",
      effectiveDate: "2023-01-01",
      lastReviewed: "2024-01-10",
      status: "active",
    },
    {
      id: "4",
      title: "Financial Management Guidelines",
      description: "Procedures for handling organizational finances and reporting.",
      category: "financial",
      version: "2.5",
      effectiveDate: "2023-04-01",
      lastReviewed: "2023-10-05",
      status: "under_review",
    },
    {
      id: "5",
      title: "Conflict of Interest Policy",
      description: "Guidelines for identifying and managing conflicts of interest.",
      category: "ethics",
      version: "1.3",
      effectiveDate: "2022-09-01",
      lastReviewed: "2023-09-01",
      status: "active",
    },
    {
      id: "6",
      title: "Event Management Procedures",
      description: "Standard operating procedures for organizing events and conferences.",
      category: "operational",
      version: "1.8",
      effectiveDate: "2023-03-01",
      lastReviewed: "2023-08-15",
      status: "active",
    },
  ];

  const filteredPolicies = policies.filter((policy) => {
    const matchesCategory = activeCategory === "all" || policy.category === activeCategory;
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: Policy["status"]) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckBadgeIcon className="h-3.5 w-3.5" />
            Active
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <ClockIcon className="h-3.5 w-3.5" />
            Under Review
          </span>
        );
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Archived
          </span>
        );
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      governance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      membership: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      ethics: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      financial: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      operational: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Policy Management
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          View and manage organizational policies and governance documents
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Policies</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{policies.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {policies.filter((p) => p.status === "active").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Under Review</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
            {policies.filter((p) => p.status === "under_review").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {categories.length - 1}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? "bg-[#00B5A5] text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map((policy) => (
          <div
            key={policy.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[#00B5A5]/10 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-[#00B5A5]" />
                </div>
                {getStatusBadge(policy.status)}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {policy.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {policy.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(policy.category)}`}>
                  {policy.category}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  v{policy.version}
                </span>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Effective: {new Date(policy.effectiveDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>Last reviewed: {new Date(policy.lastReviewed).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900 flex justify-end gap-2">
              <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <EyeIcon className="h-4 w-4" />
                View
              </button>
              <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No policies found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
