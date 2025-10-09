"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { Application } from "@/types";

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

interface SingleApplicationPageProps {
  applicationId: string;
}

export default function SingleApplicationPage({
  applicationId,
}: SingleApplicationPageProps) {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"soft" | "force">("soft");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view application");
        return;
      }

      const response = await fetch(`${apiUrl}applications/${applicationId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Application not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.status === "success") {
        setApplication(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch application");
      }
    } catch (err) {
      console.error("Failed to fetch application:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch application"
      );
      showErrorToast("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (status: string) => {
    try {
      setIsUpdating(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to update application");
        return;
      }

      const response = await fetch(
        `${apiUrl}applications/${applicationId}?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PUT",
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
        showSuccessToast(`Application status updated to: ${status}`);
        setShowStatusModal(false);
        setNewStatus("");
        await fetchApplication();
      } else {
        throw new Error(data.message || "Failed to update application status");
      }
    } catch (err) {
      console.error("Failed to update application status:", err);
      showErrorToast(
        err instanceof Error
          ? err.message
          : "Failed to update application status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteApplication = async (forceDelete = false) => {
    try {
      setIsDeleting(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to delete application");
        return;
      }

      const endpoint = forceDelete
        ? `${apiUrl}applications/${applicationId}/force-delete`
        : `${apiUrl}applications/${applicationId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
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
        showSuccessToast(
          forceDelete
            ? "Application permanently deleted"
            : "Application deleted successfully"
        );
        setShowDeleteModal(false);
        router.push("/applications");
      } else {
        throw new Error(data.message || "Failed to delete application");
      }
    } catch (err) {
      console.error("Failed to delete application:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to delete application"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "waiting_for_payment":
      case "waiting for payment":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBoolean = (value: boolean) => {
    return value ? "Yes" : "No";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading application details...
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
              Error Loading Application
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={fetchApplication}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/applications")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Back to Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              📋
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              Application Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              The requested application could not be found.
            </p>
            <button
              onClick={() => router.push("/applications")}
              className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
            >
              Back to Applications
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
              onClick={() => router.push("/applications")}
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
              Back to Applications
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowStatusModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Application Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed view of membership application
          </p>
        </div>

        {/* Application Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {application.member || application.member_details?.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Application ID: {application.id}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Applied: {formatDate(application.application_date)}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                application.application_status
              )}`}
            >
              {application.application_status}
            </span>
          </div>
        </div>

        {/* Application Sections */}
        <div className="space-y-6">
          {/* Application Details Section */}
          <CollapsibleSection title="Application Details" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Application Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(application.application_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Membership Type
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.membership_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Field of Practice
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.forensic_field_of_practice}
                  </p>
                </div>

                {application.membership_number && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Membership Number
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {application.membership_number}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Organization
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.name_of_organization} (
                    {application.Abbreviation})
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Country of Residency
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.country_of_residency}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Company Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.company_email}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Member Information Section */}
          {application.member_details && (
            <CollapsibleSection title="Member Information" defaultOpen={true}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Full Name
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {application.member_details.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {application.member_details.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {application.member_details.phone_number}
                    </p>
                  </div>

                  {application.member_details.whatsapp_number && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        WhatsApp
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.member_details.whatsapp_number}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      National ID
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {application.member_details.national_ID}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Date of Birth
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(
                        application.member_details.date_of_birth
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Account Status
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {application.member_details.verified
                        ? "Verified"
                        : "Pending Verification"}
                    </p>
                  </div>

                  {application.member_details.passport && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Passport
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {application.member_details.passport}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Documents Section */}
          {(application.qualification || application.cv_resume) && (
            <CollapsibleSection title="Documents">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.qualification && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400">
                          📄
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Qualification
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF Document
                        </p>
                      </div>
                    </div>
                    <a
                      href={application.qualification}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors"
                    >
                      View
                    </a>
                  </div>
                )}

                {application.cv_resume && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400">
                          📄
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          CV/Resume
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF Document
                        </p>
                      </div>
                    </div>
                    <a
                      href={application.cv_resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors"
                    >
                      View
                    </a>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Declaration Section */}
          <CollapsibleSection title="Declaration">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Abide with Code of Conduct
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.abide_with_code_of_conduct)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Comply with Constitution
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.comply_with_current_constitution)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Declaration Signed
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.declaration)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  In Compliance
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.incompliance)}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Countries of Practice Section */}
          {application.countriesOfPractice &&
            application.countriesOfPractice.length > 0 && (
              <CollapsibleSection title="Countries of Practice">
                <div className="flex flex-wrap gap-2">
                  {application.countriesOfPractice.map((country) => (
                    <span
                      key={country.id}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {country.country} ({country.region})
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}
        </div>

        {/* Status Update Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Update Application Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                  >
                    <option value="">Select status...</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Waiting for Payment">
                      Waiting for Payment
                    </option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setNewStatus("");
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateApplicationStatus(newStatus)}
                  disabled={!newStatus || isUpdating}
                  className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
                Delete Application
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete this application? This action
                cannot be undone.
              </p>
              <div className="space-y-3 mb-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="soft"
                    checked={deleteType === "soft"}
                    onChange={() => setDeleteType("soft")}
                    className="mr-2 text-[#00B5A5] focus:ring-[#00B5A5]"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Soft Delete (can be recovered)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="force"
                    checked={deleteType === "force"}
                    onChange={() => setDeleteType("force")}
                    className="mr-2 text-red-600 focus:ring-red-600"
                  />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Force Delete (permanent)
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteApplication(deleteType === "force")}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete Application"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
