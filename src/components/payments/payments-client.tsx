"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  UserIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  ReceiptPercentIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

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

interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface PaymentsResponse {
  current_page: number;
  data: Payment[];
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

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return {
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: CheckCircleIcon,
        dotColor: "bg-emerald-500",
      };
    case "pending":
      return {
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        icon: ClockIcon,
        dotColor: "bg-amber-500",
      };
    case "failed":
    case "cancelled":
      return {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircleIcon,
        dotColor: "bg-red-500",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        icon: ClockIcon,
        dotColor: "bg-gray-500",
      };
  }
};

const getMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case "credit card":
      return CreditCardIcon;
    case "bank transfer":
      return BuildingLibraryIcon;
    case "mobile money":
      return DevicePhoneMobileIcon;
    default:
      return BanknotesIcon;
  }
};

// Stats Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {subtext && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {subtext}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Payment Card Component
function PaymentCard({
  payment,
  onViewDetails,
}: {
  payment: Payment;
  onViewDetails: (payment: Payment) => void;
}) {
  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;
  const MethodIcon = getMethodIcon(payment.payment_method);

  return (
    <div
      onClick={() => onViewDetails(payment)}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-[#00B5A5]/50 dark:hover:border-[#00B5A5]/50 transition-all cursor-pointer group"
    >
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00B5A5]/10 dark:bg-[#00B5A5]/20 text-[#00B5A5] group-hover:bg-[#00B5A5] group-hover:text-white transition-colors">
              <MethodIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {payment.amount_paid}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {payment.payment_method}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
            {payment.status}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Member Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex items-center justify-center text-white font-medium text-sm">
            {payment.application.member_details.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {payment.application.member_details.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {payment.member} • {payment.application.membership_type}
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Transaction</p>
            <p className="font-mono text-gray-900 dark:text-white text-xs truncate">
              #{payment.transaction_number}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs">Date</p>
            <p className="text-gray-900 dark:text-white text-xs">
              {formatDate(payment.payment_date)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-1.5">
            <BuildingLibraryIcon className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {payment.gateway}
            </span>
          </div>
          {payment.is_certificate_generated && (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheckIcon className="w-4 h-4" />
              <span className="text-xs">Certificate</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Side Sheet Component
function PaymentSideSheet({
  payment,
  isOpen,
  onClose,
  onViewMember,
}: {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onViewMember: (memberNumber: string) => void;
}) {
  const [copyingField, setCopyingField] = useState<string | null>(null);

  const handleCopy = async (text: string, fieldName: string) => {
    setCopyingField(fieldName);
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`${fieldName} copied!`);
    } catch {
      showErrorToast(`Failed to copy`);
    } finally {
      setTimeout(() => setCopyingField(null), 1500);
    }
  };

  if (!payment) return null;

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;
  const MethodIcon = getMethodIcon(payment.payment_method);

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
                          Payment Details
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
                      {/* Amount Card */}
                      <div className="p-6 bg-gradient-to-br from-[#00B5A5] to-[#008F82]">
                        <div className="text-center">
                          <p className="text-white/80 text-sm mb-1">Amount Paid</p>
                          <p className="text-3xl font-bold text-white">
                            {payment.amount_paid}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
                            <StatusIcon className="w-4 h-4 text-white" />
                            <span className="text-sm font-medium text-white">
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Sections */}
                      <div className="p-6 space-y-6">
                        {/* Transaction Info */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Transaction Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Transaction Number
                                </p>
                                <p className="font-mono text-sm text-gray-900 dark:text-white">
                                  #{payment.transaction_number}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleCopy(payment.transaction_number, "Transaction")
                                }
                                className="p-2 text-gray-400 hover:text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors"
                              >
                                <DocumentDuplicateIcon className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Payment Method
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <MethodIcon className="w-4 h-4 text-[#00B5A5]" />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {payment.payment_method}
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Gateway
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                  {payment.gateway}
                                </p>
                              </div>
                            </div>

                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Payment Date
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatDateTime(payment.payment_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Member Info */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Member Information
                          </h3>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex items-center justify-center text-white font-semibold">
                                {payment.application.member_details.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {payment.application.member_details.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {payment.application.member_details.email}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#00B5A5]/10 text-[#00B5A5]">
                                    {payment.member}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                    {payment.application.membership_type}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Phone
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                  {payment.application.member_details.phone_number}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Country
                                </p>
                                <p className="text-gray-900 dark:text-white">
                                  {payment.application.country_of_residency}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => onViewMember(payment.member)}
                              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors"
                            >
                              <UserIcon className="w-4 h-4" />
                              View Member Profile
                              <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Application Info */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Application Details
                          </h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Application Status
                              </span>
                              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                {payment.application.application_status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Application Date
                              </span>
                              <span className="text-sm text-gray-900 dark:text-white">
                                {formatDate(payment.application.application_date)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Certificate Generated
                              </span>
                              {payment.is_certificate_generated ? (
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                                  <ClockIcon className="w-4 h-4" />
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Organization Info (if available) */}
                        {payment.application.name_of_organization && (
                          <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                              Organization
                            </h3>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {payment.application.name_of_organization}
                              </p>
                              {payment.application.Abbreviation && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ({payment.application.Abbreviation})
                                </p>
                              )}
                              {payment.application.company_email && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {payment.application.company_email}
                                </p>
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
                          onClick={() =>
                            (window.location.href = `/payments/${payment.id}`)
                          }
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#009985] rounded-lg transition-colors"
                        >
                          Full Details
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
function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          </div>
        ))}
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Component
export default function PaymentsClient() {
  const [paymentsData, setPaymentsData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [sideSheetOpen, setSideSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [gatewayFilter, setGatewayFilter] = useState("all");

  const router = useRouter();

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage]);

  const fetchPayments = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view payments");
        router.push("/login");
        return;
      }

      const response = await fetch(`${apiUrl}payments?page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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
        setPaymentsData(responseData.data);
      } else {
        throw new Error(responseData.message || "Failed to fetch payments");
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch payments");
      showErrorToast("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setSideSheetOpen(true);
  };

  const handleViewMember = (memberNumber: string) => {
    setSideSheetOpen(false);
    router.push(`/members?search=${memberNumber}`);
  };

  const getPaymentStats = () => {
    if (!paymentsData?.data)
      return { total: 0, completed: 0, pending: 0, failed: 0, totalAmount: 0 };

    return paymentsData.data.reduce(
      (acc, payment) => {
        acc.total++;
        if (payment.status.toLowerCase() === "completed") acc.completed++;
        if (payment.status.toLowerCase() === "pending") acc.pending++;
        if (payment.status.toLowerCase() === "failed") acc.failed++;

        const amount = parseFloat(payment.amount_paid.split(" ")[0]);
        if (!isNaN(amount)) acc.totalAmount += amount;

        return acc;
      },
      { total: 0, completed: 0, pending: 0, failed: 0, totalAmount: 0 }
    );
  };

  const filteredPayments =
    paymentsData?.data.filter((payment) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        payment.member.toLowerCase().includes(searchLower) ||
        payment.transaction_number.toLowerCase().includes(searchLower) ||
        payment.application.member_details.name.toLowerCase().includes(searchLower) ||
        payment.application.member_details.email.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "all" ||
        payment.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesGateway =
        gatewayFilter === "all" ||
        payment.gateway.toLowerCase() === gatewayFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesGateway;
    }) || [];

  const getUniqueGateways = () => {
    if (!paymentsData?.data) return [];
    return [...new Set(paymentsData.data.map((p) => p.gateway))];
  };

  const stats = getPaymentStats();

  // Error State
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Payments
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => fetchPayments(currentPage)}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payments Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and track all member payments
              </p>
            </div>
            <button
              onClick={() => fetchPayments(currentPage)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <PaymentsSkeleton />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Total Payments"
                value={stats.total}
                icon={ReceiptPercentIcon}
                color="text-gray-900 dark:text-white"
              />
              <StatCard
                title="Completed"
                value={stats.completed}
                icon={CheckCircleIcon}
                color="text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                title="Pending"
                value={stats.pending}
                icon={ClockIcon}
                color="text-amber-600 dark:text-amber-400"
              />
              <StatCard
                title="Failed"
                value={stats.failed}
                icon={XCircleIcon}
                color="text-red-600 dark:text-red-400"
              />
              <StatCard
                title="Total Amount"
                value={`$${stats.totalAmount.toFixed(2)}`}
                icon={BanknotesIcon}
                color="text-[#00B5A5]"
              />
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by member, name, email, transaction..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                {/* Gateway Filter */}
                <select
                  value={gatewayFilter}
                  onChange={(e) => setGatewayFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors"
                >
                  <option value="all">All Gateways</option>
                  {getUniqueGateways().map((gateway) => (
                    <option key={gateway} value={gateway.toLowerCase()}>
                      {gateway}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Filters */}
              {(searchTerm || statusFilter !== "all" || gatewayFilter !== "all") && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Filters:
                  </span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                      Search: {searchTerm}
                      <button
                        onClick={() => setSearchTerm("")}
                        className="hover:text-red-500"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter("all")}
                        className="hover:text-red-500"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {gatewayFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
                      Gateway: {gatewayFilter}
                      <button
                        onClick={() => setGatewayFilter("all")}
                        className="hover:text-red-500"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setGatewayFilter("all");
                    }}
                    className="text-sm text-[#00B5A5] hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredPayments.length} of {paymentsData?.total || 0} payments
              </p>
            </div>

            {/* Payments Grid */}
            {filteredPayments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <CreditCardIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Payments Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || statusFilter !== "all" || gatewayFilter !== "all"
                    ? "No payments match your current filters."
                    : "No payment records available yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPayments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {paymentsData && paymentsData.last_page > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {paymentsData.current_page} of {paymentsData.last_page}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!paymentsData.prev_page_url}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {paymentsData.links
                    .filter((link) => link.page !== null)
                    .slice(0, 5)
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
                    disabled={!paymentsData.next_page_url}
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

      {/* Side Sheet */}
      <PaymentSideSheet
        payment={selectedPayment}
        isOpen={sideSheetOpen}
        onClose={() => setSideSheetOpen(false)}
        onViewMember={handleViewMember}
      />
    </div>
  );
}