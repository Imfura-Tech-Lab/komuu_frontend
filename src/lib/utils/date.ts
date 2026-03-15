// ============================================================================
// Standardized Date Formatting Utilities
// ============================================================================

export type DateFormatStyle = "short" | "medium" | "long" | "full" | "relative";

export interface FormatDateOptions {
  style?: DateFormatStyle;
  includeTime?: boolean;
  locale?: string;
}

// ============================================================================
// Core Format Function
// ============================================================================

export function formatDate(
  date: string | Date | null | undefined,
  options: FormatDateOptions = {}
): string {
  const { style = "medium", includeTime = false, locale = "en-US" } = options;

  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Invalid Date";
    }

    // Relative formatting
    if (style === "relative") {
      return formatRelativeDate(dateObj);
    }

    // Standard formatting
    const dateOptions: Intl.DateTimeFormatOptions = getDateFormatOptions(style);

    if (includeTime) {
      dateOptions.hour = "2-digit";
      dateOptions.minute = "2-digit";
    }

    return new Intl.DateTimeFormat(locale, dateOptions).format(dateObj);
  } catch {
    return "Invalid Date";
  }
}

// ============================================================================
// Format Options by Style
// ============================================================================

function getDateFormatOptions(style: DateFormatStyle): Intl.DateTimeFormatOptions {
  switch (style) {
    case "short":
      return {
        year: "2-digit",
        month: "numeric",
        day: "numeric",
      };
    case "medium":
      return {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
    case "long":
      return {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
    case "full":
      return {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
    default:
      return {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
  }
}

// ============================================================================
// Relative Date Formatting
// ============================================================================

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Future dates
  if (diffInSeconds < 0) {
    const absDiffInDays = Math.abs(diffInDays);
    if (absDiffInDays === 0) return "Today";
    if (absDiffInDays === 1) return "Tomorrow";
    if (absDiffInDays < 7) return `In ${absDiffInDays} days`;
    if (absDiffInDays < 30) return `In ${Math.abs(diffInWeeks)} weeks`;
    return formatDate(dateObj, { style: "medium" });
  }

  // Past dates
  if (diffInSeconds < 60) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  if (diffInYears === 1) return "1 year ago";
  return `${diffInYears} years ago`;
}

// ============================================================================
// Specific Format Functions
// ============================================================================

export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, { style: "medium", includeTime: true });
}

export function formatShortDate(date: string | Date | null | undefined): string {
  return formatDate(date, { style: "short" });
}

export function formatLongDate(date: string | Date | null | undefined): string {
  return formatDate(date, { style: "long" });
}

export function formatFullDate(date: string | Date | null | undefined): string {
  return formatDate(date, { style: "full" });
}

// ============================================================================
// Time Only Formatting
// ============================================================================

export function formatTime(
  date: string | Date | null | undefined,
  options: { hour12?: boolean } = {}
): string {
  const { hour12 = true } = options;

  if (!date) return "N/A";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Invalid Time";
    }

    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12,
    }).format(dateObj);
  } catch {
    return "Invalid Time";
  }
}

// ============================================================================
// Date Range Formatting
// ============================================================================

export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  options: FormatDateOptions = {}
): string {
  const start = formatDate(startDate, options);
  const end = formatDate(endDate, options);

  if (start === end) return start;
  if (start === "N/A" && end === "N/A") return "N/A";
  if (start === "N/A") return `Until ${end}`;
  if (end === "N/A") return `From ${start}`;

  return `${start} - ${end}`;
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
}

export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
}

export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
}

export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

export function getDaysUntil(date: string | Date): number {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysSince(date: string | Date): number {
  return -getDaysUntil(date);
}
