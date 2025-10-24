import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TeamActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any;
  onEdit: () => void;
  onDelete: (id: number) => void;
  onBlockAccess: (id: number) => Promise<boolean>;
  onActivateAccess: (id: number) => Promise<boolean>;
  onSendPasswordReset: (id: number) => Promise<boolean>;
}

export const TeamActionsModal: React.FC<TeamActionsModalProps> = ({
  isOpen,
  onClose,
  team,
  onEdit,
  onDelete,
  onBlockAccess,
  onActivateAccess,
  onSendPasswordReset,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    if (!team) return;

    setLoading(action);

    let success = false;
    switch (action) {
      case "block":
        success = await onBlockAccess(team.id);
        break;
      case "activate":
        success = await onActivateAccess(team.id);
        break;
      case "reset":
        success = await onSendPasswordReset(team.id);
        break;
    }

    if (success) {
      onClose();
    }

    setLoading(null);
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Actions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Edit Team
          </button>

          {team.status === "active" ? (
            <button
              onClick={() => handleAction("block")}
              disabled={loading === "block"}
              className="w-full text-left px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading === "block" ? "Blocking..." : "Block Access"}
            </button>
          ) : (
            <button
              onClick={() => handleAction("activate")}
              disabled={loading === "activate"}
              className="w-full text-left px-4 py-3 text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading === "activate" ? "Activating..." : "Activate Access"}
            </button>
          )}

          <button
            onClick={() => handleAction("reset")}
            disabled={loading === "reset"}
            className="w-full text-left px-4 py-3 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading === "reset" ? "Sending..." : "Send Password Reset"}
          </button>

          <button
            onClick={() => {
              onClose();
              setTimeout(() => onDelete(team.id), 300);
            }}
            className="w-full text-left px-4 py-3 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
};
