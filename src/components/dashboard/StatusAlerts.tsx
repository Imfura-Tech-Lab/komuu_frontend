import React from "react";
import { UserData } from "@/types"; 
import { NextRouter } from "next/router";

interface StatusAlertsProps {
  userData: UserData;
  router: NextRouter;
}

export function StatusAlerts({ userData, router }: StatusAlertsProps) {
  return (
    <>
      {userData.role === "Pending" && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Application Under Review
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                Your membership application is currently being reviewed by our
                administrators. You'll receive an email notification once your
                application has been processed. Access to most features is
                limited until approval is complete.
              </p>
              <div className="mt-2">
                <button
                  onClick={() => router.push("/pending/status")}
                  className="text-sm text-orange-800 dark:text-orange-200 underline hover:text-orange-900 dark:hover:text-orange-100"
                >
                  Check application status →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {userData.role !== "Pending" && !userData.verified && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Account Verification Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Your account is not fully verified. Some features may be limited
                until verification is complete. Please check your email for
                verification instructions or contact support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Certificate signing notification for President */}
      {userData.role === "President" && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                Certificate Authority Access
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                As President, you have exclusive authority to sign member
                certificates. Please review and sign pending certificates to
                complete the membership process.
              </p>
              <div className="mt-2">
                <button
                  onClick={() => router.push("/certificates")}
                  className="text-sm text-purple-800 dark:text-purple-200 underline hover:text-purple-900 dark:hover:text-purple-100"
                >
                  Review pending certificates →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
