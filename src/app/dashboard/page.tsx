"use client";

import BoardDashboard from "@/components/dashboard/board-dashboard";
import MemberDashboard from "@/components/dashboard/member-dashboard";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import { useDashboardData } from "@/lib/hooks/useDashboardData";

const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
      ))}
    </div>
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
  </div>
);

const DashboardError = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center max-w-md">
      <div className="mb-4">
        <svg
          className="w-16 h-16 mx-auto text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Dashboard Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-[#00B5A5] hover:bg-[#008F82] text-white rounded-md font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading) {
    return (
      <SecureDashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <DashboardSkeleton />
        </div>
      </SecureDashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <SecureDashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <DashboardError error={error || new Error('No data')} retry={refetch} />
        </div>
      </SecureDashboardLayout>
    );
  }

  return (
    <SecureDashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        {data.role === "board" ? (
          <BoardDashboard data={data.data} message={data.message} refetch={refetch} />
        ) : (
          <MemberDashboard data={data.data} message={data.message} refetch={refetch} />
        )}
      </div>
    </SecureDashboardLayout>
  );
}