"use client";

import { useState } from "react";
import { PaymentPDFService } from "@/services/paymentPDFService";
import PaymentHeader from "@/components/payments/PaymentHeader";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentList from "@/components/payments/PaymentList";
import PaymentDetailsModal from "@/components/payments/PaymentDetailsModal";
import PaymentPagination from "@/components/payments/PaymentPagination";
import LoadingSpinner from "@/components/applications/LoadingSpinner";
import ErrorState from "@/components/applications/ErrorState";
import PDFLoadingOverlay from "@/components/applications/PDFLoadingOverlay";
import { usePaymentFilters } from "@/lib/hooks/usePaymentFilters";
import { usePayments } from "@/lib/hooks/usePayments";
import { Payment } from "@/types/payment";

export default function MyPaymentsClient() {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const {
    paymentsData,
    loading,
    error,
    currentPage,
    handlePageChange,
    refetch,
  } = usePayments();

  const {
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    filteredPayments,
    getPaymentStats,
  } = usePaymentFilters(paymentsData?.data || []);

  // Modal handlers
  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  const handleCloseModal = () => {
    setSelectedPayment(null);
  };

  // PDF generation handlers
  const handleGenerateSinglePDF = async (payment: Payment) => {
    setIsGeneratingPDF(true);
    try {
      await PaymentPDFService.generateSinglePaymentPDF(payment);
    } catch (error) {
      console.error("Failed to generate payment PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateReportPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const stats = getPaymentStats();
      const filters = { statusFilter, searchTerm, dateRange };
      await PaymentPDFService.generatePaymentReportPDF(filteredPayments, stats, filters);
    } catch (error) {
      console.error("Failed to generate payment report:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Early returns for different states
  if (loading) {
    return <LoadingSpinner message="Loading your payments..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!paymentsData || paymentsData.data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PaymentHeader
            totalPayments={0}
            isGeneratingPDF={false}
            onRefresh={refetch}
          />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">💳</div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              No Payments Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You don't have any payment records yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const stats = getPaymentStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <PaymentHeader
          totalPayments={paymentsData.total}
          isGeneratingPDF={isGeneratingPDF}
          onRefresh={refetch}
          onGenerateReport={handleGenerateReportPDF}
        />

        {/* Statistics Cards */}
        <PaymentStats stats={stats} />

        {/* Filters */}
        <PaymentFilters
          statusFilter={statusFilter}
          searchTerm={searchTerm}
          dateRange={dateRange}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchTerm}
          onDateRangeChange={setDateRange}
          resultsCount={filteredPayments.length}
          totalCount={paymentsData.total}
        />

        {/* Payments List */}
        <PaymentList
          payments={filteredPayments}
          onViewDetails={handleViewDetails}
          onGeneratePDF={handleGenerateSinglePDF}
        />

        {/* Pagination */}
        <PaymentPagination
          paymentsData={paymentsData}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />

        {/* Payment Details Modal */}
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={handleCloseModal}
        />

        {/* PDF Loading Overlay */}
        <PDFLoadingOverlay isVisible={isGeneratingPDF} />
      </div>
    </div>
  );
}

