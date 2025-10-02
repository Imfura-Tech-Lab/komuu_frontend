"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showFooterLinks?: boolean;
}

// Compact Theme Toggle for Auth Layout
const AuthThemeToggle = () => {
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
      <div className="w-10 h-10 bg-white/20 dark:bg-white/30 rounded-lg animate-pulse" />
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

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105 border border-white/20"
        aria-label="Toggle theme"
        title="Change theme"
      >
        <CurrentIcon size={18} className="text-white" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
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

export default function AuthLayout({
  children,
  title,
  subtitle,
  showFooterLinks = true,
}: AuthLayoutProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  return (
    <>
      {/* Toast Container with Theme Support */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--toast-bg)",
            color: "var(--toast-color)",
            border: "1px solid var(--toast-border)",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
            padding: "16px 20px",
            minWidth: "300px",
            boxShadow:
              resolvedTheme === "dark"
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      />

      <div className="min-h-screen flex transition-colors duration-300">
        {/* Left Side - Description */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] relative overflow-hidden">
          {/* Navigation buttons - Positioned in top-right of left panel */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105 border border-white/20"
              title="Home"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </button>

            <button
              onClick={() => router.push("/register")}
              className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 hover:scale-105 border border-white/20"
              title="Create Account"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </button>

            <AuthThemeToggle />
          </div>

          <div className="flex flex-col justify-center items-start p-12 text-white relative z-10">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-40 h-14 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <span className="text-white font-bold text-2xl">AFSA</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                Welcome to the African Forensic Sciences Academy
              </h1>

              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Advancing forensic science education and research across Africa
                through innovative programs and collaborative partnerships.
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 group">
                  <div className="w-2 h-2 bg-white rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-white/90 group-hover:text-white transition-colors duration-200">
                    Access your membership dashboard
                  </span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-2 h-2 bg-white rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-white/90 group-hover:text-white transition-colors duration-200">
                    Connect with forensic professionals
                  </span>
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-2 h-2 bg-white rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                  <span className="text-white/90 group-hover:text-white transition-colors duration-200">
                    Access exclusive resources and events
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 opacity-10 dark:opacity-15">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
            <div
              className="absolute bottom-32 right-20 w-24 h-24 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 right-32 w-16 h-16 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-1/3 left-1/3 w-8 h-8 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "3s" }}
            ></div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent dark:from-black/40"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900 transition-colors duration-300 relative">
          {/* Navigation buttons for mobile/when left panel is hidden */}
          <div className="lg:hidden absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Home"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </button>

            <button
              onClick={() => router.push("/register")}
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Create Account"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </button>

            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <AuthThemeToggle />
            </div>
          </div>

          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8 mt-12">
              <div className="flex justify-center mb-4">
                <div className="w-36 h-12 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <span className="text-white font-bold text-2xl">AFSA</span>
                </div>
              </div>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
                {title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                {subtitle}
              </p>
            </div>

            {/* Form Content */}
            <div className="transition-all duration-300">{children}</div>

            {/* Footer Links */}
            {showFooterLinks && (
              <div className="mt-8 flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                <a
                  href="#"
                  className="hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors duration-200 hover:underline"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors duration-200 hover:underline"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors duration-200 hover:underline"
                >
                  Support
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Keep all existing utility components unchanged
export const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(({ label, error, className, ...props }, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
      {label}
    </label>
    <input
      ref={ref}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] focus:border-[#00B5A5] dark:focus:border-[#00D4C7] bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 ${
        error
          ? "border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500 dark:focus:ring-red-400"
          : ""
      } ${className || ""}`}
      {...props}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-300">
        {error}
      </p>
    )}
  </div>
));

AuthInput.displayName = "AuthInput";

export const AuthButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading?: boolean;
    loadingText?: string;
    variant?: "primary" | "secondary";
  }
>(
  (
    {
      children,
      loading,
      loadingText,
      variant = "primary",
      className,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "w-full font-medium py-3 px-4 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]";

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] hover:from-[#008A7C] hover:to-[#006D5D] dark:hover:from-[#00B5A5] dark:hover:to-[#008A7C] disabled:from-[#7DD3C0] disabled:to-[#7DD3C0] dark:disabled:from-[#4B5563] dark:disabled:to-[#4B5563] text-white focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7]",
      secondary:
        "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-gray-500 dark:focus:ring-gray-400",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${
          className || ""
        }`}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {loadingText || "Loading..."}
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

AuthButton.displayName = "AuthButton";

export const AuthLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <a
    href={href}
    className={`text-[#00B5A5] dark:text-[#00D4C7] hover:text-[#008A7C] dark:hover:text-[#00B5A5] font-medium transition-all duration-200 hover:underline ${
      className || ""
    }`}
  >
    {children}
  </a>
);

// Keep all existing toast utility functions unchanged
export const showSuccessToast = (message: string) => {
  return toast.success(message, {
    duration: 4000,
    style: {
      background: "#10B981",
      color: "#fff",
      padding: "16px 20px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "500",
      minWidth: "300px",
      boxShadow:
        "0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.2)",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#10B981",
    },
  });
};

export const showErrorToast = (message: string) => {
  return toast.error(message, {
    duration: 5000,
    style: {
      background: "#EF4444",
      color: "#fff",
      padding: "16px 20px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "500",
      minWidth: "300px",
      boxShadow:
        "0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.2)",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#EF4444",
    },
  });
};

export const showInfoToast = (message: string) => {
  return toast(message, {
    duration: 4000,
    style: {
      background: "var(--toast-bg)",
      color: "var(--toast-color)",
      border: "1px solid var(--toast-border)",
      padding: "16px 20px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "500",
      minWidth: "300px",
    },
    icon: "ℹ️",
  });
};

export const showWarningToast = (message: string) => {
  return toast(message, {
    duration: 4000,
    style: {
      background: "#F59E0B",
      color: "#fff",
      padding: "16px 20px",
      borderRadius: "8px",
      fontSize: "16px",
      fontWeight: "500",
      minWidth: "300px",
      boxShadow:
        "0 10px 15px -3px rgba(245, 158, 11, 0.3), 0 4px 6px -2px rgba(245, 158, 11, 0.2)",
    },
    icon: "⚠️",
  });
};
