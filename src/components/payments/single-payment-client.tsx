"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

interface Payment {
  id: number;
  member: string; // This is likely the member ID
  amount_paid: string;
  payment_method: string;
  transaction_number: string;
  gateway: string;
  status: string;
  is_certificate_generated: boolean;
  payment_date: string;
  created_at?: string;
  updated_at?: string;
  description?: string;
  currency?: string;
  reference?: string;
  receipt_url?: string;
}

interface UserData {
  role: string;
  // Add other user properties you might need here
}

interface SinglePaymentClientProps {
  paymentId: string;
}

export default function SinglePaymentClient({
  paymentId,
}: SinglePaymentClientProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Store user role

  const router = useRouter();

  // Effect to determine user role and fetch payment
  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    const parsedUserData: UserData | null = userData
      ? JSON.parse(userData)
      : null;
    const role = parsedUserData?.role || null;
    setUserRole(role);

    // Only fetch payment if we have a paymentId and user role is determined
    if (paymentId && role !== null) {
      fetchPayment(role);
    }
  }, [paymentId, userRole]); // Re-run when paymentId or userRole changes

  const fetchPayment = async (role: string | null) => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view payment details");
        router.push("/login"); // Redirect to login if no token
        return;
      }

      if (!apiUrl) {
        showErrorToast("Backend API URL is not configured.");
        setError("Configuration error: Backend API URL missing.");
        return;
      }

      // Dynamically construct the API endpoint based on the user's role
      const endpoint =
        role === "Member"
          ? `${apiUrl}membership/payments/${paymentId}`
          : `${apiUrl}payments/${paymentId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Payment not found.");
        }
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status === "success") {
        setPayment(responseData.data);
      } else {
        throw new Error(
          responseData.message || "Failed to fetch payment details."
        );
      }
    } catch (err) {
      console.error("Failed to fetch payment:", {
        paymentId,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
      setError(err instanceof Error ? err.message : "Failed to fetch payment.");
      showErrorToast("Failed to load payment details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString; // Fallback to original string if invalid
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return dateString; // Fallback to original string if invalid
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "pending":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "failed":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const handleCopy = async (text: string | number, label: string) => {
    const textToCopy = String(text); // Ensure it's a string
    setCopying(label);
    try {
      await navigator.clipboard.writeText(textToCopy);
      showSuccessToast(`${label} copied to clipboard`);
    } catch (err) {
      console.error(`Failed to copy ${label.toLowerCase()}:`, err);
      showErrorToast(`Failed to copy ${label.toLowerCase()}`);
    } finally {
      setTimeout(() => setCopying(null), 1000);
    }
  };

  const handleCopyAllDetails = async () => {
    if (!payment) return;

    const paymentDetails = `
PAYMENT DETAILS
===============
Payment ID: ${payment.id}
Member Number: ${payment.member}
Amount Paid: ${payment.currency ? `${payment.currency} ` : ""}${
      payment.amount_paid
    }
Payment Method: ${payment.payment_method}
Transaction Number: ${payment.transaction_number || "N/A"}
Gateway: ${payment.gateway || "N/A"}
Status: ${payment.status}
Payment Date: ${formatDateTime(payment.payment_date)}
Certificate Generated: ${payment.is_certificate_generated ? "Yes" : "No"}
${payment.description ? `Description: ${payment.description}` : ""}
${payment.reference ? `Reference: ${payment.reference}` : ""}
${payment.receipt_url ? `Receipt URL: ${payment.receipt_url}` : ""}
${payment.created_at ? `Created At: ${formatDateTime(payment.created_at)}` : ""}
${
  payment.updated_at
    ? `Last Updated: ${formatDateTime(payment.updated_at)}`
    : ""
}
    `.trim();

    await handleCopy(paymentDetails, "Payment details");
  };

  // Determine the base path for payment lists
  const paymentsBasePath = userRole === "Member" ? "/my-payments" : "/payments";
  // Determine the certificate base path
  const certificatesBasePath =
    userRole === "Member" ? "/my-certificates" : "/certificates";

  if (loading || userRole === null) {
    // Added userRole === null to wait for role to be determined
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {userRole === null
                ? "Determining user role..."
                : "Loading payment details..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              ⚠️
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Payment
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={() => fetchPayment(userRole)} // Pass the current userRole to refetch
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push(paymentsBasePath)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Back to Payments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              💳
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              Payment Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              The requested payment could not be found.
            </p>
            <button
              onClick={() => router.push(paymentsBasePath)}
              className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
            >
              Back to Payments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push(paymentsBasePath)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Payments
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyAllDetails}
                disabled={copying === "Payment details"}
                className="px-4 py-2 text-sm border border-[#00B5A5] text-[#00B5A5] hover:bg-[#00B5A5] hover:text-white rounded-md transition-colors disabled:opacity-50"
              >
                {copying === "Payment details" ? "Copied!" : "Copy Details"}
              </button>
              <button
                onClick={() => fetchPayment(userRole)} // Pass the current userRole to refetch
                disabled={loading}
                className="px-4 py-2 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed information for payment #{paymentId}
          </p>
        </div>

        {/* Payment Overview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div
            className={`p-6 ${
              payment.status === "Completed"
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : payment.status === "Pending"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-full">
                  {getStatusIcon(payment.status)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {payment.currency ? `${payment.currency} ` : ""}{" "}
                    {payment.amount_paid}
                  </h2>
                  <p className="text-white/90">{payment.payment_method}</p>
                  <p className="text-white/80 text-sm">via {payment.gateway}</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(
                    payment.status
                  )}`}
                >
                  {payment.status}
                </span>
                <p className="text-white/80 text-sm mt-2">
                  {formatDate(payment.payment_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Transaction Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Transaction Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment ID
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {payment.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transaction Number
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded flex-1 truncate">
                    {payment.transaction_number || "N/A"}
                  </code>
                  {payment.transaction_number && (
                    <button
                      onClick={() =>
                        handleCopy(
                          payment.transaction_number,
                          "Transaction number"
                        )
                      }
                      disabled={copying === "Transaction number"}
                      className="px-3 py-2 text-xs bg-[#00B5A5] hover:bg-[#009985] text-white rounded transition-colors disabled:opacity-50"
                    >
                      {copying === "Transaction number" ? "Copied!" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Member Number
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payment.member}
                  </p>
                  <button
                    onClick={() => handleCopy(payment.member, "Member number")}
                    disabled={copying === "Member number"}
                    className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded transition-colors disabled:opacity-50"
                  >
                    {copying === "Member number" ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Gateway
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {payment.gateway || "N/A"}
                </p>
              </div>

              {payment.description && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Description
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payment.description}
                  </p>
                </div>
              )}

              {payment.reference && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reference
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {payment.reference}
                  </p>
                </div>
              )}

              {payment.receipt_url && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receipt
                  </p>
                  <a
                    href={payment.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00B5A5] hover:underline flex items-center mt-1"
                  >
                    View Receipt
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status & Certificate */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status & Certificate
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Status
                </p>
                <div className="flex items-center space-x-3 mt-2">
                  <div
                    className={`${getStatusColor(
                      payment.status
                    )} p-2 rounded-full`}
                  >
                    {getStatusIcon(payment.status)}
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Certificate Status
                </p>
                <div className="mt-2">
                  {payment.is_certificate_generated ? (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Certificate Generated
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                      <svg
                        className="w-5 h-5 text-orange-600 dark:text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Certificate Not Generated
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white text-lg">
                  {formatDateTime(payment.payment_date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        {(payment.created_at || payment.updated_at) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Record Timestamps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payment.created_at && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Record Created
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(payment.created_at)}
                  </p>
                </div>
              )}
              {payment.updated_at && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last Updated
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDateTime(payment.updated_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => router.push(certificatesBasePath)} // Use role-based path for certificates
            className="px-6 py-3 border-2 border-[#00B5A5] text-[#00B5A5] hover:bg-[#00B5A5] hover:text-white rounded-lg transition-colors font-medium"
          >
            View My Certificates
          </button>

          <button
            onClick={() => router.push(paymentsBasePath)}
            className="px-6 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors font-medium"
          >
            View All Payments
          </button>
        </div>
      </div>
    </div>
  );
}
