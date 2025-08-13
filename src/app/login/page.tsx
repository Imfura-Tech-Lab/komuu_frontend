"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout, {
  AuthInput,
  AuthButton,
  AuthLink,
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { useAuth } from "@/lib/hooks/Use-auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const { login, loading } = useAuth();
  const router = useRouter();

  // Form validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) return;

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      showErrorToast("Please fix the errors below and try again.");
      return;
    }

    try {
      const result = await login({ email, password });
      console.log("Login result:", result);

      if (result.success) {
        // Show success toast
        showSuccessToast(result.message ?? "Login successful! Welcome back.");

        // Add a small delay before redirect to allow toast to show
        setTimeout(() => {
          router.push("/otp-verification");
        }, 1000);
      } else {
        // Show error toast
        showErrorToast(result.message || "Login failed. Please try again.");
      }
    } catch (error) {
      showErrorToast("An unexpected error occurred. Please try again.");
    }
  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your AFSA membership account"
    >
      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Email address"
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Enter your email"
          disabled={loading}
          error={errors.email}
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center group cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#00B5A5] dark:text-[#00D4C7] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] dark:ring-offset-gray-800 transition-all duration-200 hover:border-[#00B5A5] dark:hover:border-[#00D4C7]"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200">
              Remember me
            </span>
          </label>
          <AuthLink href="/forgot-password" className="text-sm hover:underline">
            Forgot password?
          </AuthLink>
        </div>

        <AuthButton
          type="submit"
          loading={loading}
          loadingText="Signing in..."
          disabled={loading}
        >
          Sign in
        </AuthButton>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors duration-300">
              New to AFSA?
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            Don't have an account?{" "}
            <AuthLink href="/register" className="font-semibold">
              Create your account
            </AuthLink>
          </p>
        </div>

        {/* Additional Help */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Need help signing in?
          </h3>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>
              • Make sure you're using the email address associated with your
              AFSA account
            </p>
            <p>• Check that Caps Lock is turned off</p>
            <p>• Try resetting your password if you can't remember it</p>
          </div>
          <div className="mt-3 flex items-center space-x-4 text-xs">
            <AuthLink href="/support" className="text-xs">
              Contact Support
            </AuthLink>
            <AuthLink href="/help" className="text-xs">
              Help Center
            </AuthLink>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
