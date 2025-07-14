"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout, {
  AuthInput,
  AuthButton,
  AuthLink,
} from "@/components/layouts/AuthLayerOut";
import { useAuth } from "@/lib/hooks/UseAuthReturn";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) return;

    const result = await login({ email, password });
    console.log("Login result:", result);

    if (result.success) {
      // Show success toast
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

      // Add a small delay before redirect to allow toast to show
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      // Show error toast
      toast.error(result.message || "Login failed. Please try again.", {
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
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your AFSA membership account"
    >
      {/* Login Form */}
      <div className="space-y-6">
        <AuthInput
          label="Email address"
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={loading}
        />

        <AuthInput
          label="Password"
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          disabled={loading}
        />

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
          <AuthLink href="/forgot-password" className="text-sm">
            Forgot password?
          </AuthLink>
        </div>

        <AuthButton
          type="submit"
          onClick={handleSubmit}
          loading={loading}
          loadingText="Signing in..."
        >
          Sign in
        </AuthButton>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account? <AuthLink href="/register">Sign up</AuthLink>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
