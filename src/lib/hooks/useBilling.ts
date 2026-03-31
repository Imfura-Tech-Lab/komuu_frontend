"use client";

import { useState, useCallback } from "react";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";

export interface SubscriptionPackage {
  id: number;
  name: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
}

export interface Subscription {
  id: number;
  package: SubscriptionPackage;
  category: "Trial" | "Paid";
  status: string;
  start_date: string;
  end_date: string;
  renewal_date: string | null;
  payment?: SubscriptionPayment;
  invoice?: SubscriptionInvoice;
  created_at: string;
}

export interface SubscriptionPayment {
  id: number;
  amount_paid: string;
  payment_method: string;
  transaction_number: string | null;
  gateway: string | null;
  status: string;
  currency: string;
  created_at: string;
}

export interface SubscriptionInvoice {
  id: number;
  company_id: string;
  amount_paid: string;
  currency: string;
  status: string;
  issued_at: string;
  paid_at: string | null;
}

interface BillingApiResponse {
  status: string;
  message?: string;
  data: Subscription | null;
}

interface SubscriptionsListResponse {
  status: string;
  message?: string;
  data: {
    data: Subscription[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

interface InvoicesListResponse {
  status: string;
  message?: string;
  data: {
    data: SubscriptionInvoice[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

export function useBilling() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPlan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<BillingApiResponse>("billing/plans", {
        headers: getCompanyHeaders(),
      });

      if (response.data.status === "success") {
        setCurrentSubscription(response.data.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch subscription");
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribe = useCallback(
    async (data: {
      package: number;
      category: "Trial" | "Paid";
      amount_paid?: number;
      payment_method?: string;
      transaction_number?: string;
      gateway?: string;
      payment_status?: string;
    }): Promise<{ success: boolean; data?: Subscription }> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.post<BillingApiResponse>(
          "billing/subscribe",
          data,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          showSuccessToast(response.data.message || "Subscribed successfully");
          setCurrentSubscription(response.data.data);
          return { success: true, data: response.data.data! };
        }

        showErrorToast(response.data.message || "Subscription failed");
        return { success: false };
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Subscription failed");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const upgradeSubscription = useCallback(
    async (data: {
      package: number;
      amount_paid: number;
      payment_method: string;
      transaction_number: string;
      gateway: string;
      payment_status: string;
    }): Promise<{ success: boolean; data?: Subscription }> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.post<BillingApiResponse>(
          "billing/upgrade-subscription",
          data,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          showSuccessToast(response.data.message || "Subscription upgraded");
          setCurrentSubscription(response.data.data);
          return { success: true, data: response.data.data! };
        }

        showErrorToast(response.data.message || "Upgrade failed");
        return { success: false };
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Upgrade failed");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const renewSubscription = useCallback(
    async (data: {
      amount_paid: number;
      payment_method: string;
      transaction_number: string;
      gateway: string;
      payment_status: string;
    }): Promise<{ success: boolean; data?: Subscription }> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.post<BillingApiResponse>(
          "billing/renew-subscription",
          data,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          showSuccessToast(response.data.message || "Subscription renewed");
          setCurrentSubscription(response.data.data);
          return { success: true, data: response.data.data! };
        }

        showErrorToast(response.data.message || "Renewal failed");
        return { success: false };
      } catch (err) {
        const apiError = err as ApiError;
        showErrorToast(apiError.message || "Renewal failed");
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const client = getAuthenticatedClient();
      const response = await client.get<BillingApiResponse>(
        "billing/cancel-subscription",
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success") {
        showSuccessToast(response.data.message || "Subscription cancelled");
        setCurrentSubscription(response.data.data);
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

  const fetchSubscriptions = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const client = getAuthenticatedClient();
      const response = await client.get<SubscriptionsListResponse>(
        `billing/subscriptions?page=${page}`,
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success") {
        setSubscriptions(response.data.data.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscription = useCallback(
    async (id: number): Promise<Subscription | null> => {
      try {
        const client = getAuthenticatedClient();
        const response = await client.get<{ status: string; data: Subscription }>(
          `billing/subscriptions/${id}`,
          { headers: getCompanyHeaders() }
        );

        if (response.data.status === "success") {
          return response.data.data;
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const fetchInvoices = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const client = getAuthenticatedClient();
      const response = await client.get<InvoicesListResponse>(
        `billing/subscriptions-invoices?page=${page}`,
        { headers: getCompanyHeaders() }
      );

      if (response.data.status === "success") {
        setInvoices(response.data.data.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvoice = useCallback(
    async (id: number): Promise<SubscriptionInvoice | null> => {
      try {
        const client = getAuthenticatedClient();
        const response = await client.get<{
          status: string;
          data: SubscriptionInvoice;
        }>(`billing/subscriptions-invoices/${id}`, {
          headers: getCompanyHeaders(),
        });

        if (response.data.status === "success") {
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
    currentSubscription,
    subscriptions,
    invoices,
    loading,
    error,
    fetchCurrentPlan,
    subscribe,
    upgradeSubscription,
    renewSubscription,
    cancelSubscription,
    fetchSubscriptions,
    fetchSubscription,
    fetchInvoices,
    fetchInvoice,
  };
}
