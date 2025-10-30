import { CheckCircle } from "lucide-react";
import { CollapsibleSection } from "./CollapsibleSection";
import { ApprovalRecord } from "@/types/application.types";

// ============================================================================
// APPROVAL HISTORY SECTION COMPONENT
// ============================================================================

interface ApprovalHistorySectionProps {
  approvals: ApprovalRecord[];
}

export function ApprovalHistorySection({
  approvals,
}: ApprovalHistorySectionProps) {
  // Don't render if no approvals
  if (!approvals || approvals.length === 0) {
    return null;
  }

  // Format date helper
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
    <CollapsibleSection
      title="Approval History"
      icon={<CheckCircle className="w-5 h-5 text-[#00B5A5]" />}
    >
      <div className="space-y-3">
        {approvals
          .sort(
            (a, b) =>
              new Date(b.approved_at).getTime() -
              new Date(a.approved_at).getTime()
          )
          .map((approval, index) => (
            <div
              key={`approval-${approval.id}-${approval.approved_at}-${index}`}
              className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {approval.approved_by}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {approval.comments}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {formatDate(approval.approved_at)}
                </p>
              </div>
            </div>
          ))}
      </div>
    </CollapsibleSection>
  );
}