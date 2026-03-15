"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
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

interface Document {
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
  employement: string | null;
  qualification: string | null;
  cv_resume: string | null;
  associate_category: string | null;
  university: string | null;
  passport: string | null;
  passport_national_id_from: string | null;
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
  fieldsOfPractices: FieldOfPractice[];
  sectorOfEmployments: any[];
  countriesOfPractice: CountryOfPractice[];
  documents: Document[];
}

interface MemberApplicationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  application: MemberApplication | null;
  onRefresh?: () => void;
  onGeneratePDF?: () => void;
  isRefreshing?: boolean;
}

type TabId = "overview" | "practice" | "documents" | "compliance";

function getStatusConfig(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("approved") || normalized.includes("certificate")) {
    return {
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: CheckCircleIcon,
    };
  }
  if (normalized.includes("pending") || normalized.includes("review")) {
    return {
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-200 dark:border-amber-800",
      icon: ClockIcon,
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
    color: "text-gray-700 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    icon: ClockIcon,
  };
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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
  document: Document;
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

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "practice", label: "Practice" },
  { id: "documents", label: "Documents" },
  { id: "compliance", label: "Compliance" },
];

export default function MemberApplicationSheet({
  isOpen,
  onClose,
  application,
  onRefresh,
  onGeneratePDF,
  isRefreshing = false,
}: MemberApplicationSheetProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const {
    isOpen: fileViewerOpen,
    fileUrl,
    fileName,
    openFile,
    closeFile,
  } = useFileViewer();

  if (!application) return null;

  const statusConfig = getStatusConfig(application.application_status);
  const StatusIcon = statusConfig.icon;
  const member = application.member_details;
  const canGenerateCertificate = application.application_status
    .toLowerCase()
    .includes("certificate");

  return (
    <>
      <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-full sm:max-w-3xl lg:max-w-4xl">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-2xl">
                    {/* Header */}
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                          My Application
                        </Dialog.Title>
                        <div className="flex items-center gap-2">
                          {onRefresh && (
                            <button
                              onClick={onRefresh}
                              disabled={isRefreshing}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              title="Refresh"
                            >
                              <ArrowPathIcon
                                className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
                              />
                            </button>
                          )}
                          <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusConfig.bg} ${statusConfig.border}`}
                      >
                        <StatusIcon
                          className={`w-4 h-4 ${statusConfig.color}`}
                        />
                        <span
                          className={`text-sm font-medium ${statusConfig.color}`}
                        >
                          {application.application_status}
                        </span>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                      <nav
                        className="flex gap-1 -mb-px overflow-x-auto"
                        aria-label="Tabs"
                      >
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

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                      {/* Overview Tab */}
                      {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Member Profile Card */}
                          <div className="md:col-span-2 p-4 bg-gradient-to-br from-[#00B5A5]/5 to-[#00B5A5]/10 dark:from-[#00B5A5]/10 dark:to-[#00B5A5]/5 rounded-xl border border-[#00B5A5]/20">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-[#00B5A5] rounded-xl">
                                <UserCircleIcon className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                  {application.member}
                                </h2>
                                <p className="text-sm text-[#00B5A5] font-medium">
                                  {application.membership_type}
                                </p>
                                {application.membership_number && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {application.membership_number}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div>
                            <SectionHeader
                              icon={EnvelopeIcon}
                              title="Contact Information"
                            />
                            <div className="space-y-1">
                              <InfoRow
                                icon={EnvelopeIcon}
                                label="Email"
                                value={member.email}
                              />
                              <InfoRow
                                icon={PhoneIcon}
                                label="Phone"
                                value={member.phone_number}
                              />
                              {member.secondary_email && (
                                <InfoRow
                                  icon={EnvelopeIcon}
                                  label="Secondary Email"
                                  value={member.secondary_email}
                                />
                              )}
                              {member.date_of_birth && (
                                <InfoRow
                                  icon={CalendarIcon}
                                  label="Date of Birth"
                                  value={formatDate(member.date_of_birth)}
                                />
                              )}
                            </div>
                          </div>

                          {/* Organization */}
                          <div>
                            <SectionHeader
                              icon={BuildingOfficeIcon}
                              title="Organization"
                            />
                            <div className="space-y-1">
                              <InfoRow
                                icon={BuildingOfficeIcon}
                                label="Organization"
                                value={
                                  application.Abbreviation
                                    ? `${application.name_of_organization} (${application.Abbreviation})`
                                    : application.name_of_organization
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

                          {/* Application Details */}
                          <div className="md:col-span-2">
                            <SectionHeader
                              icon={CalendarIcon}
                              title="Application Details"
                            />
                            <InfoRow
                              icon={CalendarIcon}
                              label="Application Date"
                              value={formatDate(application.application_date)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Practice Tab */}
                      {activeTab === "practice" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Fields of Practice */}
                          <div>
                            <SectionHeader
                              icon={AcademicCapIcon}
                              title="Fields of Practice"
                            />
                            {application.fieldsOfPractices.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {application.fieldsOfPractices
                                  .filter(
                                    (f, i, arr) =>
                                      arr.findIndex(
                                        (x) =>
                                          x.id === f.id &&
                                          x.is_primary === f.is_primary,
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

                          {/* Countries of Practice */}
                          <div>
                            <SectionHeader
                              icon={GlobeAltIcon}
                              title="Countries of Practice"
                            />
                            {application.countriesOfPractice.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {application.countriesOfPractice.map(
                                  (country, index) => (
                                    <TagBadge
                                      key={`${country.id}-${index}`}
                                      label={`${country.country} (${country.region})`}
                                      isPrimary={country.is_primary}
                                    />
                                  ),
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No countries of practice specified
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Documents Tab */}
                      {activeTab === "documents" && (
                        <div>
                          <SectionHeader
                            icon={DocumentTextIcon}
                            title="Uploaded Documents"
                          />
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

                      {/* Compliance Tab */}
                      {activeTab === "compliance" && (
                        <div>
                          <SectionHeader
                            icon={CheckBadgeIcon}
                            title="Compliance Status"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ComplianceCard
                              title="Code of Conduct"
                              description={
                                application.abide_with_code_of_conduct
                                  ? "Accepted"
                                  : "Not accepted"
                              }
                              isCompliant={
                                application.abide_with_code_of_conduct
                              }
                            />
                            <ComplianceCard
                              title="Constitution"
                              description={
                                application.comply_with_current_constitution
                                  ? "Compliant"
                                  : "Not compliant"
                              }
                              isCompliant={
                                application.comply_with_current_constitution
                              }
                            />
                            <ComplianceCard
                              title="Declaration"
                              description={
                                application.declaration
                                  ? "Signed"
                                  : "Not signed"
                              }
                              isCompliant={application.declaration}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {canGenerateCertificate && onGeneratePDF && (
                      <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button
                          onClick={onGeneratePDF}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white font-medium rounded-xl transition-colors"
                        >
                          <DocumentArrowDownIcon className="w-5 h-5" />
                          Download Certificate
                        </button>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>

      {/* File Viewer Modal */}
      <FileViewer
        isOpen={fileViewerOpen}
        onClose={closeFile}
        fileUrl={fileUrl}
        fileName={fileName}
      />
    </>
  );
}
