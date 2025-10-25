"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import {
  CheckCircle,
  Trash2,
  RefreshCw,
  ChevronDown,
  ArrowLeft,
  FileText,
  Download,
  CreditCard,
  Briefcase,
} from "lucide-react";

interface MemberDetails {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  secondary_email: string | null;
  alternative_phone: string | null;
  whatsapp_number: string | null;
  role: string;
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth: string;
  national_ID: string;
  passport: string | null;
  public_profile: string | null;
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

interface FieldOfPractice {
  id: number;
  code: string;
  field_of_practice: string;
  is_primary: boolean;
}

interface CountryOfPractice {
  id: number;
  country: string;
  region: string;
  is_primary: boolean;
}

interface Document {
  id: number;
  document_type: string;
  document_path: string;
  document_path_id: string;
  current: boolean;
  uploaded_at: string;
}

interface Application {
  id: string;
  member: string;
  application_status: string;
  application_date: string;
  membership_type: string;
  membership_number: string | null;
  employement: string | null;
  qualification: string | null;
  cv_resume: string | null;
  associate_category: string | null;
  university: string | null;
  degree: string | null;
  graduation_year: string | null;
  proof_of_registration: string | null;
  country_of_study: string | null;
  name_of_organization: string | null;
  Abbreviation: string | null;
  country_of_residency: string | null;
  country_of_operation: string | null;
  company_email: string | null;
  abide_with_code_of_conduct: boolean;
  comply_with_current_constitution: boolean;
  declaration: boolean;
  incompliance: boolean;
  member_details: MemberDetails;
  payments: Payment[];
  fieldsOfPractices: FieldOfPractice[];
  sectorOfEmployments: any[];
  countriesOfPractice: CountryOfPractice[];
  notes: any[];
  documents: Document[];
  approved_by: any[];
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
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowActionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleRefresh = async () => {
    showSuccessToast("Refreshing application data...");
    await fetchApplication();
  };

  const approveApplication = async () => {
    try {
      setIsUpdating(true);
      setShowActionsDropdown(false);
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

      const response = await fetch(
        `${apiUrl}applications/${applicationId}?${params.toString()}`,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Application approved successfully");
        await fetchApplication();
      } else {
        throw new Error(data.message || "Failed to approve application");
      }
    } catch (err) {
      console.error("Failed to approve application:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to approve application"
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBoolean = (value: boolean | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return value ? "Yes" : "No";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5]"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400 text-xl mb-4">
          {error || "Application not found"}
        </div>
        <button
          onClick={() => router.push("/applications")}
          className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const isApproved =
    application.application_status === "Approved" ||
    application.application_status === "approved";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/applications")}
            className="flex items-center text-[#00B5A5] hover:text-[#009985] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Applications
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Application Details
            </h1>

            {/* Actions Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
              >
                <span>Actions</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showActionsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-1">
                    <button
                      onClick={handleRefresh}
                      disabled={loading}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>Refresh</span>
                    </button>

                    <button
                      onClick={approveApplication}
                      disabled={isUpdating || isApproved}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{isApproved ? "Already Approved" : "Approve"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowActionsDropdown(false);
                        setShowDeleteModal(true);
                      }}
                      disabled={isDeleting}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Application Content */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Status
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isApproved
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : application.application_status === "Rejected" ||
                        application.application_status === "rejected"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : application.application_status === "Under Review" ||
                        application.application_status === "under_review"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {application.application_status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Applied on
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(application.application_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <CollapsibleSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Full Name</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.member_details.name}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.member_details.email}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.member_details.phone_number}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Secondary Email
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.member_details.secondary_email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Alternative Phone
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.member_details.alternative_phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  WhatsApp Number
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.member_details.whatsapp_number || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Date of Birth
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.member_details.date_of_birth
                    ? new Date(
                        application.member_details.date_of_birth
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Role</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.member_details.role}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Verified</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.member_details.verified)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Active</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.member_details.active)}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Organization Information */}
          <CollapsibleSection title="Organization Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Organization Name
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.name_of_organization || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Abbreviation</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.Abbreviation || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Company Email
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.company_email || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Country of Residency
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.country_of_residency || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Country of Operation
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.country_of_operation || "N/A"}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Membership Information */}
          <CollapsibleSection title="Membership Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Membership Type
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.membership_type}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Membership Number
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.membership_number || "Not Assigned"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Associate Category
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.associate_category || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Employment</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.employement || "N/A"}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Education Information */}
          <CollapsibleSection title="Education Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">University</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.university || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Degree</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.degree || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Graduation Year
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.graduation_year || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Country of Study
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {application.country_of_study || "N/A"}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Identification Documents */}
          {(application.member_details.national_ID ||
            application.member_details.passport) && (
            <CollapsibleSection title="Identification Documents">
              <div className="space-y-3">
                {application.member_details.national_ID && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          National ID
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {application.member_details.national_ID}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {application.member_details.passport && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Passport
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {application.member_details.passport}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Uploaded Documents */}
          {application.documents && application.documents.length > 0 && (
            <CollapsibleSection title="Uploaded Documents">
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          doc.document_type === "CV/Resume"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                        }`}
                      >
                        <FileText
                          className={`w-5 h-5 ${
                            doc.document_type === "CV/Resume"
                              ? "text-green-600 dark:text-green-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {doc.document_type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Uploaded: {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={doc.document_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>View</span>
                    </a>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Payment Information */}
          {application.payments && application.payments.length > 0 && (
            <CollapsibleSection title="Payment Information">
              <div className="space-y-3">
                {application.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-600 dark:text-gray-400">
                            Amount Paid
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {payment.amount_paid}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Payment Method
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.payment_method}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Transaction Number
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.transaction_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Gateway
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {payment.gateway}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Status
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Payment Date
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(payment.payment_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Certificate Generated
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatBoolean(payment.is_certificate_generated)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Fields of Practice */}
          {application.fieldsOfPractices &&
            application.fieldsOfPractices.length > 0 && (
              <CollapsibleSection title="Fields of Practice">
                <div className="flex flex-wrap gap-2">
                  {application.fieldsOfPractices.map((field) => (
                    <span
                      key={field.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        field.is_primary
                          ? "bg-[#00B5A5] text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {field.field_of_practice}{" "}
                      {field.is_primary && "(Primary)"}
                    </span>
                  ))}
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
