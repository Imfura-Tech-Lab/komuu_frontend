"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

interface Certificate {
  id: number;
  name?: string;
  member_number?: string;
  certificate_number?: string;
  status: string;
  valid_from?: string;
  valid_until?: string;
  membership_term?: string;
  issued_date?: string;
  created_at?: string;
  updated_at?: string;
  payment_id?: number;
  token?: string;
  next_payment_date?: string;
  payment?: {
    id: number;
    member: string;
    amount_paid: string;
    payment_method: string;
    transaction_number: string;
    gateway: string;
    status: string;
    payment_date: string;
  };
}

interface UserData {
  role: string;
}

interface CertificateCardProps {
  certificate: Certificate;
  onCertificateClick: (certificateId: number) => void;
  onViewPaymentClick: (paymentId: number) => void;
  getStatusColor: (status: string) => string;
  formatDate: (dateString?: string) => string;
  formatDateTime: (dateString?: string) => string;
  userRole: string | null;
}

function CertificateCard({
  certificate,
  onCertificateClick,
  onViewPaymentClick,
  getStatusColor,
  formatDate,
  formatDateTime,
  userRole,
}: CertificateCardProps) {
  // Generate a display identifier that's more user-friendly than ID
  const displayIdentifier =
    certificate.certificate_number ||
    certificate.member_number ||
    `Certificate #${certificate.id.toString().padStart(4, "0")}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <button
              onClick={() => onCertificateClick(certificate.id)}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#00B5A5] transition-colors text-left"
            >
              {displayIdentifier}
            </button>

            {certificate.name && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {certificate.name}
              </p>
            )}

            {certificate.membership_term && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Membership Term: {certificate.membership_term}
              </p>
            )}
          </div>

          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              certificate.status
            )}`}
          >
            {certificate.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
          {certificate.valid_from && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Valid From</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(certificate.valid_from)}
              </p>
            </div>
          )}

          {certificate.valid_until && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Valid Until</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(certificate.valid_until)}
              </p>
            </div>
          )}

          {certificate.next_payment_date && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                Next Payment Due
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(certificate.next_payment_date)}
              </p>
            </div>
          )}

          {certificate.issued_date && (
            <div>
              <p className="text-gray-500 dark:text-gray-400">Issued Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(certificate.issued_date)}
              </p>
            </div>
          )}
        </div>

        {certificate.payment && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Payment Information
              </p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  certificate.payment.status === "Completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                }`}
              >
                {certificate.payment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Amount</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {certificate.payment.amount_paid}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Method</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {certificate.payment.payment_method}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Transaction</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {certificate.payment.transaction_number}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDateTime(certificate.payment.payment_date)}
                </p>
              </div>
            </div>

            <button
              onClick={() => onViewPaymentClick(certificate.payment!.id)}
              className="mt-3 w-full text-xs text-[#00B5A5] hover:underline flex items-center justify-center"
            >
              View Full Payment Details
              <svg
                className="w-3 h-3 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        )}

        {certificate.token && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Verification Token
            </p>
            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all">
              {certificate.token}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CertificatesClient() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    const parsedUserData: UserData | null = userData
      ? JSON.parse(userData)
      : null;
    const role = parsedUserData?.role || null;
    setUserRole(role);

    if (role !== null) {
      fetchCertificates(role);
    }
  }, [userRole]);

  const fetchCertificates = async (role: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view certificates");
        router.push("/login");
        return;
      }

      if (!apiUrl) {
        showErrorToast("Backend API URL is not configured.");
        setError("Configuration error: Backend API URL missing.");
        return;
      }

      const endpoint =
        role === "Member"
          ? `${apiUrl}membership/certificates`
          : `${apiUrl}certificates`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const certificatesData = data.data?.data || data.data || [];
        setCertificates(
          Array.isArray(certificatesData)
            ? certificatesData.map((cert: any) => ({
                id: cert.id,
                name: cert.name,
                member_number: cert.member_number,
                certificate_number: cert.certificate_number,
                status: cert.status,
                valid_from: cert.valid_from,
                valid_until: cert.valid_until,
                membership_term: cert.membership_term,
                issued_date: cert.signed_date,
                next_payment_date: cert.next_payment_date,
                created_at: cert.created_at,
                updated_at: cert.updated_at,
                token: cert.token,
                payment: cert.payment
                  ? {
                      id: cert.payment.id,
                      member: cert.payment.member,
                      amount_paid: cert.payment.amount_paid,
                      payment_method: cert.payment.payment_method,
                      transaction_number: cert.payment.transaction_number,
                      gateway: cert.payment.gateway,
                      status: cert.payment.status,
                      payment_date: cert.payment.payment_date,
                    }
                  : undefined,
              }))
            : []
        );
      } else {
        throw new Error(data.message || "Failed to fetch certificates");
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch certificates"
      );
      showErrorToast("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "valid":
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "revoked":
      case "abandoned":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
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

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleCertificateClick = (certificateId: number) => {
    const detailPath =
      userRole === "Member"
        ? `/my-certificates/${certificateId}`
        : `/certificates/${certificateId}`;
    router.push(detailPath);
  };

  const handleViewPayment = (paymentId: number) => {
    const paymentPath =
      userRole === "Member"
        ? `/my-payments/${paymentId}`
        : `/payments/${paymentId}`;
    router.push(paymentPath);
  };

  const filteredCertificates = certificates.filter((certificate) => {
    const matchesSearch =
      certificate.certificate_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      certificate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.member_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      certificate.membership_term
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      certificate.payment?.transaction_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      certificate.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    const stats = certificates.reduce(
      (acc, cert) => {
        const status = cert.status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        acc.total++;
        return acc;
      },
      {
        total: 0,
        active: 0,
        expired: 0,
        suspended: 0,
        revoked: 0,
        abandoned: 0,
        pending: 0,
        valid: 0,
        approved: 0,
      } as Record<string, number>
    );
    return stats;
  };

  const stats = getStatusStats();

  if (loading || userRole === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {userRole === null
                ? "Determining user role..."
                : "Loading certificates..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              ⚠️
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Certificates
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={() => fetchCertificates(userRole)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Certificates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {userRole === "Member"
              ? "Your membership certificates"
              : "Manage all membership certificates"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Certificates
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(stats.active || 0) + (stats.valid || 0) + (stats.approved || 0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active/Approved
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.expired || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Expired</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.suspended || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Suspended
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Search Certificates
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by certificate number, member name, transaction..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="valid">Valid</option>
                <option value="approved">Approved</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
                <option value="revoked">Revoked</option>
                <option value="abandoned">Abandoned</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCertificates.length} of {certificates.length}{" "}
            certificates
          </p>
        </div>

        {filteredCertificates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              📜
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              No Certificates Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No certificates are available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onCertificateClick={handleCertificateClick}
                onViewPaymentClick={handleViewPayment}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                formatDateTime={formatDateTime}
                userRole={userRole}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => fetchCertificates(userRole)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
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
      </div>
    </div>
  );
}
