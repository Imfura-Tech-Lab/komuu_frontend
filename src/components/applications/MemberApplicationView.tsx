"use client";

import { useState } from "react";
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckBadgeIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useFileViewer } from "@/lib/hooks/useFileViewer";
import { FileViewer } from "@/components/ui/FileViwer";

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
  date_of_birth: string | null;
  national_ID: string | null;
  passport: string | null;
  public_profile: string | null;
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

interface ApplicationDocument {
  id: number;
  document_type: string;
  document_path: string;
  document_path_id: string;
  current: boolean;
  uploaded_at: string;
}

interface MemberApplication {
  id: string;
  member: string;
  application_status: string;
  application_date: string;
  membership_type: string;
  membership_number: string | null;
  name_of_organization: string | null;
  Abbreviation: string | null;
  country_of_residency: string | null;
  company_email: string | null;
  abide_with_code_of_conduct: boolean;
  comply_with_current_constitution: boolean;
  declaration: boolean;
  member_details: MemberDetails;
  fieldsOfPractices: FieldOfPractice[];
  countriesOfPractice: CountryOfPractice[];
  documents: ApplicationDocument[];
  payments?: Array<{ status: string }>;
}

type TabId = "overview" | "practice" | "documents" | "compliance";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "practice", label: "Practice" },
  { id: "documents", label: "Documents" },
  { id: "compliance", label: "Compliance" },
];

function getStatusConfig(status: string) {
  const normalized = (status || "").toLowerCase();
  if (normalized.includes("certificate")) {
    return {
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: CheckBadgeIcon,
    };
  }
  if (normalized === "approved") {
    return {
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: CheckCircleIcon,
    };
  }
  if (normalized.includes("waiting for payment")) {
    return {
      color: "text-[#00B5A5] dark:text-[#00D4C7]",
      bg: "bg-[#00B5A5]/10 dark:bg-[#00B5A5]/20",
      border: "border-[#00B5A5]/30 dark:border-[#00B5A5]/40",
      icon: CreditCardIcon,
    };
  }
  if (normalized.includes("rejected") || normalized.includes("denied")) {
    return {
      color: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-200 dark:border-red-800",
      icon: XCircleIcon,
    };
  }
  return {
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: ClockIcon,
  };
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0">
        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="p-1.5 bg-[#00B5A5]/10 rounded-lg">
        <Icon className="w-4 h-4 text-[#00B5A5]" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
  );
}

function DocumentCard({
  document,
  onView,
}: {
  document: ApplicationDocument;
  onView: (url: string, name: string) => void;
}) {
  return (
    <button
      onClick={() => onView(document.document_path, document.document_type)}
      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group w-full text-left"
    >
      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <DocumentTextIcon className="w-5 h-5 text-[#00B5A5]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {document.document_type}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(document.uploaded_at)}
        </p>
      </div>
      <EyeIcon className="w-4 h-4 text-gray-400 group-hover:text-[#00B5A5] transition-colors" />
    </button>
  );
}

function TagBadge({
  label,
  isPrimary,
}: {
  label: string;
  isPrimary?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
        isPrimary
          ? "bg-[#00B5A5]/10 text-[#00B5A5] border border-[#00B5A5]/20"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
      }`}
    >
      {label}
      {isPrimary && <CheckBadgeIcon className="w-3.5 h-3.5" />}
    </span>
  );
}

function ComplianceCard({
  title,
  description,
  isCompliant,
}: {
  title: string;
  description: string;
  isCompliant: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        isCompliant
          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      }`}
    >
      <div className="flex items-center gap-3">
        {isCompliant ? (
          <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
        ) : (
          <XCircleIcon className="w-6 h-6 text-red-500" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

interface MemberApplicationViewProps {
  application: MemberApplication;
  onRefresh: () => void;
  isRefreshing?: boolean;
  onPayNow?: () => void;
  isPayingNow?: boolean;
  onGeneratePDF?: () => void;
  isGeneratingPDF?: boolean;
}

export default function MemberApplicationView({
  application,
  onRefresh,
  isRefreshing = false,
  onPayNow,
  isPayingNow = false,
  onGeneratePDF,
  isGeneratingPDF = false,
}: MemberApplicationViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const {
    isOpen: fileViewerOpen,
    fileUrl,
    fileName,
    openFile,
    closeFile,
  } = useFileViewer();

  const statusConfig = getStatusConfig(application.application_status);
  const StatusIcon = statusConfig.icon;
  const member = application.member_details;
  const normalizedStatus = application.application_status.toLowerCase();
  const isWaitingForPayment = normalizedStatus.includes("waiting for payment");
  const isCertificateGenerated = normalizedStatus.includes("certificate");
  const isRejected = normalizedStatus.includes("rejected") || normalizedStatus.includes("denied");

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Application
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Membership application details and status
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Status + primary action card */}
        <div className={`rounded-2xl border ${statusConfig.border} ${statusConfig.bg} p-5`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-white dark:bg-gray-900/30 ${statusConfig.color}`}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Current status
                </p>
                <p className={`text-lg font-semibold ${statusConfig.color}`}>
                  {application.application_status}
                </p>
                {isWaitingForPayment && (
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    Your application has been approved — complete the membership fee to activate your certificate.
                  </p>
                )}
                {isCertificateGenerated && (
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    Your membership is active. Download your certificate below.
                  </p>
                )}
                {isRejected && (
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    Your application was not approved. Please reach out to the administration for next steps.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isWaitingForPayment && onPayNow && (
                <button
                  onClick={onPayNow}
                  disabled={isPayingNow}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPayingNow ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <CreditCardIcon className="w-4 h-4" />
                  )}
                  {isPayingNow ? "Redirecting..." : "Pay Now"}
                </button>
              )}
              {isCertificateGenerated && onGeneratePDF && (
                <button
                  onClick={onGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  {isGeneratingPDF ? "Generating..." : "Download Certificate"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Summary Card */}
        <div className="p-5 bg-gradient-to-br from-[#00B5A5]/5 to-[#00B5A5]/10 dark:from-[#00B5A5]/10 dark:to-[#00B5A5]/5 rounded-2xl border border-[#00B5A5]/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00B5A5] rounded-xl shrink-0">
              <UserCircleIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {application.member}
              </h2>
              <p className="text-sm text-[#00B5A5] font-medium">
                {application.membership_type}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                {application.membership_number && (
                  <span>{application.membership_number}</span>
                )}
                <span>Applied on {formatDate(application.application_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-[#00B5A5] text-[#00B5A5]"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-4 sm:px-6 py-5">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SectionHeader icon={EnvelopeIcon} title="Contact Information" />
                  <div className="space-y-1">
                    <InfoRow icon={EnvelopeIcon} label="Email" value={member.email} />
                    <InfoRow icon={PhoneIcon} label="Phone" value={member.phone_number} />
                    <InfoRow
                      icon={EnvelopeIcon}
                      label="Secondary Email"
                      value={member.secondary_email}
                    />
                    <InfoRow
                      icon={PhoneIcon}
                      label="Alternative Phone"
                      value={member.alternative_phone}
                    />
                    <InfoRow
                      icon={PhoneIcon}
                      label="WhatsApp"
                      value={member.whatsapp_number}
                    />
                    <InfoRow
                      icon={CalendarIcon}
                      label="Date of Birth"
                      value={member.date_of_birth ? formatDate(member.date_of_birth) : null}
                    />
                  </div>
                </div>

                <div>
                  <SectionHeader icon={BuildingOfficeIcon} title="Organization" />
                  <div className="space-y-1">
                    <InfoRow
                      icon={BuildingOfficeIcon}
                      label="Organization"
                      value={
                        application.name_of_organization
                          ? application.Abbreviation
                            ? `${application.name_of_organization} (${application.Abbreviation})`
                            : application.name_of_organization
                          : null
                      }
                    />
                    <InfoRow
                      icon={EnvelopeIcon}
                      label="Company Email"
                      value={application.company_email}
                    />
                    <InfoRow
                      icon={MapPinIcon}
                      label="Country of Residency"
                      value={application.country_of_residency}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "practice" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SectionHeader icon={AcademicCapIcon} title="Fields of Practice" />
                  {application.fieldsOfPractices.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {application.fieldsOfPractices
                        .filter(
                          (f, i, arr) =>
                            arr.findIndex(
                              (x) => x.id === f.id && x.is_primary === f.is_primary,
                            ) === i,
                        )
                        .map((field, index) => (
                          <TagBadge
                            key={`${field.id}-${field.is_primary}-${index}`}
                            label={field.field_of_practice}
                            isPrimary={field.is_primary}
                          />
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No fields of practice specified
                    </p>
                  )}
                </div>

                <div>
                  <SectionHeader icon={GlobeAltIcon} title="Countries of Practice" />
                  {application.countriesOfPractice.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {application.countriesOfPractice.map((country, index) => (
                        <TagBadge
                          key={`${country.id}-${index}`}
                          label={`${country.country} (${country.region})`}
                          isPrimary={country.is_primary}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No countries of practice specified
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div>
                <SectionHeader icon={DocumentTextIcon} title="Uploaded Documents" />
                {application.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {application.documents.map((doc) => (
                      <DocumentCard key={doc.id} document={doc} onView={openFile} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No documents uploaded
                  </p>
                )}
              </div>
            )}

            {activeTab === "compliance" && (
              <div>
                <SectionHeader icon={CheckBadgeIcon} title="Compliance Status" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ComplianceCard
                    title="Code of Conduct"
                    description={
                      application.abide_with_code_of_conduct ? "Accepted" : "Not accepted"
                    }
                    isCompliant={application.abide_with_code_of_conduct}
                  />
                  <ComplianceCard
                    title="Constitution"
                    description={
                      application.comply_with_current_constitution ? "Compliant" : "Not compliant"
                    }
                    isCompliant={application.comply_with_current_constitution}
                  />
                  <ComplianceCard
                    title="Declaration"
                    description={application.declaration ? "Signed" : "Not signed"}
                    isCompliant={application.declaration}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FileViewer
        isOpen={fileViewerOpen}
        onClose={closeFile}
        fileUrl={fileUrl}
        fileName={fileName}
      />
    </>
  );
}
