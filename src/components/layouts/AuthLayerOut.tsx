import React from "react";
import { Toaster, toast } from "react-hot-toast"; // Import toast at the top

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showFooterLinks?: boolean;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showFooterLinks = true,
}: AuthLayoutProps) {
  return (
    <>
      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#374151",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
            padding: "16px 20px",
            minWidth: "300px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
        }}
      />

      <div className="min-h-screen flex">
        {/* Left Side - Description */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#00B5A5] relative overflow-hidden">
          <div className="flex flex-col justify-center items-start p-12 text-white relative z-10">
            {/* Logo */}
            <div className="mb-8">
              <div className="w-40 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg">
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
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">
                    Access your membership dashboard
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">
                    Connect with forensic professionals
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white/90">
                    Access exclusive resources and events
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-32 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 right-32 w-16 h-16 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-36 h-12 bg-[#00B5A5] rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">AFSA</span>
                </div>
              </div>
            </div>

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
            </div>

            {/* Form Content */}
            {children}

            {/* Footer Links */}
            {showFooterLinks && (
              <div className="mt-8 flex justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                <a
                  href="#"
                  className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
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

// Utility components for consistent styling
export const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(({ label, error, className, ...props }, ref) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <input
      ref={ref}
      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors border-gray-300 dark:border-gray-600 ${
        error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
      } ${className || ""}`}
      {...props}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
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
      "w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl";

    const variantClasses = {
      primary:
        "bg-[#00B5A5] hover:bg-[#008A7C] disabled:bg-[#7DD3C0] text-white focus:ring-[#00B5A5]",
      secondary:
        "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 focus:ring-gray-500",
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
    className={`text-[#00B5A5] hover:text-[#008A7C] font-medium transition-colors ${
      className || ""
    }`}
  >
    {children}
  </a>
);

// Toast utility functions with proper imports
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
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#EF4444",
    },
  });
};
