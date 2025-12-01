"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { InstitutionMember } from "@/lib/hooks/useInstitutionMembers";


interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMembers: (memberIds: number[]) => void;
  loading?: boolean;
  slug: string;

  availableMembers: InstitutionMember[];
  membersLoading: boolean;
}

export function AddMemberModal({
  isOpen,
  onClose,
  onAddMembers,
  loading = false,
  slug,
  availableMembers,
  membersLoading,
}: AddMemberModalProps) {
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedMembers([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredMembers = availableMembers.filter((member) => {
    const memberName = member.name || "";
    const memberEmail = member.email || "";
    const lowerSearchTerm = searchTerm.toLowerCase();

    return (
      memberName.toLowerCase().includes(lowerSearchTerm) ||
      memberEmail.toLowerCase().includes(lowerSearchTerm)
    );
  });

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = () => {
    if (selectedMembers.length > 0) {
      onAddMembers(selectedMembers);
    }
  };

  const handleClose = () => {
    setSelectedMembers([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Members to Group
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              />
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
              {membersLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading members...
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No members found
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => toggleMemberSelection(member.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        className="h-4 w-4 text-[#00B5A5] focus:ring-[#00B5A5] border-gray-300 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              member.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {member.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {member.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedMembers.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                {selectedMembers.length} member(s) selected
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedMembers.length === 0 || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] rounded-md hover:bg-[#008F82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Adding Members..."
                : `Add ${selectedMembers.length} Member(s)`}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
