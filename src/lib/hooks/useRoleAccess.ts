import { useState, useEffect } from "react";
import {
  UserData,
  UserRole,
  Permission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from "@/types";

export function useRoleAccess() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserData = localStorage.getItem("user_data");
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
    }
    setIsLoading(false);
  }, []);

  const hasPermission = (permission: Permission | string): boolean => {
    if (!userData) return false;
    const permissions = ROLE_PERMISSIONS[userData.role];
    return (permissions as readonly string[]).includes(permission);
  };

  const hasRole = (role: UserRole | string): boolean => {
    if (!userData) return false;
    return userData.role === role;
  };

  const hasMinimumRole = (minimumRole: UserRole | string): boolean => {
    if (!userData) return false;
    const userLevel = ROLE_HIERARCHY[userData.role];
    const requiredLevel = ROLE_HIERARCHY[minimumRole as UserRole];
    return userLevel >= requiredLevel;
  };

  const canAccess = (
    requiredRoles: (UserRole | string)[],
    requiredPermissions: (Permission | string)[] = []
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
