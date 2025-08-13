"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthLayout, {
  AuthInput,
  AuthLink,
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";

type Step = "email" | "otp" | "password";

export default function PasswordResetFlow() {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Helper function to mask email for privacy
  const maskEmail = (email: string): string => {
    const [username, domain] = email.split("@");
    if (username.length <= 2) return email;

    const firstChar = username[0];
    const lastChar = username[username.length - 1];
    const maskedPart = "*".repeat(username.length - 2);

    return `${firstChar}${maskedPart}${lastChar}@${domain}`;
  };

  // Clear errors when user starts typing
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Step 1: Send reset code to email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrors({ email: "Email address is required" });
      showErrorToast("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      showErrorToast("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const response = await fetch(
        `${apiUrl}password/forgot?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        (data.success || data.status === true || data.status === "success")
      ) {
        showSuccessToast("Reset code sent to your email!");
        setCurrentStep("otp");
      } else {
        const errorMessage =
          data.message || "Failed to send reset code. Please try again.";
        showErrorToast(errorMessage);

        if (data.errors?.email) {
          setErrors({
            email: Array.isArray(data.errors.email)
              ? data.errors.email[0]
              : data.errors.email,
          });
        }
      }
    } catch (error) {
      console.error("Send code error:", error);
      showErrorToast(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code" });
      showErrorToast("Please enter the complete 6-digit code");
      return;
    }

    // Move to password step
    setErrors({});
    showSuccessToast("Code verified! Set your new password.");
    setCurrentStep("password");
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showErrorToast("Please fix the errors and try again");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const otpValue = otp.join("");

      const response = await fetch(
        `${apiUrl}password/reset?code=${otpValue}&password=${encodeURIComponent(
          newPassword
        )}&password_confirmation=${encodeURIComponent(confirmPassword)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (
        response.ok &&
        (data.success ||
          data.status === true ||
          data.status === "success" ||
          data.message === "password has been successfully reset")
      ) {
        showSuccessToast(
          "Password reset successful! Please login with your new password."
        );

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errorMessage =
          data.message || "Failed to reset password. Please try again.";
        showErrorToast(errorMessage);

        if (data.errors) {
          const apiErrors: Record<string, string> = {};

          if (data.errors.code) {
            apiErrors.otp = Array.isArray(data.errors.code)
              ? data.errors.code[0]
              : data.errors.code;
          }
          if (data.errors.password) {
            apiErrors.newPassword = Array.isArray(data.errors.password)
              ? data.errors.password[0]
              : data.errors.password;
          }
          if (data.errors.password_confirmation) {
            apiErrors.confirmPassword = Array.isArray(
              data.errors.password_confirmation
            )
              ? data.errors.password_confirmation[0]
              : data.errors.password_confirmation;
          }

          setErrors(apiErrors);
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showErrorToast(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP input handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    clearError("otp");

    // Auto-focus next input
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      otpInputRefs.current[index - 1]
    ) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newOtp = [...otp];

    for (let i = 0; i < Math.min(pasteData.length, 6); i++) {
      newOtp[i] = pasteData[i];
    }

    setOtp(newOtp);

    // Focus appropriate input
    const focusIndex = Math.min(pasteData.length, 5);
    if (otpInputRefs.current[focusIndex]) {
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Render Step 1: Email Input
  if (currentStep === "email") {
    return (
      <AuthLayout
        title="Forgot Password"
        subtitle="Enter your email address and we'll send you a reset code"
      >
        <form onSubmit={handleSendCode} className="space-y-6">
          <AuthInput
            label="Email Address"
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            placeholder="Enter your email address"
            disabled={isSubmitting}
            error={errors.email}
            autoComplete="email"
          />

          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${
              isSubmitting || !email.trim()
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-[#00B5A5] dark:bg-[#00D4C7] hover:bg-[#008F82] dark:hover:bg-[#00B5A5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] shadow-lg hover:shadow-xl"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{" "}
              <AuthLink href="/login" className="font-semibold">
                Back to Login
              </AuthLink>
            </p>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Need help?
            </h3>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>
                • Make sure you're using the email associated with your AFSA
                account
              </p>
              <p>• Check that the email address is spelled correctly</p>
              <p>• Contact support if you don't have access to your email</p>
            </div>
            <div className="mt-3 flex items-center space-x-4 text-xs">
              <AuthLink href="/support" className="text-xs">
                Contact Support
              </AuthLink>
              <AuthLink href="/register" className="text-xs">
                Create Account
              </AuthLink>
            </div>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // Render Step 2: OTP Verification
  if (currentStep === "otp") {
    return (
      <AuthLayout
        title="Enter Reset Code"
        subtitle={`We've sent a 6-digit code to ${maskEmail(email)}`}
      >
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reset Code <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className={`w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] focus:border-transparent transition-all duration-200 ${
                    errors.otp
                      ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  } text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800`}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errors.otp}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.join("").length !== 6}
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${
              isSubmitting || otp.join("").length !== 6
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-[#00B5A5] dark:bg-[#00D4C7] hover:bg-[#008F82] dark:hover:bg-[#00B5A5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] shadow-lg hover:shadow-xl"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setCurrentStep("email")}
              disabled={isSubmitting}
              className="text-gray-500 dark:text-gray-400 hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors duration-200"
            >
              ← Change Email
            </button>

            <AuthLink href="/login" className="font-semibold">
              Back to Login
            </AuthLink>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Didn't receive the code?
            </h3>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>• Check your email inbox and spam folder</p>
              <p>• Make sure the email address is correct</p>
              <p>• The code is valid for 5 minutes only</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep("email")}
              className="mt-2 text-xs text-[#00B5A5] dark:text-[#00D4C7] hover:underline"
            >
              Try different email
            </button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  // Render Step 3: New Password
  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a strong new password for your account"
    >
      <form onSubmit={handleResetPassword} className="space-y-6">
        <AuthInput
          label="New Password"
          id="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            clearError("newPassword");
          }}
          placeholder="Enter your new password"
          disabled={isSubmitting}
          error={errors.newPassword}
          autoComplete="new-password"
        />

        <AuthInput
          label="Confirm Password"
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearError("confirmPassword");
          }}
          placeholder="Confirm your new password"
          disabled={isSubmitting}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={isSubmitting || !newPassword || !confirmPassword}
          className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-200 ${
            isSubmitting || !newPassword || !confirmPassword
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-[#00B5A5] dark:bg-[#00D4C7] hover:bg-[#008F82] dark:hover:bg-[#00B5A5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] shadow-lg hover:shadow-xl"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setCurrentStep("otp")}
            disabled={isSubmitting}
            className="text-gray-500 dark:text-gray-400 hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors duration-200"
          >
            ← Back to Code
          </button>

          <AuthLink href="/login" className="font-semibold">
            Back to Login
          </AuthLink>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Password Requirements
          </h3>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>• At least 8 characters long</p>
            <p>• Use a mix of letters, numbers, and symbols</p>
            <p>• Avoid common words or personal information</p>
            <p>• Different from your previous password</p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
