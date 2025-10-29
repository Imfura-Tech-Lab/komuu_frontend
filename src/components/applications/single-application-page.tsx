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
  User,
  Building2,
  GraduationCap,
  MapPin,
  Shield,
} from "lucide-react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

interface ApprovalRecord {
  id: number;
  approved_by: string;
  comments: string;
  approved_at: string;
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
  approved_by: ApprovalRecord[];
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}

interface SingleApplicationPageProps {
  applicationId: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus === "approved") {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  }
  if (normalizedStatus === "rejected") {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
  if (normalizedStatus === "under review" || normalizedStatus === "under_review") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  }
  return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
};

// ============================================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================================

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  icon,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-8 h-8 bg-[#00B5A5]/10 dark:bg-[#00B5A5]/20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <svg
          className={`w-5 h-5 transform transition-transform text-gray-500 dark:text-gray-400 ${
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
        <div className="p-6 bg-white dark:bg-gray-800">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INFO ROW COMPONENT
// ============================================================================

interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p
        className={`text-sm font-medium ${
          highlight
            ? "text-[#00B5A5] dark:text-[#00B5A5]"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value || "N/A"}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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

  // ============================================================================
  // EFFECTS
  // ============================================================================

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

  // ============================================================================
  // API CALLS
  // ============================================================================

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

  // ============================================================================
  // RENDER STATES
  // ============================================================================

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

  const isApproved = application.application_status.toLowerCase() === "approved";

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============================================================================ */}
        {/* HEADER */}
        {/* ============================================================================ */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/applications")}
            className="flex items-center text-[#00B5A5] hover:text-[#009985] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Applications
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Application Details
              </h1>
            </div>

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

        {/* ============================================================================ */}
        {/* APPLICATION CONTENT */}
        {/* ============================================================================ */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Application Status
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    application.application_status
                  )}`}
                >
                  {application.application_status}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Membership Type
                </h2>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {application.membership_type}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Application Date
                </h2>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(application.application_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <CollapsibleSection
            title="Personal Information"
            icon={<User className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="Full Name" value={application.member_details.name} highlight />
              <InfoRow label="Email" value={application.member_details.email} />
              <InfoRow label="Phone Number" value={application.member_details.phone_number} />
              <InfoRow label="Secondary Email" value={application.member_details.secondary_email} />
              <InfoRow label="Alternative Phone" value={application.member_details.alternative_phone} />
              <InfoRow label="WhatsApp Number" value={application.member_details.whatsapp_number} />
              <InfoRow
                label="Date of Birth"
                value={
                  application.member_details.date_of_birth
                    ? new Date(application.member_details.date_of_birth).toLocaleDateString()
                    : null
                }
              />
              <InfoRow label="National ID" value={application.member_details.national_ID} />
              <InfoRow label="Passport" value={application.member_details.passport} />
              <InfoRow label="Role" value={application.member_details.role} />
              <InfoRow
                label="Verified"
                value={formatBoolean(application.member_details.verified)}
              />
              <InfoRow
                label="Active"
                value={formatBoolean(application.member_details.active)}
              />
            </div>
          </CollapsibleSection>

          {/* Organization Information */}
          <CollapsibleSection
            title="Organization Information"
            icon={<Building2 className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow
                label="Organization Name"
                value={application.name_of_organization}
                highlight
              />
              <InfoRow label="Abbreviation" value={application.Abbreviation} />
              <InfoRow label="Company Email" value={application.company_email} />
              <InfoRow label="Country of Residency" value={application.country_of_residency} />
              <InfoRow label="Country of Operation" value={application.country_of_operation} />
            </div>
          </CollapsibleSection>

          {/* Membership Information */}
          <CollapsibleSection
            title="Membership Information"
            icon={<Briefcase className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow
                label="Membership Type"
                value={application.membership_type}
                highlight
              />
              <InfoRow
                label="Membership Number"
                value={application.membership_number || "Not Assigned"}
              />
              <InfoRow label="Associate Category" value={application.associate_category} />
              <InfoRow label="Employment" value={application.employement} />
              <InfoRow label="Qualification" value={application.qualification} />
            </div>
          </CollapsibleSection>

          {/* Education Information */}
          <CollapsibleSection
            title="Education Information"
            icon={<GraduationCap className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="University" value={application.university} />
              <InfoRow label="Degree" value={application.degree} />
              <InfoRow label="Graduation Year" value={application.graduation_year} />
              <InfoRow label="Country of Study" value={application.country_of_study} />
            </div>
          </CollapsibleSection>

          {/* Documents */}
          {application.documents && application.documents.length > 0 && (
            <CollapsibleSection
              title="Uploaded Documents"
              icon={<FileText className="w-5 h-5 text-[#00B5A5]" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.document_type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Uploaded: {formatDate(doc.uploaded_at)}
                        </p>
                        {doc.current && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mt-1">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={doc.document_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors ml-4"
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
            <CollapsibleSection
              title="Payment Information"
              icon={<CreditCard className="w-5 h-5 text-[#00B5A5]" />}
            >
              <div className="space-y-4">
                {application.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {payment.amount_paid}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payment.member}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <InfoRow label="Payment Method" value={payment.payment_method} />
                      <InfoRow label="Transaction Number" value={payment.transaction_number} />
                      <InfoRow label="Gateway" value={payment.gateway} />
                      <InfoRow label="Payment Date" value={formatDate(payment.payment_date)} />
                      <InfoRow
                        label="Certificate Generated"
                        value={formatBoolean(payment.is_certificate_generated)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Fields of Practice */}
          {application.fieldsOfPractices &&
            application.fieldsOfPractices.length > 0 && (
              <CollapsibleSection
                title="Fields of Practice"
                icon={<Briefcase className="w-5 h-5 text-[#00B5A5]" />}
              >
                <div className="flex flex-wrap gap-2">
                  {application.fieldsOfPractices.map((field) => (
                    <span
                      key={field.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        field.is_primary
                          ? "bg-[#00B5A5] text-white border-[#00B5A5]"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {field.field_of_practice} ({field.code})
                      {field.is_primary && " • Primary"}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

          {/* Countries of Practice */}
          {application.countriesOfPractice &&
            application.countriesOfPractice.length > 0 && (
              <CollapsibleSection
                title="Countries of Practice"
                icon={<MapPin className="w-5 h-5 text-[#00B5A5]" />}
              >
                <div className="flex flex-wrap gap-2">
                  {application.countriesOfPractice.map((country) => (
                    <span
                      key={country.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    >
                      {country.country}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {country.region}
                      </span>
                      {country.is_primary && (
                        <span className="ml-2 text-[#00B5A5]">• Primary</span>
                      )}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

          {/* Declaration */}
          <CollapsibleSection
            title="Declaration & Compliance"
            icon={<Shield className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    application.abide_with_code_of_conduct
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {application.abide_with_code_of_conduct ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Code of Conduct
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatBoolean(application.abide_with_code_of_conduct)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    application.comply_with_current_constitution
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {application.comply_with_current_constitution ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Constitution Compliance
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatBoolean(application.comply_with_current_constitution)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    application.declaration
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {application.declaration ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Declaration Signed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatBoolean(application.declaration)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    application.incompliance
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {application.incompliance ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    In Compliance
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatBoolean(application.incompliance)}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Approval History */}
          {application.approved_by && application.approved_by.length > 0 && (
            <CollapsibleSection
              title="Approval History"
              icon={<CheckCircle className="w-5 h-5 text-[#00B5A5]" />}
            >
              <div className="space-y-3">
                {application.approved_by
                  .sort(
                    (a, b) =>
                      new Date(b.approved_at).getTime() -
                      new Date(a.approved_at).getTime()
                  )
                  .map((approval) => (
                    <div
                      key={approval.id}
                      className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/30"
                    >
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {approval.approved_by}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {approval.comments}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {formatDate(approval.approved_at)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* ============================================================================ */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ============================================================================ */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Delete Application
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete this application? This action
                cannot be undone.
              </p>
              <div className="space-y-3 mb-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="soft"
                    checked={deleteType === "soft"}
                    onChange={() => setDeleteType("soft")}
                    className="mt-1 text-[#00B5A5] focus:ring-[#00B5A5]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Soft Delete
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Mark as deleted but keep in database (can be recovered)
                    </p>
                  </div>
                </label>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="force"
                    checked={deleteType === "force"}
                    onChange={() => setDeleteType("force")}
                    className="mt-1 text-red-600 focus:ring-red-600"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Force Delete
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Permanently remove from database (cannot be recovered)
                    </p>
                  </div>
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Application</span>
                    </>
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