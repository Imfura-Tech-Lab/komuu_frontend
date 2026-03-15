"use client";

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ShieldExclamationIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { InstitutionMember } from "@/lib/hooks/useInstitutionMembers";

interface BlockMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlockMember: (memberId: number) => Promise<void>;
  loading: boolean;
  slug: string;
  groupMembers: InstitutionMember[];
  membersLoading: boolean;
}

export function BlockMemberModal({
  isOpen,
  onClose,
  onBlockMember,
  loading,
  slug,
  groupMembers,
  membersLoading,
}: BlockMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  const filteredMembers = groupMembers.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBlock = async () => {
    if (!selectedMemberId) return;

    try {
      setIsBlocking(true);
      await onBlockMember(selectedMemberId);
      handleClose();
    } catch {
      // Error handled by parent component
    } finally {
      setIsBlocking(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedMemberId(null);
    setBlockReason("");
    onClose();
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
                  <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                          <ShieldExclamationIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                            Block Member Access
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select a member to block from accessing this group
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {/* Search */}
                      <div className="mb-4">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Members List */}
                      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {membersLoading ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                          </div>
                        ) : filteredMembers.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No members found
                          </div>
                        ) : (
                          filteredMembers.map((member) => (
                            <label
                              key={member.id}
                              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                selectedMemberId === member.id
                                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                                  : "border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700"
                              }`}
                            >
                              <input
                                type="radio"
                                name="member"
                                value={member.id}
                                checked={selectedMemberId === member.id}
                                onChange={() => setSelectedMemberId(member.id)}
                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {member.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {member.email}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      member.status === "active"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {member.status || "inactive"}
                                  </span>
                                </div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>

                      {/* Block Reason (Optional) */}
                      {selectedMemberId && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reason for blocking (Optional)
                          </label>
                          <textarea
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Enter reason for blocking this member..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                          />
                        </div>
                      )}

                      {/* Warning Message */}
                      {selectedMemberId && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Warning:</strong> This member will be blocked from accessing
                            the group. They won't be able to view or participate in group
                            activities until unblocked.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-3">
                      <button
                        onClick={handleClose}
                        disabled={isBlocking}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBlock}
                        disabled={!selectedMemberId || isBlocking || loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isBlocking ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Blocking...</span>
                          </>
                        ) : (
                          <>
                            <ShieldExclamationIcon className="w-4 h-4" />
                            <span>Block Member</span>
                          </>
                        )}
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
