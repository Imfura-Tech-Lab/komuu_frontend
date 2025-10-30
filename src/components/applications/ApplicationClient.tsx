"use client";
import { useState } from "react";
import { PDFService } from "@/services/pdfService";
import { Application } from "@/types";
import ApplicationHeader from "@/components/applications/ApplicationHeader";
import ApplicationStats from "@/components/applications/ApplicationStats";
import ApplicationFilters from "@/components/applications/ApplicationFilters";
import ApplicationList from "@/components/applications/ApplicationList";
import EmptyState from "@/components/applications/EmptyState";
import LoadingSpinner from "@/components/applications/LoadingSpinner";
import ErrorState from "@/components/applications/ErrorState";
import PDFLoadingOverlay from "@/components/applications/PDFLoadingOverlay";
import { useApplications } from "@/lib/hooks/useApplications";
import { useApplicationFilters } from "@/lib/hooks/useApplicationFilters";
import { getStatusColor, formatDate, formatBoolean } from "@/lib/utils/applicationUtils";

export default function ApplicationClient() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const {
    applications,
    loading,
    error,
    userRole,
    fetchApplications,
  } = useApplications();

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

  // ============================================================================
  // SKELETON LOADING STATE
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-3">
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="w-full md:w-48">
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Applications List Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="col-span-1">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Table Rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="col-span-1 flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="mt-6 flex items-center justify-between">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error) {
    return <ErrorState error={error} onRetry={fetchApplications} />;
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================
  if (applications.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

  // ============================================================================
  // MAIN CONTENT
  // ============================================================================
  const stats = getStatusStats();
  const isSingleApplication = applications.length === 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ApplicationHeader
          applications={applications}
          isSingleApplication={isSingleApplication}
          userRole={userRole}
          loading={loading}
          isGeneratingPDF={isGeneratingPDF}
          onRefresh={fetchApplications}
          onGenerateSinglePDF={handleGenerateSinglePDF}
          onGenerateAllPDF={handleGenerateAllPDF}
        />

        {/* Statistics Overview - Only show for multiple applications */}
        {!isSingleApplication && (
          <>
            <ApplicationStats stats={stats} />
            
            {/* Filters */}
            <ApplicationFilters
              searchTerm={searchTerm}
              filterStatus={filterStatus}
              onSearchChange={setSearchTerm}
              onStatusChange={setFilterStatus}
            />
          </>
        )}

        {/* Applications List */}
        <ApplicationList
          applications={applications}
          filteredApplications={filteredApplications}
          userRole={userRole}
          getStatusColor={getStatusColor}
          formatDate={formatDate}
          formatBoolean={formatBoolean}
          onGeneratePDF={handleGenerateSinglePDF}
        />

        {/* PDF Loading Overlay */}
        <PDFLoadingOverlay isVisible={isGeneratingPDF} />
      </div>
    </div>
  );
}