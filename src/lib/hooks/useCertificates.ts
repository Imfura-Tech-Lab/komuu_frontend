import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

interface PaymentInfo {
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

export interface Certificate {
  id: number;
  name: string;
  member_number: string;
  certificate: string | null;
  status: string;
  valid_from: string;
  valid_until: string;
  membership_term: string;
  signed_date: string;
  created_at: string;
  token: string;
  next_payment_date: string;
  payment: PaymentInfo;
}

interface CertificateInfo {
  id: number;
  name: string;
  member_number: string;
  certificate?: string;
  signed_date: string;
  valid_from: string;
  valid_until: string;
  next_payment_date?: string;
  status: string;
  token: string;
  membership_term: string;
  created_at: string;
  payment?: PaymentInfo;
}

interface InstitutionInfo {
  name: string;
  president_name: string;
  abbreviation: string;
  logo: string;
  signature: string;
  stamp: string;
}

export interface CertificateData {
  certificate: CertificateInfo;
  institution: InstitutionInfo;
}

interface PaginationLinks {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface CertificatesPagination {
  current_page: number;
  data: Certificate[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLinks[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface CertificatesApiResponse {
  status: string;
  message?: string;
  data?: {
    certificates: CertificatesPagination;
    institution: InstitutionInfo;
  };
}

interface CertificateDataApiResponse {
  status: string;
  message?: string;
  data?: CertificateData;
}

// Helper function to clean malformed URLs
function cleanCertificateUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  if (url.includes('/storage/https://') || url.includes('/storage/http://')) {
    const match = url.match(/\/storage\/(https?:\/\/.+)/);
    return match ? match[1] : url;
  }

  return url;
}

function mapCertificateData(cert: Record<string, unknown>): Certificate {
  const payment = cert.payment as Record<string, unknown> | undefined;
  return {
    id: cert.id as number,
    name: cert.name as string,
    member_number: cert.member_number as string,
    certificate: cleanCertificateUrl(cert.certificate as string | null),
    status: cert.status as string,
    valid_from: cert.valid_from as string,
    valid_until: cert.valid_until as string,
    membership_term: cert.membership_term as string,
    signed_date: cert.signed_date as string,
    next_payment_date: cert.next_payment_date as string,
    created_at: cert.created_at as string,
    token: cert.token as string,
    payment: {
      id: payment?.id as number,
      member: payment?.member as string,
      amount_paid: payment?.amount_paid as string,
      payment_method: payment?.payment_method as string,
      transaction_number: payment?.transaction_number as string,
      gateway: payment?.gateway as string,
      status: payment?.status as string,
      is_certificate_generated: payment?.is_certificate_generated as boolean,
      payment_date: payment?.payment_date as string,
    },
  };
}

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [institution, setInstitution] = useState<InstitutionInfo | null>(null);
  const [pagination, setPagination] = useState<Omit<CertificatesPagination, 'data'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingCertificate, setFetchingCertificate] = useState(false);
  const router = useRouter();

  const fetchCertificates = useCallback(async (role: string | null, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        showErrorToast("Please login to view certificates");
        router.push("/login");
        return;
      }

      const endpoint = role === "Member"
        ? `membership/certificates?page=${page}`
        : `certificates?page=${page}`;

      const client = getAuthenticatedClient();
      const response = await client.get<CertificatesApiResponse>(endpoint);
      const data = response.data;

      if (data.status === "success" && data.data) {
        const certificatesData = data.data.certificates?.data || [];
        const institutionData = data.data.institution;
        const paginationData = data.data.certificates;

        setCertificates(
          Array.isArray(certificatesData)
            ? certificatesData.map((cert) => mapCertificateData(cert as unknown as Record<string, unknown>))
            : []
        );

        if (institutionData) {
          setInstitution(institutionData);
        }

        if (paginationData) {
          const { data: _, ...paginationMeta } = paginationData;
          setPagination(paginationMeta);
        }
      } else {
        throw new Error(data.message || "Failed to fetch certificates");
      }
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.status === 401 || apiError.status === 403) {
        showErrorToast("Unauthorized. Please log in again.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        router.push("/login");
        return;
      }

      setError(apiError.message || "Failed to fetch certificates");
      showErrorToast("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const getCertificateData = useCallback(async (certificateId: number): Promise<CertificateData | null> => {
    try {
      setFetchingCertificate(true);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        showErrorToast("Please login to view certificate");
        return null;
      }

      const client = getAuthenticatedClient();
      const response = await client.get<CertificateDataApiResponse>(
        `membership/certificate/${certificateId}/download`,
        { headers: getCompanyHeaders() }
      );

      const responseData = response.data;
      if (responseData.status === "success" && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(responseData.message || "Failed to fetch certificate data");
      }
    } catch (err) {
      const apiError = err as ApiError;

      if (apiError.status === 401 || apiError.status === 403) {
        showErrorToast("Unauthorized. Please log in again.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        router.push("/login");
        return null;
      }

      showErrorToast(apiError.message || "Failed to fetch certificate data");
      return null;
    } finally {
      setFetchingCertificate(false);
    }
  }, [router]);

  return {
    certificates,
    institution,
    pagination,
    loading,
    error,
    fetchingCertificate,
    fetchCertificates,
    getCertificateData,
    refetch: fetchCertificates,
  };
}
