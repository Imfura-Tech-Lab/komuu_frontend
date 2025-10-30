import { CheckCircle, RefreshCw, FileSignature, Trash2 } from "lucide-react";

// ============================================================================
// ACTIONS DROPDOWN COMPONENT
// ============================================================================

interface ActionsDropdownProps {
  isOpen: boolean; // ← ADD THIS
  loading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isApproved: boolean;
  isPresident: boolean;
  onRefresh: () => void;
  onApprove: () => void;
  onSign: () => void;
  onDelete: () => void;
}

export function ActionsDropdown({
  isOpen, // ← ADD THIS
  loading,
  isUpdating,
  isDeleting,
  isApproved,
  isPresident,
  onRefresh,
  onApprove,
  onSign,
  onDelete,
}: ActionsDropdownProps) {
  // Don't render if not open
  if (!isOpen) return null; // ← ADD THIS

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div className="py-1">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>

        <button
          onClick={onApprove}
          disabled={isUpdating || isApproved}
          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{isApproved ? "Already Approved" : "Approve"}</span>
        </button>

        {isPresident && isApproved && (
          <button
            onClick={onSign}
            disabled={isUpdating}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left text-purple-600 dark:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSignature className="w-5 h-5" />
            <span>Sign Certificate</span>
          </button>
        )}

        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-5 h-5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}