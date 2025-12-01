"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

import {
  UserData,
  UserRole,
  Permission,
  NavigationItemType,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  createNavigationItems,
} from "@/types";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { StatusAlerts } from "./StatusAlerts";
import { useImprovedAutoLogout } from "@/lib/hooks/useImprovedAutoLogout";
import { SessionWarningModal } from "./SessionWarningModal";

interface SecureDashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
}

export default function SecureDashboardLayout({
  children,
  requiredRoles = [],
  requiredPermissions = [],
}: SecureDashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [isProd, setIsProd] = useState(false);
  
  const [userData, setUserData] = useState<UserData | null>(() => {
    // Initialize from localStorage immediately
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("user_data");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(() => {
    // If we have a token, assume initialized until proven otherwise
    return typeof window !== 'undefined' && !!localStorage.getItem("auth_token");
  });
  const [debugExpanded, setDebugExpanded] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set environment flags on client side only
  useEffect(() => {
    setMounted(true);
    setIsDev(process.env.NODE_ENV === 'development');
    setIsProd(process.env.NODE_ENV === 'production');
  }, []);

  // Memoized navigation items
  const navigationItems = useMemo(() => {
    return userData ? createNavigationItems(userData.role) : [];
  }, [userData?.role]);

  // Enhanced role color with new styling
  const roleColor = useMemo(() => {
    if (!userData) return "";

    const colors: Record<UserRole, string> = {
      Administrator:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      President:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      Board: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      Member:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      Pending:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };

    return colors[userData.role];
  }, [userData?.role]);

  // Enhanced role description
  const getRoleDescription = useCallback((role: UserRole) => {
    const descriptions: Record<UserRole, string> = {
      Administrator: "Full system access & management",
      President: "Executive access with certificate authority",
      Board: "View access to all organizational data",
      Member: "Active member with full benefits",
      Pending: "Application under review",
    };
    return descriptions[role] || "";
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Enhanced permission and role checking - FIXED TYPE
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!userData) return false;
      //@ts-ignore
      return ROLE_PERMISSIONS[userData.role]?.includes(permission) ?? false;
    },
    [userData]
  );

  const hasRoleLevel = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!userData) return false;
      return ROLE_HIERARCHY[userData.role] >= ROLE_HIERARCHY[requiredRole];
    },
    [userData]
  );

  // Enhanced token validation
  const validateTokenWithBackend = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${apiUrl}profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Token validation failed - authentication error");
          throw new Error("Authentication failed");
        }

        console.warn(
          `Profile fetch failed with status ${response.status}, but continuing with stored data`
        );
        return false;
      }

      const data = await response.json();
      if (data.data || data.user) {
        const updatedUserData: UserData = data.data || data.user;
        localStorage.setItem("user_data", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        return true;
      }

      return false;
    } catch (error) {
      if (error instanceof Error && error.message === "Authentication failed") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("refresh_token");
        throw error;
      }

      console.warn("Token validation failed due to network error:", error);
      return false;
    }
  }, []);

  // Improved logout function with better state management
  const handleLogout = useCallback(
    async (showMessage = true) => {
      if (isLoggingOut) return;

      setIsLoggingOut(true);
      setProfileDropdownOpen(false);

      try {
        const token = localStorage.getItem("auth_token");
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

        // Attempt to call logout API with timeout
        if (token && apiUrl) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            await fetch(`${apiUrl}logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
          } catch (error) {
            console.warn("Logout API call failed:", error);
            // Continue with client-side cleanup even if API fails
          }
        }
      } finally {
        // Always clean up regardless of API success/failure
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("refresh_token");

        setUserData(null);
        setAuthInitialized(false);

        if (showMessage) {
          showSuccessToast("Logged out successfully!");
        }

        router.push("/login");
        setIsLoggingOut(false);
      }
    },
    [isLoggingOut, router]
  );

  // Use the improved auto-logout hook
  const {
    lastActivity,
    showWarningModal,
    warningTimeRemaining,
    extendSession,
    forceLogout,
  } = useImprovedAutoLogout({
    onLogout: handleLogout,
    isAuthenticated: authInitialized && !!userData,
    timeoutDuration: 30 * 60 * 1000, // 30 minutes
    warningDuration: 2 * 60 * 1000, // 2 minutes warning
  });

  // Authentication check - optimistic with background validation
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("user_data");
      
      if (!token || !storedUser) {
        router.push("/login");
        return;
      }

      try {
        const parsedUserData: UserData = JSON.parse(storedUser);
        
        // Set user data immediately for seamless transition
        setUserData(parsedUserData);
        setAuthInitialized(true);

        // Permission/role checks
        if (requiredRoles.length > 0 && !requiredRoles.includes(parsedUserData.role)) {
          showErrorToast("Access denied. Insufficient role privileges.");
          router.push("/dashboard");
          return;
        }

        if (requiredPermissions.length > 0) {
          const hasRequiredPermissions = requiredPermissions.every((permission) =>
            //@ts-ignore
            ROLE_PERMISSIONS[parsedUserData.role]?.includes(permission)
          );
          if (!hasRequiredPermissions) {
            showErrorToast("Access denied. Missing required permissions.");
            router.push("/dashboard");
            return;
          }
        }

        // Force password change
        if (!parsedUserData.has_changed_password && pathname !== "/change-password") {
          showErrorToast("Please change your default password to continue.");
          router.push("/change-password");
          return;
        }

        // Active account check
        if (!parsedUserData.active) {
          showErrorToast("Your account has been deactivated. Please contact support.");
          handleLogout(false);
          return;
        }

        // Pending redirect
        if (
          parsedUserData.role === "Pending" &&
          !pathname.startsWith("/pending") &&
          pathname !== "/profile" &&
          pathname !== "/change-password"
        ) {
          showErrorToast("Your application is still pending review.");
          router.push("/pending/status");
          return;
        }

        // Background token validation - don't block UI
        validateTokenWithBackend(token).catch((error) => {
          console.error("Background token validation failed:", error);
          
          // Only force logout for authentication failures (revoked tokens, disabled accounts)
          // Let useImprovedAutoLogout handle timeout-based expiration with modal
          if (error instanceof Error && error.message === "Authentication failed") {
            // This is a hard auth failure (401/403) - not a timeout
            showErrorToast("Your session is no longer valid. Please login again.");
            handleLogout(false);
          }
          // Network errors and timeouts don't force logout - the auto-logout hook handles those
        });
      } catch (error) {
        console.error("Authentication check failed:", error);
        showErrorToast("Session validation failed. Please login again.");
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  const handleProfileClick = useCallback(() => {
    router.push("/profile");
    setProfileDropdownOpen(false);
  }, [router]);

  const handleSettingsClick = useCallback(() => {
    router.push("/settings");
    setProfileDropdownOpen(false);
  }, [router]);

  // Get user initials for avatar
  const getUserInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, []);

  // Show loading until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5]"></div>
      </div>
    );
  }

  if (!authInitialized || !userData) {
    return null; // Quick bailout without loading screen
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Environment Banner - Only show in development */}
      {isDev && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-2 px-4 text-sm font-medium border-b">
          DEVELOPMENT MODE - API: {process.env.NEXT_PUBLIC_BACKEND_API_URL}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigationItems={navigationItems}
        pathname={pathname}
        hasPermission={hasPermission}
        userRole={userData.role}
      />

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header */}
        <Header
          userData={userData}
          roleColor={roleColor}
          getRoleDescription={getRoleDescription}
          getUserInitials={getUserInitials}
          handleLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          handleProfileClick={handleProfileClick}
          handleSettingsClick={handleSettingsClick}
          setSidebarOpen={setSidebarOpen}
          // @ts-ignore
          dropdownRef={dropdownRef}
        />

        {/* Account Status Alerts */}
        <StatusAlerts 
        userData={userData} 
         // @ts-ignore
        router={router} />

        {/* Main content area */}
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Session Warning Modal */}
      <SessionWarningModal
        isOpen={showWarningModal}
        timeRemaining={warningTimeRemaining}
        onExtendSession={extendSession}
        onLogoutNow={forceLogout}
      />

      {/* Debug panel - Only show in development */}
      {isDev && userData && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white rounded-lg overflow-hidden opacity-90 hover:opacity-100 transition-opacity z-40 shadow-lg">
          <button
            onClick={() => setDebugExpanded(!debugExpanded)}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 flex items-center justify-between text-sm font-medium"
          >
            <span>Debug Info</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                debugExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {debugExpanded && (
            <div className="p-4 max-w-sm max-h-96 overflow-y-auto">
              <h4 className="font-bold mb-2 text-xs uppercase tracking-wide">
                User Data
              </h4>
              <div className="space-y-1 text-xs">
                <p>
                  <strong>ID:</strong> {userData.id}
                </p>
                <p>
                  <strong>Role:</strong> {userData.role}
                </p>
                <p>
                  <strong>Hierarchy Level:</strong>{" "}
                  {ROLE_HIERARCHY[userData.role]}
                </p>
                <p>
                  <strong>Verified:</strong> {userData.verified ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Active:</strong> {userData.active ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Auth Initialized:</strong>{" "}
                  {authInitialized ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Application Status:</strong>{" "}
                  {userData.application_status || "N/A"}
                </p>
                <div>
                  <strong>Permissions:</strong>
                  <ul className="ml-4 mt-1 list-disc list-inside">
                    {ROLE_PERMISSIONS[userData.role]?.map((perm) => (
                      <li key={perm}>{perm}</li>
                    ))}
                  </ul>
                </div>
                <p>
                  <strong>Current Path:</strong> {pathname}
                </p>
                <p>
                  <strong>Last Activity:</strong>{" "}
                  {new Date(lastActivity).toLocaleTimeString()}
                </p>
                <p>
                  <strong>Environment:</strong>{" "}
                  {isDev ? "Development" : "Production"}
                </p>
                <p>
                  <strong>Session Warning:</strong>{" "}
                  {showWarningModal ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}