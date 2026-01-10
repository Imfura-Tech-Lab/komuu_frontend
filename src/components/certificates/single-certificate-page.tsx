"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

interface SignedBy {
  id: number;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  active: boolean;
}

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
  signed_by: SignedBy;
  payment: Payment;
}

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="text-gray-500 dark:text-gray-400">{icon}</span>
          )}
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`transition-all duration-200 ${
          isOpen
            ? "max-h-[1000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-5 bg-white dark:bg-gray-800">{children}</div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
}

function InfoItem({ label, value, copyable }: InfoItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof value === "string") {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {value || "—"}
        </p>
        {copyable && typeof value === "string" && (
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface SingleCertificatePageProps {
  certificateId: string;
}

export default function SingleCertificatePage({
  certificateId,
}: SingleCertificatePageProps) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    valid_from: "",
    valid_until: "",
    membership_term: "",
  });

  const router = useRouter();

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view certificate");
        return;
      }

      const response = await fetch(`${apiUrl}certificates/${certificateId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Certificate not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setCertificate(data.data);
        setEditForm({
          status: data.data.status || "",
          valid_from: data.data.valid_from || "",
          valid_until: data.data.valid_until || "",
          membership_term: data.data.membership_term || "",
        });
      } else {
        throw new Error(data.message || "Failed to fetch certificate");
      }
    } catch (err) {
      console.error("Failed to fetch certificate:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch certificate"
      );
      showErrorToast("Failed to load certificate details");
    } finally {
      setLoading(false);
    }
  };

  const updateCertificate = async () => {
    try {
      setIsUpdating(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to update certificate");
        return;
      }

      const params = new URLSearchParams();
      params.append("status", editForm.status);
      params.append("valid_from", editForm.valid_from || "null");
      params.append("valid_until", editForm.valid_until || "null");
      params.append("membership_term", editForm.membership_term);

      const response = await fetch(
        `${apiUrl}certificates/${certificateId}?${params.toString()}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Certificate updated successfully");
        setShowEditModal(false);
        await fetchCertificate();
      } else {
        throw new Error(data.message || "Failed to update certificate");
      }
    } catch (err) {
      console.error("Failed to update certificate:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to update certificate"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: string }> =
      {
        approved: {
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-700 dark:text-green-400",
          icon: "✓",
        },
        active: {
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-700 dark:text-green-400",
          icon: "✓",
        },
        valid: {
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-700 dark:text-green-400",
          icon: "✓",
        },
        expired: {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-700 dark:text-red-400",
          icon: "✕",
        },
        suspended: {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          text: "text-amber-700 dark:text-amber-400",
          icon: "⏸",
        },
        revoked: {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-700 dark:text-red-400",
          icon: "✕",
        },
        abandoned: {
          bg: "bg-gray-50 dark:bg-gray-900/20",
          text: "text-gray-700 dark:text-gray-400",
          icon: "—",
        },
        pending: {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          text: "text-blue-700 dark:text-blue-400",
          icon: "○",
        },
      };
    return (
      configs[status.toLowerCase()] || {
        bg: "bg-gray-50 dark:bg-gray-900/20",
        text: "text-gray-700 dark:text-gray-400",
        icon: "•",
      }
    );
  };

  const getPaymentStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string }> = {
      completed: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
      },
      pending: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
      },
      failed: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
      },
    };
    return (
      configs[status.toLowerCase()] || {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-700 dark:text-gray-400",
      }
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntilExpiry = (validUntil: string) => {
    const expiry = new Date(validUntil);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Certificate
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-6">
              {error}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={fetchCertificate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/certificates")}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
              >
                Back to Certificates
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Certificate Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              The requested certificate could not be found.
            </p>
            <button
              onClick={() => router.push("/certificates")}
              className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors font-medium"
            >
              Back to Certificates
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(certificate.status);
  const daysUntilExpiry = getDaysUntilExpiry(certificate.valid_until);
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/certificates")}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <svg
              className="w-4 h-4 mr-1.5"
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
            Back to Certificates
          </button>
        </div>

        {/* Certificate Hero Card */}
        <div className="bg-gradient-to-br from-[#00B5A5] to-[#008577] rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">
                Membership Certificate
              </p>
              <h1 className="text-2xl font-bold">{certificate.name}</h1>
              <p className="text-white/80 font-mono text-sm">
                {certificate.member_number}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}
            >
              <span className="mr-1">{statusConfig.icon}</span>
              {certificate.status}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">
                  Term
                </p>
                <p className="font-semibold mt-1">
                  {certificate.membership_term}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">
                  Valid From
                </p>
                <p className="font-semibold mt-1">
                  {formatDate(certificate.valid_from)}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">
                  Valid Until
                </p>
                <p className="font-semibold mt-1">
                  {formatDate(certificate.valid_until)}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider">
                  Next Payment
                </p>
                <p className="font-semibold mt-1">
                  {formatDate(certificate.next_payment_date)}
                </p>
              </div>
            </div>
          </div>

          {isExpiringSoon && (
            <div className="mt-4 p-3 bg-amber-500/20 rounded-lg flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm font-medium text-amber-100">
                Certificate expires in {daysUntilExpiry} days
              </span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 mb-6">
          {certificate.certificate && (
            <a
              href={certificate.certificate}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download Certificate
            </a>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors font-medium text-sm"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Update Certificate
          </button>
        </div>

        {/* Details Sections */}
        <div className="space-y-4">
          {/* Signing Authority */}
          <CollapsibleSection
            title="Signing Authority"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
            defaultOpen={true}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#00B5A5]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#00B5A5] font-semibold text-lg">
                  {certificate.signed_by.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem label="Name" value={certificate.signed_by.name} />
                <InfoItem label="Role" value={certificate.signed_by.role} />
                <InfoItem
                  label="Email"
                  value={certificate.signed_by.email}
                  copyable
                />
                <InfoItem
                  label="Signed Date"
                  value={formatDate(certificate.signed_date)}
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {certificate.signed_by.verified && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
              {certificate.signed_by.active && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  Active
                </span>
              )}
            </div>
          </CollapsibleSection>

          {/* Payment Information */}
          <CollapsibleSection
            title="Payment Information"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                label="Amount Paid"
                value={certificate.payment.amount_paid}
              />
              <InfoItem
                label="Payment Method"
                value={certificate.payment.payment_method}
              />
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </p>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    getPaymentStatusConfig(certificate.payment.status).bg
                  } ${getPaymentStatusConfig(certificate.payment.status).text}`}
                >
                  {certificate.payment.status}
                </span>
              </div>
              <InfoItem
                label="Transaction Number"
                value={certificate.payment.transaction_number}
                copyable
              />
              <InfoItem label="Gateway" value={certificate.payment.gateway} />
              <InfoItem
                label="Payment Date"
                value={formatDateTime(certificate.payment.payment_date)}
              />
            </div>
          </CollapsibleSection>

          {/* System Information */}
          <CollapsibleSection
            title="System Information"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            defaultOpen={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem
                label="Certificate Token"
                value={certificate.token}
                copyable
              />
              <InfoItem
                label="Created At"
                value={formatDateTime(certificate.created_at)}
              />
            </div>
          </CollapsibleSection>
        </div>

        {/* Update Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Update Certificate
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-shadow"
                  >
                    <option value="">Select status...</option>
                    <option value="Approved">Approved</option>
                    <option value="Active">Active</option>
                    <option value="Valid">Valid</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Revoked">Revoked</option>
                    <option value="Abandoned">Abandoned</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={editForm.valid_from}
                      onChange={(e) =>
                        setEditForm({ ...editForm, valid_from: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={editForm.valid_until}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          valid_until: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Membership Term
                  </label>
                  <input
                    type="text"
                    value={editForm.membership_term}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        membership_term: e.target.value,
                      })
                    }
                    placeholder="e.g., 2026 - 2027"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={updateCertificate}
                  disabled={!editForm.status || isUpdating}
                  className="px-4 py-2.5 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {isUpdating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Certificate"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
