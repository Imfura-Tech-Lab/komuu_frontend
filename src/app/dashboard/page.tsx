"use client";
import SecureDashboardLayout, {
  UserData,
} from "@/components/layouts/secure-dashboard-layout";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem("user_data");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);

  return (
    <SecureDashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Welcome Section */}
        {userData && (
          <div className="mb-8 bg-gradient-to-r from-[#00B5A5] to-[#00D4C7] dark:from-[#008F82] dark:to-[#00B5A5] rounded-lg p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {userData.name.split(" ")[0]}! 👋
            </h2>
            <p className="text-[#E6FFFD] dark:text-[#B3F5F0]">
              Here's what's happening with your AFSA membership today.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Stat Card 1 - Membership Status */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[#00B5A5] dark:bg-[#00D4C7] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Membership Status
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData?.active ? "Active" : "Inactive"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Card 2 - Profile Completion */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">%</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Profile Complete
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData ? calculateProfileCompletion(userData) : 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Card 3 - Account Verification */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      userData?.verified
                        ? "bg-green-500 dark:bg-green-600"
                        : "bg-yellow-500 dark:bg-yellow-600"
                    }`}
                  >
                    <span className="text-white font-semibold">
                      {userData?.verified ? "✓" : "!"}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Verification
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData?.verified ? "Verified" : "Pending"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Card 4 - Member Since */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">📅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Member Since
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                      {userData
                        ? new Date(userData.date_of_birth).getFullYear()
                        : "2024"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Account Information
              </h3>
              {userData && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Full Name:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {userData.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {userData.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phone:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {userData.phone_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Role:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {userData.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      National ID:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {userData.national_ID}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        userData.active
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {userData.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#00B5A5] dark:text-[#00D4C7] bg-[#00B5A5]/10 dark:bg-[#00D4C7]/10 hover:bg-[#00B5A5]/20 dark:hover:bg-[#00D4C7]/20 transition-colors duration-200">
                  Update Profile
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200">
                  View Membership Details
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200">
                  Download Certificate
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200">
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 lg:col-span-2 transition-colors duration-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  <li className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                          <span className="text-white text-sm">✓</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Account created and password changed successfully
                            <span className="whitespace-nowrap ml-2 text-gray-400 dark:text-gray-500">
                              just now
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                          <span className="text-white text-sm">📧</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Welcome email sent to {userData?.email}
                            <span className="whitespace-nowrap ml-2 text-gray-400 dark:text-gray-500">
                              5 min ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="relative">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-[#00B5A5] dark:bg-[#00D4C7] flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                          <span className="text-white text-sm">👤</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Profile information submitted for verification
                            <span className="whitespace-nowrap ml-2 text-gray-400 dark:text-gray-500">
                              10 min ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SecureDashboardLayout>
  );
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(userData: UserData): number {
  const fields = [
    userData.name,
    userData.email,
    userData.phone_number,
    userData.national_ID,
    userData.date_of_birth,
  ];

  const optionalFields = [
    userData.passport,
    userData.secondary_email,
    userData.alternative_phone,
    userData.whatsapp_number,
  ];

  const requiredComplete = fields.filter(
    (field) => field && field.trim() !== ""
  ).length;
  const optionalComplete = optionalFields.filter(
    (field) => field && field.trim() !== ""
  ).length;

  const requiredWeight = 0.7; // 70% weight for required fields
  const optionalWeight = 0.3; // 30% weight for optional fields

  const requiredPercentage =
    (requiredComplete / fields.length) * requiredWeight;
  const optionalPercentage =
    (optionalComplete / optionalFields.length) * optionalWeight;

  return Math.round((requiredPercentage + optionalPercentage) * 100);
}
