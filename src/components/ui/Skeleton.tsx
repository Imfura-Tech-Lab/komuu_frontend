"use client";

import { ReactNode } from "react";

// ============================================================================
// Base Skeleton Component
// ============================================================================

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export function Skeleton({ className = "", children }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Skeleton Variants
// ============================================================================

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return <Skeleton className={`rounded-full ${sizeClasses[size]}`} />;
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  return <SkeletonCircle size={size} />;
}

export function SkeletonButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return <Skeleton className={`rounded-lg ${sizeClasses[size]}`} />;
}

export function SkeletonInput() {
  return <Skeleton className="h-10 w-full rounded-lg" />;
}

export function SkeletonCard({ hasImage = false }: { hasImage?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      {hasImage && <Skeleton className="h-40 w-full rounded-lg" />}
      <SkeletonText lines={2} />
      <div className="flex items-center space-x-2">
        <SkeletonAvatar size="sm" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// ============================================================================
// Table Skeleton
// ============================================================================

export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3 text-left">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonTableRow key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Stats Card Skeleton
// ============================================================================

export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
        <SkeletonCircle size="lg" />
      </div>
    </div>
  );
}

export function SkeletonStatsGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// List Skeleton
// ============================================================================

export function SkeletonListItem() {
  return (
    <div className="flex items-center space-x-4 p-4 animate-pulse">
      <SkeletonAvatar />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// Search Bar Skeleton
// ============================================================================

export function SkeletonSearchBar() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <Skeleton className="flex-1 w-full h-10 rounded-lg" />
        <Skeleton className="w-full md:w-32 h-10 rounded-lg" />
        <Skeleton className="w-full md:w-32 h-10 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// Page Header Skeleton
// ============================================================================

export function SkeletonPageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between animate-pulse">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="mt-4 sm:mt-0">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// Full Page Loading Skeleton
// ============================================================================

export function SkeletonPage() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <SkeletonStatsGrid />
      <SkeletonSearchBar />
      <SkeletonTable />
    </div>
  );
}

// ============================================================================
// Form Skeleton
// ============================================================================

export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex justify-end space-x-3 pt-4">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
}

// ============================================================================
// Grid Skeleton
// ============================================================================

export function SkeletonGrid({
  items = 6,
  columns = 3,
  hasImage = true,
}: {
  items?: number;
  columns?: 2 | 3 | 4;
  hasImage?: boolean;
}) {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-6 ${columnClasses[columns]}`}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} hasImage={hasImage} />
      ))}
    </div>
  );
}

export default Skeleton;
