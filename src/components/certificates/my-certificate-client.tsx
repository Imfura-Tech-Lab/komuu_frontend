"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid,
} from "@heroicons/react/24/solid";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { useCertificates } from "@/lib/hooks/useCertificates";

// Types matching API response
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
  national_ID: string | null;
  passport: string | null;
  public_profile: string | null;
}

interface Application {
  id: string;
  member: string;
  application_status: string;
  application_date: string;
  membership_type: string;
  membership_number: string;
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
  country_of_residency: string;
  country_of_operation: string | null;
  company_email: string | null;
  abide_with_code_of_conduct: boolean;
  comply_with_current_constitution: boolean;
  declaration: boolean;
  incompliance: boolean;
  member_details: MemberDetails;
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
  application: Application;
}

interface Certificate {
  id: number;
  name: string;
  member_number: string;
  certificate: string | null;
  signed_date: string;
  valid_from: string;
  valid_until: string;
  next_payment_date: string;
  status: string;
  token: string;
  membership_term: string;
  created_at: string;
  payment?: Payment;
}

interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface CertificatesResponse {
  current_page: number;
  data: Certificate[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Utility functions
const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatDateTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const getDaysUntilExpiry = (validUntil: string) => {
  const expiryDate = new Date(validUntil);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getExpiryStatus = (validUntil: string) => {
  const daysLeft = getDaysUntilExpiry(validUntil);

  if (daysLeft < 0) {
    return {
      status: "expired",
      label: `Expired ${Math.abs(daysLeft)} days ago`,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      borderColor: "border-red-200 dark:border-red-800",
      icon: XCircleIcon,
      iconSolid: ExclamationTriangleSolid,
    };
  }

  if (daysLeft <= 30) {
    return {
      status: "expiring",
      label: `${daysLeft} days remaining`,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      icon: ExclamationTriangleIcon,
      iconSolid: ExclamationTriangleSolid,
    };
  }

  return {
    status: "valid",
    label: `${daysLeft} days remaining`,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircleIcon,
    iconSolid: ShieldCheckSolid,
  };
};

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// Certificate Row Component (List View - like payments)
function CertificateRow({
  certificate,
  onViewDetails,
  onDownload,
  downloading,
}: {
  certificate: Certificate;
  onViewDetails: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  const expiryStatus = getExpiryStatus(certificate.valid_until);
  const StatusIcon = expiryStatus.icon;

  return (
    <div
      onClick={onViewDetails}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-[#00B5A5]/50 transition-all cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon & Term */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00B5A5] to-[#008F82] text-white flex-shrink-0">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {certificate.membership_term}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {certificate.member_number} • {certificate.name}
            </p>
          </div>
        </div>

        {/* Center: Details */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Valid Until
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(certificate.valid_until)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Next Payment
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(certificate.next_payment_date)}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Amount Paid
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {certificate.payment?.amount_paid || "N/A"}
            </p>
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Expiry Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${expiryStatus.bgColor} ${expiryStatus.color}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {expiryStatus.status === "expired"
                ? "Expired"
                : expiryStatus.status === "expiring"
                ? "Expiring"
                : "Valid"}
            </span>
            <span className="sm:hidden">
              {getDaysUntilExpiry(certificate.valid_until)}d
            </span>
          </span>

          {/* Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            disabled={!certificate.certificate || downloading}
            className={`p-2 rounded-lg transition-colors ${
              certificate.certificate
                ? "text-[#00B5A5] hover:bg-[#00B5A5]/10"
                : "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            }`}
            title={
              certificate.certificate ? "Download Certificate" : "Not Available"
            }
          >
            {downloading ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile: Extra Info Row */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2 text-sm">
          <BanknotesIcon className="w-4 h-4 text-[#00B5A5]" />
          <span className="font-medium text-gray-900 dark:text-white">
            {certificate.payment?.amount_paid || "N/A"}
          </span>
        </div>
        <span className={`text-xs ${expiryStatus.color}`}>
          {expiryStatus.label}
        </span>
      </div>
    </div>
  );
}

// Certificate Details Side Sheet
function CertificateDetailsSheet({
  certificate,
  isOpen,
  onClose,
  onDownload,
  downloading,
}: {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  const [copyingField, setCopyingField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    setCopyingField(fieldName);
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`${fieldName} copied!`);
    } catch {
      showErrorToast("Failed to copy");
    } finally {
      setTimeout(() => setCopyingField(null), 1500);
    }
  };

  if (!certificate) return null;

  const expiryStatus = getExpiryStatus(certificate.valid_until);
  const StatusIconSolid = expiryStatus.iconSolid;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />
        </Transition.Child>

        {/* Side Sheet */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-2xl">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                          Certificate Details
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                      {/* Hero Section */}
                      <div className="relative bg-gradient-to-br from-[#00B5A5] to-[#008F82] p-6">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                        <div className="relative text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                            <ShieldCheckIcon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white">
                            {certificate.membership_term}
                          </h3>
                          <p className="text-white/80 mt-1">
                            {certificate.name}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                            <span className="text-sm font-medium text-white">
                              {certificate.member_number}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Sections */}
                      <div className="p-6 space-y-6">
                        {/* Validity Status */}
                        <div
                          className={`p-4 rounded-xl ${expiryStatus.bgColor} border ${expiryStatus.borderColor}`}
                        >
                          <div className="flex items-center gap-3">
                            <StatusIconSolid
                              className={`w-8 h-8 ${expiryStatus.color}`}
                            />
                            <div>
                              <p
                                className={`font-semibold ${expiryStatus.color}`}
                              >
                                {expiryStatus.status === "expired"
                                  ? "Certificate Expired"
                                  : expiryStatus.status === "expiring"
                                  ? "Expiring Soon"
                                  : "Valid Certificate"}
                              </p>
                              <p
                                className={`text-sm ${expiryStatus.color} opacity-80`}
                              >
                                {expiryStatus.label}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Certificate Info */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Certificate Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Certificate ID
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  #{certificate.id}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Valid From
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                  {formatDate(certificate.valid_from)}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Valid Until
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                  {formatDate(certificate.valid_until)}
                                </p>
                              </div>
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Signed Date
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {formatDateTime(certificate.signed_date)}
                              </p>
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Next Payment Due
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {formatDate(certificate.next_payment_date)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Token */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Verification Token
                          </h3>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <code className="flex-1 text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                              {certificate.token}
                            </code>
                            <button
                              onClick={() =>
                                handleCopy(certificate.token, "Token")
                              }
                              className="p-2 text-gray-400 hover:text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors flex-shrink-0"
                            >
                              {copyingField === "Token" ? (
                                <CheckCircleSolid className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <DocumentDuplicateIcon className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Payment Info */}
                        {certificate.payment && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                              Payment Information
                            </h3>
                            <div className="p-4 bg-gradient-to-br from-[#00B5A5]/10 to-transparent border border-[#00B5A5]/20 rounded-xl">
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {certificate.payment.amount_paid}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                  <CheckCircleSolid className="w-3 h-3" />
                                  {certificate.payment.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    Method
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {certificate.payment.payment_method}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    Gateway
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {certificate.payment.gateway}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    Transaction
                                  </p>
                                  <p className="font-mono text-gray-900 dark:text-white">
                                    #{certificate.payment.transaction_number}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    Date
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(
                                      certificate.payment.payment_date
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Membership Info */}
                        {certificate.payment?.application && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                              Membership Details
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                {
                                  certificate.payment.application
                                    .membership_type
                                }
                              </span>
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                {
                                  certificate.payment.application
                                    .country_of_residency
                                }
                              </span>
                              {certificate.payment.application
                                .name_of_organization && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {
                                    certificate.payment.application
                                      .name_of_organization
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex gap-3">
                        <button
                          onClick={onClose}
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={onDownload}
                          disabled={!certificate.certificate || downloading}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                            certificate.certificate
                              ? "bg-[#00B5A5] hover:bg-[#009985] text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {downloading ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          )}
                          Download Certificate
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Loading Skeleton
function CertificatesSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
              </div>
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* List Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                </div>
                <div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                </div>
                <div className="hidden sm:block">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <ShieldCheckIcon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No Certificates Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">
        You don't have any membership certificates yet. Complete your
        application and payment to receive your certificate.
      </p>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
      >
        <ArrowPathIcon className="w-5 h-5" />
        Refresh
      </button>
    </div>
  );
}

// Main Component
export default function MyCertificatesClient() {
  const [certificatesData, setCertificatesData] =
    useState<CertificatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [sideSheetOpen, setSideSheetOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const { getCertificateData } = useCertificates();

  useEffect(() => {
    fetchCertificates(currentPage);
  }, [currentPage]);

  const fetchCertificates = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view certificates");
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${apiUrl}membership/certificates?page=${page}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status === "success") {
        setCertificatesData(responseData.data);
      } else {
        throw new Error(responseData.message || "Failed to fetch certificates");
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

  const handleViewDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setSideSheetOpen(true);
  };

  const handleDownload = async (certificate: Certificate) => {
    if (!certificate.certificate && !certificate.token) {
      showErrorToast("Certificate not available for download");
      return;
    }

    try {
      setDownloadingId(certificate.id);

      // Use the useCertificates hook to get certificate data and generate PDF
      const certData = await getCertificateData(certificate.token);
      if (certData) {
        showSuccessToast("Certificate downloaded successfully");
      }
    } catch (err) {
      console.error("Download error:", err);
      showErrorToast("Failed to download certificate");
    } finally {
      setDownloadingId(null);
    }
  };

  const getStats = () => {
    if (!certificatesData?.data)
      return { total: 0, approved: 0, pending: 0, active: 0, expired: 0 };

    return certificatesData.data.reduce(
      (acc, cert) => {
        acc.total++;
        if (cert.status.toLowerCase() === "approved") acc.approved++;
        if (cert.status.toLowerCase() === "pending") acc.pending++;

        const daysLeft = getDaysUntilExpiry(cert.valid_until);
        if (daysLeft < 0) acc.expired++;
        else acc.active++;

        return acc;
      },
      { total: 0, approved: 0, pending: 0, active: 0, expired: 0 }
    );
  };

  const stats = getStats();

  // Error State
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Certificates
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => fetchCertificates(currentPage)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Certificates
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and download your membership certificates
              </p>
            </div>
            <button
              onClick={() => fetchCertificates(currentPage)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <CertificatesSkeleton />
        ) : !certificatesData || certificatesData.data.length === 0 ? (
          <EmptyState onRefresh={() => fetchCertificates(currentPage)} />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Total"
                value={stats.total}
                icon={DocumentTextIcon}
                color="text-gray-900 dark:text-white"
                bgColor="bg-gray-100 dark:bg-gray-700"
              />
              <StatCard
                title="Approved"
                value={stats.approved}
                icon={CheckCircleIcon}
                color="text-emerald-600 dark:text-emerald-400"
                bgColor="bg-emerald-100 dark:bg-emerald-900/30"
              />
              <StatCard
                title="Active"
                value={stats.active}
                icon={ShieldCheckIcon}
                color="text-blue-600 dark:text-blue-400"
                bgColor="bg-blue-100 dark:bg-blue-900/30"
              />
              <StatCard
                title="Pending"
                value={stats.pending}
                icon={ClockIcon}
                color="text-amber-600 dark:text-amber-400"
                bgColor="bg-amber-100 dark:bg-amber-900/30"
              />
              <StatCard
                title="Expired"
                value={stats.expired}
                icon={XCircleIcon}
                color="text-red-600 dark:text-red-400"
                bgColor="bg-red-100 dark:bg-red-900/30"
              />
            </div>

            {/* Certificates List */}
            <div className="space-y-4">
              {certificatesData.data.map((certificate) => (
                <CertificateRow
                  key={certificate.id}
                  certificate={certificate}
                  onViewDetails={() => handleViewDetails(certificate)}
                  onDownload={() => handleDownload(certificate)}
                  downloading={downloadingId === certificate.id}
                />
              ))}
            </div>

            {/* Pagination */}
            {certificatesData.last_page > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {certificatesData.from} to {certificatesData.to} of{" "}
                  {certificatesData.total} certificates
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!certificatesData.prev_page_url}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {certificatesData.links
                    .filter((link) => link.page !== null)
                    .map((link) => (
                      <button
                        key={link.page}
                        onClick={() => setCurrentPage(link.page!)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                          link.active
                            ? "bg-[#00B5A5] text-white"
                            : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {link.page}
                      </button>
                    ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!certificatesData.next_page_url}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Side Sheet */}
      <CertificateDetailsSheet
        certificate={selectedCertificate}
        isOpen={sideSheetOpen}
        onClose={() => setSideSheetOpen(false)}
        onDownload={() =>
          selectedCertificate && handleDownload(selectedCertificate)
        }
        downloading={
          selectedCertificate ? downloadingId === selectedCertificate.id : false
        }
      />
    </div>
  );
}
