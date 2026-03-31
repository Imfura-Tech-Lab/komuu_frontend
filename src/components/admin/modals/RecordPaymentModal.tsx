"use client";

import { useState } from "react";
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
}

const CURRENCIES = ["USD", "EUR", "GBP", "RWF", "AUD", "CAD"];
const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Mobile Money",
  "Credit/Debit Card",
  "Google Pay",
  "Apple Pay",
  "AFSA Administration",
  "Sponsored",
];

export default function RecordPaymentModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: RecordPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount_paid: "",
    currency: "USD",
    payment_method: "",
    payment_gateway: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount_paid || Number(formData.amount_paid) <= 0) {
      newErrors.amount_paid = "Amount is required and must be positive";
    }
    if (!formData.payment_method) {
      newErrors.payment_method = "Payment method is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSubmit({
      amount_paid: Number(formData.amount_paid),
      currency: formData.currency,
      payment_method: formData.payment_method,
      payment_gateway: formData.payment_gateway || undefined,
    });

    if (success) {
      setFormData({ amount_paid: "", currency: "USD", payment_method: "", payment_gateway: "" });
      setErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
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
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount_paid}
              onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              placeholder="0.00"
            />
            {errors.amount_paid && <p className="mt-1 text-sm text-red-500">{errors.amount_paid}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
            >
              <option value="">Select method...</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {errors.payment_method && <p className="mt-1 text-sm text-red-500">{errors.payment_method}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Payment Gateway <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.payment_gateway}
              onChange={(e) => setFormData({ ...formData, payment_gateway: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              placeholder="e.g., DPO Rwanda"
            />
          </div>

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
              disabled={loading}
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
