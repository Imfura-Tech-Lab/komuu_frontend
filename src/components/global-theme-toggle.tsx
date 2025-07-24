"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

const GlobalThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
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
      <div className="fixed top-4 right-4 z-50">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>
    );
  }

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      description: "Light mode",
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
      description: "Dark mode",
    },
    {
      value: "system",
      label: "System",
      icon: Monitor,
      description: "Follow system preference",
    },
  ];

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        aria-label="Toggle theme"
      >
        <div className="relative">
          <CurrentIcon
            size={18}
            className="text-gray-600 dark:text-gray-300 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors"
          />
          {resolvedTheme === "dark" && theme === "system" && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors hidden sm:block">
          {currentTheme.label}
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
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

          {/* Current System Theme Indicator */}
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

export default GlobalThemeToggle;
