import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

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

interface Certificate {
  id: number;
  name?: string;
  member_number?: string;
  certificate?: string;
  status: string;
  valid_from?: string;
  valid_until?: string;
  membership_term?: string;
  signed_date?: string;
  created_at?: string;
  token?: string;
  next_payment_date?: string;
  payment?: PaymentInfo;
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

// Helper function to clean malformed URLs
function cleanCertificateUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  if (url.includes('/storage/https://') || url.includes('/storage/http://')) {
    const match = url.match(/\/storage\/(https?:\/\/.+)/);
    return match ? match[1] : url;
  }
  
  return url;
}

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingCertificate, setFetchingCertificate] = useState(false);
  const router = useRouter();

  const fetchCertificates = useCallback(async (role: string | null) => {
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

      if (!apiUrl) {
        showErrorToast("Backend API URL is not configured.");
        setError("Configuration error: Backend API URL missing.");
        return;
      }

      const endpoint =
        role === "Member"
          ? `${apiUrl}membership/certificates`
          : `${apiUrl}certificates`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const certificatesData = data.data?.data || data.data || [];
        setCertificates(
          Array.isArray(certificatesData)
            ? certificatesData.map((cert: any) => ({
                id: cert.id,
                name: cert.name,
                member_number: cert.member_number,
                certificate: cleanCertificateUrl(cert.certificate),
                status: cert.status,
                valid_from: cert.valid_from,
                valid_until: cert.valid_until,
                membership_term: cert.membership_term,
                signed_date: cert.signed_date,
                next_payment_date: cert.next_payment_date,
                created_at: cert.created_at,
                token: cert.token,
                payment: cert.payment
                  ? {
                      id: cert.payment.id,
                      member: cert.payment.member,
                      amount_paid: cert.payment.amount_paid,
                      payment_method: cert.payment.payment_method,
                      transaction_number: cert.payment.transaction_number,
                      gateway: cert.payment.gateway,
                      status: cert.payment.status,
                      is_certificate_generated: cert.payment.is_certificate_generated,
                      payment_date: cert.payment.payment_date,
                    }
                  : undefined,
              }))
            : []
        );
      } else {
        throw new Error(data.message || "Failed to fetch certificates");
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
  }, [router]);

  const getCertificateData = useCallback(async (certificateId: number): Promise<CertificateData | null> => {
    try {
      setFetchingCertificate(true);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const companyId = localStorage.getItem("company_id") || "";

      if (!token) {
        showErrorToast("Please login to view certificate");
        return null;
      }

      if (!apiUrl) {
        showErrorToast("Backend API URL is not configured.");
        return null;
      }

      const endpoint = `${apiUrl}membership/certificate/${certificateId}/download`;

      const headers: HeadersInit = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      // Add X-Company-ID header if available
      if (companyId) {
        headers["X-Company-ID"] = companyId;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          router.push("/login");
          return null;
        }
        throw new Error(`Failed to fetch certificate data: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.status === "success" && responseData.data) {
        // Return the complete data structure with certificate and institution
        return responseData.data;
      } else {
        throw new Error(responseData.message || "Failed to fetch certificate data");
      }
    } catch (err) {
      console.error("Failed to fetch certificate data:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to fetch certificate data"
      );
      return null;
    } finally {
      setFetchingCertificate(false);
    }
  }, [router]);

  return {
    certificates,
    loading,
    error,
    fetchingCertificate,
    fetchCertificates,
    getCertificateData,
    refetch: fetchCertificates,
  };
}