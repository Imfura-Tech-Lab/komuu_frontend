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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchApplications} />;
  }

  if (applications.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

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

