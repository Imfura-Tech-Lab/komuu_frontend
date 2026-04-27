"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  XCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  IdentificationIcon,
  BanknotesIcon,
  CreditCardIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  KeyIcon,
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
import { useFileViewer } from "@/lib/hooks/useFileViewer";
import { FileViewer } from "@/components/ui/FileViwer";
import { generateCertificatePDF } from "@/lib/utils/certificateGenerator";

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
  country_of_residency: string;
  country_of_operation: string | null;
  name_of_organization: string | null;
  Abbreviation: string | null;
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

interface CertificatesPayload {
  data: Certificate[];
  total: number;
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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
      status: "expired" as const,
      label: `Expired ${Math.abs(daysLeft)} days ago`,
      headline: "Certificate Expired",
      tone: "Renew your membership to restore your active certificate.",
      color: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-200 dark:border-red-800",
      icon: XCircleIcon,
      iconSolid: ExclamationTriangleSolid,
    };
  }

  if (daysLeft <= 30) {
    return {
      status: "expiring" as const,
      label: `${daysLeft} days remaining`,
      headline: "Expiring Soon",
      tone: "Your certificate is about to expire — renew to avoid disruption.",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-200 dark:border-amber-800",
      icon: ExclamationTriangleIcon,
      iconSolid: ExclamationTriangleSolid,
    };
  }

  return {
    status: "valid" as const,
    label: `${daysLeft} days remaining`,
    headline: "Valid Certificate",
    tone: "Your membership is active. Download or share your certificate anytime.",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircleIcon,
    iconSolid: ShieldCheckSolid,
  };
};

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

function InfoCell({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

function CertificateSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <ShieldCheckIcon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No Certificate Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">
        Once your application is approved and the membership fee is paid, your
        certificate will appear here.
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

export default function MyCertificatesClient() {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  const router = useRouter();
  const { getCertificateData } = useCertificates();
  const {
    isOpen: fileViewerOpen,
    fileUrl,
    fileName,
    openFile,
    closeFile,
  } = useFileViewer();

  useEffect(() => {
    fetchCertificate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view your certificate");
        router.push("/login");
        return;
      }

      const response = await fetch(`${apiUrl}membership/certificates`, {
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
        const payload = responseData.data?.certificates as
          | CertificatesPayload
          | undefined;
        const first = payload?.data?.[0] ?? null;
        setCertificate(first);
      } else {
        throw new Error(responseData.message || "Failed to fetch certificate");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch certificate",
      );
      showErrorToast("Failed to load certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = async () => {
    if (!certificate) return;
    try {
      setDownloading(true);

      const certificateData = await getCertificateData(certificate.id);
      if (!certificateData) {
        showErrorToast("Failed to load certificate data");
        return;
      }

      const pdfBlob = await generateCertificatePDF(certificateData);
      const blobUrl = URL.createObjectURL(pdfBlob);
      openFile(blobUrl, `Certificate-${certificate.member_number}.pdf`, "pdf");
    } catch {
      showErrorToast("Failed to generate certificate preview");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToken = async () => {
    if (!certificate) return;
    try {
      await navigator.clipboard.writeText(certificate.token);
      showSuccessToast("Verification token copied");
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 1500);
    } catch {
      showErrorToast("Failed to copy");
    }
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-900 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Certificate
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchCertificate}
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <CertificateSkeleton />
        ) : !certificate ? (
          <EmptyState onRefresh={fetchCertificate} />
        ) : (
          <CertificateView
            certificate={certificate}
            downloading={downloading}
            tokenCopied={tokenCopied}
            onRefresh={fetchCertificate}
            onView={handleViewCertificate}
            onCopyToken={handleCopyToken}
          />
        )}
      </div>

      <FileViewer
        fileUrl={fileUrl}
        fileName={fileName}
        fileType="pdf"
        isOpen={fileViewerOpen}
        onClose={closeFile}
      />
    </div>
  );
}

function CertificateView({
  certificate,
  downloading,
  tokenCopied,
  onRefresh,
  onView,
  onCopyToken,
}: {
  certificate: Certificate;
  downloading: boolean;
  tokenCopied: boolean;
  onRefresh: () => void;
  onView: () => void;
  onCopyToken: () => void;
}) {
  const expiry = getExpiryStatus(certificate.valid_until);
  const StatusIcon = expiry.icon;
  const StatusIconSolid = expiry.iconSolid;
  const application = certificate.payment?.application;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Certificate
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View, download, and verify your membership certificate
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Status + primary action */}
      <div
        className={`rounded-2xl border ${expiry.border} ${expiry.bg} p-5`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl bg-white dark:bg-gray-900/30 ${expiry.color}`}
            >
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Validity
              </p>
              <p className={`text-lg font-semibold ${expiry.color}`}>
                {expiry.headline}
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {expiry.label} — {expiry.tone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onView}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <EyeIcon className="w-4 h-4" />
              )}
              {downloading ? "Loading..." : "View Certificate"}
            </button>
          </div>
        </div>
      </div>

      {/* Hero / member identity */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00B5A5] to-[#008F82] p-6 text-white shadow-lg">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-12 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-white/80">
              {certificate.membership_term}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold truncate">
              {certificate.name}
            </h2>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm">
              <IdentificationIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                {certificate.member_number}
              </span>
            </div>
          </div>
          <StatusIconSolid className="hidden sm:block w-10 h-10 text-white/70" />
        </div>
      </div>

      {/* Certificate Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <SectionHeader icon={CalendarIcon} title="Certificate Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCell label="Valid From" value={formatDate(certificate.valid_from)} />
          <InfoCell label="Valid Until" value={formatDate(certificate.valid_until)} />
          <InfoCell
            label="Signed Date"
            value={formatDateTime(certificate.signed_date)}
          />
          <InfoCell
            label="Next Payment Due"
            value={formatDate(certificate.next_payment_date)}
          />
        </div>
      </div>

      {/* Verification Token */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <SectionHeader icon={KeyIcon} title="Verification Token" />
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <code className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-200 break-all">
            {certificate.token}
          </code>
          <button
            onClick={onCopyToken}
            className="p-2 text-gray-400 hover:text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors flex-shrink-0"
            title="Copy token"
          >
            {tokenCopied ? (
              <CheckCircleSolid className="w-4 h-4 text-emerald-500" />
            ) : (
              <DocumentDuplicateIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Payment Information */}
      {certificate.payment && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <SectionHeader icon={BanknotesIcon} title="Payment Information" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Method
                </p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
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
                <p className="font-mono text-gray-900 dark:text-white break-all">
                  #{certificate.payment.transaction_number}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(certificate.payment.payment_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Membership Details */}
      {application && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <SectionHeader icon={CreditCardIcon} title="Membership Details" />
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
              {application.membership_type}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              <GlobeAltIcon className="w-3.5 h-3.5" />
              {application.country_of_residency}
            </span>
            {application.name_of_organization && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <BuildingOfficeIcon className="w-3.5 h-3.5" />
                {application.name_of_organization}
                {application.Abbreviation
                  ? ` (${application.Abbreviation})`
                  : ""}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
