import { useState, useMemo } from "react";
import { Payment } from "@/types/payment";

export const usePaymentFilters = (payments: Payment[] = []) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Status filter
      const matchesStatus = statusFilter === "all" || 
        payment.status.toLowerCase() === statusFilter.toLowerCase();

      // Search filter
      const matchesSearch = searchTerm === "" ||
        payment.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.gateway.toLowerCase().includes(searchTerm.toLowerCase());

      // Date range filter
      const paymentDate = new Date(payment.payment_date);
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;
      
      const matchesDateRange = (!fromDate || paymentDate >= fromDate) &&
        (!toDate || paymentDate <= toDate);

      return matchesStatus && matchesSearch && matchesDateRange;
    });
  }, [payments, statusFilter, searchTerm, dateRange]);

  const getPaymentStats = () => {
    const stats = payments.reduce((acc, payment) => {
      acc.total++;
      const status = payment.status.toLowerCase();
      
      if (status === "completed") acc.completed++;
      else if (status === "pending") acc.pending++;
      else if (status === "failed") acc.failed++;
      else if (status === "cancelled") acc.cancelled++;
      
      // Extract numeric amount
      const amount = parseFloat(payment.amount_paid.split(' ')[0]);
      if (!isNaN(amount)) {
        acc.totalAmount += amount;
        if (status === "completed") acc.completedAmount += amount;
      }
      
      if (payment.is_certificate_generated) acc.certificatesGenerated++;
      
      return acc;
    }, {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      cancelled: 0,
      totalAmount: 0,
      completedAmount: 0,
      certificatesGenerated: 0,
    });
    
    return stats;
  };

  return {
    statusFilter,
    setStatusFilter,
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    filteredPayments,
    getPaymentStats,
  };
};
