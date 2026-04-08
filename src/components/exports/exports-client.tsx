"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Download,
  Trash2,
  RefreshCw,
  FileDown,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useExports, ExportJob } from "@/lib/hooks/useExports";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case "completed":
      return { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" };
    case "processing":
      return { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" };
    case "pending":
      return { icon: <Clock className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" };
    case "failed":
      return { icon: <XCircle className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" };
    default:
      return { icon: <Clock className="w-4 h-4" />, color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-700" };
  }
}

export default function ExportsClient() {
  const { exports: exportJobs, loading, fetchExports, requestExport, checkStatus, downloadExport, approveExport, deleteExport } = useExports();
  const [pollingIds, setPollingIds] = useState<Set<number>>(new Set());
  const intervalsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [untilDate, setUntilDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchExports();
  }, [fetchExports]);

  const startPolling = useCallback((id: number) => {
    if (intervalsRef.current.has(id)) return;

    const interval = setInterval(async () => {
      const updated = await checkStatus(id);
      if (updated && (updated.status === "completed" || updated.status === "failed" || updated.status === "Completed")) {
        clearInterval(intervalsRef.current.get(id)!);
        intervalsRef.current.delete(id);
        setPollingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        fetchExports();
      }
    }, 5000);

    intervalsRef.current.set(id, interval);
    setPollingIds((prev) => new Set(prev).add(id));
  }, [checkStatus, fetchExports]);

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
    };
  }, []);

  useEffect(() => {
    exportJobs.forEach((job) => {
      if ((job.status === "pending" || job.status === "processing") && !intervalsRef.current.has(job.id)) {
        startPolling(job.id);
      }
    });
  }, [exportJobs, startPolling]);

  const handleRequestExport = async () => {
    if (!fromDate || !untilDate) return;
    const job = await requestExport({ from: fromDate, until: untilDate });
    if (job) {
      setShowDatePicker(false);
      fetchExports();
      if (job.status === "pending" || job.status === "processing") {
        startPolling(job.id);
      }
    }
  };

  const handleDownload = async (id: number) => {
    await downloadExport(id);
  };

  const handleApprove = async (id: number) => {
    const ok = await approveExport(id, true);
    if (ok) fetchExports();
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Exports</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Export your organization data for analysis or backup
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            New Export
          </button>
          <button
            onClick={fetchExports}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      {showDatePicker && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Select date range for export</h3>
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Until</label>
              <input
                type="date"
                value={untilDate}
                onChange={(e) => setUntilDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestExport}
                disabled={loading || !fromDate || !untilDate}
                className="px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Exporting..." : "Start Export"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Exports", value: exportJobs.length, color: "text-gray-900 dark:text-white" },
          { label: "Completed", value: exportJobs.filter((e) => e.status?.toLowerCase() === "completed").length, color: "text-green-600" },
          { label: "In Progress", value: exportJobs.filter((e) => ["pending", "processing"].includes(e.status?.toLowerCase())).length, color: "text-blue-600" },
          { label: "Failed", value: exportJobs.filter((e) => e.status?.toLowerCase() === "failed").length, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Export List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading && exportJobs.length === 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : exportJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Download className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No exports yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              Click &quot;New Export&quot; to create your first data export
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {exportJobs.map((job) => {
              const statusConfig = getStatusConfig(job.status);
              return (
                <div key={job.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                      <span className={statusConfig.color}>{statusConfig.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Export #{job.id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {job.export_from} to {job.export_until} &middot; by {job.generated_by} &middot; {formatDate(job.generated_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      {job.status}
                    </span>
                    {job.status?.toLowerCase() !== "completed" && job.status?.toLowerCase() !== "failed" && (
                      <button
                        onClick={() => handleApprove(job.id)}
                        className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                        title="Approve export"
                      >
                        Approve
                      </button>
                    )}
                    {job.status?.toLowerCase() === "completed" && (
                      <button
                        onClick={() => handleDownload(job.id)}
                        className="p-2 text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors"
                        title="Download (requires 3 approvals)"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this export?")) {
                          deleteExport(job.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
