"use client";

import { useState, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";

interface Payment {
  id: number;
  member: string;
  amount_paid: string;
  payment_method: string;
  transaction_number: string;
  gateway: string;
  status: string;
  is_certificate_generated: boolean;
  payment_date: string;
  created_at?: string;
  updated_at?: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaymentsResponse {
  current_page: number;
  data: Payment[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface PaymentCardProps {
  payment: Payment;
  onViewDetails: (payment: Payment) => void;
}

function PaymentCard({ payment, onViewDetails }: PaymentCardProps) {
  const [copying, setCopying] = useState(false);

  const formatDate = (dateString: string) => {
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

  const handleCopyTransaction = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(payment.transaction_number);
      showSuccessToast("Transaction number copied to clipboard");
    } catch (err) {
      showErrorToast("Failed to copy transaction number");
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const getStatusColor = (status: string) => {
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

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "credit card":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "bank transfer":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case "mobile money":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Payment Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-[#00B5A5]">
              {getMethodIcon(payment.payment_method)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {payment.amount_paid}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {payment.payment_method}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
            {payment.status}
          </span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Member Number</p>
            <p className="font-medium text-gray-900 dark:text-white">{payment.member}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Payment Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(payment.payment_date)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Transaction Number</p>
          <div className="flex items-center space-x-2 mt-1">
            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1">
              {payment.transaction_number}
            </code>
            <button
              onClick={handleCopyTransaction}
              disabled={copying}
              className="px-2 py-1 text-xs bg-[#00B5A5] hover:bg-[#009985] text-white rounded transition-colors disabled:opacity-50"
              title="Copy transaction number"
            >
              {copying ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Gateway</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{payment.gateway}</p>
          </div>
          
          {payment.is_certificate_generated && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">Certificate Generated</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => onViewDetails(payment)}
            className="w-full px-3 py-2 text-sm border border-[#00B5A5] text-[#00B5A5] hover:bg-[#00B5A5] hover:text-white rounded-md transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => window.location.href = `/my-payments/${payment.id}`}
            className="w-full px-3 py-2 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
          >
            View Full Payment
          </button>
        </div>
      </div>
    </div>
  );
}

interface PaymentDetailsModalProps {
  payment: Payment | null;
  onClose: () => void;
}

function PaymentDetailsModal({ payment, onClose }: PaymentDetailsModalProps) {
  const [copyingField, setCopyingField] = useState<string | null>(null);

  if (!payment) return null;

  const formatDateTime = (dateString: string) => {
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

  const handleCopy = async (text: string, fieldName: string) => {
    setCopyingField(fieldName);
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`${fieldName} copied to clipboard`);
    } catch (err) {
      showErrorToast(`Failed to copy ${fieldName}`);
    } finally {
      setTimeout(() => setCopyingField(null), 1000);
    }
  };

  const handleCopyAll = async () => {
    setCopyingField("all");
    const paymentInfo = `
Payment ID: ${payment.id}
Member: ${payment.member}
Amount: ${payment.amount_paid}
Method: ${payment.payment_method}
Transaction: ${payment.transaction_number}
Gateway: ${payment.gateway}
Status: ${payment.status}
Date: ${formatDateTime(payment.payment_date)}
Certificate Generated: ${payment.is_certificate_generated ? 'Yes' : 'No'}
    `.trim();
    
    try {
      await navigator.clipboard.writeText(paymentInfo);
      showSuccessToast("Payment details copied to clipboard");
    } catch (err) {
      showErrorToast("Failed to copy payment details");
    } finally {
      setTimeout(() => setCopyingField(null), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID</p>
                <p className="font-medium text-gray-900 dark:text-white">{payment.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{payment.member}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
                <p className="font-semibold text-lg text-green-600 dark:text-green-400">{payment.amount_paid}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                <p className="font-medium text-gray-900 dark:text-white">{payment.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gateway</p>
                <p className="font-medium text-gray-900 dark:text-white">{payment.gateway}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  payment.status === "Completed" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : payment.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {payment.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Number</p>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded flex-1">
                  {payment.transaction_number}
                </code>
                <button
                  onClick={() => handleCopy(payment.transaction_number, "Transaction number")}
                  disabled={copyingField === "Transaction number"}
                  className="px-3 py-2 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded disabled:opacity-50"
                >
                  {copyingField === "Transaction number" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Payment Date</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(payment.payment_date)}</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Certificate Generation Status
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  payment.is_certificate_generated 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-orange-600 dark:text-orange-400"
                }`}>
                  {payment.is_certificate_generated ? "Generated" : "Not Generated"}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCopyAll}
                disabled={copyingField === "all"}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
              >
                {copyingField === "all" ? "Copied!" : "Copy All Details"}
              </button>
              <button
                onClick={() => window.location.href = `/payments/${payment.id}`}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                View Full Payment
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyPaymentsClient() {
  const [paymentsData, setPaymentsData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage]);

  const fetchPayments = async (page: number = 1) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view payments");
        return;
      }

      console.group(`Payments API Request - Page ${page}`);
      console.log("API URL:", `${apiUrl}membership/payments?page=${page}`);
      console.log("Request timestamp:", new Date().toISOString());

      const response = await fetch(`${apiUrl}membership/payments?page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status === "success") {
        setPaymentsData(responseData.data);
      } else {
        throw new Error(responseData.message || "Failed to fetch payments");
      }
    } catch (err) {
      console.error("Failed to fetch payments:", {
        page,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
      setError(err instanceof Error ? err.message : "Failed to fetch payments");
      showErrorToast("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPaymentStats = () => {
    if (!paymentsData?.data) return { total: 0, completed: 0, pending: 0, failed: 0, totalAmount: 0 };
    
    const stats = paymentsData.data.reduce((acc, payment) => {
      acc.total++;
      if (payment.status === "Completed") acc.completed++;
      if (payment.status === "Pending") acc.pending++;
      if (payment.status === "Failed") acc.failed++;
      
      // Extract numeric amount from string like "50.00 USD"
      const amount = parseFloat(payment.amount_paid.split(' ')[0]);
      if (!isNaN(amount)) acc.totalAmount += amount;
      
      return acc;
    }, { total: 0, completed: 0, pending: 0, failed: 0, totalAmount: 0 });
    
    return stats;
  };

  const filteredPayments = paymentsData?.data.filter(payment => {
    if (statusFilter === "all") return true;
    return payment.status.toLowerCase() === statusFilter.toLowerCase();
  }) || [];

  const formatDate = (dateString: string) => {
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

  const formatDateTime = (dateString: string) => {
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

  const renderPagination = () => {
    if (!paymentsData || paymentsData.last_page <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {paymentsData.from} to {paymentsData.to} of {paymentsData.total} payments
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!paymentsData.prev_page_url}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: paymentsData.last_page }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                page === paymentsData.current_page
                  ? "bg-[#00B5A5] text-white"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!paymentsData.next_page_url}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading your payments...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              ⚠️
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Payments
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={() => fetchPayments(currentPage)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your payment history and transaction details
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.failed}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-[#00B5A5]">
              ${stats.totalAmount.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Grid */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              💳
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              No Payments Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {statusFilter !== "all" 
                ? "No payments found with the selected status filter." 
                : "You don't have any payment records yet."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredPayments.length} of {paymentsData?.total || 0} payments
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchPayments(currentPage)}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Payments
          </button>
        </div>

        {/* Payment Details Modal */}
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      </div>
    </div>
  );
}