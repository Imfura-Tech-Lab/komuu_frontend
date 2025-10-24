import React, { JSX } from "react";
import { NavigationItem } from "./NavigationItem";
import { NavigationItemType, UserRole } from "@/types";
import { NavigationSection as NavigationSectionType } from "@/types/navigation";

interface NavigationSectionProps {
  section: NavigationSectionType;
  items: NavigationItemType[];
  userRole: UserRole;
  pathname: string;
  hasPermission: (permission: NavigationItemType["permission"]) => boolean;
  getIcon: (iconName?: string) => JSX.Element | null;
}

export function NavigationSection({
  section,
  items,
  userRole,
  pathname,
  hasPermission,
  getIcon,
}: NavigationSectionProps) {
  const visibleItems = items.filter((item) => hasPermission(item.permission));

  if (visibleItems.length === 0) return null;

  const sectionLabel = section.labelByRole?.[userRole] || section.label;

  return (
    <div>
      <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {sectionLabel}
      </h3>
      <div className="space-y-1">
        {visibleItems.map((item) => (
          <NavigationItem
            key={item.name}
            item={item}
            pathname={pathname}
            getIcon={getIcon}
            hasPermission={hasPermission}
          />
        ))}
      </div>
    </div>
  );
}