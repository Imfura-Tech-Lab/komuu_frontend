"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  FileText, 
  PenTool, 
  MoreVertical, 
  CheckCircle, 
  Trash2,
  Loader2 
} from "lucide-react";
import { Application } from "@/types";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";

interface ApplicationListProps {
  applications: Application[];
  filteredApplications: Application[];
  userRole: string;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
  formatBoolean: (value: boolean) => string;
  onGeneratePDF: (application: Application) => Promise<void>;
}

export default function ApplicationList({
  applications,
  filteredApplications,
  userRole,
  getStatusColor,
  formatDate,
  formatBoolean,
  onGeneratePDF,
}: ApplicationListProps) {
  const router = useRouter();
  const [signingId, setSigningId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Check user permissions
  const isPresident = userRole === "President";
  const isAdmin = userRole === "Administrator";
  const canApprove = isAdmin;
  const canSign = isPresident;
  const canDelete = isAdmin;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        if (!dropdownRefs.current[openDropdownId]?.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownId]);

  // Toggle dropdown
  const toggleDropdown = (applicationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === applicationId ? null : applicationId);
  };

  // Close dropdown
  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Navigate to application details
  const handleViewDetails = (applicationId: string) => {
    router.push(`/applications/${applicationId}`);
  };

  // Sign Certificate Handler
  const handleSignCertificate = async (application: Application, e: React.MouseEvent) => {
    e.stopPropagation();
    closeDropdown();

    if (application.application_status.toLowerCase() !== "approved") {
      showErrorToast("Only approved applications can be signed");
      return;
    }

    try {
      setSigningId(application.id);
      
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id");

      if (!token) {
        showErrorToast("Please login to sign certificate");
        return;
      }

      if (!companyId) {
        showErrorToast("Company ID not found. Please re-login.");
        return;
      }

      const formData = new FormData();
      formData.append(`applications[0][id]`, application.id);

      console.log("=== SIGN CERTIFICATE DEBUG ===");
      console.log("Application ID:", application.id);
      console.log("API URL:", apiUrl);
      console.log("Company ID:", companyId);
      console.log("Has Token:", !!token);

      const response = await fetch(`${apiUrl}applications/sign-certificates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Company-ID": companyId,
        },
        body: formData,
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error Response:", errorData);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Success Response:", data);

      if (data.status === "success") {
        showSuccessToast("Certificate signed successfully");
        window.location.reload();
      } else {
        throw new Error(data.message || "Failed to sign certificate");
      }
    } catch (err) {
      console.error("=== SIGN CERTIFICATE ERROR ===");
      console.error("Error:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to sign certificate"
      );
    } finally {
      setSigningId(null);
    }
  };

  // Approve Application Handler
  const handleApproveApplication = async (application: Application, e: React.MouseEvent) => {
    e.stopPropagation();
    closeDropdown();

    if (application.application_status.toLowerCase() === "approved") {
      showErrorToast("Application is already approved");
      return;
    }

    try {
      setApprovingId(application.id);
      
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to approve application");
        return;
      }

      const params = new URLSearchParams({
        status: "1",
        note: "Application approved by admin",
      });

      console.log("Approving application:", application.id);

      const response = await fetch(
        `${apiUrl}applications/${application.id}?${params.toString()}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "X-Company-ID": localStorage.getItem("company_id") || "",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Application approved successfully");
        window.location.reload();
      } else {
        throw new Error(data.message || "Failed to approve application");
      }
    } catch (err) {
      console.error("Failed to approve application:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to approve application"
      );
    } finally {
      setApprovingId(null);
    }
  };

  // Delete Application Handler
  const handleDeleteApplication = async (application: Application, e: React.MouseEvent) => {
    e.stopPropagation();
    closeDropdown();

    if (!confirm(`Are you sure you want to delete the application for ${application.member_details?.full_name}?`)) {
      return;
    }

    try {
      setDeletingId(application.id);
      
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to delete application");
        return;
      }

      console.log("Deleting application:", application.id);

      const response = await fetch(`${apiUrl}applications/${application.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Application deleted successfully");
        window.location.reload();
      } else {
        throw new Error(data.message || "Failed to delete application");
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to delete application"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Check if application can be signed
  const canSignApplication = (application: Application) => {
    return (
      canSign &&
      application.application_status.toLowerCase() === "approved"
    );
  };

  // Check if application can be approved
  const canApproveApplication = (application: Application) => {
    return (
      canApprove &&
      application.application_status.toLowerCase() !== "approved"
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          <div className="col-span-3">Applicant</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Application Date</div>
          <div className="col-span-2">Payment</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredApplications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No applications found matching your filters.
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div
              key={application.id}
              className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={() => handleViewDetails(application.id)}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Applicant Info */}
                <div className="col-span-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.member_details?.full_name || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {application.member_details?.email || "N/A"}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      application.application_status
                    )}`}
                  >
                    {application.application_status}
                  </span>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {application.membership_type}
                  </p>
                </div>

                {/* Application Date */}
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(application.application_date)}
                  </p>
                </div>

                {/* Payment Status */}
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      //@ts-ignore
                      application.payments && application.payments.length > 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {
                      //@ts-ignore
                    application.payments && application.payments.length > 0
                      ? "Paid"
                      : "Unpaid"}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end">
                  <div className="relative" 
                  //@ts-ignore
                  ref={(el) => (dropdownRefs.current[application.id] = el)}>
                    <button
                      onClick={(e) => toggleDropdown(application.id, e)}
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="Actions"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdownId === application.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="py-1">
                          {/* View Details */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              closeDropdown();
                              handleViewDetails(application.id);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-3" />
                            View Details
                          </button>

                          {/* Generate PDF */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              closeDropdown();
                              onGeneratePDF(application);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3" />
                            Generate PDF
                          </button>

                          {/* Approve Application - Admin Only */}
                          {canApproveApplication(application) && (
                            <>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                              <button
                                onClick={(e) => handleApproveApplication(application, e)}
                                disabled={approvingId === application.id}
                                className="w-full flex items-center px-4 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {approvingId === application.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-3" />
                                    Approve Application
                                  </>
                                )}
                              </button>
                            </>
                          )}

                          {/* Sign Certificate - President Only */}
                          {canSignApplication(application) && (
                            <>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                              <button
                                onClick={(e) => handleSignCertificate(application, e)}
                                disabled={signingId === application.id}
                                className="w-full flex items-center px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {signingId === application.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                                    Signing...
                                  </>
                                ) : (
                                  <>
                                    <PenTool className="w-4 h-4 mr-3" />
                                    Sign Certificate
                                  </>
                                )}
                              </button>
                            </>
                          )}

                          {/* Delete Application - Admin Only */}
                          {canDelete && (
                            <>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                              <button
                                onClick={(e) => handleDeleteApplication(application, e)}
                                disabled={deletingId === application.id}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === application.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-3" />
                                    Delete Application
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}