import { CheckCircle, RefreshCw, FileSignature, Trash2 } from "lucide-react";

interface ActionsButtonsProps {
  loading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isApproved: boolean;
  isPresident: boolean;
  hasUserApproved: boolean;
  onRefresh: () => void;
  onApprove: () => void;
  onSign: () => void;
  onDelete: () => void;
}

export function ActionsButtons({
  loading,
  isUpdating,
  isDeleting,
  isApproved,
  isPresident,
  hasUserApproved,
  onRefresh,
  onApprove,
  onSign,
  onDelete,
}: ActionsButtonsProps) {
  const getApproveButtonState = () => {
    if (isApproved) return { disabled: true, label: "Approved" };
    if (hasUserApproved) return { disabled: true, label: "Already Voted" };
    return { disabled: isUpdating, label: "Approve" };
  };

  const approveState = getApproveButtonState();

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <button
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      <button
        onClick={onApprove}
        disabled={approveState.disabled}
        className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={
          hasUserApproved ? "You have already approved this application" : ""
        }
      >
        <CheckCircle className="w-4 h-4" />
        <span className="hidden sm:inline">{approveState.label}</span>
      </button>

      {isPresident && isApproved && (
        <button
          onClick={onSign}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSignature className="w-4 h-4" />
          <span className="hidden sm:inline">Sign</span>
        </button>
      )}

      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden sm:inline">Delete</span>
      </button>
    </div>
  );
}
