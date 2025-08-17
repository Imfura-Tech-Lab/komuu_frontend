"use client";
import SecureDashboardLayout, {
  UserData,
} from "@/components/layouts/secure-dashboard-layout";
import { useEffect, useState, Suspense, lazy } from "react";
import { showErrorToast } from "@/components/layouts/auth-layer-out";
import React from "react";
import { AdministratorDashboard } from "@/components/dashboards/AdministratorDashboard";
import { PresidentDashboard } from "@/components/dashboards/PresidentDashboard";
import { BoardDashboard } from "@/components/dashboards/BoardDashboard";
import { MemberDashboard } from "@/components/dashboards/MemberDashboard";

// // Lazy load role-specific dashboard components
// const AdministratorDashboard = lazy(
//   () => import("@/components/dashboards/AdministratorDashboard")
// );
// const PresidentDashboard = lazy(
//   () => import("@/components/dashboards/PresidentDashboard")
// );
// const BoardDashboard = lazy(
//   () => import("@/components/dashboards/BoardDashboard")
// );
// const MemberDashboard = lazy(
//   () => import("@/components/dashboards/MemberDashboard")
// );
// const MemberUnverifiedDashboard = lazy(
//   () => import("@/components/dashboards/MemberUnverifiedDashboard")
// );

// Loading component for role-specific dashboards
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6">
    {/* Welcome Section Skeleton */}
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"
        ></div>
      ))}
    </div>

    {/* Content Grid Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 lg:col-span-2"></div>
    </div>
  </div>
);

// Error fallback component
const DashboardError = ({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center max-w-md">
      <div className="mb-4">
        <svg
          className="w-16 h-16 mx-auto text-red-400 dark:text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Dashboard Error
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Unable to load the dashboard component: {error.message}
      </p>
      <button
        onClick={retry}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00B5A5] hover:bg-[#008F82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  </div>
);

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dashboardError, setDashboardError] = useState<Error | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem("user_data");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        showErrorToast("Failed to load user data. Please refresh the page.");
      }
    }
  }, []);

  // Reset error state when retrying
  const handleRetry = () => {
    setDashboardError(null);
    setRetryKey((prev) => prev + 1);
  };

  // Get the appropriate dashboard component based on user role
  const getDashboardComponent = () => {
    if (!userData) return null;

    const roleComponentMap = {
      Administrator: AdministratorDashboard,
      President: PresidentDashboard,
      Board: BoardDashboard,
      Member: MemberDashboard,
      MemberUnverified: MemberDashboard,
    };

    const DashboardComponent = roleComponentMap[userData.role];

    if (!DashboardComponent) {
      // Fallback to Member dashboard if role not found
      return MemberDashboard;
    }

    return DashboardComponent;
  };

  // Role-specific welcome messages
  const getWelcomeMessage = () => {
    if (!userData)
      return { title: "Welcome!", description: "Loading your dashboard..." };

    const roleMessages = {
      Administrator: {
        title: `Welcome back, Administrator ${userData.name.split(" ")[0]}! 🛡️`,
        description:
          "Manage users, system settings, and oversee all AFSA operations.",
      },
      President: {
        title: `Welcome back, President ${userData.name.split(" ")[0]}! 🏛️`,
        description:
          "Review strategic initiatives and organizational performance.",
      },
      Board: {
        title: `Welcome back, ${userData.name.split(" ")[0]}! 📋`,
        description:
          "Access board meetings, policies, and member oversight tools.",
      },
      Member: {
        title: `Welcome back, ${userData.name.split(" ")[0]}! 👋`,
        description:
          "Explore resources, events, and connect with the AFSA community.",
      },
      MemberUnverified: {
        title: `Hello, ${userData.name.split(" ")[0]}! 🕐`,
        description:
          "Complete your verification to unlock all AFSA member benefits.",
      },
    };

    return roleMessages[userData.role] || roleMessages.Member;
  };

  // Show loading state while user data is being loaded
  if (!userData) {
    return (
      <SecureDashboardLayout>
        <div className="px-4 py-6 sm:px-0">
          <DashboardSkeleton />
        </div>
      </SecureDashboardLayout>
    );
  }

  const DashboardComponent = getDashboardComponent();
  const welcomeMessage = getWelcomeMessage();

  return (
    <SecureDashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        {/* Universal Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-[#00B5A5] to-[#00D4C7] dark:from-[#008F82] dark:to-[#00B5A5] rounded-lg p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">{welcomeMessage.title}</h2>
          <p className="text-[#E6FFFD] dark:text-[#B3F5F0]">
            {welcomeMessage.description}
          </p>
        </div>

        {/* Role-specific Dashboard Content */}
        <div key={retryKey}>
          {dashboardError ? (
            <DashboardError error={dashboardError} retry={handleRetry} />
          ) : (
            <Suspense fallback={<DashboardSkeleton />}>
              {DashboardComponent && (
                <ErrorBoundary
                  fallback={(error) => {
                    setDashboardError(error);
                    return null;
                  }}
                >
                  <DashboardComponent />
                </ErrorBoundary>
              )}
            </Suspense>
          )}
        </div>

        {/* Fallback: Show basic dashboard if component fails to load */}
        {!DashboardComponent && !dashboardError && (
          <div className="space-y-6">
            <DefaultDashboardContent userData={userData} />
          </div>
        )}
      </div>
    </SecureDashboardLayout>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: (error: Error) => React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Dashboard component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
}

// Default/Fallback Dashboard Content
const DefaultDashboardContent = ({ userData }: { userData: UserData }) => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Membership Status */}
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
                  {userData.active ? "Active" : "Inactive"}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
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
                  {calculateProfileCompletion(userData)}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Account Verification */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  userData.verified
                    ? "bg-green-500 dark:bg-green-600"
                    : "bg-yellow-500 dark:bg-yellow-600"
                }`}
              >
                <span className="text-white font-semibold">
                  {userData.verified ? "✓" : "!"}
                </span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Verification
                </dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userData.verified ? "Verified" : "Pending"}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">👤</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Role
                </dt>
                <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userData.role === "MemberUnverified"
                    ? "Member"
                    : userData.role}
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
              <span className="text-sm text-gray-900 dark:text-gray-100 truncate ml-2">
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
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
