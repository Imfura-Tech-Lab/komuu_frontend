"use client";

import { ReactNode } from "react";

// ============================================================================
// Status Badge Component
// ============================================================================

export type StatusType =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled"
  | "failed"
  | "success"
  | "warning"
  | "info"
  | "draft"
  | "scheduled"
  | "ongoing"
  | "expired"
  | "revoked"
  | "under_review";

interface StatusConfig {
  label: string;
  className: string;
  dotColor?: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    dotColor: "bg-gray-500",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    dotColor: "bg-yellow-500",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    dotColor: "bg-red-500",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    dotColor: "bg-gray-500",
  },
  failed: {
    label: "Failed",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    dotColor: "bg-red-500",
  },
  success: {
    label: "Success",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    dotColor: "bg-green-500",
  },
  warning: {
    label: "Warning",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    dotColor: "bg-orange-500",
  },
  info: {
    label: "Info",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    dotColor: "bg-gray-500",
  },
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
  ongoing: {
    label: "Ongoing",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    dotColor: "bg-purple-500",
  },
  expired: {
    label: "Expired",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    dotColor: "bg-red-500",
  },
  revoked: {
    label: "Revoked",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    dotColor: "bg-red-500",
  },
  under_review: {
    label: "Under Review",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    dotColor: "bg-blue-500",
  },
};

interface StatusBadgeProps {
  status: StatusType | string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
  customLabel?: string;
  icon?: ReactNode;
}

export function StatusBadge({
  status,
  size = "sm",
  showDot = false,
  customLabel,
  icon,
}: StatusBadgeProps) {
  // Normalize status to lowercase and replace spaces with underscores
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "_") as StatusType;

  // Get config or use default
  const config = statusConfigs[normalizedStatus] || {
    label: status,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    dotColor: "bg-gray-500",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full
        ${sizeClasses[size]}
        ${config.className}
      `}
    >
      {showDot && (
        <span className={`${dotSizeClasses[size]} rounded-full ${config.dotColor}`} />
      )}
      {icon}
      {customLabel || config.label}
    </span>
  );
}

// ============================================================================
// Helper function to get status from string
// ============================================================================

export function getStatusType(status: string): StatusType {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  if (normalized in statusConfigs) {
    return normalized as StatusType;
  }
  return "inactive";
}

// ============================================================================
// Helper function for payment status
// ============================================================================

export function getPaymentStatusType(status: string): StatusType {
  const map: Record<string, StatusType> = {
    pending: "pending",
    completed: "completed",
    failed: "failed",
    refunded: "warning",
  };
  return map[status.toLowerCase()] || "inactive";
}

// ============================================================================
// Helper function for application status
// ============================================================================

export function getApplicationStatusType(status: string): StatusType {
  const map: Record<string, StatusType> = {
    pending: "pending",
    "under review": "under_review",
    approved: "approved",
    rejected: "rejected",
    "certificate generated": "completed",
  };
  return map[status.toLowerCase()] || "inactive";
}

// ============================================================================
// Helper function for certificate status
// ============================================================================

export function getCertificateStatusType(status: string): StatusType {
  const map: Record<string, StatusType> = {
    active: "active",
    pending: "pending",
    expired: "expired",
    revoked: "revoked",
  };
  return map[status.toLowerCase()] || "inactive";
}

// ============================================================================
// Helper function for event status
// ============================================================================

export function getEventStatusType(status: string): StatusType {
  const map: Record<string, StatusType> = {
    scheduled: "scheduled",
    ongoing: "ongoing",
    completed: "completed",
    cancelled: "cancelled",
    draft: "draft",
  };
  return map[status.toLowerCase()] || "inactive";
}

export default StatusBadge;
