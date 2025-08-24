"use client";

import { useState, useEffect } from "react";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { Certificate, CertificatesResponse } from "@/types";

export default function CertificatesClient() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view your certificates");
        return;
      }

      const response = await fetch(`${apiUrl}membership/certificates`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CertificatesResponse = await response.json();

      if (data.status === "success") {
        setCertificates(data.data);
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
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "revoked":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCertificateTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "membership":
        return "🏛️";
      case "professional":
        return "🎓";
      case "training":
        return "📚";
      case "accreditation":
        return "⭐";
      default:
        return "📄";
    }
  };

  const filteredCertificates = certificates.filter((cert) => {
    if (filter === "all") return true;
    return cert.status === filter;
  });

  const getCertificateTypeDisplay = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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

        {/* Filter Section */}
        {certificates.length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by status:
              </span>
              <div className="flex flex-wrap gap-2">
                {["all", "active", "pending", "expired", "revoked"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filter === status
                          ? "bg-[#00B5A5] text-white"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              📜
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              {certificates.length === 0
                ? "No Certificates Found"
                : "No certificates match your filter"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {certificates.length === 0
                ? "You don't have any certificates yet. Certificates will appear here once they are issued."
                : "Try selecting a different filter to see more certificates."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Certificate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getCertificateTypeIcon(certificate.certificate_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {getCertificateTypeDisplay(
                          certificate.certificate_type
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        #{certificate.certificate_number}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      certificate.status
                    )}`}
                  >
                    {getStatusText(certificate.status)}
                  </span>
                </div>

                {/* Certificate Details */}
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Issued On
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(certificate.issue_date)}
                    </p>
                  </div>

                  {certificate.expiry_date && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {certificate.status === "active"
                          ? "Expires On"
                          : "Expired On"}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(certificate.expiry_date)}
                      </p>
                    </div>
                  )}

                  {certificate.status === "active" &&
                    certificate.expiry_date && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Valid for{" "}
                          {Math.ceil(
                            (new Date(certificate.expiry_date).getTime() -
                              Date.now()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          more days
                        </p>
                      </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <a
                    href={certificate.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm font-medium rounded-md transition-colors text-center"
                  >
                    Download Certificate
                  </a>

                  <a
                    href={certificate.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 text-center"
                  >
                    Verify Online
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statistics */}
        {certificates.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Certificate Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00B5A5]">
                  {certificates.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {certificates.filter((c) => c.status === "active").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Active
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {certificates.filter((c) => c.status === "pending").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    certificates.filter(
                      (c) => c.status === "expired" || c.status === "revoked"
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Inactive
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchCertificates}
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
