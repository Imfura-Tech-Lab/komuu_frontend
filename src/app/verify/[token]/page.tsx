"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { ShieldCheckIcon as ShieldCheckSolid } from "@heroicons/react/24/solid";
import { apiClient, ApiError } from "@/lib/api-client";

interface VerifiedCertificate {
  id: number;
  name: string;
  member_number: string;
  signed_date: string;
  valid_from: string;
  valid_until: string;
  next_payment_date: string;
  status: string;
  token: string;
  membership_term: string;
  created_at: string;
  signed_by?: { full_names?: string } | null;
  payment?: {
    application?: {
      membership_type?: string | null;
      country_of_residency?: string | null;
      name_of_organization?: string | null;
      Abbreviation?: string | null;
    } | null;
  } | null;
}

interface VerifyResponse {
  status: string;
  message?: string;
  data?: VerifiedCertificate;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
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

const getDaysUntilExpiry = (validUntil: string) => {
  const expiryDate = new Date(validUntil);
  const today = new Date();
  return Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
};

type Validity = "valid" | "expiring" | "expired";

const getValidity = (validUntil: string): Validity => {
  const days = getDaysUntilExpiry(validUntil);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "valid";
};

export default function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      setLoading(true);
      setErrorMessage(null);
      setNotFound(false);
      try {
        const resp = await apiClient.get<VerifyResponse>(
          `certificate/verify/${encodeURIComponent(token)}`,
        );
        if (cancelled) return;
        const data = resp.data?.data;
        if (resp.data?.status === "success" && data) {
          setCertificate(data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        if (cancelled) return;
        const apiError = err as ApiError;
        if (apiError.status === 404) {
          setNotFound(true);
        } else {
          setErrorMessage(
            apiError.message || "Unable to verify this certificate right now.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#00B5A5]/5 dark:from-gray-900 dark:to-gray-900">
      <div className="px-4 py-10 mx-auto max-w-3xl sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#00B5A5] hover:text-[#008F82]"
          >
            <ShieldCheckIcon className="w-6 h-6" />
            <span className="text-lg font-semibold">Komuu</span>
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            Certificate Verification
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Confirm the authenticity of a membership certificate
          </p>
        </div>

        {loading && <LoadingCard />}

        {!loading && errorMessage && (
          <ErrorCard message={errorMessage} onRetry={() => location.reload()} />
        )}

        {!loading && !errorMessage && notFound && <NotFoundCard token={token} />}

        {!loading && !errorMessage && !notFound && certificate && (
          <VerifiedCard certificate={certificate} />
        )}
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="p-10 text-center bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
      <ArrowPathIcon className="w-12 h-12 mx-auto text-[#00B5A5] animate-spin" />
      <p className="mt-4 text-gray-700 dark:text-gray-200 font-medium">
        Verifying certificate...
      </p>
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-8 text-center bg-white border-2 border-red-200 dark:bg-gray-800 dark:border-red-800 rounded-2xl">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
        <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Verification Failed
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors"
      >
        <ArrowPathIcon className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

function NotFoundCard({ token }: { token: string }) {
  return (
    <div className="p-8 text-center bg-white border-2 border-red-200 dark:bg-gray-800 dark:border-red-800 rounded-2xl">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
        <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
        Certificate Not Found
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        We could not find a certificate matching this verification token.
      </p>
      <p className="mt-1 text-xs font-mono text-gray-500 dark:text-gray-500 break-all">
        {token}
      </p>
    </div>
  );
}

function VerifiedCard({
  certificate,
}: {
  certificate: VerifiedCertificate;
}) {
  const validity = getValidity(certificate.valid_until);
  const application = certificate.payment?.application ?? null;

  const validityCopy = {
    valid: {
      headline: "Valid Certificate",
      tone: "This certificate is currently active and verified.",
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: ShieldCheckSolid,
    },
    expiring: {
      headline: "Certificate Expiring Soon",
      tone: "This certificate is genuine but is approaching its expiry date.",
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
      border: "border-amber-200 dark:border-amber-800",
      icon: ExclamationTriangleIcon,
    },
    expired: {
      headline: "Certificate Expired",
      tone: "This certificate is genuine but is no longer active.",
      color: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-200 dark:border-red-800",
      icon: XCircleIcon,
    },
  }[validity];

  const ValidityIcon = validityCopy.icon;

  return (
    <div className="space-y-5">
      <div
        className={`p-5 rounded-2xl border ${validityCopy.border} ${validityCopy.bg}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl bg-white dark:bg-gray-900/30 ${validityCopy.color}`}
          >
            <ValidityIcon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Verification Result
            </p>
            <p className={`text-lg font-semibold ${validityCopy.color}`}>
              {validityCopy.headline}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {validityCopy.tone}
            </p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden text-white rounded-2xl bg-gradient-to-br from-[#00B5A5] to-[#008F82] p-6 shadow-lg">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-12 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs tracking-wide uppercase text-white/80">
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
        </div>
      </div>

      <div className="p-5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="w-4 h-4 text-[#00B5A5]" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Validity
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Cell label="Valid From" value={formatDate(certificate.valid_from)} />
          <Cell
            label="Valid Until"
            value={formatDate(certificate.valid_until)}
          />
          <Cell
            label="Signed Date"
            value={formatDate(certificate.signed_date)}
          />
          <Cell label="Status" value={certificate.status} />
        </div>
      </div>

      {application && (
        <div className="p-5 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <BuildingOfficeIcon className="w-4 h-4 text-[#00B5A5]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Membership
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {application.membership_type && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                {application.membership_type}
              </span>
            )}
            {application.country_of_residency && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {application.country_of_residency}
              </span>
            )}
            {application.name_of_organization && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {application.name_of_organization}
                {application.Abbreviation
                  ? ` (${application.Abbreviation})`
                  : ""}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700 rounded-xl">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Verification token
        </p>
        <code className="text-xs font-mono text-gray-700 dark:text-gray-200 break-all">
          {certificate.token}
        </code>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-900/40">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
        {value}
      </p>
    </div>
  );
}
