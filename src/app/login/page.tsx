"use client";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/services/authService";
import { useRouter } from "next/navigation";

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

      // Redirect to dashboard or home page after successful login
      router.push("/dashboard");
    } catch (error) {
      // Error is handled by the auth service and displayed via error state
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              className="dark:invert drop-shadow-lg"
              src="/Logo.png"
              alt="AFSA Logo"
              width={140}
              height={35}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in to your AFSA membership account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-sm text-red-700 dark:text-red-300">
                  {(() => {
                    if (typeof error === "string") {
                      try {
                        const parsed = JSON.parse(error);
                        return parsed.message || error;
                      } catch {
                        return error;
                      }
                    }
                    return error?.message || "An error occurred";
                  })()}
                </div>
              </div>
            )}

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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors border-gray-300 dark:border-gray-600`}
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors border-gray-300 dark:border-gray-600`}
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
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
  );
}
