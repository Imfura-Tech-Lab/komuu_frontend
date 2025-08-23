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

interface SecureDashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[]; // Use UserRole type
  requiredPermissions?: Permission[]; // Use Permission type
}

const AUTO_LOGOUT_TIMEOUT = 30 * 60 * 1000;

export default function SecureDashboardLayout({
  children,
  requiredRoles = [],
  requiredPermissions = [],
}: SecureDashboardLayoutProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [authInitialized, setAuthInitialized] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  // @ts-ignore
  const activityTimeoutRef = useRef<NodeJS.Timeout>();

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
    // Use UserRole type
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

  // Activity tracking for auto-logout
  const updateLastActivity = useCallback(() => {
    if (authInitialized) {
      setLastActivity(Date.now());
    }
  }, [authInitialized]);

  useEffect(() => {
    if (!authInitialized) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(event, updateLastActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateLastActivity, true);
      });
    };
  }, [updateLastActivity, authInitialized]);

  // Enhanced permission and role checking
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      // Use Permission type
      if (!userData) return false;
      // @ts-ignore
      return ROLE_PERMISSIONS[userData.role]?.includes(permission) ?? false;
    },
    [userData]
  );

  const hasRoleLevel = useCallback(
    (requiredRole: UserRole): boolean => {
      // Use UserRole type
      if (!userData) return false;
      return ROLE_HIERARCHY[userData.role] >= ROLE_HIERARCHY[requiredRole];
    },
    [userData]
  );

  // Enhanced token validation - more tolerant of network errors
  const validateTokenWithBackend = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${apiUrl}profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Only logout for explicit auth failures, not network errors
        if (response.status === 401 || response.status === 403) {
          console.warn("Token validation failed - authentication error");
          throw new Error("Authentication failed");
        }

        // For other errors (500, network issues, etc.), warn but don't logout
        console.warn(
          `Profile fetch failed with status ${response.status}, but continuing with stored data`
        );
        return false; // Indicate validation failed but don't throw
      }

      const data = await response.json();
      if (data.data || data.user) {
        const updatedUserData: UserData = data.data || data.user; // Ensure type
        localStorage.setItem("user_data", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        return true;
      }

      return false;
    } catch (error) {
      // Only throw for authentication errors, not network errors
      if (error instanceof Error && error.message === "Authentication failed") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("refresh_token");
        throw error;
      }

      // For network errors, just log and continue
      console.warn("Token validation failed due to network error:", error);
      return false;
    }
  }, []);

  // Token refresh functionality
  const refreshAuthToken = useCallback(async (refreshToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${apiUrl}refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        return data.access_token;
      }

      throw new Error("Invalid refresh response");
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  }, []);

  // Cleaner logout function
  const handleLogout = useCallback(
    async (showMessage = true) => {
      if (isLoggingOut) return;
      setIsLoggingOut(true);
      setProfileDropdownOpen(false);

      try {
        const token = localStorage.getItem("auth_token");
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

        // Try to call logout endpoint, but don't block on failure
        if (token && apiUrl) {
          try {
            await fetch(`${apiUrl}logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });
          } catch (error) {
            console.warn("Logout API call failed:", error);
            // Continue with logout even if API call fails
          }
        }
      } finally {
        // Clear all auth data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("refresh_token");

        // Clear activity timeout
        if (activityTimeoutRef.current) {
          clearTimeout(activityTimeoutRef.current);
        }

        // Reset state
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

  // Auto-logout timer - only start after auth is initialized
  useEffect(() => {
    if (!userData || !authInitialized) return;

    const checkActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= AUTO_LOGOUT_TIMEOUT) {
        console.log("Auto-logout triggered due to inactivity");
        showErrorToast(
          "Session expired due to inactivity. Please login again."
        );
        handleLogout(false);
        return;
      }

      // Schedule next check
      const timeUntilLogout = AUTO_LOGOUT_TIMEOUT - timeSinceLastActivity;
      activityTimeoutRef.current = setTimeout(
        checkActivity,
        Math.min(timeUntilLogout, 60000)
      );
    };

    // Start the activity check
    checkActivity();

    return () => {
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [userData, lastActivity, authInitialized, handleLogout]);

  // Enhanced authentication check - run only once on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const storedUserData = localStorage.getItem("user_data");

        if (!token || !storedUserData) {
          console.log("No token or user data found");
          showErrorToast("Session expired. Please login again.");
          router.push("/login");
          return;
        }

        let parsedUserData: UserData;
        try {
          parsedUserData = JSON.parse(storedUserData);
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          showErrorToast("Invalid session data. Please login again.");
          router.push("/login");
          return;
        }

        // Validate user data structure
        if (
          !parsedUserData.id ||
          !parsedUserData.role ||
          !parsedUserData.email
        ) {
          console.error("Invalid user data structure:", parsedUserData);
          showErrorToast("Invalid session data. Please login again.");
          router.push("/login");
          return;
        }

        // Check role-based access
        if (requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.some(
            (role) =>
              parsedUserData.role === role ||
              ROLE_HIERARCHY[parsedUserData.role] >= ROLE_HIERARCHY[role]
          );
          if (!hasRequiredRole) {
            showErrorToast("Access denied. Insufficient permissions.");
            router.push("/dashboard");
            return;
          }
        }

        // Check permission-based access
        if (requiredPermissions.length > 0) {
          const userPermissions = ROLE_PERMISSIONS[parsedUserData.role] || [];
          const hasRequiredPermissions = requiredPermissions.every(
            // @ts-ignore
            (permission) => userPermissions.includes(permission)
          );
          if (!hasRequiredPermissions) {
            showErrorToast("Access denied. Missing required permissions.");
            router.push("/dashboard");
            return;
          }
        }

        // Enhanced force password change check
        if (
          !parsedUserData.has_changed_password &&
          pathname !== "/change-password"
        ) {
          showErrorToast("Please change your default password to continue.");
          router.push("/change-password");
          return;
        }

        // Active account check
        if (!parsedUserData.active) {
          showErrorToast(
            "Your account has been deactivated. Please contact support."
          );
          handleLogout(false);
          return;
        }

        // Pending application redirect
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

        // Set user data from localStorage first
        setUserData(parsedUserData);
        setAuthInitialized(true);

        // Try to validate token with backend, but don't block on failure
        try {
          await validateTokenWithBackend(token);
        } catch (error) {
          console.error("Token validation failed:", error);
          showErrorToast("Session validation failed. Please login again.");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        showErrorToast("Session validation failed. Please login again.");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on mount
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
        <StatusAlerts userData={userData} 
        // @ts-ignore
        router={router}
         />

        {/* Main content area */}
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Enhanced debug panel */}
      {process.env.NODE_ENV === "development" && userData && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm opacity-90 hover:opacity-100 transition-opacity z-50">
          <h4 className="font-bold mb-2">Debug: User Data</h4>
          <div className="space-y-1">
            <p>
              <strong>ID:</strong> {userData.id}
            </p>
            <p>
              <strong>Role:</strong> {userData.role}
            </p>
            <p>
              <strong>Hierarchy Level:</strong> {ROLE_HIERARCHY[userData.role]}
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
            <p>
              <strong>Permissions:</strong>
            </p>
            <ul className="ml-4 text-xs max-h-32 overflow-y-auto list-disc list-inside">
              {ROLE_PERMISSIONS[userData.role]?.map((perm) => (
                <li key={perm}>{perm}</li>
              ))}
            </ul>
            <p>
              <strong>Current Path:</strong> {pathname}
            </p>
            <p>
              <strong>Last Activity:</strong>{" "}
              {new Date(lastActivity).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
