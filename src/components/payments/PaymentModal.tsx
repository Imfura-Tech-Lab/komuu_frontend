"use client";

import { useState } from "react";
import { X, CreditCard } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount_paid: number;
    payment_method: string;
    gateway: string;
    transaction_number?: string;
  }) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  loading: boolean;
  title?: string;
  description?: string;
  defaultAmount?: number;
}

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Mobile Money",
  "Credit/Debit Card",
];

const GATEWAYS = ["DPO Rwanda", "FlutterWave"];

export default function PaymentModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  title = "Make Payment",
  description,
  defaultAmount,
}: PaymentModalProps) {
  const [formData, setFormData] = useState({
    amount_paid: defaultAmount?.toString() || "",
    payment_method: "",
    gateway: "DPO Rwanda",
    transaction_number: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount_paid || Number(formData.amount_paid) <= 0) {
      newErrors.amount_paid = "Amount is required";
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
    setServerErrors(null);

    const result = await onSubmit({
      amount_paid: Number(formData.amount_paid),
      payment_method: formData.payment_method,
      gateway: formData.gateway,
      transaction_number: formData.transaction_number || undefined,
    });

    if (result.success) {
      setFormData({ amount_paid: "", payment_method: "", gateway: "DPO Rwanda", transaction_number: "" });
      setErrors({});
      onClose();
    } else if (result.errors) {
      setServerErrors(result.errors);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col rounded-l-2xl overflow-hidden animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00B5A5]/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-[#00B5A5]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {serverErrors && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              {Object.entries(serverErrors).map(([field, msgs]) => (
                <div key={field}>
                  {msgs.map((msg, i) => (
                    <p key={i} className="text-sm text-red-600 dark:text-red-400">{msg}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

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
              Gateway
            </label>
            <select
              value={formData.gateway}
              onChange={(e) => setFormData({ ...formData, gateway: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
            >
              {GATEWAYS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Number <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.transaction_number}
              onChange={(e) => setFormData({ ...formData, transaction_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              placeholder="e.g., TXN123456"
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
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
