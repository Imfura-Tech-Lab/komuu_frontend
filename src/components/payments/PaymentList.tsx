"use client";

import { Payment } from "@/types/payment";
import PaymentCard from "./PaymentCard";

interface PaymentListProps {
  payments: Payment[];
  onViewDetails: (payment: Payment) => void;
  onGeneratePDF?: (payment: Payment) => void;
}

export default function PaymentList({ 
  payments, 
  onViewDetails, 
  onGeneratePDF 
}: PaymentListProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">💳</div>
        <h3 className="text-gray-900 dark:text-white font-medium mb-2">
          No Payments Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No payments match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          onViewDetails={onViewDetails}
          onGeneratePDF={onGeneratePDF}
        />
      ))}
    </div>
  );
}