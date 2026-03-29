"use client";

import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface MembershipInfo {
  id: number;
  membership_type: string;
  status: string;
  start_date: string;
  end_date: string;
  certificate?: {
    id: number;
    certificate_number: string;
    status: string;
    valid_until: string;
  };
}

interface MembershipApiResponse {
  status: string;
  message?: string;
  data: MembershipInfo | null;
}

interface PaymentApiResponse {
  status: string;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
}

export function useMemberMembership() {
  const [membership, setMembership] = useState<MembershipInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentMembership = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<MembershipApiResponse>(
        "membership/current-membership",
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success") {
        setMembership(response.data.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch membership");
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelMembership = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const client = getAuthenticatedClient();
      const response = await client.put<MembershipApiResponse>(
        "membership/cancel-membership",
        undefined,
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success") {
        showSuccessToast(response.data.message || "Membership cancelled");
        setMembership(response.data.data);
        return true;
      }

      showErrorToast(response.data.message || "Cancellation failed");
      return false;
    } catch (err) {
      const apiError = err as ApiError;
      showErrorToast(apiError.message || "Cancellation failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const renewMembership = useCallback(
    async (data: {
      amount_paid: number;
      payment_method: string;
      transaction_number: string;
    }): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.post<PaymentApiResponse>(
          "membership/renew-membership",
          data,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          showSuccessToast(response.data.message || "Membership renewed successfully");
          return { success: true };
        }

        if (response.data.errors) {
          return { success: false, errors: response.data.errors };
        }

        showErrorToast(response.data.message || "Renewal failed");
        return { success: false };
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.errors) {
          return { success: false, errors: apiError.errors };
        }
        showErrorToast(apiError.message || "Renewal failed");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const payForApplication = useCallback(
    async (
      applicationId: string,
      data: {
        amount_paid: number;
        payment_method: string;
        gateway: string;
      }
    ): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.post<PaymentApiResponse>(
          `my-application/${applicationId}/add-payment`,
          data,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          showSuccessToast(response.data.message || "Payment recorded successfully");
          return { success: true };
        }

        if (response.data.errors) {
          return { success: false, errors: response.data.errors };
        }

        showErrorToast(response.data.message || "Payment failed");
        return { success: false };
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.errors) {
          return { success: false, errors: apiError.errors };
        }
        showErrorToast(apiError.message || "Payment failed");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const membershipRenewalPayment = useCallback(
    async (data: {
      amount_paid: number;
      payment_method: string;
      gateway: string;
    }): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.post<PaymentApiResponse>(
          "my-application/add-payment",
          data,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          showSuccessToast(response.data.message || "Renewal payment recorded");
          return { success: true };
        }

        if (response.data.errors) {
          return { success: false, errors: response.data.errors };
        }

        showErrorToast(response.data.message || "Payment failed");
        return { success: false };
      } catch (err) {
        const apiError = err as ApiError;
        if (apiError.errors) {
          return { success: false, errors: apiError.errors };
        }
        showErrorToast(apiError.message || "Payment failed");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    membership,
    loading,
    error,
    fetchCurrentMembership,
    cancelMembership,
    renewMembership,
    payForApplication,
    membershipRenewalPayment,
  };
}
