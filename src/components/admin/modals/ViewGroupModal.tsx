"use client";

import React from "react";
import {
  XMarkIcon,
  UserGroupIcon,
  UsersIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Group } from "@/lib/hooks/useGroups";

interface ViewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  loading: boolean;
}

export function ViewGroupModal({
  isOpen,
  onClose,
  group,
  loading,
}: ViewGroupModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00B5A5] to-[#008f82] rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {loading ? "Loading..." : group?.name || "Group Details"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? "Please wait..." : group?.category || "Category"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5]"></div>
              </div>
            ) : group ? (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {group.description || "No description provided."}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Members Count */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Members
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {group.members}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Status */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        {group.privacy === "Public" ? (
                          <GlobeAltIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <LockClosedIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Privacy
                        </p>
                        <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                          {group.privacy}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div
                    className={`${
                      group.activity === "High"
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : group.activity === "Medium"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    } border rounded-lg p-4`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          group.activity === "High"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : group.activity === "Medium"
                            ? "bg-yellow-100 dark:bg-yellow-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        }`}
                      >
                        <ChartBarIcon
                          className={`w-5 h-5 ${
                            group.activity === "High"
                              ? "text-green-600 dark:text-green-400"
                              : group.activity === "Medium"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Activity
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            group.activity === "High"
                              ? "text-green-600 dark:text-green-400"
                              : group.activity === "Medium"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {group.activity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Group Information
                  </h4>

                  {/* Slug */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Slug
                    </span>
                    <code className="text-sm font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white">
                      {group.slug}
                    </code>
                  </div>

                  {/* ID */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Group ID
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {group.id}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Created
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(group.created_at)}
                    </span>
                  </div>
                </div>

                {/* Created By */}
                {group.created_by && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <ShieldCheckIcon className="w-4 h-4 mr-2" />
                      Created By
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#00B5A5] rounded-full flex items-center justify-center text-white font-semibold">
                        {group.created_by.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {group.created_by.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {group.created_by.role}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    <strong>Quick Actions:</strong>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Use the actions dropdown to manage this group
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No group data available
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}