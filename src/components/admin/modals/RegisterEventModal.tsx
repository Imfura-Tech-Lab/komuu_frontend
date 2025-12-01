"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Event } from "@/lib/hooks/useMemberEvents";

interface RegisterEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (registrationData: {
    is_paid: boolean;
    amount_paid?: number;
    transaction_number?: string;
    payment_method?: string;
    status?: "pending" | "confirmed" | "cancelled" | "failed";
  }) => Promise<void>;
  event: Event | null;
  loading: boolean;
}

export function RegisterEventModal({
  isOpen,
  onClose,
  onConfirm,
  event,
  loading,
}: RegisterEventModalProps) {
  const [transactionNumber, setTransactionNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [errors, setErrors] = useState<{
    transactionNumber?: string;
    paymentMethod?: string;
  }>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTransactionNumber("");
      setPaymentMethod("");
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      transactionNumber?: string;
      paymentMethod?: string;
    } = {};

    if (event.is_paid) {
      if (!transactionNumber.trim()) {
        newErrors.transactionNumber = "Transaction number is required for paid events";
      } else if (transactionNumber.trim().length < 5) {
        newErrors.transactionNumber = "Transaction number must be at least 5 characters";
      }

      if (!paymentMethod) {
        newErrors.paymentMethod = "Payment method is required for paid events";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) {
      return;
    }

    await onConfirm({
      is_paid: event.is_paid,
      amount_paid: event.is_paid ? parseFloat(event.price || "0") : undefined,
      transaction_number: event.is_paid ? transactionNumber.trim() : undefined,
      payment_method: event.is_paid ? paymentMethod : undefined,
      status: event.is_paid ? "pending" : "confirmed",
    });
  };

  const availableSlots = event.available_slots || 0;
  const isLimitedSeats = availableSlots <= 10 && availableSlots > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Register for Event
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Event Details Summary */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {event.title}
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {formatDate(event.start_time)} · {formatTime(event.start_time)}
                  </span>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>
                    {event.registrations || 0} / {event.capacity} registered
                  </span>
                </div>

                {event.is_paid && (
                  <div className="flex items-center text-gray-900 dark:text-white font-semibold">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      RWF {event.price}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Limited seats warning */}
            {isLimitedSeats && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      Limited Availability
                    </h3>
                    <div className="mt-2 text-sm text-orange-700 dark:text-orange-400">
                      <p>
                        Only {availableSlots} {availableSlots === 1 ? "seat" : "seats"} remaining. Register soon to secure your spot!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information (only for paid events) */}
            {event.is_paid && (
              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Payment Information
                  </h4>

                  {/* Payment Method */}
                  <div className="mb-4">
                    <label
                      htmlFor="paymentMethod"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        if (errors.paymentMethod) {
                          setErrors((prev) => ({
                            ...prev,
                            paymentMethod: undefined,
                          }));
                        }
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                        errors.paymentMethod
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      disabled={loading}
                    >
                      <option value="">Select payment method</option>
                      <option value="Credit/Debit Card">Credit/Debit Card</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                    </select>
                    {errors.paymentMethod && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.paymentMethod}
                      </p>
                    )}
                  </div>

                  {/* Transaction Number */}
                  <div>
                    <label
                      htmlFor="transactionNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Transaction/Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="transactionNumber"
                      type="text"
                      value={transactionNumber}
                      onChange={(e) => {
                        setTransactionNumber(e.target.value);
                        if (errors.transactionNumber) {
                          setErrors((prev) => ({
                            ...prev,
                            transactionNumber: undefined,
                          }));
                        }
                      }}
                      placeholder="Enter your transaction number"
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors ${
                        errors.transactionNumber
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      disabled={loading}
                      maxLength={100}
                    />
                    {errors.transactionNumber && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.transactionNumber}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Provide the transaction reference from your payment confirmation
                    </p>
                  </div>
                </div>

                {/* Payment Info Box */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Payment Verification
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                        <p>
                          Your registration will be pending until payment is verified by the organizer. You will receive a confirmation email once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Free event confirmation */}
            {!event.is_paid && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                      Free Event
                    </h3>
                    <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                      <p>
                        This is a free event. Your registration will be confirmed immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008f82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Registering...</span>
                </>
              ) : (
                <span>Confirm Registration</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}