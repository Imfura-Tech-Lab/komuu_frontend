import React, { JSX } from "react";
import { NavigationItemType } from "@/types"; 

interface NavigationItemProps {
  item: NavigationItemType; 
  pathname: string;
  getIcon: (iconName?: string) => JSX.Element | null;
}

export function NavigationItem({
  item,
  pathname,
  getIcon,
}: NavigationItemProps) {
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

      {/* Active indicator */}
      {isActive && (
        <div className="absolute inset-y-0 left-0 w-1 bg-white rounded-r-md"></div>
      )}
    </a>
  );
}
