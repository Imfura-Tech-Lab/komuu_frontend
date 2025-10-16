"use client";

import { useRouter } from "next/navigation";

interface EmptyStateProps {
  userRole: string;
  message?: string;
}

export default function EmptyState({ userRole, message }: EmptyStateProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📋</div>
          <h3 className="text-gray-900 dark:text-white font-medium mb-2 text-xl">
            No Applications Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            {message || (userRole === "Member"
              ? "You haven't submitted an application yet."
              : "No applications are available to review at this time.")}
          </p>
          {userRole === "Member" && (
            <button
              onClick={() => router.push("/apply")}
              className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}