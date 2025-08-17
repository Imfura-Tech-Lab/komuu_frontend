"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  role: "Administrator" | "President" | "Board" | "Member" | "Pending";
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth: string;
  national_ID: string;
  passport: string | null;
  public_profile: string;
  application_status?: "pending" | "approved" | "rejected";
}

interface SecureDashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: Array<
    "Administrator" | "President" | "Board" | "Member" | "Pending"
  >;
  requiredPermissions?: string[];
}

// Enhanced Role hierarchy and permissions
const ROLE_HIERARCHY = {
  Administrator: 4,
  President: 3,
  Board: 2,
  Member: 1,
  Pending: 0,
} as const;

const ROLE_PERMISSIONS = {
  Administrator: [
    // User & Application Management
    "manage_users",
    "manage_board_members",
    "approve_applications",
    "reject_applications",
    "manage_roles",
    
    // System & Communication
    "system_settings",
    "send_notifications",
    "manage_notifications",
    
    // Full Access to All Views
    "view_all_applications",
    "view_all_payments",
    "view_all_members",
    "view_all_certificates",
    "view_all_analytics",
    
    // Basic Access
    "view_profile",
    "update_profile",
    "member_dashboard",
  ],
  President: [
    // Exclusive Certificate Signing
    "sign_certificates",
    "certificate_authority",
    
    // Full View Access (Same as Board + Administrator)
    "view_all_applications", 
    "view_all_payments",
    "view_all_members", 
    "view_all_certificates",
    "view_all_analytics",
    
    // Strategic & Executive
    "strategic_planning",
    "executive_dashboard",
    "presidential_reports",
    
    // Basic Access
    "view_profile",
    "update_profile", 
    "member_dashboard",
  ],
  Board: [
    // View-Only Access to Management Features
    "view_all_applications",
    "view_all_payments", 
    "view_all_members",
    "view_all_certificates",
    "view_all_analytics",
    
    // Board-Specific Features
    "board_meetings",
    "board_dashboard",
    "policy_decisions",
    "board_discussions",
    
    // Basic Access
    "view_profile",
    "update_profile",
    "member_dashboard",
  ],
  Member: [
    // Personal Data & Resources
    "view_profile",
    "update_profile", 
    "member_dashboard",
    "member_resources",
    "member_events",
    "view_own_payments",
    "view_own_certificates",
    "member_community",
  ],
  Pending: [
    // Very Limited Access
    "view_profile",
    "update_profile",
    "application_status",
    "application_help",
  ],
} as const;

// Auto-logout timeout (30 minutes of inactivity)
const AUTO_LOGOUT_TIMEOUT = 30 * 60 * 1000;

// Enhanced Navigation items factory function
const createNavigationItems = (role: keyof typeof ROLE_PERMISSIONS) => {
  const baseItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      permission: "member_dashboard",
      icon: "dashboard",
      description: "Overview and summary",
    },
    {
      name: "My Profile", 
      href: "/profile",
      permission: "view_profile",
      icon: "profile",
      description: "Personal information",
    },
  ];

  const roleSpecificItems = {
    Administrator: [
      {
        name: "Application Management",
        href: "/admin/applications",
        permission: "approve_applications",
        icon: "applications",
        description: "Review and approve membership applications",
        badge: "pending_count", // Could show pending count
      },
      {
        name: "Member Management", 
        href: "/admin/members",
        permission: "manage_users",
        icon: "members",
        description: "Manage all members and their details",
      },
      {
        name: "Board Management",
        href: "/admin/board",
        permission: "manage_board_members", 
        icon: "board_manage",
        description: "Add, remove and update board member details",
      },
      {
        name: "Payment Overview",
        href: "/admin/payments",
        permission: "view_all_payments",
        icon: "payments",
        description: "View all member payments and transactions",
      },
      {
        name: "Certificates",
        href: "/admin/certificates", 
        permission: "view_all_certificates",
        icon: "certificates",
        description: "View all member certificates",
      },
      {
        name: "Analytics & Reports",
        href: "/admin/analytics",
        permission: "view_all_analytics", 
        icon: "analytics",
        description: "Comprehensive system analytics",
      },
      {
        name: "Notifications",
        href: "/admin/notifications",
        permission: "send_notifications",
        icon: "notifications", 
        description: "Send notifications to members",
      },
      {
        name: "System Settings",
        href: "/admin/settings",
        permission: "system_settings",
        icon: "settings",
        description: "Configure system settings",
      },
    ],
    President: [
      {
        name: "Executive Dashboard",
        href: "/president/dashboard", 
        permission: "executive_dashboard",
        icon: "executive",
        description: "Presidential overview and insights",
      },
      {
        name: "Certificate Authority",
        href: "/president/certificates",
        permission: "sign_certificates",
        icon: "certificate_sign",
        description: "Sign and authorize member certificates",
        badge: "unsigned_count",
      },
      {
        name: "Strategic Planning",
        href: "/president/strategy",
        permission: "strategic_planning", 
        icon: "strategy",
        description: "Long-term planning and strategy",
      },
      {
        name: "Applications Review",
        href: "/president/applications",
        permission: "view_all_applications",
        icon: "applications",
        description: "Review membership applications",
      },
      {
        name: "Members Overview", 
        href: "/president/members",
        permission: "view_all_members",
        icon: "members",
        description: "All members overview",
      },
      {
        name: "Financial Overview",
        href: "/president/payments", 
        permission: "view_all_payments",
        icon: "payments",
        description: "Financial transactions overview", 
      },
      {
        name: "Analytics",
        href: "/president/analytics",
        permission: "view_all_analytics",
        icon: "analytics", 
        description: "Executive analytics and insights",
      },
    ],
    Board: [
      {
        name: "Board Dashboard", 
        href: "/board/dashboard",
        permission: "board_dashboard",
        icon: "board",
        description: "Board member overview",
      },
      {
        name: "Applications List",
        href: "/board/applications",
        permission: "view_all_applications", 
        icon: "applications",
        description: "View membership applications",
      },
      {
        name: "Member Directory",
        href: "/board/members",
        permission: "view_all_members",
        icon: "members", 
        description: "View all members",
      },
      {
        name: "Payment Records",
        href: "/board/payments", 
        permission: "view_all_payments",
        icon: "payments",
        description: "View payment records",
      },
      {
        name: "Certificates Registry",
        href: "/board/certificates",
        permission: "view_all_certificates",
        icon: "certificates",
        description: "View issued certificates", 
      },
      {
        name: "Board Meetings",
        href: "/board/meetings", 
        permission: "board_meetings",
        icon: "meetings",
        description: "Board meetings and schedules",
      },
      {
        name: "Analytics",
        href: "/board/analytics",
        permission: "view_all_analytics",
        icon: "analytics",
        description: "Membership analytics and reports",
      },
      {
        name: "Policy Management", 
        href: "/board/policies",
        permission: "policy_decisions",
        icon: "policies",
        description: "Organizational policies",
      },
    ],
    Member: [
      {
        name: "My Payments",
        href: "/member/payments",
        permission: "view_own_payments", 
        icon: "payments",
        description: "View your payment history",
      },
      {
        name: "My Certificates", 
        href: "/member/certificates",
        permission: "view_own_certificates",
        icon: "certificates",
        description: "View your certificates",
      },
      {
        name: "Resources",
        href: "/member/resources",
        permission: "member_resources",
        icon: "resources", 
        description: "Member resources and downloads",
      },
      {
        name: "Events",
        href: "/member/events",
        permission: "member_events",
        icon: "events",
        description: "Upcoming events and activities", 
      },
      {
        name: "Community",
        href: "/member/community", 
        permission: "member_community",
        icon: "community",
        description: "Connect with other members",
      },
    ],
    Pending: [
      {
        name: "Application Status",
        href: "/pending/status",
        permission: "application_status",
        icon: "status",
        description: "Check your application status",
      },
      {
        name: "Help & Support",
        href: "/pending/help", 
        permission: "application_help",
        icon: "help",
        description: "Get help with your application",
      },
    ],
  };

  return [...baseItems, ...(roleSpecificItems[role] || [])];
};

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

    const colors = {
      Administrator: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      President: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", 
      Board: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      Member: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      Pending: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };

    return colors[userData.role];
  }, [userData?.role]);

  // Enhanced role description
  const getRoleDescription = useCallback((role: string) => {
    const descriptions = {
      Administrator: "Full system access & management",
      President: "Executive access with certificate authority", 
      Board: "View access to all organizational data",
      Member: "Active member with full benefits",
      Pending: "Application under review",
    };
    return descriptions[role as keyof typeof descriptions] || "";
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
    (permission: string): boolean => {
      if (!userData) return false;
      // @ts-ignore
      return ROLE_PERMISSIONS[userData.role]?.includes(permission) ?? false;
    },
    [userData]
  );

  const hasRoleLevel = useCallback(
    (requiredRole: string): boolean => {
      if (!userData) return false;
      return (
        ROLE_HIERARCHY[userData.role] >=
        ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY]
      );
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
        const updatedUserData = data.data || data.user;
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

        let parsedUserData;
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
            // @ts-ignore
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
          // @ts-ignore
          const userPermissions = ROLE_PERMISSIONS[parsedUserData.role] || [];
          const hasRequiredPermissions = requiredPermissions.every(
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <SidebarContent
              navigationItems={navigationItems}
              pathname={pathname}
              hasPermission={hasPermission}
              userRole={userData.role}
            />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <SidebarContent
            navigationItems={navigationItems}
            pathname={pathname}
            hasPermission={hasPermission}
            userRole={userData.role}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Enhanced top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00B5A5] md:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    AFSA Portal
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    African Financial Services Association
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Enhanced role and verification badges */}
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden md:block">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleColor}`}>
                      {userData.role}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getRoleDescription(userData.role)}
                    </p>
                  </div>
                  
                  {userData.role !== "Pending" && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userData.verified
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      }`}
                    >
                      {userData.verified ? "✓ Verified" : "⚠ Unverified"}
                    </span>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] hover:bg-gray-50 dark:hover:bg-gray-700 p-2 transition-colors duration-200"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    aria-expanded={profileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#00B5A5] flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {getUserInitials(userData.name)}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {userData.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {userData.email}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        profileDropdownOpen ? "rotate-180" : ""
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

                  {/* Dropdown menu */}
                  {profileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 focus:outline-none z-50">
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {userData.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {userData.email}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {userData.role} • {getRoleDescription(userData.role)}
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <svg
                            className="mr-3 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Your Profile
                        </button>
                        {userData.role !== "Pending" && (
                          <button
                            onClick={handleSettingsClick}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            <svg
                              className="mr-3 h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Settings
                          </button>
                        )}
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleLogout(true)}
                          disabled={isLoggingOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoggingOut ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-3"></div>
                              Logging out...
                            </>
                          ) : (
                            <>
                              <svg
                                className="mr-3 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                              </svg>
                              Sign out
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Enhanced Account Status Alerts */}
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
                  Your membership application is currently being reviewed by our administrators. 
                  You'll receive an email notification once your application has been processed. 
                  Access to most features is limited until approval is complete.
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
                  Your account is not fully verified. Some features may be limited until verification is complete. 
                  Please check your email for verification instructions or contact support.
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
                  As President, you have exclusive authority to sign member certificates. 
                  Please review and sign pending certificates to complete the membership process.
                </p>
                <div className="mt-2">
                  <button 
                    onClick={() => router.push("/president/certificates")}
                    className="text-sm text-purple-800 dark:text-purple-200 underline hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    Review pending certificates →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Enhanced debug panel */}
      {process.env.NODE_ENV === "development" && userData && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm opacity-90 hover:opacity-100 transition-opacity">
          <h4 className="font-bold mb-2">Debug: User Data</h4>
          <div className="space-y-1">
            <p><strong>ID:</strong> {userData.id}</p>
            <p><strong>Role:</strong> {userData.role}</p>
            <p><strong>Hierarchy Level:</strong> {ROLE_HIERARCHY[userData.role]}</p>
            <p><strong>Verified:</strong> {userData.verified ? "Yes" : "No"}</p>
            <p><strong>Active:</strong> {userData.active ? "Yes" : "No"}</p>
            <p><strong>Auth Initialized:</strong> {authInitialized ? "Yes" : "No"}</p>
            <p><strong>Application Status:</strong> {userData.application_status || "N/A"}</p>
            <p><strong>Permissions:</strong></p>
            <ul className="ml-4 text-xs max-h-32 overflow-y-auto">
              {ROLE_PERMISSIONS[userData.role]?.map((perm) => (
                <li key={perm}>• {perm}</li>
              ))}
            </ul>
            <p><strong>Current Path:</strong> {pathname}</p>
            <p><strong>Last Activity:</strong> {new Date(lastActivity).toLocaleTimeString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Sidebar content component with better organization
interface SidebarContentProps {
  navigationItems: Array<{
    name: string;
    href: string;
    permission: string;
    icon?: string;
    description?: string;
    badge?: string;
  }>;
  pathname: string;
  hasPermission: (permission: string) => boolean;
  userRole: string;
}

function SidebarContent({
  navigationItems,
  pathname,
  hasPermission,
  userRole,
}: SidebarContentProps) {
  
  // Enhanced icon mapping with new icons
  const getIcon = (iconName?: string) => {
    const icons = {
      dashboard: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-5-3-5 3V5z" />
        </svg>
      ),
      profile: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      applications: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      members: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      board_manage: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      payments: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      certificates: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      certificate_sign: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      analytics: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      notifications: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.08 13.601a5.02 5.02 0 015.73-7.882l.47-1.717a6.518 6.518 0 00-7.376 9.599l1.176-.471z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
        </svg>
      ),
      settings: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      executive: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      strategy: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      board: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      meetings: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      policies: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      resources: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      events: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      community: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      status: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      help: (
        <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };

    return icons[iconName as keyof typeof icons] || null;
  };

  // Group navigation items by category for better organization
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: typeof navigationItems } = {
      main: [],
      management: [],
      data: [],
      tools: [],
    };

    navigationItems.forEach(item => {
      if (item.name === "Dashboard" || item.name === "My Profile") {
        groups.main.push(item);
      } else if (
        item.name.includes("Management") || 
        item.name.includes("Applications") ||
        item.name === "Board Management" ||
        item.name === "Certificate Authority"
      ) {
        groups.management.push(item);
      } else if (
        item.name.includes("Overview") ||
        item.name.includes("Analytics") ||
        item.name.includes("Payment") ||
        item.name.includes("Certificate") ||
        item.name.includes("Member") ||
        item.name === "Applications List" ||
        item.name === "Member Directory" ||
        item.name === "Payment Records" ||
        item.name === "Certificates Registry"
      ) {
        groups.data.push(item);
      } else {
        groups.tools.push(item);
      }
    });

    return groups;
  }, [navigationItems]);

  return (
    <>
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-[#00B5A5] dark:bg-[#008F82]">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#00B5A5] font-bold text-sm">A</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AFSA Portal</h2>
            <p className="text-xs text-teal-100">Member System</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-6" role="navigation" aria-label="Main navigation">
          
          {/* Main Section */}
          {groupedItems.main.length > 0 && (
            <div>
              <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Main
              </h3>
              <div className="space-y-1">
                {groupedItems.main
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => (
                    <NavigationItem
                      key={item.name}
                      item={item}
                      pathname={pathname}
                      getIcon={getIcon}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Management Section */}
          {groupedItems.management.length > 0 && (
            <div>
              <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {userRole === "Administrator" ? "Administration" : "Management"}
              </h3>
              <div className="space-y-1">
                {groupedItems.management
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => (
                    <NavigationItem
                      key={item.name}
                      item={item}
                      pathname={pathname}
                      getIcon={getIcon}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Data & Reports Section */}
          {groupedItems.data.length > 0 && (
            <div>
              <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Data & Reports
              </h3>
              <div className="space-y-1">
                {groupedItems.data
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => (
                    <NavigationItem
                      key={item.name}
                      item={item}
                      pathname={pathname}
                      getIcon={getIcon}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Tools & Resources Section */}
          {groupedItems.tools.length > 0 && (
            <div>
              <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {userRole === "Pending" ? "Support" : userRole === "Member" ? "Resources" : "Tools"}
              </h3>
              <div className="space-y-1">
                {groupedItems.tools
                  .filter((item) => hasPermission(item.permission))
                  .map((item) => (
                    <NavigationItem
                      key={item.name}
                      item={item}
                      pathname={pathname}
                      getIcon={getIcon}
                    />
                  ))}
              </div>
            </div>
          )}

        </nav>

        {/* Footer with role information */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium">Role: {userRole}</p>
            <p className="mt-1">
              {userRole === "Administrator" && "Full system control"}
              {userRole === "President" && "Certificate authority"}  
              {userRole === "Board" && "View-only access"}
              {userRole === "Member" && "Member benefits"}
              {userRole === "Pending" && "Application pending"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Individual navigation item component for better reusability
interface NavigationItemProps {
  item: {
    name: string;
    href: string;
    permission: string;
    icon?: string;
    description?: string;
    badge?: string;
  };
  pathname: string;
  // @ts-ignore
  getIcon: (iconName?: string) => JSX.Element | null;
}

function NavigationItem({ item, pathname, getIcon }: NavigationItemProps) {
  const isActive = pathname === item.href;
  
  return (
    <a
      key={item.name}
      href={item.href}
      className={`group relative flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:ring-opacity-50 ${
        isActive
          ? "bg-[#00B5A5] text-white dark:bg-[#008F82] shadow-sm"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
      }`}
      aria-current={isActive ? "page" : undefined}
      title={item.description}
    >
      <div className="flex items-center flex-1">
        {getIcon(item.icon)}
        <span className="truncate">{item.name}</span>
      </div>
      
      {/* Badge for notifications/counts */}
      {item.badge && (
        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          isActive 
            ? "bg-white bg-opacity-20 text-white" 
            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        }`}>
          {item.badge === "pending_count" && "3"} {/* This would come from props/state */}
          {item.badge === "unsigned_count" && "2"} {/* This would come from props/state */}
        </span>
      )}
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute inset-y-0 left-0 w-1 bg-white rounded-r-md"></div>
      )}
    </a>
  );
}