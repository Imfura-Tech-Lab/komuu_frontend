import { useState, useEffect } from "react";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: "Administrator" | "President" | "Board" | "Member";
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
}

const ROLE_HIERARCHY = {
  Administrator: 4,
  President: 3,
  Board: 2,
  Member: 1,
};

const ROLE_PERMISSIONS = {
  Administrator: [
    "manage_users",
    "manage_roles",
    "view_all_data",
    "system_settings",
    "financial_reports",
    "member_management",
    "board_access",
    "president_access",
  ],
  President: [
    "view_all_data",
    "financial_reports",
    "member_management",
    "board_access",
    "president_access",
    "strategic_planning",
  ],
  Board: [
    "financial_reports",
    "member_management",
    "board_access",
    "board_meetings",
    "policy_decisions",
  ],
  Member: [
    "view_profile",
    "update_profile",
    "member_resources",
    "member_events",
  ],
};

export function useRoleAccess() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserData = localStorage.getItem("user_data");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
    setIsLoading(false);
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!userData) return false;
    return ROLE_PERMISSIONS[userData.role]?.includes(permission) ?? false;
  };

  const hasRole = (role: string): boolean => {
    if (!userData) return false;
    return userData.role === role;
  };

  const hasMinimumRole = (minimumRole: string): boolean => {
    if (!userData) return false;
    return (
      ROLE_HIERARCHY[userData.role] >=
      ROLE_HIERARCHY[minimumRole as keyof typeof ROLE_HIERARCHY]
    );
  };

  const canAccess = (
    requiredRoles: string[],
    requiredPermissions: string[] = []
  ): boolean => {
    if (!userData) return false;

    const hasRequiredRole =
      requiredRoles.length === 0 ||
      requiredRoles.some((role) => hasRole(role) || hasMinimumRole(role));

    const hasRequiredPermissions =
      requiredPermissions.length === 0 ||
      requiredPermissions.every((permission) => hasPermission(permission));

    return hasRequiredRole && hasRequiredPermissions;
  };

  return {
    userData,
    isLoading,
    hasPermission,
    hasRole,
    hasMinimumRole,
    canAccess,
    userRole: userData?.role,
    userPermissions: userData ? ROLE_PERMISSIONS[userData.role] : [],
  };
}
