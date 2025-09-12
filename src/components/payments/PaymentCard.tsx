"use client";

import { useState } from "react";
import { Payment } from "@/types/payment";
import { getStatusColor, formatDate } from "@/lib/utils/applicationUtils";
import { copyToClipboard } from "@/lib/utils/paymentUtils";
import { PaymentMethodIcon } from "./PaymentMethodIcon";


interface PaymentCardProps {
  payment: Payment;
  onViewDetails: (payment: Payment) => void;
  onGeneratePDF?: (payment: Payment) => void;
}

export default function PaymentCard({
  payment,
  onViewDetails,
  onGeneratePDF,
}: PaymentCardProps) {
  const [copying, setCopying] = useState(false);

  const handleCopyTransaction = async () => {
    setCopying(true);
    const success = await copyToClipboard(
      payment.transaction_number,
      "Transaction number"
    );
    if (success) {
      setTimeout(() => setCopying(false), 1000);
    } else {
      setCopying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      {/* Payment Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-[#00B5A5]">
              <PaymentMethodIcon method={payment.payment_method} />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {payment.amount_paid}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {payment.payment_method}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                payment.status
              )}`}
            >
              {payment.status}
            </span>
            {onGeneratePDF && (
              <button
                onClick={() => onGeneratePDF(payment)}
                className="p-2 text-gray-400 hover:text-[#00B5A5] transition-colors"
                title="Export as PDF"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Member Number</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {payment.member}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Payment Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(payment.payment_date)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Transaction Number
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-1">
              {payment.transaction_number}
            </code>
            <button
              onClick={handleCopyTransaction}
              disabled={copying}
              className="px-2 py-1 text-xs bg-[#00B5A5] hover:bg-[#009985] text-white rounded transition-colors disabled:opacity-50"
              title="Copy transaction number"
            >
              {copying ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Gateway</p>
            <p className="font-medium text-gray-900 dark:text-white text-sm">
              {payment.gateway}
            </p>
          </div>

          {payment.is_certificate_generated && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs">Certificate Generated</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => onViewDetails(payment)}
            className="w-full px-3 py-2 text-sm border border-[#00B5A5] text-[#00B5A5] hover:bg-[#00B5A5] hover:text-white rounded-md transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() =>
              (window.location.href = `/my-payments/${payment.id}`)
            }
            className="w-full px-3 py-2 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
          >
            View Full Payment
          </button>
        </div>
      </div>
    </div>
  );
}
