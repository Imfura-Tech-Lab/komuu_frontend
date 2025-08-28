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

interface CertificateCardProps {
  certificate: Certificate;
  onCertificateClick: (certificateId: number) => void;
  getStatusColor: (status: string) => string;
  formatDate: (dateString?: string) => string;
}

function CertificateCard({
  certificate,
  onCertificateClick,
  getStatusColor,
  formatDate,
}: CertificateCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => onCertificateClick(certificate.id)}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#00B5A5] transition-colors text-left"
            >
              Certificate #{certificate.certificate_number || certificate.id}
            </button>
            
            {certificate.member_name && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {certificate.member_name}
              </p>
            )}
            
            {certificate.membership_term && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Term: {certificate.membership_term}
              </p>
            )}
          </div>
          
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(certificate.status)}`}>
            {certificate.status}
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
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
        </div>
        
        {certificate.issued_date && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Issued: {formatDate(certificate.issued_date)}
            </p>
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

  const router = useRouter();

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view certificates");
        return;
      }

      const response = await fetch(`${apiUrl}certificates`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const certificatesData = data.data?.data || data.data || [];
        setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
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
      month: "short",
      day: "numeric",
    });
  };

  const handleCertificateClick = (certificateId: number) => {
    router.push(`/certificates/${certificateId}`);
  };

  // Filter certificates
  const filteredCertificates = certificates.filter((certificate) => {
    const matchesSearch = 
      certificate.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.id.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || 
      certificate.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    const stats = certificates.reduce((acc, cert) => {
      const status = cert.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      acc.total++;
      return acc;
    }, { 
      total: 0,
      active: 0,
      expired: 0,
      suspended: 0,
      revoked: 0,
      abandoned: 0,
      pending: 0,
      valid: 0
    } as Record<string, number>);
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading certificates...
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
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">⚠️</div>
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

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Certificates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage membership certificates
          </p>
        </div>

        {/* Statistics Overview */}
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
              {(stats.active || 0) + (stats.valid || 0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Certificates
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by certificate number, member name..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
                <option value="revoked">Revoked</option>
                <option value="abandoned">Abandoned</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCertificates.length} of {certificates.length} certificates
          </p>
        </div>

        {/* Certificates Grid */}
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
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))}
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