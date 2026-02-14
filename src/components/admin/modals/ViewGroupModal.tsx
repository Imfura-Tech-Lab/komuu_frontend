"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                <Dialog.Panel className="pointer-events-auto w-screen max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#00B5A5] to-[#008f82] rounded-xl flex items-center justify-center">
                          <UserGroupIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            {loading ? "Loading..." : group?.name || "Group Details"}
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {loading ? "Please wait..." : group?.category || "Category"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {loading ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5]"></div>
                        </div>
                      ) : group ? (
                        <div className="space-y-6">
                          {/* Description */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                              {group.description || "No description provided."}
                            </p>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Members Count */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Members
                                  </p>
                                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {group.members}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Privacy Status */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                  {group.privacy === "Public" ? (
                                    <GlobeAltIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  ) : (
                                    <LockClosedIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                              } border rounded-xl p-4`}
                            >
                              <div className="flex items-center gap-3">
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
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                              Group Information
                            </h4>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl divide-y divide-gray-200 dark:divide-gray-700">
                              {/* Slug */}
                              <div className="flex items-center justify-between p-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Slug
                                </span>
                                <code className="text-sm font-mono bg-white dark:bg-gray-900 px-3 py-1 rounded-lg text-gray-900 dark:text-white">
                                  {group.slug}
                                </code>
                              </div>

                              {/* ID */}
                              <div className="flex items-center justify-between p-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  Group ID
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {group.id}
                                </span>
                              </div>

                              {/* Created Date */}
                              <div className="flex items-center justify-between p-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                  <CalendarIcon className="w-4 h-4" />
                                  Created
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatDate(group.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Created By */}
                          {group.created_by && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4" />
                                Created By
                              </h4>
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-[#00B5A5] to-[#008f82] rounded-full flex items-center justify-center text-white font-semibold">
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
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <UserGroupIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No group data available
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                      <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 text-sm font-medium bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
                      >
                        Close
                      </button>
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
}
