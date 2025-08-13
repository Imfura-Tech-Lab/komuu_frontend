"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  secondary_email: string | null;
  alternative_phone: string | null;
  whatsapp_number: string | null;
  role: string;
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth: string;
  national_ID: string;
  passport: string | null;
  public_profile: string;
}

interface SecureDashboardLayoutProps {
  children: React.ReactNode;
}

export default function SecureDashboardLayout({
  children,
}: SecureDashboardLayoutProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Check authentication and load user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const storedUserData = localStorage.getItem("user_data");

        // Check if user is authenticated
        if (!token || !storedUserData) {
          showErrorToast("Session expired. Please login again.");
          router.push("/login");
          return;
        }

        // Parse user data
        const parsedUserData = JSON.parse(storedUserData);

        // Check if user needs to change password (except on change-password page)
        if (
          !parsedUserData.has_changed_password &&
          pathname !== "/change-password"
        ) {
          showErrorToast("Please change your default password to continue.");
          router.push("/change-password");
          return;
        }

        // Check if user account is active
        if (!parsedUserData.active) {
          showErrorToast(
            "Your account has been deactivated. Please contact support."
          );
          handleLogout();
          return;
        }

        // Validate token with backend (optional - you can implement this)
        try {
          await validateTokenWithBackend(token);
        } catch (error) {
          // If token validation fails, the function already handles cleanup
          return;
        }

        setUserData(parsedUserData);
      } catch (error) {
        console.error("Authentication check failed:", error);
        showErrorToast("Session validation failed. Please login again.");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Optional: Validate token with backend
  const validateTokenWithBackend = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${apiUrl}/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // If 401/403, token is invalid
        if (response.status === 401 || response.status === 403) {
          throw new Error("Token expired or invalid");
        }
        // For other errors, continue with stored data
        console.warn("Profile fetch failed but continuing with stored data");
        return;
      }

      const data = await response.json();

      // Update user data if backend returns updated info
      if (data.data || data.user) {
        const updatedUserData = data.data || data.user;
        localStorage.setItem("user_data", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
      }
    } catch (error) {
      // If token validation fails, clear storage and redirect
      console.error("Token validation failed:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      throw error;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const token = localStorage.getItem("auth_token");
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      // Call logout API if token exists
      if (token && apiUrl) {
        await fetch(`${apiUrl}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API fails
    } finally {
      // Clear local storage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");

      showSuccessToast("Logged out successfully!");
      router.push("/login");
      setIsLoggingOut(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // If no user data, don't render anything (redirect will happen)
  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                AFSA Dashboard
              </h1>
              <div className="hidden sm:block">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userData.verified
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                  }`}
                >
                  {userData.verified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userData.role}
                </p>
              </div>

              {/* User Avatar */}
              <div className="h-8 w-8 rounded-full bg-[#00B5A5] dark:bg-[#00D4C7] flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00B5A5] dark:bg-[#00D4C7] hover:bg-[#008F82] dark:hover:bg-[#00B5A5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className="mt-2 md:hidden">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {userData.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userData.email} • {userData.role}
            </p>
          </div>
        </div>
      </header>

      {/* Account Status Alerts */}
      {!userData.verified && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400 dark:text-yellow-500"
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
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your account is not verified. Some features may be limited.
                Please check your email for verification instructions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</main>

      {/* User Data Debug Panel (Development Only) */}
      {process.env.NODE_ENV === "development" && userData && (
        <div className="fixed bottom-4 right-4 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-100 p-4 rounded-lg text-xs max-w-sm opacity-90 hover:opacity-100 transition-opacity border border-gray-700 dark:border-gray-600">
          <h4 className="font-bold mb-2">Debug: User Data</h4>
          <div className="space-y-1">
            <p>
              <strong>ID:</strong> {userData.id}
            </p>
            <p>
              <strong>Name:</strong> {userData.name}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Phone:</strong> {userData.phone_number}
            </p>
            <p>
              <strong>Role:</strong> {userData.role}
            </p>
            <p>
              <strong>Verified:</strong> {userData.verified ? "Yes" : "No"}
            </p>
            <p>
              <strong>Active:</strong> {userData.active ? "Yes" : "No"}
            </p>
            <p>
              <strong>Password Changed:</strong>{" "}
              {userData.has_changed_password ? "Yes" : "No"}
            </p>
            <p>
              <strong>National ID:</strong> {userData.national_ID}
            </p>
            {userData.passport && (
              <p>
                <strong>Passport:</strong> {userData.passport}
              </p>
            )}
            {userData.secondary_email && (
              <p>
                <strong>Secondary Email:</strong> {userData.secondary_email}
              </p>
            )}
            {userData.alternative_phone && (
              <p>
                <strong>Alt Phone:</strong> {userData.alternative_phone}
              </p>
            )}
            {userData.whatsapp_number && (
              <p>
                <strong>WhatsApp:</strong> {userData.whatsapp_number}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
