"use client";
import { useState } from "react";
import { useAuth } from "@/services/authService";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });

      // Show success toast with custom styling
      toast.success("Login successful! Welcome back.", {
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

      // Redirect to dashboard after successful login
      router.push("/dashboard");
    } catch (error) {
      // Show error toast - handle the double-wrapped JSON error
      const errorMessage = (() => {
        if (error && typeof error === "object" && "message" in error) {
          // Check if the message is a JSON string that needs parsing
          if (typeof error.message === "string") {
            try {
              const parsed = JSON.parse(error.message);
              return parsed.message || error.message;
            } catch {
              // If parsing fails, return the original message
              return error.message;
            }
          }
          return error.message;
        }
        if (error && typeof error === "object" && "errors" in error) {
          // Handle validation errors from your LoginError interface
          const errors = error.errors as {
            email?: string[];
            password?: string[];
          };
          if (errors?.email?.[0]) return errors.email[0];
          if (errors?.password?.[0]) return errors.password[0];
        }
        return "Login failed. Please try again.";
      })();

      toast.error(errorMessage, {
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
    }
  };

  return (
    <>
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

        {/* Right Side - Login Form */}
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
                Welcome back
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to your AFSA membership account
              </p>
            </div>

            {/* Login Form */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors border-gray-300 dark:border-gray-600"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors border-gray-300 dark:border-gray-600"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#00B5A5] bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00B5A5] dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    disabled={loading}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm text-[#00B5A5] hover:text-[#008A7C] transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#00B5A5] hover:bg-[#008A7C] disabled:bg-[#7DD3C0] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-[#00B5A5] focus:ring-offset-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <a
                    href="/register"
                    className="text-[#00B5A5] hover:text-[#008A7C] font-medium transition-colors"
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </div>

            {/* Footer Links */}
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
          </div>
        </div>
      </div>
    </>
  );
}
