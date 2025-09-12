"use client";

import { useState } from "react";
import { Payment } from "@/types/payment";
import { copyToClipboard, formatDateTime } from "@/lib/utils/paymentUtils";

interface PaymentDetailsModalProps {
  payment: Payment | null;
  onClose: () => void;
}

export default function PaymentDetailsModal({ payment, onClose }: PaymentDetailsModalProps) {
  const [copyingField, setCopyingField] = useState<string | null>(null);

  if (!payment) return null;

  const handleCopy = async (text: string, fieldName: string) => {
    setCopyingField(fieldName);
    const success = await copyToClipboard(text, fieldName);
    if (success) {
      setTimeout(() => setCopyingField(null), 1000);
    } else {
      setCopyingField(null);
    }
  };

  const handleCopyAll = async () => {
    setCopyingField("all");
    const paymentInfo = `
Payment ID: ${payment.id}
Member: ${payment.member}
Amount: ${payment.amount_paid}
Method: ${payment.payment_method}
Transaction: ${payment.transaction_number}
Gateway: ${payment.gateway}
Status: ${payment.status}
Date: ${formatDateTime(payment.payment_date)}
Certificate Generated: ${payment.is_certificate_generated ? 'Yes' : 'No'}
    `.trim();
    
    const success = await copyToClipboard(paymentInfo, "Payment details");
    if (success) {
      setTimeout(() => setCopyingField(null), 1000);
    } else {
      setCopyingField(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID</p>
                <p className="font-medium text-gray-900 dark:text-white">{payment.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Number</p>
                <p className="font-medium text-gray-900 dark:text-white">{payment.member}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount Paid</p>
                <p className="font-semibold text-lg text-green-600 dark:text-green-400">{payment.amount_paid}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                <p className="font-medium text-gray-900 dark:text-white">{payment.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gateway</p>
                <p className="font-medium text-gray-900 dark:text-white">{payment.gateway}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  payment.status === "Completed" 
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : payment.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                }`}>
                  {payment.status}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Number</p>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded flex-1">
                  {payment.transaction_number}
                </code>
                <button
                  onClick={() => handleCopy(payment.transaction_number, "Transaction number")}
                  disabled={copyingField === "Transaction number"}
                  className="px-3 py-2 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded disabled:opacity-50"
                >
                  {copyingField === "Transaction number" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Payment Date</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(payment.payment_date)}</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Certificate Generation Status
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  payment.is_certificate_generated 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-orange-600 dark:text-orange-400"
                }`}>
                  {payment.is_certificate_generated ? "Generated" : "Not Generated"}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCopyAll}
                disabled={copyingField === "all"}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
              >
                {copyingField === "all" ? "Copied!" : "Copy All Details"}
              </button>
              <button
                onClick={() => window.location.href = `/payments/${payment.id}`}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                View Full Payment
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}