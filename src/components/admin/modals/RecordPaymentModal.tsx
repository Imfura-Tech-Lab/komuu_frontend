"use client";

import { useEffect, useState } from "react";
import { X, CreditCard } from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount_paid: number;
    currency: string;
    payment_method: string;
    payment_gateway?: string;
  }) => Promise<boolean>;
  loading: boolean;
  expectedAmount: number | null;
  expectedCurrency: string | null;
}

const PAYMENT_METHODS = [
  "Bank Transfer",
  "Cash",
  "Cheque",
  "Mobile Money",
  "Credit/Debit Card",
  "Google Pay",
  "Apple Pay",
  "AFSA Administration",
  "Sponsored",
];

const GATEWAYS = ["DPO Rwanda", "FlutterWave"];

export default function RecordPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  expectedAmount,
  expectedCurrency,
}: RecordPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");
  const [paymentGateway, setPaymentGateway] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod("Bank Transfer");
      setPaymentGateway("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (expectedAmount === null || !expectedCurrency) {
      setError("Missing membership pricing — refresh the page and try again.");
      return;
    }
    if (!paymentMethod) {
      setError("Payment method is required.");
      return;
    }

    const success = await onSubmit({
      amount_paid: Number(expectedAmount),
      currency: expectedCurrency,
      payment_method: paymentMethod,
      payment_gateway: paymentGateway || undefined,
    });

    if (success) {
      onClose();
    }
  };

  const amountDisplay =
    expectedAmount !== null && expectedCurrency
      ? `${expectedCurrency} ${Number(expectedAmount).toFixed(2)}`
      : "Unavailable";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00B5A5]/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-[#00B5A5]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Record Payment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Record a bank transfer or other offline payment. The amount must
            match the membership fee exactly.
          </p>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Amount due
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {amountDisplay}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Gateway{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={paymentGateway}
              onChange={(e) => setPaymentGateway(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
            >
              <option value="">None</option>
              {GATEWAYS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || expectedAmount === null || !expectedCurrency}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Recording..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
