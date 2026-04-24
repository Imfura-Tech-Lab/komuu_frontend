import { CheckCircle, CreditCard, RefreshCw, FileSignature, Trash2, XCircle } from "lucide-react";

interface ActionsButtonsProps {
  loading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isApproved: boolean;
  isRejected?: boolean;
  isWaitingForPayment?: boolean;
  isPresident: boolean;
  hasUserApproved: boolean;
  hasUserRejected?: boolean;
  approvalProgress?: { required: number; approved: number; rejected: number; total_reviews: number };
  onRefresh: () => void;
  onApprove: () => void;
  onReject?: () => void;
  onSign: () => void;
  onDelete: () => void;
  onAnalyzeDocuments?: () => void;
  onRecordPayment?: () => void;
}

export function ActionsButtons({
  loading,
  isUpdating,
  isDeleting,
  isApproved,
  isRejected,
  isWaitingForPayment,
  isPresident,
  hasUserApproved,
  hasUserRejected,
  approvalProgress,
  onRefresh,
  onApprove,
  onReject,
  onSign,
  onDelete,
  onAnalyzeDocuments,
  onRecordPayment,
}: ActionsButtonsProps) {
  const canReview = !isApproved && !isRejected;
  const approveLabel = hasUserApproved ? "Approved ✓" : isApproved ? "Approved" : "Approve";
  const rejectLabel = hasUserRejected ? "Rejected" : "Reject";

  return (
    <div className="space-y-3">
      {/* Approval progress */}
      {approvalProgress && canReview && (
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2.5">
          <div className="flex gap-1">
            {Array.from({ length: approvalProgress.required }, (_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < approvalProgress.approved ? "bg-green-500" : approvalProgress.rejected > 0 ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"}`} />
            ))}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {approvalProgress.rejected > 0
              ? "Rejected"
              : `${approvalProgress.approved}/${approvalProgress.required} approvals`}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button onClick={onRefresh} disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Approve button */}
        {canReview && (
          <button onClick={onApprove} disabled={isUpdating || hasUserApproved}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            title={hasUserApproved ? "You already approved — click Reject to change" : ""}>
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{approveLabel}</span>
          </button>
        )}

        {/* Reject button */}
        {canReview && onReject && (
          <button onClick={onReject} disabled={isUpdating || hasUserRejected}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            title={hasUserRejected ? "You already rejected — click Approve to change" : ""}>
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{rejectLabel}</span>
          </button>
        )}


        {isWaitingForPayment && onRecordPayment && (
          <button onClick={onRecordPayment} disabled={isUpdating}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#009985] rounded-lg transition-colors disabled:opacity-50"
            title="Record a bank transfer or offline payment for this application">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Record Payment</span>
          </button>
        )}

        {isPresident && isApproved && (
          <button onClick={onSign} disabled={isUpdating}
            className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50">
            <FileSignature className="w-4 h-4" />
            <span className="hidden sm:inline">Sign</span>
          </button>
        )}

        <button onClick={onDelete} disabled={isDeleting}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  );
}
