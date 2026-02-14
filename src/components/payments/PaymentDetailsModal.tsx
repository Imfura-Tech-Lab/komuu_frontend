"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, DocumentDuplicateIcon, CheckIcon } from "@heroicons/react/24/outline";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Sheet Container */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
                        Payment Details
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDateTime(payment.payment_date)}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="bg-gradient-to-r from-[#00B5A5]/10 to-[#00B5A5]/5 dark:from-[#00B5A5]/20 dark:to-[#00B5A5]/10 rounded-xl p-6 text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
                          <p className="text-3xl font-bold text-[#00B5A5]">{payment.amount_paid}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Transaction Details
                          </h3>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Member Number</p>
                              <p className="font-medium text-gray-900 dark:text-white">{payment.member}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                              <p className="font-medium text-gray-900 dark:text-white">{payment.payment_method}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gateway</p>
                              <p className="font-medium text-gray-900 dark:text-white">{payment.gateway}</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</p>
                              <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(payment.payment_date)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Transaction Number */}
                        <div className="space-y-2">
                          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Transaction Number
                          </h3>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg font-mono text-gray-900 dark:text-white">
                              {payment.transaction_number}
                            </code>
                            <button
                              onClick={() => handleCopy(payment.transaction_number, "Transaction number")}
                              disabled={copyingField === "Transaction number"}
                              className="p-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                              {copyingField === "Transaction number" ? (
                                <CheckIcon className="w-5 h-5" />
                              ) : (
                                <DocumentDuplicateIcon className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Certificate Status */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Certificate Status
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  Generation status for this payment
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm font-semibold ${
                              payment.is_certificate_generated
                                ? "text-green-600 dark:text-green-400"
                                : "text-orange-600 dark:text-orange-400"
                            }`}>
                              {payment.is_certificate_generated ? "Generated" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          onClick={handleCopyAll}
                          disabled={copyingField === "all"}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {copyingField === "all" ? (
                            <>
                              <CheckIcon className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <DocumentDuplicateIcon className="w-4 h-4" />
                              Copy All
                            </>
                          )}
                        </button>
                        <button
                          onClick={onClose}
                          className="flex-1 px-4 py-2.5 text-sm bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
