"use client";

import { useState } from "react";
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  CalendarIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

// Types based on API response
interface MemberDetails {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  secondary_email?: string;
  alternative_phone?: string;
  whatsapp_number?: string;
  role: string;
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth?: string;
  national_ID?: string;
  passport?: string;
  public_profile?: string;
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
  membership_number: string;
  employement?: string;
  qualification?: string;
  cv_resume?: string;
  associate_category?: string;
  university?: string;
  passport?: string;
  passport_national_id_from?: string;
  degree?: string;
  graduation_year?: string;
  proof_of_registration?: string;
  country_of_study?: string;
  name_of_organization?: string;
  Abbreviation?: string;
  country_of_residency?: string;
  country_of_operation?: string;
  company_email?: string;
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

interface MemberApplicationDetailProps {
  application: MemberApplication;
  onRefresh: () => void;
  loading?: boolean;
  onGeneratePDF?: () => void;
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes("certificate") || normalizedStatus.includes("generated")) {
      return {
        icon: SparklesIcon,
        bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
        text: "text-white",
        label: "Certificate Generated",
      };
    }
    if (normalizedStatus.includes("approved")) {
      return {
        icon: CheckCircleIcon,
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-400",
        label: "Approved",
      };
    }
    if (normalizedStatus.includes("pending")) {
      return {
        icon: ClockIcon,
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-700 dark:text-amber-400",
        label: "Pending Review",
      };
    }
    if (normalizedStatus.includes("rejected")) {
      return {
        icon: XCircleIcon,
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        label: "Rejected",
      };
    }
    return {
      icon: ClockIcon,
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-700 dark:text-gray-300",
      label: status,
    };
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
      <Icon className="w-5 h-5" />
      {config.label}
    </span>
  );
}

// Info Card Component
function InfoCard({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  className?: string;
}) {
  if (!value) return null;
  
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#00B5A5]/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#00B5A5]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// Compliance Item Component
function ComplianceItem({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
      {checked ? (
        <CheckCircleSolid className="w-6 h-6 text-emerald-500 flex-shrink-0" />
      ) : (
        <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
      )}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    </div>
  );
}

// Document Card Component
function DocumentCard({ document }: { document: Document }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <a
      href={document.document_path}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#00B5A5] dark:hover:border-[#00B5A5] hover:shadow-lg transition-all bg-white dark:bg-gray-800"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <DocumentTextIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#00B5A5] transition-colors">
          {document.document_type}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Uploaded {formatDate(document.uploaded_at)}
        </p>
      </div>
      <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-400 group-hover:text-[#00B5A5] transition-colors flex-shrink-0" />
    </a>
  );
}

// Tag/Chip Component
function Tag({
  children,
  primary = false,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
        primary
          ? "bg-[#00B5A5]/10 text-[#00B5A5] ring-1 ring-[#00B5A5]/20"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
      }`}
    >
      {primary && <CheckBadgeIcon className="w-4 h-4" />}
      {children}
    </span>
  );
}

// Main Component
export default function MemberApplicationDetail({
  application,
  onRefresh,
  loading = false,
  onGeneratePDF,
}: MemberApplicationDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const member = application.member_details;
  const isCertificateGenerated = application.application_status
    .toLowerCase()
    .includes("certificate");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl mb-6">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00B5A5]/5 via-transparent to-blue-500/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B5A5]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative p-6 sm:p-8">
            {/* Top Actions */}
            <div className="flex items-center justify-between mb-6">
              <StatusBadge status={application.application_status} />
              <div className="flex items-center gap-2">
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
                {onGeneratePDF && (
                  <button
                    onClick={onGeneratePDF}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#009985] rounded-lg transition-colors"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Download PDF
                  </button>
                )}
              </div>
            </div>

            {/* Member Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#00B5A5] to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {application.member
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    {application.member}
                  </h1>
                  {member.verified && (
                    <CheckCircleSolid className="w-6 h-6 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00B5A5]">
                    <IdentificationIcon className="w-4 h-4" />
                    {application.membership_number}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <AcademicCapIcon className="w-4 h-4" />
                    {application.membership_type}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    Applied {formatShortDate(application.application_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {isCertificateGenerated && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      Congratulations! Your membership certificate has been generated.
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                      You can download it from your certificates section.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <SectionHeader
                icon={UserIcon}
                title="Contact Information"
                subtitle="Personal and contact details"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoCard
                  icon={EnvelopeIcon}
                  label="Primary Email"
                  value={member.email}
                />
                <InfoCard
                  icon={EnvelopeIcon}
                  label="Secondary Email"
                  value={member.secondary_email}
                />
                <InfoCard
                  icon={PhoneIcon}
                  label="Phone Number"
                  value={member.phone_number}
                />
                <InfoCard
                  icon={PhoneIcon}
                  label="Alternative Phone"
                  value={member.alternative_phone}
                />
                <InfoCard
                  icon={CalendarIcon}
                  label="Date of Birth"
                  value={formatShortDate(member.date_of_birth)}
                />
                <InfoCard
                  icon={MapPinIcon}
                  label="Country of Residency"
                  value={application.country_of_residency}
                />
              </div>
            </div>

            {/* Organization Details */}
            {(application.name_of_organization || application.company_email) && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <SectionHeader
                  icon={BuildingOfficeIcon}
                  title="Organization"
                  subtitle="Professional affiliation"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoCard
                    icon={BuildingOfficeIcon}
                    label="Organization Name"
                    value={application.name_of_organization}
                  />
                  <InfoCard
                    icon={IdentificationIcon}
                    label="Abbreviation"
                    value={application.Abbreviation}
                  />
                  <InfoCard
                    icon={EnvelopeIcon}
                    label="Company Email"
                    value={application.company_email}
                  />
                  <InfoCard
                    icon={GlobeAltIcon}
                    label="Country of Operation"
                    value={application.country_of_operation}
                  />
                </div>
              </div>
            )}

            {/* Fields of Practice */}
            {application.fieldsOfPractices.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <SectionHeader
                  icon={BriefcaseIcon}
                  title="Fields of Practice"
                  subtitle="Areas of professional expertise"
                />
                
                <div className="flex flex-wrap gap-2">
                  {application.fieldsOfPractices.map((field, index) => (
                    <Tag key={`${field.id}-${index}`} primary={field.is_primary}>
                      {field.field_of_practice}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Countries of Practice */}
            {application.countriesOfPractice.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <SectionHeader
                  icon={GlobeAltIcon}
                  title="Countries of Practice"
                  subtitle="Geographic areas of operation"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {application.countriesOfPractice.map((country, index) => (
                    <div
                      key={`${country.id}-${index}`}
                      className={`flex items-center gap-3 p-4 rounded-xl border ${
                        country.is_primary
                          ? "border-[#00B5A5] bg-[#00B5A5]/5"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          country.is_primary
                            ? "bg-[#00B5A5]/10"
                            : "bg-gray-100 dark:bg-gray-600"
                        }`}
                      >
                        <MapPinIcon
                          className={`w-5 h-5 ${
                            country.is_primary
                              ? "text-[#00B5A5]"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {country.country}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {country.region}
                          {country.is_primary && (
                            <span className="ml-2 text-[#00B5A5] font-medium">
                              • Primary
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Documents */}
            {application.documents.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <SectionHeader
                  icon={DocumentCheckIcon}
                  title="Documents"
                  subtitle={`${application.documents.length} uploaded`}
                />
                
                <div className="space-y-3">
                  {application.documents.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              </div>
            )}

            {/* Compliance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <SectionHeader
                icon={ShieldCheckIcon}
                title="Compliance"
                subtitle="Declarations and agreements"
              />
              
              <div className="space-y-3">
                <ComplianceItem
                  label="Abides by Code of Conduct"
                  checked={application.abide_with_code_of_conduct}
                />
                <ComplianceItem
                  label="Complies with Constitution"
                  checked={application.comply_with_current_constitution}
                />
                <ComplianceItem
                  label="Declaration Signed"
                  checked={application.declaration}
                />
                <ComplianceItem
                  label="In Compliance"
                  checked={!application.incompliance}
                />
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <SectionHeader
                icon={ShieldCheckIcon}
                title="Account Status"
                subtitle="Verification and activity"
              />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Verified
                  </span>
                  {member.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircleSolid className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <ClockIcon className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Account Status
                  </span>
                  {member.active ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircleSolid className="w-4 h-4" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                      <XCircleIcon className="w-4 h-4" />
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Role
                  </span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">
                    {member.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}