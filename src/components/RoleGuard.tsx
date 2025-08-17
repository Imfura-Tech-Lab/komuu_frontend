import React from "react";
import { useRoleAccess } from "../../hooks/useRoleAccess";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-gray-400">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        Access Restricted
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        You don't have permission to view this content.
      </p>
    </div>
  ),
}: RoleGuardProps) {
  const { canAccess, isLoading } = useRoleAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5]"></div>
      </div>
    );
  }

  if (!canAccess(requiredRoles, requiredPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
