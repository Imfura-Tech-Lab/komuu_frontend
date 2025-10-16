import { useState, useEffect } from "react";
import { Payment, PaymentsResponse } from "@/types/payment";
import { showErrorToast } from "@/components/layouts/auth-layer-out";

export const usePayments = () => {
  const [paymentsData, setPaymentsData] = useState<PaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPayments = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view payments");
        return;
      }

      const response = await fetch(`${apiUrl}membership/payments?page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status === "success") {
        setPaymentsData(responseData.data);
        setCurrentPage(page);
      } else {
        throw new Error(responseData.message || "Failed to fetch payments");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch payments";
      setError(errorMessage);
      showErrorToast("Failed to load payments");
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

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