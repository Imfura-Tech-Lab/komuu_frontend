import { useState, useMemo } from "react";
import { Payment } from "@/types/payment";

export interface AdvancedFilters {
  statusFilter: string;
  searchTerm: string;
  dateRange: { from: string; to: string };
  amountRange: { min: string; max: string };
  paymentMethods: string[];
  gateways: string[];
  certificateGenerated: string;
}

export const useAdvancedPaymentFilters = (payments: Payment[] = []) => {
  const [filters, setFilters] = useState<AdvancedFilters>({
    statusFilter: "all",
    searchTerm: "",
    dateRange: { from: "", to: "" },
    amountRange: { min: "", max: "" },
    paymentMethods: [],
    gateways: [],
    certificateGenerated: "all",
  });

  const updateFilter = <K extends keyof AdvancedFilters>(
    key: K,
    value: AdvancedFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      statusFilter: "all",
      searchTerm: "",
      dateRange: { from: "", to: "" },
      amountRange: { min: "", max: "" },
      paymentMethods: [],
      gateways: [],
      certificateGenerated: "all",
    });
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Status filter
      if (
        filters.statusFilter !== "all" &&
        payment.status.toLowerCase() !== filters.statusFilter.toLowerCase()
      ) {
        return false;
      }

      // Search filter
      if (
        filters.searchTerm &&
        !payment.member
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) &&
        !payment.transaction_number
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) &&
        !payment.gateway
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      const paymentDate = new Date(payment.payment_date);
      if (
        filters.dateRange.from &&
        paymentDate < new Date(filters.dateRange.from)
      )
        return false;
      if (filters.dateRange.to && paymentDate > new Date(filters.dateRange.to))
        return false;

      // Amount range filter
      const amount = parseFloat(payment.amount_paid.split(" ")[0]);
      if (
        filters.amountRange.min &&
        amount < parseFloat(filters.amountRange.min)
      )
        return false;
      if (
        filters.amountRange.max &&
        amount > parseFloat(filters.amountRange.max)
      )
        return false;

      // Payment methods filter
      if (
        filters.paymentMethods.length > 0 &&
        !filters.paymentMethods.includes(payment.payment_method)
      )
        return false;

      // Gateways filter
      if (
        filters.gateways.length > 0 &&
        !filters.gateways.includes(payment.gateway)
      )
        return false;

      // Certificate generated filter
      if (filters.certificateGenerated !== "all") {
        const hascertificate = payment.is_certificate_generated;
        if (filters.certificateGenerated === "yes" && !hascertificate)
          return false;
        if (filters.certificateGenerated === "no" && hascertificate)
          return false;
      }

      return true;
    });
  }, [payments, filters]);

  const getFilterOptions = () => {
    const uniquePaymentMethods = [
      ...new Set(payments.map((p) => p.payment_method)),
    ];
    const uniqueGateways = [...new Set(payments.map((p) => p.gateway))];
    const amounts = payments
      .map((p) => parseFloat(p.amount_paid.split(" ")[0]))
      .filter((a) => !isNaN(a));

    return {
      paymentMethods: uniquePaymentMethods,
      gateways: uniqueGateways,
      amountRange: {
        min: amounts.length > 0 ? Math.min(...amounts) : 0,
        max: amounts.length > 0 ? Math.max(...amounts) : 0,
      },
    };
  };

  const getPaymentStats = () => {
    const stats = filteredPayments.reduce(
      (acc, payment) => {
        acc.total++;
        const status = payment.status.toLowerCase();

        if (status === "completed") acc.completed++;
        else if (status === "pending") acc.pending++;
        else if (status === "failed") acc.failed++;
        else if (status === "cancelled") acc.cancelled++;

        const amount = parseFloat(payment.amount_paid.split(" ")[0]);
        if (!isNaN(amount)) {
          acc.totalAmount += amount;
          if (status === "completed") acc.completedAmount += amount;
        }

        if (payment.is_certificate_generated) acc.certificatesGenerated++;

        // Payment method breakdown
        acc.byPaymentMethod[payment.payment_method] =
          (acc.byPaymentMethod[payment.payment_method] || 0) + 1;

        // Gateway breakdown
        acc.byGateway[payment.gateway] =
          (acc.byGateway[payment.gateway] || 0) + 1;

        return acc;
      },
      {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        cancelled: 0,
        totalAmount: 0,
        completedAmount: 0,
        certificatesGenerated: 0,
        byPaymentMethod: {} as Record<string, number>,
        byGateway: {} as Record<string, number>,
      }
    );

    return stats;
  };

  const hasActiveFilters = () => {
    return (
      filters.statusFilter !== "all" ||
      filters.searchTerm !== "" ||
      filters.dateRange.from !== "" ||
      filters.dateRange.to !== "" ||
      filters.amountRange.min !== "" ||
      filters.amountRange.max !== "" ||
      filters.paymentMethods.length > 0 ||
      filters.gateways.length > 0 ||
      filters.certificateGenerated !== "all"
    );
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredPayments,
    getFilterOptions,
    getPaymentStats,
    hasActiveFilters,
  };
};
