"use client";

import { useState, useCallback } from "react";
import { getAuthenticatedClient, ApiError } from "@/lib/api-client";

interface ConfigOption {
  value: string;
  label: string;
}

interface ConfigApiResponse {
  status: string;
  data?: ConfigOption[] | string[];
  types?: string[];
  message?: string;
}

export function useConfigData() {
  const [loading, setLoading] = useState(false);

  const fetchConfig = useCallback(
    async (endpoint: string): Promise<string[]> => {
      try {
        setLoading(true);
        const client = getAuthenticatedClient();
        const response = await client.get<ConfigApiResponse>(endpoint);

        const data = response.data;
        if (data.status === "success") {
          // Handle different response shapes
          if (data.types) return data.types;
          if (data.data && Array.isArray(data.data)) {
            return data.data.map((item) =>
              typeof item === "string" ? item : item.label || item.value
            );
          }
        }
        return [];
      } catch {
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchCertificateStatuses = useCallback(
    () => fetchConfig("certificate-statuses"),
    [fetchConfig]
  );

  const fetchAssociateCategories = useCallback(
    () => fetchConfig("associate-membership-categories"),
    [fetchConfig]
  );

  const fetchConversationTypes = useCallback(
    () => fetchConfig("conversation-types"),
    [fetchConfig]
  );

  const fetchPaymentMethods = useCallback(
    () => fetchConfig("payment-methods"),
    [fetchConfig]
  );

  const fetchResourceTypes = useCallback(
    () => fetchConfig("resource-types"),
    [fetchConfig]
  );

  const fetchCurrencies = useCallback(
    () => fetchConfig("currencies"),
    [fetchConfig]
  );

  const fetchPaymentProviders = useCallback(
    () => fetchConfig("payment-providers"),
    [fetchConfig]
  );

  const fetchSubscriptionPlans = useCallback(
    () => fetchConfig("subscription-plans"),
    [fetchConfig]
  );

  const fetchSubscriptionStatuses = useCallback(
    () => fetchConfig("subscription-status"),
    [fetchConfig]
  );

  const fetchTransactionStatuses = useCallback(
    () => fetchConfig("transaction-status"),
    [fetchConfig]
  );

  const fetchRoles = useCallback(
    () => fetchConfig("roles"),
    [fetchConfig]
  );

  const fetchApplicationStatuses = useCallback(
    () => fetchConfig("application-status"),
    [fetchConfig]
  );

  return {
    loading,
    fetchConfig,
    fetchCertificateStatuses,
    fetchAssociateCategories,
    fetchConversationTypes,
    fetchPaymentMethods,
    fetchResourceTypes,
    fetchCurrencies,
    fetchPaymentProviders,
    fetchSubscriptionPlans,
    fetchSubscriptionStatuses,
    fetchTransactionStatuses,
    fetchRoles,
    fetchApplicationStatuses,
  };
}
