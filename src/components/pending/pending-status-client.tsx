"use client";

import { useEffect, useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CreditCardIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "pending" | "attention_needed";
  completedAt?: string;
  note?: string;
}

export default function PendingStatusClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [applicationDate] = useState("2024-01-15");
  const [applicationNumber] = useState("APP-2024-00156");

  const steps: ApplicationStep[] = [
    {
      id: "1",
      title: "Application Submitted",
      description: "Your membership application has been received",
      status: "completed",
      completedAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Document Verification",
      description: "Reviewing your submitted documents and credentials",
      status: "completed",
      completedAt: "2024-01-18",
    },
    {
      id: "3",
      title: "Payment Processing",
      description: "Membership fee payment verification",
      status: "in_progress",
      note: "Awaiting payment confirmation",
    },
    {
      id: "4",
      title: "Committee Review",
      description: "Application review by the membership committee",
      status: "pending",
    },
    {
      id: "5",
      title: "Final Approval",
      description: "Final decision on your membership application",
      status: "pending",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getStepIcon = (status: ApplicationStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case "in_progress":
        return <ArrowPathIcon className="h-6 w-6 text-[#00B5A5] animate-spin" />;
      case "attention_needed":
        return <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />;
      default:
        return <ClockIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStepBorderColor = (status: ApplicationStep["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-500";
      case "in_progress":
        return "border-[#00B5A5]";
      case "attention_needed":
        return "border-yellow-500";
      default:
        return "border-gray-300 dark:border-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading application status...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Application Status
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Track the progress of your membership application
        </p>
      </div>

      {/* Application Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00B5A5]/10 rounded-full">
              <UserCircleIcon className="h-8 w-8 text-[#00B5A5]" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Application Number</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {applicationNumber}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Submitted On</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(applicationDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Status</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00B5A5]/10 text-[#00B5A5]">
                <ArrowPathIcon className="h-3 w-3" />
                In Progress
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Application Progress
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div
                    className={`absolute left-[23px] top-12 w-0.5 h-full -mb-6 ${
                      step.status === "completed"
                        ? "bg-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
                <div className="flex gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-800 ${getStepBorderColor(
                      step.status
                    )}`}
                  >
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3
                        className={`font-medium ${
                          step.status === "pending"
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {step.title}
                      </h3>
                      {step.completedAt && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(step.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                    {step.note && (
                      <p className="text-sm text-[#00B5A5] mt-2 flex items-center gap-1">
                        <ExclamationCircleIcon className="h-4 w-4" />
                        {step.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">View Application</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Review your submitted application details
          </p>
          <button className="text-sm text-[#00B5A5] hover:underline">
            View Details
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Payment Status</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Check your payment status or make a payment
          </p>
          <button className="text-sm text-[#00B5A5] hover:underline">
            View Payments
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">Estimated Timeline</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Applications typically processed within 7-14 days
          </p>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Days remaining: ~5
          </span>
        </div>
      </div>

      {/* Need Help Banner */}
      <div className="bg-gradient-to-r from-[#00B5A5]/10 to-[#00B5A5]/5 rounded-xl p-6 border border-[#00B5A5]/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Have questions about your application?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Our support team is here to help you through the process.
            </p>
          </div>
          <a
            href="/pending/help"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors"
          >
            Get Help
          </a>
        </div>
      </div>
    </div>
  );
}
