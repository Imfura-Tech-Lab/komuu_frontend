"use client";

import { Application } from "@/types";
import ApplicationCard from "../dashboard/application-card";
import { useRouter } from "next/navigation";

interface ApplicationListProps {
  applications: Application[];
  filteredApplications: Application[];
  userRole: string;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
  formatBoolean: (value: boolean) => string;
  onGeneratePDF?: (application: Application) => void;
}

export default function ApplicationList({
  applications,
  filteredApplications,
  userRole,
  getStatusColor,
  formatDate,
  formatBoolean,
  onGeneratePDF,
}: ApplicationListProps) {
  const router = useRouter();
  const isSingleApplication = applications.length === 1;

  if (filteredApplications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">🔍</div>
        <h3 className="text-gray-900 dark:text-white font-medium mb-2">
          No applications match your filters
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {filteredApplications.map((application, index) => (
          <div key={application.id || index} className="relative">
            <ApplicationCard
              application={application}
              index={index}
              getStatusColor={getStatusColor}
              formatDate={formatDate}
              formatBoolean={formatBoolean}
              router={router}
              userRole={userRole}
            />
            {/* Individual PDF export button for each application */}
            {!isSingleApplication && onGeneratePDF && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => onGeneratePDF(application)}
                  className="inline-flex items-center px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-xs rounded-md transition-colors"
                  title="Export this application as PDF"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  PDF
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Results count for filtered view */}
      {!isSingleApplication && filteredApplications.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      )}
    </>
  );
}