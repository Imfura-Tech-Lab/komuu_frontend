"use client";

import { useState } from "react";
import { X, CreditCard } from "lucide-react";

export type SubscribeMode = "subscribe" | "upgrade" | "renew";

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: SubscribeMode;
  onSubmit: (data: Record<string, unknown>) => Promise<{ success: boolean }>;
  loading: boolean;
  currentPackageId?: number;
  currentPrice?: number;
}

const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Mobile Money", "Credit/Debit Card"];
const GATEWAYS = ["DPO Rwanda", "FlutterWave"];

const MODE_CONFIG = {
  subscribe: { title: "Subscribe to Plan", action: "Subscribe" },
  upgrade: { title: "Upgrade Subscription", action: "Upgrade" },
  renew: { title: "Renew Subscription", action: "Renew" },
};

export default function SubscribeModal({
  isOpen,
  onClose,
  mode,
  onSubmit,
  loading,
  currentPackageId,
  currentPrice,
}: SubscribeModalProps) {
  const [formData, setFormData] = useState({
    package: currentPackageId?.toString() || "",
    category: "Paid" as "Trial" | "Paid",
    amount_paid: currentPrice?.toString() || "",
    payment_method: "",
    transaction_number: "",
    gateway: "DPO Rwanda",
    payment_status: "Completed",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const config = MODE_CONFIG[mode];
  const isTrial = mode === "subscribe" && formData.category === "Trial";

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode !== "renew" && !formData.package) newErrors.package = "Package is required";
    if (!isTrial) {
      if (!formData.amount_paid || Number(formData.amount_paid) <= 0) newErrors.amount_paid = "Amount is required";
      if (!formData.payment_method) newErrors.payment_method = "Payment method is required";
      if (!formData.transaction_number) newErrors.transaction_number = "Transaction number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Record<string, unknown> = {};
    if (mode !== "renew") payload.package = Number(formData.package);
    if (mode === "subscribe") payload.category = formData.category;
    if (!isTrial) {
      payload.amount_paid = Number(formData.amount_paid);
      payload.payment_method = formData.payment_method;
      payload.transaction_number = formData.transaction_number;
      payload.gateway = formData.gateway;
      payload.payment_status = formData.payment_status;
    }

    const result = await onSubmit(payload);
    if (result.success) onClose();
  };

  const inputClass = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00B5A5]/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-[#00B5A5]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{config.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === "subscribe" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <div className="flex gap-3">
                {(["Trial", "Paid"] as const).map((cat) => (
                  <button key={cat} type="button" onClick={() => setFormData({ ...formData, category: cat })}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${formData.category === cat ? "border-[#00B5A5] bg-[#00B5A5]/10 text-[#00B5A5]" : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode !== "renew" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package ID <span className="text-red-500">*</span></label>
              <input type="number" value={formData.package} onChange={(e) => setFormData({ ...formData, package: e.target.value })} className={inputClass} placeholder="Package ID" />
              {errors.package && <p className="mt-1 text-sm text-red-500">{errors.package}</p>}
            </div>
          )}

          {!isTrial && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" value={formData.amount_paid} onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })} className={inputClass} placeholder="0.00" />
                {errors.amount_paid && <p className="mt-1 text-sm text-red-500">{errors.amount_paid}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method <span className="text-red-500">*</span></label>
                <select value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className={inputClass}>
                  <option value="">Select method...</option>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.payment_method && <p className="mt-1 text-sm text-red-500">{errors.payment_method}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Number <span className="text-red-500">*</span></label>
                <input type="text" value={formData.transaction_number} onChange={(e) => setFormData({ ...formData, transaction_number: e.target.value })} className={inputClass} placeholder="TXN123456" />
                {errors.transaction_number && <p className="mt-1 text-sm text-red-500">{errors.transaction_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gateway</label>
                <select value={formData.gateway} onChange={(e) => setFormData({ ...formData, gateway: e.target.value })} className={inputClass}>
                  {GATEWAYS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Processing..." : config.action}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
