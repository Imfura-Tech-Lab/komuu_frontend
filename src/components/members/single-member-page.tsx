"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition, Tab } from "@headlessui/react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  CreditCardIcon,
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
  AcademicCapIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  XMarkIcon,
  ChevronRightIcon,
  BanknotesIcon,
  IdentificationIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
} from "@heroicons/react/24/solid";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";
import { useFileViewer } from "@/lib/hooks/useFileViewer";
import { FileViewer } from "@/components/ui/FileViwer";

// Types matching API response
interface Country {
  id: number;
  country: string;
}

interface FieldOfPractice {
  id: number;
  field: string;
  code: string;
  description: string | null;
  total_applications: number | null;
}

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

interface PaymentApplication {
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
  application: PaymentApplication;
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
  payment: Payment;
}

interface Document {
  id: number;
  document_type: string;
  document_path: string;
  document_path_id: string;
  current: boolean;
  uploaded_at: string;
}

interface Member {
  id: string;
  title: string;
  surname: string;
  first_name: string;
  middle_name: string | null;
  email: string;
  date_of_birth: string | null;
  passport: string | null;
  passport_national_id_from: string | null;
  phone_number: string | null;
  secondary_email: string | null;
  alternative_phone: string | null;
  whatsapp_number: string | null;
  account_status: boolean;
  public_profile: string;
  incompliance: boolean;
  membership_type: string;
  membership_number: string;
  certificate_status: string;
  application_status: string;
  employement: string | null;
  forensic_field_of_practice: string | null;
  qualification: string;
  cv_resume: string;
  associate_category: string;
  university: string;
  degree: string;
  degree_year: string;
  country_of_study: string;
  proof_of_registration: string;
  name_of_organization: string;
  Abbreviation: string;
  application_date: string;
  country_of_residency: Country;
  country_of_practice: Country[];
  field_of_practice: FieldOfPractice[];
  sector_of_employment: any[];
  latest_certificate: Certificate | null;
  certificates: Certificate[];
  payments: Payment[];
  documents: Document[];
}

// Utility functions
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not provided";
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

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "Not provided";
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
  const statusLower = status.toLowerCase();
  if (statusLower.includes("approved") || statusLower.includes("completed") || statusLower.includes("generated") || statusLower.includes("active")) {
    return {
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      icon: CheckCircleIcon,
    };
  }
  if (statusLower.includes("pending") || statusLower.includes("processing")) {
    return {
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      icon: ClockIcon,
    };
  }
  if (statusLower.includes("rejected") || statusLower.includes("failed") || statusLower.includes("expired")) {
    return {
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      borderColor: "border-red-200 dark:border-red-800",
      icon: XCircleIcon,
    };
  }
  return {
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    borderColor: "border-gray-200 dark:border-gray-800",
    icon: ClockIcon,
  };
};

// Loading Skeleton
function MemberDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
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
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
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
  const displayValue = typeof value === "string" && (value === "NA" || value === "") ? "Not provided" : value;
  
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-gray-900 dark:text-white text-right ${mono ? "font-mono" : ""}`}>
          {displayValue}
        </span>
        {copyable && onCopy && typeof value === "string" && value !== "NA" && value !== "" && (
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

// Profile Avatar Component
function ProfileAvatar({ member, size = "large" }: { member: Member; size?: "small" | "large" | "xl" }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const initials = [member.first_name?.[0], member.surname?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    small: "w-12 h-12 text-lg",
    large: "w-20 h-20 text-2xl",
    xl: "w-28 h-28 text-3xl",
  };

  const isValidImageUrl = member.public_profile && member.public_profile !== "NA" && member.public_profile.trim() !== "";

  if (!isValidImageUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex items-center justify-center text-white font-bold shadow-lg`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden shadow-lg`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#00B5A5] border-t-transparent rounded-full" />
        </div>
      )}
      <img
        src={member.public_profile}
        alt={`${member.first_name} ${member.surname}`}
        className={`w-full h-full object-cover ${imageLoading ? "opacity-0" : "opacity-100"} transition-opacity`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageLoading(false);
          setImageError(true);
        }}
      />
    </div>
  );
}

// Certificate Card Component
function CertificateCard({ certificate, onViewPayment }: { certificate: Certificate; onViewPayment: (payment: Payment) => void }) {
  const statusConfig = getStatusConfig(certificate.status);
  const StatusIcon = statusConfig.icon;
  const isExpired = new Date(certificate.valid_until) < new Date();

  return (
    <div className={`p-4 rounded-xl border ${isExpired ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800" : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{certificate.membership_term}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">#{certificate.member_number}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {certificate.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Valid From</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(certificate.valid_from)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Valid Until</p>
          <p className={`font-medium ${isExpired ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
            {formatDate(certificate.valid_until)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Signed Date</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(certificate.signed_date)}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Next Payment</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(certificate.next_payment_date)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
        <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
          {certificate.token.substring(0, 16)}...
        </code>
        <button
          onClick={() => onViewPayment(certificate.payment)}
          className="text-xs text-[#00B5A5] hover:underline flex items-center gap-1"
        >
          View Payment
          <ChevronRightIcon className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// Payment Card Component
function PaymentCard({ payment, onClick }: { payment: Payment; onClick: () => void }) {
  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-[#00B5A5]/50 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-lg text-gray-900 dark:text-white">{payment.amount_paid}</p>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {payment.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Method</p>
          <p className="font-medium text-gray-900 dark:text-white">{payment.payment_method}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Gateway</p>
          <p className="font-medium text-gray-900 dark:text-white">{payment.gateway}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Transaction</p>
          <p className="font-mono text-gray-900 dark:text-white">#{payment.transaction_number}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Date</p>
          <p className="font-medium text-gray-900 dark:text-white">{formatDate(payment.payment_date)}</p>
        </div>
      </div>
      {payment.is_certificate_generated && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ShieldCheckIcon className="w-4 h-4" />
          <span className="text-xs">Certificate Generated</span>
        </div>
      )}
    </div>
  );
}

// Document Card Component
function DocumentCard({ 
  document, 
  onViewFile 
}: { 
  document: Document; 
  onViewFile: (url: string, name: string, type: "pdf" | "image" | "document") => void;
}) {
  const getDocumentIcon = (type: string) => {
    if (type.toLowerCase().includes("cv") || type.toLowerCase().includes("resume")) {
      return DocumentTextIcon;
    }
    if (type.toLowerCase().includes("qualification")) {
      return AcademicCapIcon;
    }
    return DocumentArrowDownIcon;
  };

  const getFileType = (path: string): "pdf" | "image" | "document" => {
    const lowerPath = path.toLowerCase();
    if (lowerPath.includes(".pdf")) return "pdf";
    if (lowerPath.includes(".jpg") || lowerPath.includes(".jpeg") || lowerPath.includes(".png") || lowerPath.includes(".gif") || lowerPath.includes(".webp")) return "image";
    return "document";
  };

  const Icon = getDocumentIcon(document.document_type);
  const fileType = getFileType(document.document_path);

  const handleView = () => {
    onViewFile(document.document_path, document.document_type, fileType);
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#00B5A5]/10 text-[#00B5A5]">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{document.document_type}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Uploaded {formatDate(document.uploaded_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {document.current && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            Current
          </span>
        )}
        <button
          onClick={handleView}
          className="p-2 text-gray-400 hover:text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors"
          title="View document"
        >
          <EyeIcon className="w-5 h-5" />
        </button>
        <a
          href={document.document_path}
          download
          className="p-2 text-gray-400 hover:text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors"
          title="Download document"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}

// Payment Side Sheet
function PaymentSideSheet({
  payment,
  isOpen,
  onClose,
}: {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!payment) return null;

  const statusConfig = getStatusConfig(payment.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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

                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="p-6 bg-gradient-to-br from-[#00B5A5] to-[#008F82] rounded-xl text-white text-center mb-6">
                        <p className="text-white/80 text-sm mb-1">Amount Paid</p>
                        <p className="text-3xl font-bold">{payment.amount_paid}</p>
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">{payment.status}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <DetailRow label="Transaction Number" value={payment.transaction_number} mono />
                        <DetailRow label="Payment Method" value={payment.payment_method} />
                        <DetailRow label="Gateway" value={payment.gateway} />
                        <DetailRow label="Payment Date" value={formatDateTime(payment.payment_date)} />
                        <DetailRow
                          label="Certificate"
                          value={
                            payment.is_certificate_generated ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircleSolid className="w-4 h-4" />
                                Generated
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <ClockIcon className="w-4 h-4" />
                                Pending
                              </span>
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
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

interface SingleMemberPageProps {
  memberId: string;
}

export default function SingleMemberPage({ memberId }: SingleMemberPageProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);

  const router = useRouter();
  const fileViewer = useFileViewer();

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view member");
        router.push("/login");
        return;
      }

      const response = await fetch(`${apiUrl}members/${memberId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Member not found");
        }
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status === "success") {
        setMember(responseData.data);
      } else {
        throw new Error(responseData.message || "Failed to fetch member");
      }
    } catch (err) {
      console.error("Failed to fetch member:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch member");
      showErrorToast("Failed to load member details");
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

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentSheetOpen(true);
  };

  const getDisplayName = (m: Member) => {
    return [m.title, m.first_name, m.middle_name, m.surname].filter(Boolean).join(" ");
  };

  const getUniqueFieldsOfPractice = (fields: FieldOfPractice[]) => {
    const seen = new Set();
    return fields.filter((field) => {
      if (seen.has(field.id)) return false;
      seen.add(field.id);
      return true;
    });
  };

  // Loading State
  if (loading) {
    return <MemberDetailsSkeleton />;
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
              Error Loading Member
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={fetchMember}
                className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/members")}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Members
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Member Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The requested member could not be found.
            </p>
            <button
              onClick={() => router.push("/members")}
              className="px-6 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
            >
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  const certificateStatusConfig = getStatusConfig(member.certificate_status);
  const applicationStatusConfig = getStatusConfig(member.application_status);
  const uniqueFields = getUniqueFieldsOfPractice(member.field_of_practice || []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/members")}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Members
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Details</h1>
            <button
              onClick={fetchMember}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6">
            <ProfileAvatar member={member} size="xl" />
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getDisplayName(member)}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{member.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#00B5A5]/10 text-[#00B5A5]">
                      {member.membership_number}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                      {member.membership_type}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${member.account_status ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                    {member.account_status ? <CheckCircleSolid className="w-4 h-4" /> : <XCircleSolid className="w-4 h-4" />}
                    {member.account_status ? "Active" : "Inactive"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${!member.incompliance ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
                    {!member.incompliance ? <ShieldCheckIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    {!member.incompliance ? "Compliant" : "Non-compliant"}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Certificate</p>
                  <p className={`font-semibold mt-1 ${certificateStatusConfig.color}`}>
                    {member.certificate_status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Application</p>
                  <p className={`font-semibold mt-1 ${applicationStatusConfig.color}`}>
                    {member.application_status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Country</p>
                  <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                    {member.country_of_residency?.country || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Applied</p>
                  <p className="font-semibold mt-1 text-gray-900 dark:text-white">
                    {formatDate(member.application_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-white dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700 mb-6">
            {["Overview", "Certificates", "Payments", "Documents"].map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
                    selected
                      ? "bg-[#00B5A5] text-white shadow"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* Overview Tab */}
            <Tab.Panel className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <InfoCard title="Personal Information" icon={UserIcon}>
                  <div className="space-y-1">
                    <DetailRow label="Full Name" value={getDisplayName(member)} />
                    <DetailRow
                      label="Email"
                      value={member.email}
                      copyable
                      onCopy={() => handleCopy(member.email, "Email")}
                      copying={copying === "Email"}
                    />
                    <DetailRow
                      label="Phone"
                      value={member.phone_number || "Not provided"}
                      copyable={!!member.phone_number}
                      onCopy={() => member.phone_number && handleCopy(member.phone_number, "Phone")}
                      copying={copying === "Phone"}
                    />
                    <DetailRow label="Secondary Email" value={member.secondary_email || "Not provided"} />
                    <DetailRow label="Alternative Phone" value={member.alternative_phone || "Not provided"} />
                    <DetailRow label="WhatsApp" value={member.whatsapp_number || "Not provided"} />
                    <DetailRow label="Date of Birth" value={formatDate(member.date_of_birth)} />
                    <DetailRow label="Passport" value={member.passport || "Not provided"} />
                  </div>
                </InfoCard>

                {/* Location Information */}
                <InfoCard title="Location" icon={MapPinIcon}>
                  <div className="space-y-1">
                    <DetailRow label="Country of Residency" value={member.country_of_residency?.country || "Not set"} />
                    <div className="py-3 border-b border-gray-100 dark:border-gray-700/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Countries of Practice</p>
                      <div className="flex flex-wrap gap-2">
                        {member.country_of_practice && member.country_of_practice.length > 0 ? (
                          member.country_of_practice.map((country) => (
                            <span
                              key={country.id}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            >
                              <GlobeAltIcon className="w-3 h-3 mr-1" />
                              {country.country}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </InfoCard>

                {/* Professional Information */}
                <InfoCard title="Professional Information" icon={BriefcaseIcon}>
                  <div className="space-y-1">
                    <DetailRow label="Employment" value={member.employement} />
                    <div className="py-3 border-b border-gray-100 dark:border-gray-700/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Fields of Practice</p>
                      <div className="flex flex-wrap gap-2">
                        {uniqueFields.length > 0 ? (
                          uniqueFields.map((field) => (
                            <span
                              key={field.id}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#00B5A5]/10 text-[#00B5A5]"
                            >
                              {field.field}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Not specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </InfoCard>

                {/* Education */}
                <InfoCard title="Education" icon={AcademicCapIcon}>
                  <div className="space-y-1">
                    <DetailRow label="University" value={member.university} />
                    <DetailRow label="Degree" value={member.degree} />
                    <DetailRow label="Graduation Year" value={member.degree_year} />
                    <DetailRow label="Country of Study" value={member.country_of_study} />
                    <DetailRow label="Qualification" value={member.qualification} />
                  </div>
                </InfoCard>

                {/* Organization */}
                {member.name_of_organization && member.name_of_organization !== "NA" && (
                  <InfoCard title="Organization" icon={BuildingOfficeIcon}>
                    <div className="space-y-1">
                      <DetailRow label="Organization Name" value={member.name_of_organization} />
                      <DetailRow label="Abbreviation" value={member.Abbreviation} />
                    </div>
                  </InfoCard>
                )}

                {/* Latest Certificate Quick View */}
                {member.latest_certificate && (
                  <InfoCard title="Current Certificate" icon={ShieldCheckIcon}>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {member.latest_certificate.membership_term}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          <CheckCircleSolid className="w-3.5 h-3.5" />
                          {member.latest_certificate.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Valid Until</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(member.latest_certificate.valid_until)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">Next Payment</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(member.latest_certificate.next_payment_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </InfoCard>
                )}
              </div>
            </Tab.Panel>

            {/* Certificates Tab */}
            <Tab.Panel>
              <InfoCard
                title={`Certificates (${member.certificates?.length || 0})`}
                icon={ShieldCheckIcon}
              >
                {member.certificates && member.certificates.length > 0 ? (
                  <div className="space-y-4">
                    {member.certificates.map((certificate) => (
                      <CertificateCard
                        key={certificate.id}
                        certificate={certificate}
                        onViewPayment={handleViewPayment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShieldCheckIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No certificates available</p>
                  </div>
                )}
              </InfoCard>
            </Tab.Panel>

            {/* Payments Tab */}
            <Tab.Panel>
              <InfoCard
                title={`Payment History (${member.payments?.length || 0})`}
                icon={CreditCardIcon}
              >
                {member.payments && member.payments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {member.payments.map((payment) => (
                      <PaymentCard
                        key={payment.id}
                        payment={payment}
                        onClick={() => handleViewPayment(payment)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCardIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No payments available</p>
                  </div>
                )}
              </InfoCard>
            </Tab.Panel>

            {/* Documents Tab */}
            <Tab.Panel>
              <InfoCard
                title={`Documents (${member.documents?.length || 0})`}
                icon={DocumentTextIcon}
              >
                {member.documents && member.documents.length > 0 ? (
                  <div className="space-y-3">
                    {member.documents.map((document) => (
                      <DocumentCard 
                        key={document.id} 
                        document={document} 
                        onViewFile={fileViewer.openFile}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No documents uploaded</p>
                  </div>
                )}
              </InfoCard>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Payment Side Sheet */}
      <PaymentSideSheet
        payment={selectedPayment}
        isOpen={paymentSheetOpen}
        onClose={() => setPaymentSheetOpen(false)}
      />

      {/* File Viewer */}
      {fileViewer.isOpen && (
        <FileViewer
          isOpen={fileViewer.isOpen}
          onClose={fileViewer.closeFile}
          fileUrl={fileViewer.fileUrl}
          fileName={fileViewer.fileName}
          fileType={fileViewer.fileType}
        />
      )}
    </div>
  );
}