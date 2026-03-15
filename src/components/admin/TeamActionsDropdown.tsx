"use client";

import { useState, Fragment } from "react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  ShieldExclamationIcon,
  ShieldCheckIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface TeamActionsDropdownProps {
  member: any;
  onDelete: (teamId: number) => Promise<void>;
  onBlockAccess: (memberId: number) => Promise<boolean>;
  onActivateAccess: (memberId: number) => Promise<boolean>;
  onSendPasswordReset: (memberId: number) => Promise<boolean>;
}

export function TeamActionsDropdown({
  member,
  onDelete,
  onBlockAccess,
  onActivateAccess,
  onSendPasswordReset,
}: TeamActionsDropdownProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!member) return null;

  const isActive = member.status === "active";

  const handleBlockAccess = async () => {
    setIsProcessing(true);
    await onBlockAccess(member.id);
    setIsProcessing(false);
  };

  const handleActivateAccess = async () => {
    setIsProcessing(true);
    await onActivateAccess(member.id);
    setIsProcessing(false);
  };

  const handleSendPasswordReset = async () => {
    setIsProcessing(true);
    await onSendPasswordReset(member.id);
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    await onDelete(member.id);
    setIsProcessing(false);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="More Actions"
          onClick={(e) => e.stopPropagation()}
        >
          <EllipsisVerticalIcon className="h-5 w-5" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700">
            <div className="py-1">
              {/* Access Control */}
              {isActive ? (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleBlockAccess}
                      disabled={isProcessing}
                      className={`${
                        active ? "bg-orange-50 dark:bg-orange-900/20" : ""
                      } w-full flex items-center space-x-3 px-4 py-2 text-sm text-orange-600 dark:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ShieldExclamationIcon className="w-4 h-4" />
                      <span>Block Access</span>
                    </button>
                  )}
                </Menu.Item>
              ) : (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleActivateAccess}
                      disabled={isProcessing}
                      className={`${
                        active ? "bg-green-50 dark:bg-green-900/20" : ""
                      } w-full flex items-center space-x-3 px-4 py-2 text-sm text-green-600 dark:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      <span>Activate Access</span>
                    </button>
                  )}
                </Menu.Item>
              )}

              {/* Password Reset */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSendPasswordReset}
                    disabled={isProcessing}
                    className={`${
                      active ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    } w-full flex items-center space-x-3 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <KeyIcon className="w-4 h-4" />
                    <span>Send Password Reset</span>
                  </button>
                )}
              </Menu.Item>
            </div>

            <div className="py-1">
              {/* Delete Member */}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isProcessing}
                    className={`${
                      active ? "bg-red-50 dark:bg-red-900/20" : ""
                    } w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete Member</span>
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Delete Confirmation Modal */}
      <Transition appear show={showDeleteConfirm} as={Fragment}>
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

          {/* Centered Modal */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                          Delete Team Member
                        </Dialog.Title>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          This action cannot be undone
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      Are you sure you want to permanently delete{" "}
                      <span className="font-semibold">{member.name}</span>? This will
                      remove all their access and data from the system.
                    </p>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isProcessing}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isProcessing}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Member"
                        )}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
