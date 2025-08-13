"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

const DraggableThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 }); // Start at top-right
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Handle drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // Don't drag when dropdown is open

    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Constrain to viewport
      const maxX = window.innerWidth - 60; // Account for button width
      const maxY = window.innerHeight - 60; // Account for button height

      setPosition({
        x: Math.max(16, Math.min(newX, maxX)),
        y: Math.max(16, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!mounted) {
    return (
      <div
        className="fixed z-50"
        style={{ top: position.y, right: position.x }}
      >
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
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{
        top: position.y,
        left: position.x,
        cursor: isDragging ? "grabbing" : isOpen ? "default" : "grab",
      }}
    >
      <div ref={dropdownRef} className="relative">
        {/* Toggle Button */}
        <button
          onMouseDown={handleMouseDown}
          onClick={() => !isDragging && setIsOpen(!isOpen)}
          className={`group flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${
            !isDragging && !isOpen ? "hover:scale-105" : ""
          } ${isDragging ? "scale-105 shadow-2xl" : ""}`}
          aria-label="Toggle theme"
        >
          <div className="relative">
            <CurrentIcon
              size={20}
              className="text-gray-600 dark:text-gray-300 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors"
            />
            {resolvedTheme === "dark" && theme === "system" && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Small dropdown indicator */}
          <ChevronDown
            size={10}
            className={`absolute bottom-1 right-1 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden animate-in slide-in-from-top-2 duration-200"
            style={{
              // Adjust position if dropdown would go off-screen
              left: position.x + 192 > window.innerWidth ? "auto" : "50%",
              right: position.x + 192 > window.innerWidth ? "0" : "auto",
              transform:
                position.x + 192 > window.innerWidth
                  ? "none"
                  : "translateX(-50%)",
            }}
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

        {/* Drag hint when hovering */}
        {!isOpen && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-2 py-1 rounded whitespace-nowrap">
              Drag to move
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableThemeToggle;
