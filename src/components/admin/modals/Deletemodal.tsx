import { Trash2 } from "lucide-react";

// ============================================================================
// DELETE MODAL COMPONENT
// ============================================================================

interface DeleteModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  deleteType: "soft" | "force";
  onClose: () => void;
  onDelete: (forceDelete: boolean) => void;
  onDeleteTypeChange: (type: "soft" | "force") => void;
}

export function DeleteModal({
  isOpen,
  isDeleting,
  deleteType,
  onClose,
  onDelete,
  onDeleteTypeChange,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Delete Application
          </h3>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete this application? This action cannot
          be undone.
        </p>
        <div className="space-y-3 mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              value="soft"
              checked={deleteType === "soft"}
              onChange={() => onDeleteTypeChange("soft")}
              className="mt-1 text-[#00B5A5] focus:ring-[#00B5A5]"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Soft Delete
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mark as deleted but keep in database (can be recovered)
              </p>
            </div>
          </label>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              value="force"
              checked={deleteType === "force"}
              onChange={() => onDeleteTypeChange("force")}
              className="mt-1 text-red-600 focus:ring-red-600"
            />
            <div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Force Delete
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Permanently remove from database (cannot be recovered)
              </p>
            </div>
          </label>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(deleteType === "force")}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Application</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}