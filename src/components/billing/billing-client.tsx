"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  FileText,
  RefreshCw,
  XCircle,
  ArrowUpCircle,
  RotateCw,
} from "lucide-react";
import { useBilling, Subscription, SubscriptionInvoice } from "@/lib/hooks/useBilling";
import SubscribeModal, { SubscribeMode } from "./SubscribeModal";

type TabType = "plan" | "subscriptions" | "invoices";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusColor(status: string): string {
  const s = status?.toLowerCase();
  if (s === "active") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "cancelled") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  if (s === "expired" || s === "renewed") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  if (s === "paid") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "unpaid" || s === "pending") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}

export default function BillingClient() {
  const [activeTab, setActiveTab] = useState<TabType>("plan");
  const [modalMode, setModalMode] = useState<SubscribeMode>("subscribe");
  const [showModal, setShowModal] = useState(false);
  const {
    currentSubscription,
    subscriptions,
    invoices,
    loading,
    fetchCurrentPlan,
    fetchSubscriptions,
    fetchInvoices,
    cancelSubscription,
    subscribe,
    upgradeSubscription,
    renewSubscription,
  } = useBilling();

  const handleModalSubmit = async (data: Record<string, unknown>) => {
    let result: { success: boolean };
    if (modalMode === "subscribe") {
      result = await subscribe(data as Parameters<typeof subscribe>[0]);
    } else if (modalMode === "upgrade") {
      result = await upgradeSubscription(data as Parameters<typeof upgradeSubscription>[0]);
    } else {
      result = await renewSubscription(data as Parameters<typeof renewSubscription>[0]);
    }
    if (result.success) {
      fetchCurrentPlan();
      fetchSubscriptions();
      fetchInvoices();
    }
    return result;
  };

  const openModal = (mode: SubscribeMode) => {
    setModalMode(mode);
    setShowModal(true);
  };

  useEffect(() => {
    fetchCurrentPlan();
    fetchSubscriptions();
    fetchInvoices();
  }, [fetchCurrentPlan, fetchSubscriptions, fetchInvoices]);

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "plan", label: "Current Plan", icon: <CreditCard className="w-4 h-4" /> },
    { key: "subscriptions", label: "Subscriptions", icon: <Calendar className="w-4 h-4" /> },
    { key: "invoices", label: "Invoices", icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your subscription and billing details
          </p>
        </div>
        <button
          onClick={() => { fetchCurrentPlan(); fetchSubscriptions(); fetchInvoices(); }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? "border-[#00B5A5] text-[#00B5A5]"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "plan" && (
        <CurrentPlanView
          subscription={currentSubscription}
          loading={loading}
          onCancel={cancelSubscription}
          onUpgrade={() => openModal("upgrade")}
          onRenew={() => openModal("renew")}
          onSubscribe={() => openModal("subscribe")}
        />
      )}

      <SubscribeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        onSubmit={handleModalSubmit}
        loading={loading}
        currentPackageId={currentSubscription?.package?.id}
        currentPrice={currentSubscription?.package?.price}
      />
      {activeTab === "subscriptions" && (
        <SubscriptionsView subscriptions={subscriptions} loading={loading} />
      )}
      {activeTab === "invoices" && (
        <InvoicesView invoices={invoices} loading={loading} />
      )}
    </div>
  );
}

function CurrentPlanView({
  subscription,
  loading,
  onCancel,
  onUpgrade,
  onRenew,
  onSubscribe,
}: {
  subscription: Subscription | null;
  loading: boolean;
  onCancel: () => Promise<boolean>;
  onUpgrade: () => void;
  onRenew: () => void;
  onSubscribe: () => void;
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <CreditCard className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Subscription</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          You don&apos;t have an active subscription yet.
        </p>
        <button
          onClick={onSubscribe}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          Subscribe Now
        </button>
      </div>
    );
  }

  const isActive = subscription.status?.toLowerCase() === "active";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-[#00B5A5] to-[#008F82] p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Current Plan</p>
            <h2 className="text-2xl font-bold mt-1">{subscription.package?.name || "Subscription"}</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isActive ? "bg-white/20 text-white" : "bg-red-500/20 text-red-100"
          }`}>
            {subscription.status}
          </span>
        </div>
        <p className="text-3xl font-bold mt-4">
          {subscription.package?.currency} {subscription.package?.price}
          <span className="text-sm font-normal opacity-80">/year</span>
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
            <p className="font-medium text-gray-900 dark:text-white">{subscription.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatDate(subscription.start_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatDate(subscription.end_date)}</p>
          </div>
        </div>

        {subscription.renewal_date && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Renewal date: <span className="font-medium">{formatDate(subscription.renewal_date)}</span>
            </p>
          </div>
        )}

        {isActive && (
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onUpgrade}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Upgrade
            </button>
            <button
              onClick={onRenew}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              Renew
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to cancel your subscription?")) {
                  onCancel();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SubscriptionsView({ subscriptions, loading }: { subscriptions: Subscription[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Subscription History</h3>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Package", "Category", "Status", "Start", "End", "Amount"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {sub.package?.name || "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{sub.category}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(sub.start_date)}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(sub.end_date)}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {sub.payment ? `${sub.payment.currency} ${sub.payment.amount_paid}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoicesView({ invoices, loading }: { invoices: SubscriptionInvoice[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Invoices</h3>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {["Invoice #", "Amount", "Currency", "Status", "Issued", "Paid At"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{inv.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{inv.amount_paid}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{inv.currency}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(inv.issued_at)}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {inv.paid_at ? formatDate(inv.paid_at) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
