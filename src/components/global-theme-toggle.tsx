"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

interface ThemeToggleProps {
  placement?: "sidebar" | "header" | "footer";
  variant?: "compact" | "full";
}

const ThemeToggle = ({
  placement = "sidebar",
  variant = "compact",
}: ThemeToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`${
          variant === "compact" ? "w-8 h-8" : "w-full h-10"
        } bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}
      />
    );
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun, description: "Light mode" },
    { value: "dark", label: "Dark", icon: Moon, description: "Dark mode" },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "Follow system preference",
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  if (variant === "full") {
    return (
      <div ref={dropdownRef} className="relative w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          <div className="flex items-center gap-3">
            <CurrentIcon
              size={16}
              className="text-gray-500 dark:text-gray-400"
            />
            <span>Theme</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.value;

              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isActive
                      ? "bg-[#00B5A5]/10 dark:bg-[#00D4C7]/10 text-[#00B5A5] dark:text-[#00D4C7]"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isActive
                        ? "text-[#00B5A5] dark:text-[#00D4C7]"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  />
                  <span className="flex-1 text-left">{themeOption.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-[#00B5A5] dark:bg-[#00D4C7] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
        aria-label="Toggle theme"
        title="Theme"
      >
        <CurrentIcon
          size={16}
          className="text-gray-600 dark:text-gray-300 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors"
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden ${
            placement === "sidebar" ? "left-full ml-2" : "right-0"
          }`}
        >
          <div className="py-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.value;

              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    isActive
                      ? "bg-[#00B5A5]/10 dark:bg-[#00D4C7]/10 text-[#00B5A5] dark:text-[#00D4C7]"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isActive
                        ? "text-[#00B5A5] dark:text-[#00D4C7]"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  />
                  <div className="flex-1 text-left">
                    <div
                      className={`font-medium ${
                        isActive ? "text-[#00B5A5] dark:text-[#00D4C7]" : ""
                      }`}
                    >
                      {themeOption.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {themeOption.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-[#00B5A5] dark:bg-[#00D4C7] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {theme === "system" && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-750">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div
                  className={`w-2 h-2 rounded-full ${
                    resolvedTheme === "dark" ? "bg-blue-500" : "bg-yellow-500"
                  }`}
                />
                <span>
                  System: {resolvedTheme === "dark" ? "Dark" : "Light"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
