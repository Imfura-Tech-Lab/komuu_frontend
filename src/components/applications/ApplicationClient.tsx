"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { PDFService } from "@/services/pdfService";
import { Application } from "@/types";
import ApplicationList from "@/components/applications/ApplicationList";
import PDFLoadingOverlay from "@/components/applications/PDFLoadingOverlay";
import MemberApplicationSheet from "@/components/applications/MemberApplicationSheet";
import { useApplications } from "@/lib/hooks/useApplications";
import { useApplicationFilters } from "@/lib/hooks/useApplicationFilters";
import {
  getStatusColor,
  formatDate,
  formatBoolean,
} from "@/lib/utils/applicationUtils";

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
  onClick,
  active,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: { value: number; isPositive: boolean };
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`w-full bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all text-left ${
        active
          ? "border-[#00B5A5] shadow-lg shadow-[#00B5A5]/10"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
              month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </button>
  );
}

// Loading Skeleton
function ApplicationsSkeleton() {
  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="w-64 h-8 mb-2 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse" />
              <div className="w-48 h-5 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="w-32 h-10 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse" />
              <div className="w-40 h-10 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-5 bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-20 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                  <div className="w-16 h-8 mt-2 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="p-4 mb-6 bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 bg-gray-200 rounded-lg h-11 dark:bg-gray-700 animate-pulse" />
            <div className="w-48 bg-gray-200 rounded-lg h-11 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-hidden bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse"
                />
              ))}
            </div>
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <div className="w-40 h-5 mb-2 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                  <div className="w-32 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded-full dark:bg-gray-700 animate-pulse" />
                <div className="w-24 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-28 dark:bg-gray-700 animate-pulse" />
                <div className="w-8 h-8 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl px-4 mx-auto">
        <div className="p-8 text-center bg-white border border-red-200 dark:bg-gray-800 rounded-2xl dark:border-red-900">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
            <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Error Loading Application
          </h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ userRole }: { userRole: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl px-4 mx-auto">
        <div className="p-12 text-center bg-white border border-gray-200 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full dark:bg-gray-700">
            <ClipboardDocumentListIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            No Application Found
          </h3>
          <p className="max-w-sm mx-auto mb-6 text-gray-600 dark:text-gray-400">
            {userRole === "Member"
              ? "You haven't submitted any applications yet. Start your membership journey today!"
              : "There are no membership applications to review at this time."}
          </p>
          {userRole === "Member" && (
            <button
              onClick={() => router.push("/apply")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              Start Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function ApplicationClient() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  const { applications, loading, error, userRole, fetchApplications } =
    useApplications();

  // Derive memberApplication from applications array for members
  const memberApplication = userRole === "Member" ? applications[0] : null;

  const {
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    filteredApplications,
    getStatusStats,
  } = useApplicationFilters(applications);

  const handleGenerateSinglePDF = async (application: Application) => {
    setIsGeneratingPDF(true);
    try {
      await PDFService.generateSingleApplicationPDF(application);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateAllPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await PDFService.generateAllApplicationsPDF(filteredApplications);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Loading State
  if (loading) {
    return <ApplicationsSkeleton />;
  }

  // Error State
  if (error) {
    return <ErrorState error={error} onRetry={fetchApplications} />;
  }

  // Member View - Show table with sheet
  if (userRole === "Member") {
    if (!memberApplication) {
      return <EmptyState userRole={userRole} />;
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Application
                </h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  View your membership application status and details
                </p>
              </div>
              <button
                onClick={fetchApplications}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowPathIcon
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Application Table */}
          <ApplicationList
            applications={applications}
            filteredApplications={applications}
            userRole={userRole}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            formatBoolean={formatBoolean}
            onGeneratePDF={handleGenerateSinglePDF}
            onViewDetails={() => setIsSheetOpen(true)}
          />

          {/* Member Application Sheet */}
          <MemberApplicationSheet
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            application={memberApplication}
            onRefresh={fetchApplications}
            isRefreshing={loading}
            onGeneratePDF={
              memberApplication.application_status
                ?.toLowerCase()
                .includes("certificate")
                ? () => handleGenerateSinglePDF(memberApplication as any)
                : undefined
            }
          />

          <PDFLoadingOverlay isVisible={isGeneratingPDF} />
        </div>
      </div>
    );
  }

  // Admin/Staff View - Show list view
  if (applications.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Applications Management
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {applications.length} total application
                {applications.length !== 1 ? "s" : ""} in the system
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchApplications}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowPathIcon
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <button
                onClick={handleGenerateAllPDF}
                disabled={isGeneratingPDF || filteredApplications.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={stats.total}
            icon={ClipboardDocumentListIcon}
            color="text-gray-900 dark:text-white"
            bgColor="bg-gray-100 dark:bg-gray-700"
            onClick={() => setFilterStatus("all")}
            active={filterStatus === "all"}
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={ClockIcon}
            color="text-amber-600 dark:text-amber-400"
            bgColor="bg-amber-100 dark:bg-amber-900/30"
            onClick={() => setFilterStatus("pending")}
            active={filterStatus === "pending"}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={CheckCircleIcon}
            color="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-100 dark:bg-emerald-900/30"
            onClick={() => setFilterStatus("approved")}
            active={filterStatus === "approved"}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircleIcon}
            color="text-red-600 dark:text-red-400"
            bgColor="bg-red-100 dark:bg-red-900/30"
            onClick={() => setFilterStatus("rejected")}
            active={filterStatus === "rejected"}
          />
        </div>

        {/* Filters */}
        <div className="p-4 mb-6 bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, membership type..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors min-w-[180px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="certificate generated">
                Certificate Generated
              </option>
            </select>
          </div>

          {/* Active Filters */}
          {(searchTerm || filterStatus !== "all") && (
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Filters:
              </span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="hover:text-red-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
                  Status: {filterStatus}
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="hover:text-red-500"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="text-sm text-[#00B5A5] hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredApplications.length} of {applications.length}{" "}
            application{applications.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-700">
              <FunnelIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              No Matching Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No applications match your current filters.
            </p>
          </div>
        ) : (
          <ApplicationList
            applications={applications}
            filteredApplications={filteredApplications}
            userRole={userRole}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            formatBoolean={formatBoolean}
            onGeneratePDF={handleGenerateSinglePDF}
          />
        )}

        {/* PDF Loading Overlay */}
        <PDFLoadingOverlay isVisible={isGeneratingPDF} />
      </div>
    </div>
  );
}
