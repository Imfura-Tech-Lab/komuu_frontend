"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
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

interface SinglePaymentClientProps {
  paymentId: string;
}

// Utility functions
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
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
  if (!dateString) return "N/A";
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
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        gradientFrom: "from-emerald-500",
        gradientTo: "to-teal-600",
        icon: CheckCircleIcon,
      };
    case "pending":
      return {
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
        borderColor: "border-amber-200 dark:border-amber-800",
        gradientFrom: "from-amber-500",
        gradientTo: "to-orange-600",
        icon: ClockIcon,
      };
    case "failed":
    case "cancelled":
      return {
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
        borderColor: "border-red-200 dark:border-red-800",
        gradientFrom: "from-red-500",
        gradientTo: "to-rose-600",
        icon: XCircleIcon,
      };
    default:
      return {
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-100 dark:bg-gray-900/30",
        borderColor: "border-gray-200 dark:border-gray-800",
        gradientFrom: "from-gray-500",
        gradientTo: "to-gray-600",
        icon: ClockIcon,
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

// Loading Skeleton
function PaymentDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mb-8" />

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Info Card Component
function InfoCard({
  title,
  children,
  icon: Icon,
  action,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Detail Row Component
function DetailRow({
  label,
  value,
  copyable,
  onCopy,
  copying,
  mono,
}: {
  label: string;
  value: string | React.ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
  copying?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium text-gray-900 dark:text-white text-right ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </span>
        {copyable && onCopy && (
          <button
            onClick={onCopy}
            className="p-1 text-gray-400 hover:text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded transition-colors"
          >
            {copying ? (
              <CheckCircleSolid className="w-4 h-4 text-emerald-500" />
            ) : (
              <DocumentDuplicateIcon className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SinglePaymentClient({
  paymentId,
}: SinglePaymentClientProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    const parsedUserData = userData ? JSON.parse(userData) : null;
    const role = parsedUserData?.role || null;
    setUserRole(role);

    if (paymentId && role !== null) {
      fetchPayment(role);
    }
  }, [paymentId]);

  const fetchPayment = async (role: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view payment details");
        router.push("/login");
        return;
      }

      const endpoint =
        role === "Member"
          ? `${apiUrl}membership/payments/${paymentId}`
          : `${apiUrl}payments/${paymentId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Payment not found.");
        }
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status === "success") {
        setPayment(responseData.data);
      } else {
        throw new Error(
          responseData.message || "Failed to fetch payment details."
        );
      }
    } catch (err) {
      console.error("Failed to fetch payment:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch payment.");
      showErrorToast("Failed to load payment details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    setCopying(label);
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast(`${label} copied!`);
    } catch {
      showErrorToast("Failed to copy");
    } finally {
      setTimeout(() => setCopying(null), 1500);
    }
  };

  const paymentsBasePath = userRole === "Member" ? "/my-payments" : "/payments";
  const certificatesBasePath =
    userRole === "Member" ? "/my-certificates" : "/certificates";
  const membersBasePath = "/members";

  // Loading State
  if (loading || userRole === null) {
    return <PaymentDetailsSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Payment
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => fetchPayment(userRole)}
                className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push(paymentsBasePath)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Payments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <CreditCardIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Payment Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The requested payment could not be found.
            </p>
            <button
              onClick={() => router.push(paymentsBasePath)}
              className="px-6 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
            >
              Back to Payments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;
  const MethodIcon = getMethodIcon(payment.payment_method);
  const member = payment.application.member_details;
  const application = payment.application;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(paymentsBasePath)}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Payments
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payment Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Transaction #{payment.transaction_number}
              </p>
            </div>
            <button
              onClick={() => fetchPayment(userRole)}
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

        {/* Hero Card */}
        <div
          className={`bg-gradient-to-br ${statusConfig.gradientFrom} ${statusConfig.gradientTo} rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-lg`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                <MethodIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Amount Paid</p>
                <p className="text-3xl sm:text-4xl font-bold">
                  {payment.amount_paid}
                </p>
                <p className="text-white/80 mt-1">
                  {payment.payment_method} via {payment.gateway}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                <StatusIcon className="w-5 h-5" />
                <span className="font-semibold">{payment.status}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm">
                  {formatDateTime(payment.payment_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">
                Member ID
              </p>
              <p className="font-semibold mt-1">{payment.member}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">
                Membership
              </p>
              <p className="font-semibold mt-1">
                {application.membership_type}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">
                Certificate
              </p>
              <p className="font-semibold mt-1 flex items-center gap-1">
                {payment.is_certificate_generated ? (
                  <>
                    <CheckCircleSolid className="w-4 h-4" />
                    Generated
                  </>
                ) : (
                  <>
                    <ClockIcon className="w-4 h-4" />
                    Pending
                  </>
                )}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wider">
                App Status
              </p>
              <p className="font-semibold mt-1">
                {application.application_status}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transaction & Application */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Details */}
            <InfoCard title="Transaction Details" icon={CreditCardIcon}>
              <div className="space-y-1">
                <DetailRow label="Payment ID" value={`#${payment.id}`} />
                <DetailRow
                  label="Transaction Number"
                  value={payment.transaction_number}
                  copyable
                  onCopy={() =>
                    handleCopy(payment.transaction_number, "Transaction")
                  }
                  copying={copying === "Transaction"}
                  mono
                />
                <DetailRow
                  label="Payment Method"
                  value={payment.payment_method}
                />
                <DetailRow label="Payment Gateway" value={payment.gateway} />
                <DetailRow label="Amount" value={payment.amount_paid} />
                <DetailRow
                  label="Payment Date"
                  value={formatDateTime(payment.payment_date)}
                />
                <DetailRow
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {payment.status}
                    </span>
                  }
                />
              </div>
            </InfoCard>

            {/* Application Details */}
            <InfoCard title="Application Details" icon={DocumentTextIcon}>
              <div className="space-y-1">
                <DetailRow
                  label="Application ID"
                  value={application.id.substring(0, 18) + "..."}
                  copyable
                  onCopy={() => handleCopy(application.id, "Application ID")}
                  copying={copying === "Application ID"}
                  mono
                />
                <DetailRow
                  label="Membership Type"
                  value={application.membership_type}
                />
                <DetailRow
                  label="Membership Number"
                  value={application.membership_number}
                />
                <DetailRow
                  label="Application Status"
                  value={
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      <CheckBadgeIcon className="w-3.5 h-3.5" />
                      {application.application_status}
                    </span>
                  }
                />
                <DetailRow
                  label="Application Date"
                  value={formatDateTime(application.application_date)}
                />
                <DetailRow
                  label="Country of Residency"
                  value={application.country_of_residency}
                />
              </div>

              {/* Compliance Badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Compliance Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {application.abide_with_code_of_conduct && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircleSolid className="w-3 h-3" />
                      Code of Conduct
                    </span>
                  )}
                  {application.comply_with_current_constitution && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircleSolid className="w-3 h-3" />
                      Constitution
                    </span>
                  )}
                  {application.declaration && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircleSolid className="w-3 h-3" />
                      Declaration
                    </span>
                  )}
                </div>
              </div>
            </InfoCard>

            {/* Organization Info (if available) */}
            {application.name_of_organization && (
              <InfoCard title="Organization" icon={BuildingOfficeIcon}>
                <div className="space-y-1">
                  <DetailRow
                    label="Organization Name"
                    value={application.name_of_organization}
                  />
                  {application.Abbreviation && (
                    <DetailRow
                      label="Abbreviation"
                      value={application.Abbreviation}
                    />
                  )}
                  {application.company_email && (
                    <DetailRow
                      label="Company Email"
                      value={application.company_email}
                      copyable
                      onCopy={() =>
                        handleCopy(application.company_email!, "Email")
                      }
                      copying={copying === "Email"}
                    />
                  )}
                </div>
              </InfoCard>
            )}
          </div>

          {/* Right Column - Member Info & Actions */}
          <div className="space-y-6">
            {/* Member Card */}
            <InfoCard
              title="Member Information"
              icon={UserIcon}
              action={
                userRole !== "Member" && (
                  <button
                    onClick={() =>
                      router.push(`${membersBasePath}?search=${payment.member}`)
                    }
                    className="text-xs text-[#00B5A5] hover:underline flex items-center gap-1"
                  >
                    View Profile
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </button>
                )
              }
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex items-center justify-center text-white font-bold text-lg">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {member.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#00B5A5]/10 text-[#00B5A5]">
                      {payment.member}
                    </span>
                    {member.verified && (
                      <CheckBadgeIcon
                        className="w-4 h-4 text-blue-500"
                        title="Verified"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300 truncate">
                    {member.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {member.phone_number}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Born {formatDate(member.date_of_birth)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {application.country_of_residency}
                  </span>
                </div>
              </div>

              {/* Status Badges */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    member.active
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {member.active ? (
                    <CheckCircleSolid className="w-3 h-3" />
                  ) : (
                    <XCircleIcon className="w-3 h-3" />
                  )}
                  {member.active ? "Active" : "Inactive"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                  {member.role}
                </span>
              </div>
            </InfoCard>

            {/* Certificate Status */}
            <InfoCard title="Certificate Status" icon={ShieldCheckIcon}>
              <div
                className={`p-4 rounded-lg border ${
                  payment.is_certificate_generated
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  {payment.is_certificate_generated ? (
                    <CheckCircleSolid className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ClockIcon className="w-8 h-8 text-amber-500" />
                  )}
                  <div>
                    <p
                      className={`font-semibold ${
                        payment.is_certificate_generated
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {payment.is_certificate_generated
                        ? "Certificate Generated"
                        : "Certificate Pending"}
                    </p>
                    <p
                      className={`text-sm ${
                        payment.is_certificate_generated
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {payment.is_certificate_generated
                        ? "Ready for download"
                        : "Will be available soon"}
                    </p>
                  </div>
                </div>
              </div>

              {payment.is_certificate_generated && (
                <button
                  onClick={() => router.push(certificatesBasePath)}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  View Certificate
                </button>
              )}
            </InfoCard>

            {/* Quick Actions */}
            <InfoCard title="Quick Actions">
              <div className="space-y-3">
                <button
                  onClick={() =>
                    handleCopy(
                      `Payment #${payment.id}\nAmount: ${
                        payment.amount_paid
                      }\nTransaction: ${payment.transaction_number}\nStatus: ${
                        payment.status
                      }\nDate: ${formatDateTime(
                        payment.payment_date
                      )}\nMember: ${member.name} (${payment.member})`,
                      "Payment Details"
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  {copying === "Payment Details"
                    ? "Copied!"
                    : "Copy All Details"}
                </button>
                <button
                  onClick={() => router.push(paymentsBasePath)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to All Payments
                </button>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
