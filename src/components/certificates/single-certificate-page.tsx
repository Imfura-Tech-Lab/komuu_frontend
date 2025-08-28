"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

interface Certificate {
  id: number;
  member_id?: string;
  member_name?: string;
  certificate_number?: string;
  status: string;
  valid_from?: string;
  valid_until?: string;
  membership_term?: string;
  issued_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <svg
          className={`w-5 h-5 transform transition-transform ${
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
      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
          {children}
        </div>
      )}
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
          valid_from: data.data.valid_from
            ? data.data.valid_from.split("T")[0]
            : "",
          valid_until: data.data.valid_until
            ? data.data.valid_until.split("T")[0]
            : "",
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

      // Build query parameters
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "valid":
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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading certificate details...
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
              Error Loading Certificate
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={fetchCertificate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/certificates")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              📜
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              Certificate Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              The requested certificate could not be found.
            </p>
            <button
              onClick={() => router.push("/certificates")}
              className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
            >
              Back to Certificates
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
              onClick={() => router.push("/certificates")}
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
              Back to Certificates
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Update Certificate
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Certificate Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed view of membership certificate
          </p>
        </div>

        {/* Certificate Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Certificate #{certificate.certificate_number || certificate.id}
              </h2>
              {certificate.member_name && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  {certificate.member_name}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Certificate ID: {certificate.id}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                certificate.status
              )}`}
            >
              {certificate.status}
            </span>
          </div>
        </div>

        {/* Certificate Sections */}
        <div className="space-y-6">
          {/* Certificate Information */}
          <CollapsibleSection
            title="Certificate Information"
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Certificate Number
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {certificate.certificate_number || certificate.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      certificate.status
                    )}`}
                  >
                    {certificate.status}
                  </span>
                </div>

                {certificate.membership_term && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Membership Term
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {certificate.membership_term}
                    </p>
                  </div>
                )}

                {certificate.member_id && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Member ID
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {certificate.member_id}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Valid From
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(certificate.valid_from)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Valid Until
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(certificate.valid_until)}
                  </p>
                </div>

                {certificate.issued_date && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Issued Date
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(certificate.issued_date)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* System Information */}
          <CollapsibleSection title="System Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {certificate.created_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(certificate.created_at)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {certificate.updated_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(certificate.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* Update Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Update Certificate
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                  >
                    <option value="">Select status...</option>
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
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
                    placeholder="e.g., 2025 - 2028"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateCertificate}
                  disabled={!editForm.status || isUpdating}
                  className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Update Certificate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
