"use client";

import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

interface DpoInitResponse {
  status: string;
  message?: string;
  data?: {
    payment_url: string;
    transaction_token: string;
    company_ref: string;
  };
}

interface DpoVerifyResponse {
  status: string;
  message?: string;
  data?: {
    status: string;
    type: string;
    amount: number;
    currency: string;
  };
}

interface DpoStatusResponse {
  status: string;
  data?: {
    transaction_status: string;
    type: string;
    amount: number;
    currency: string;
    company_ref: string;
    verified_at: string | null;
    created_at: string;
  };
}

export function useDpoPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateMembershipPayment = useCallback(
    async (applicationId: string, data: { amount: number; currency: string }): Promise<string | null> => {
      try {
        setLoading(true);
        setError(null);
        const client = getAuthenticatedClient();
        const response = await client.post<DpoInitResponse>(
          `payments/dpo/membership/${applicationId}`,
          data,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success" && response.data.data) {
          showSuccessToast("Redirecting to payment page...");
          return response.data.data.payment_url;
        }

        showErrorToast(response.data.message || "Failed to initiate payment");
        return null;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Payment initiation failed");
        setError(apiError.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const initiateSubscriptionPayment = useCallback(
    async (data: {
      package: number;
      amount: number;
      currency: string;
      action: "subscribe" | "upgrade" | "renew";
    }): Promise<string | null> => {
      try {
        setLoading(true);
        setError(null);
        const client = getAuthenticatedClient();
        const response = await client.post<DpoInitResponse>(
          "payments/dpo/subscription",
          data,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success" && response.data.data) {
          showSuccessToast("Redirecting to payment page...");
          return response.data.data.payment_url;
        }

        showErrorToast(response.data.message || "Failed to initiate payment");
        return null;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Payment initiation failed");
        setError(apiError.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const initiateEventPayment = useCallback(
    async (eventId: string): Promise<string | null> => {
      try {
        setLoading(true);
        setError(null);
        const client = getAuthenticatedClient();
        const response = await client.post<DpoInitResponse>(
          `payments/dpo/event/${eventId}`,
          {},
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success" && response.data.data) {
          showSuccessToast("Redirecting to payment page...");
          return response.data.data.payment_url;
        }

        showErrorToast(response.data.message || "Failed to initiate payment");
        return null;
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Payment initiation failed");
        setError(apiError.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyPayment = useCallback(
    async (params: { ref?: string; token?: string }): Promise<DpoVerifyResponse["data"] | null> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const query = params.ref ? `ref=${params.ref}` : `token=${params.token}`;
        const response = await client.get<DpoVerifyResponse>(
          `payments/dpo/verify?${query}`
        );

        if (response.data.status === "success" && response.data.data) {
          return response.data.data;
        }
        return null;
      } catch {
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkStatus = useCallback(
    async (companyRef: string): Promise<DpoStatusResponse["data"] | null> => {
      try {
        const client = getAuthenticatedClient();
        const response = await client.get<DpoStatusResponse>(
          `payments/dpo/status/${companyRef}`,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success" && response.data.data) {
          return response.data.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  return {
    loading,
    error,
    initiateMembershipPayment,
    initiateSubscriptionPayment,
    initiateEventPayment,
    verifyPayment,
    checkStatus,
  };
}
