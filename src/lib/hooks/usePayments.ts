import { useState, useEffect, useCallback } from "react";
import { PaymentsResponse } from "@/types/payment";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import { getAuthenticatedClient, ApiError } from "@/lib/api-client";

export const usePayments = () => {
  const [paymentsData, setPaymentsData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPayments = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const client = getAuthenticatedClient();
      const response = await client.get<{ status: string; data: PaymentsResponse; message?: string }>(
        `membership/payments?page=${page}`
      );

      const responseData = response.data;
      if (responseData.status === "success") {
        setPaymentsData(responseData.data);
        setCurrentPage(page);
      } else {
        throw new Error(responseData.message || "Failed to fetch payments");
      }
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || "Failed to fetch payments";
      setError(errorMessage);
      showErrorToast("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(currentPage);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPayments(page);
  };

  return {
    paymentsData,
    loading,
    error,
    currentPage,
    fetchPayments,
    handlePageChange,
    refetch: () => fetchPayments(currentPage),
  };
};
