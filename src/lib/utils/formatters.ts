// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatBoolean = (value: boolean | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return value ? "Yes" : "No";
};

export const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus === "approved") {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  }
  if (normalizedStatus === "rejected") {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
  if (normalizedStatus === "under review" || normalizedStatus === "under_review") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  }
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
};