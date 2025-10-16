import React from "react";
import { UserRole, NavigationItemType } from "@/types";
import { NAVIGATION_SECTIONS } from "@/lib/config/navigationSections";
import { useNavigationGrouping } from "@/lib/hooks/useNavigationGrouping";
import { NavigationSection } from "./NavigationSection";
import { useNavigationIcons } from "@/lib/hooks/useNavigationIcons";
import ThemeToggle from "../global-theme-toggle";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigationItems: NavigationItemType[];
  pathname: string;
  hasPermission: (permission: NavigationItemType["permission"]) => boolean;
  userRole: UserRole;
}

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  navigationItems,
  pathname,
  hasPermission,
  userRole,
}: SidebarProps) {
  return (
    <>
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
              userRole={userRole}
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
            userRole={userRole}
          />
        </div>
      </div>
    </>
  );
}

function SidebarContent({
  navigationItems,
  pathname,
  hasPermission,
  userRole,
}: {
  navigationItems: NavigationItemType[];
  pathname: string;
  hasPermission: (permission: NavigationItemType["permission"]) => boolean;
  userRole: UserRole;
}) {
  const groupedNavigation = useNavigationGrouping(navigationItems, userRole);
  const getIcon = useNavigationIcons();

  // Sort sections by order
  const sortedSections = NAVIGATION_SECTIONS.filter(
    (section) => groupedNavigation[section.id]
  ).sort((a, b) => a.order - b.order);

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
        <nav
          className="flex-1 px-2 py-4 space-y-6"
          role="navigation"
          aria-label="Main navigation"
        >
          {sortedSections.map((section) => (
            <NavigationSection
              key={section.id}
              section={section}
              items={groupedNavigation[section.id].items}
              userRole={userRole}
              pathname={pathname}
              hasPermission={hasPermission}
              getIcon={getIcon}
            />
          ))}
        </nav>

        {/* Footer with role information */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Theme Toggle Section */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <ThemeToggle placement="sidebar" variant="full" />
          </div>

          {/* Role Information */}
          <div className="px-4 py-3">
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
      </div>
    </>
  );
}
