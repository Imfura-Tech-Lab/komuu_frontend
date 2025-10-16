import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "cancelled":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    default:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  }
};

export type PaymentMethodIcon =
  | "credit-card"
  | "bank-transfer"
  | "mobile-money"
  | "default";

export const getMethodIconType = (method: string): PaymentMethodIcon => {
  switch (method.toLowerCase()) {
    case "credit card":
      return "credit-card";
    case "bank transfer":
      return "bank-transfer";
    case "mobile money":
      return "mobile-money";
    default:
      return "default";
  }
};

// SVG path data for each icon type
export const PAYMENT_ICON_PATHS: Record<PaymentMethodIcon, string> = {
  "credit-card":
    "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  "bank-transfer":
    "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
  "mobile-money":
    "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
  default:
    "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
};

export const copyToClipboard = async (
  text: string,
  fieldName: string
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    showSuccessToast(`${fieldName} copied to clipboard`);
    return true;
  } catch (err) {
    showErrorToast(`Failed to copy ${fieldName}`);
    return false;
  }
};
