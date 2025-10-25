"use client";

import { useState } from "react";
import {
  X,
  ShieldOff,
  ShieldCheck,
  Key,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface TeamActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any;
  onDelete: (teamId: number) => Promise<void>;
  onBlockAccess: (memberId: number) => Promise<boolean>;
  onActivateAccess: (memberId: number) => Promise<boolean>;
  onSendPasswordReset: (memberId: number) => Promise<boolean>;
}

export function TeamActionsModal({
  isOpen,
  onClose,
  team,
  onDelete,
  onBlockAccess,
  onActivateAccess,
  onSendPasswordReset,
}: TeamActionsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !team) return null;

  const isActive = team.status === "active";

  const handleBlockAccess = async () => {
    setIsProcessing(true);
    const success = await onBlockAccess(team.id);
    setIsProcessing(false);
    if (success) {
      onClose();
    }
  };

  const handleActivateAccess = async () => {
    setIsProcessing(true);
    const success = await onActivateAccess(team.id);
    setIsProcessing(false);
    if (success) {
      onClose();
    }
  };

  const handleSendPasswordReset = async () => {
    setIsProcessing(true);
    await onSendPasswordReset(team.id);
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    await onDelete(team.id);
    setIsProcessing(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Team Member
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">{team.name}</span>? This will
              remove all their access and data from the system.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Deleting..." : "Delete Member"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Member Actions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {team.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {/* Access Control */}
          {isActive ? (
            <button
              onClick={handleBlockAccess}
              disabled={isProcessing}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldOff className="w-5 h-5" />
              <div>
                <p className="font-medium">Block Access</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Temporarily disable member login
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={handleActivateAccess}
              disabled={isProcessing}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-5 h-5" />
              <div>
                <p className="font-medium">Activate Access</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Re-enable member login
                </p>
              </div>
            </button>
          )}

          {/* Password Reset */}
          <button
            onClick={handleSendPasswordReset}
            disabled={isProcessing}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Key className="w-5 h-5" />
            <div>
              <p className="font-medium">Send Password Reset Link</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email reset link to member
              </p>
            </div>
          </button>

          {/* Delete Member */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isProcessing}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-5 h-5" />
            <div>
              <p className="font-medium">Delete Member</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Permanently remove from system
              </p>
            </div>
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}