import React, { JSX, useState } from "react";
import Link from "next/link";
import { NavigationItemType } from "@/types";

interface NavigationItemProps {
  item: NavigationItemType;
  pathname: string;
  getIcon: (iconName?: string) => JSX.Element | null;
  hasPermission: (permission: NavigationItemType["permission"]) => boolean;
}

export function NavigationItem({
  item,
  pathname,
  getIcon,
  hasPermission,
}: NavigationItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  
  // Auto-expand if current path matches any child
  const [isExpanded, setIsExpanded] = useState(() => {
    if (hasChildren) {
      return item.children!.some((child) => pathname.startsWith(child.href));
    }
    return false;
  });

  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const isChildActive = item.children?.some((child) => pathname.startsWith(child.href));

  // Filter visible children based on permissions
  const visibleChildren = item.children?.filter((child) =>
    hasPermission(child.permission)
  );

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren && visibleChildren && visibleChildren.length > 0) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      {/* Parent Item */}
      <Link
        href={item.href}
        onClick={handleToggle}
        className={`
          group flex items-center px-2 py-2 text-sm font-medium rounded-md
          transition-colors duration-150 ease-in-out
          ${
            isActive || isChildActive
              ? "bg-[#00B5A5] text-white dark:bg-[#008F82]"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }
        `}
      >
        {/* Icon */}
        <span
          className={`
            flex-shrink-0
            ${
              isActive || isChildActive
                ? "text-white"
                : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
            }
          `}
        >
          {getIcon(item.icon)}
        </span>

        {/* Label */}
        <span className="flex-1">{item.name}</span>

        {/* Badge */}
        {item.badge && (
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            {item.badge}
          </span>
        )}

        {/* Chevron for expandable items */}
        {hasChildren && visibleChildren && visibleChildren.length > 0 && (
          <svg
            className={`
              ml-auto h-5 w-5 transition-transform duration-200
              ${isExpanded ? "transform rotate-90" : ""}
              ${
                isActive || isChildActive
                  ? "text-white"
                  : "text-gray-400 dark:text-gray-500"
              }
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        )}
      </Link>

      {/* Children Items (Collapsible) */}
      {hasChildren && visibleChildren && visibleChildren.length > 0 && isExpanded && (
        <div className="mt-1 space-y-1 pl-11">
          {visibleChildren
            .sort((a, b) => a._order - b._order)
            .map((child) => {
              const isChildItemActive =
                pathname === child.href || pathname.startsWith(child.href + "/");

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm rounded-md
                    transition-colors duration-150 ease-in-out
                    ${
                      isChildItemActive
                        ? "bg-[#00B5A5]/10 text-[#00B5A5] dark:bg-[#008F82]/20 dark:text-[#00B5A5] font-medium"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }
                  `}
                >
                  {/* Child Icon */}
                  <span
                    className={`
                      flex-shrink-0
                      ${
                        isChildItemActive
                          ? "text-[#00B5A5]"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      }
                    `}
                  >
                    {getIcon(child.icon)}
                  </span>

                  {/* Child Label */}
                  <span className="flex-1">{child.name}</span>

                  {/* Child Badge */}
                  {child.badge && (
                    <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      {child.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}