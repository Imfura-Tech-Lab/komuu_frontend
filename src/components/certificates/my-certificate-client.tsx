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
}

interface Certificate {
  id: number;
  name: string;
  member_number: string;
  certificate: string | null;
  signed_date: string;
  valid_from: string;
  valid_until: string;
  next_payment_date: string;
  status: string;
  token: string;
  membership_term: string;
  created_at: string;
  payment?: Payment;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface CertificatesResponse {
  current_page: number;
  data: Certificate[];
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

interface CertificateCardProps {
  certificate: Certificate;
  onDownload: (certificate: Certificate) => void;
  onViewDetails: (certificate: Certificate) => void;
}

function CertificateCard({ certificate, onDownload, onViewDetails }: CertificateCardProps) {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const isExpired = () => {
    const validUntil = new Date(certificate.valid_until);
    const today = new Date();
    return validUntil < today;
  };

  const daysUntilExpiry = () => {
    const validUntil = new Date(certificate.valid_until);
    const today = new Date();
    const diffTime = validUntil.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = daysUntilExpiry();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-[#00B5A5] to-[#009985] p-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="font-bold text-lg">{certificate.membership_term}</h3>
            <p className="text-teal-100 text-sm">{certificate.member_number}</p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(certificate.status)}`}>
              {certificate.status}
            </span>
          </div>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="p-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Certificate Holder</p>
            <p className="font-medium text-gray-900 dark:text-white">{certificate.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valid From</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(certificate.valid_from)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valid Until</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(certificate.valid_until)}
              </p>
            </div>
          </div>

          {/* Validity Warning */}
          {isExpired() ? (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                Certificate Expired
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Expired {Math.abs(daysLeft)} days ago
              </p>
            </div>
          ) : daysLeft <= 30 ? (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
              <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
                Expiring Soon
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {daysLeft} days remaining
              </p>
            </div>
          ) : (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                Valid Certificate
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {daysLeft} days remaining
              </p>
            </div>
          )}

          {/* Next Payment Due */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Next Payment Due</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(certificate.next_payment_date)}
            </p>
          </div>

          {/* Payment Info */}
          {certificate.payment && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Amount: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.payment.amount_paid}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Method: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.payment.payment_method}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onViewDetails(certificate)}
            className="flex-1 px-3 py-2 text-sm border border-[#00B5A5] text-[#00B5A5] hover:bg-[#00B5A5] hover:text-white rounded-md transition-colors"
          >
            View Details
          </button>
          {certificate.certificate ? (
            <button
              onClick={() => onDownload(certificate)}
              className="flex-1 px-3 py-2 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
            >
              Download
            </button>
          ) : (
            <button
              disabled
              className="flex-1 px-3 py-2 text-sm bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
            >
              Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CertificateDetailsModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

function CertificateDetailsModal({ certificate, onClose }: CertificateDetailsModalProps) {
  if (!certificate) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Certificate Details
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

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificate ID</p>
              <p className="font-medium text-gray-900 dark:text-white">{certificate.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member Number</p>
              <p className="font-medium text-gray-900 dark:text-white">{certificate.member_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Membership Term</p>
              <p className="font-medium text-gray-900 dark:text-white">{certificate.membership_term}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                certificate.status === "Approved" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
              }`}>
                {certificate.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Certificate Token</p>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1">
                {certificate.token}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(certificate.token)}
                className="px-2 py-1 text-xs bg-[#00B5A5] hover:bg-[#009985] text-white rounded"
              >
                Copy
              </button>
            </div>
          </div>

          {certificate.payment && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Payment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Amount: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.payment.amount_paid}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Method: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.payment.payment_method}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Transaction: </span>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
                    {certificate.payment.transaction_number}
                  </code>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Gateway: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {certificate.payment.gateway}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-600 dark:text-gray-400">Payment Date: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(certificate.payment.payment_date)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyCertificatesClient() {
  const [certificatesData, setCertificatesData] = useState<CertificatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCertificates(currentPage);
  }, [currentPage]);

  const fetchCertificates = async (page: number = 1) => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view certificates");
        return;
      }

      console.group(`Certificates API Request - Page ${page}`);
      console.log("API URL:", `${apiUrl}membership/certificates?page=${page}`);
      console.log("Request timestamp:", new Date().toISOString());

      const response = await fetch(
        `${apiUrl}membership/certificates?page=${page}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status === "success") {
        setCertificatesData(responseData.data);
      } else {
        throw new Error(responseData.message || "Failed to fetch certificates");
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", {
        page,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
      setError(
        err instanceof Error ? err.message : "Failed to fetch certificates"
      );
      showErrorToast("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    if (!certificate.certificate) {
      showErrorToast("Certificate file not available");
      return;
    }

    try {
      setDownloadingId(certificate.id);

      // If certificate.certificate is a URL, open it
      if (certificate.certificate.startsWith("http")) {
        window.open(certificate.certificate, "_blank");
      } else {
        // If it's a file path, construct the download URL
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        const downloadUrl = `${apiUrl}download/certificate/${certificate.certificate}`;
        window.open(downloadUrl, "_blank");
      }

      showSuccessToast("Certificate download initiated");
    } catch (err) {
      console.error("Download error:", err);
      showErrorToast("Failed to download certificate");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleViewDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
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

  const getCertificateStats = () => {
    if (!certificatesData?.data)
      return { total: 0, approved: 0, pending: 0, active: 0, expired: 0 };

    const stats = certificatesData.data.reduce(
      (acc, cert) => {
        acc.total++;
        if (cert.status === "Approved") acc.approved++;
        if (cert.status === "Pending") acc.pending++;

        const validUntil = new Date(cert.valid_until);
        const today = new Date();
        if (validUntil < today) acc.expired++;
        else acc.active++;

        return acc;
      },
      { total: 0, approved: 0, pending: 0, active: 0, expired: 0 }
    );

    return stats;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (!certificatesData || certificatesData.last_page <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {certificatesData.from} to {certificatesData.to} of{" "}
          {certificatesData.total} certificates
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!certificatesData.prev_page_url}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {Array.from(
            { length: certificatesData.last_page },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                page === certificatesData.current_page
                  ? "bg-[#00B5A5] text-white"
                  : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!certificatesData.next_page_url}
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
              Loading your certificates...
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
              Error Loading Certificates
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              // @ts-ignore
              onClick={fetchCertificates}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getCertificateStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Certificates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your membership certificates
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.approved}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.active}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.pending}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.expired}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
          </div>
        </div>

        {/* Certificates Grid */}
        {!certificatesData?.data || certificatesData.data.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              📜
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              No Certificates Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You don't have any certificates yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificatesData.data.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                  onDownload={handleDownload}
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
            onClick={() => fetchCertificates(currentPage)}
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
            Refresh Certificates
          </button>
        </div>

        {/* Certificate Details Modal */}
        <CertificateDetailsModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      </div>
    </div>
  );
}