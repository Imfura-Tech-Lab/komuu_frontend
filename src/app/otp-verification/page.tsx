"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout, {
  AuthButton,
  AuthLink,
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { useAuth } from "@/lib/hooks/Use-auth";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState<{ otp?: string }>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get the OTP code from URL params if available
  const urlCode = searchParams.get("code");

  // Show the OTP code in a toast when component mounts
  useEffect(() => {
    if (urlCode) {
      showSuccessToast(`Your OTP code is: ${urlCode}`);
    }
  }, [urlCode]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors({});
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
    const newOtp = [...otp];

    for (let i = 0; i < Math.min(pasteData.length, 6); i++) {
      newOtp[i] = pasteData[i];
    }

    setOtp(newOtp);

    // Focus the next empty field or last field
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Form validation
  const validateForm = () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code" });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isVerifying) return;

    setErrors({});

    if (!validateForm()) {
      showErrorToast("Please enter a valid 6-digit OTP code.");
      return;
    }

    const otpString = otp.join("");
    setIsVerifying(true);

    try {
      // Call the two-factor-check API with code as query parameter
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const response = await fetch(
        `${apiUrl}two-factor-check?code=${otpString}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && (data.success || data.status === "success")) {
        showSuccessToast("OTP verified successfully!");

        // Store user data globally if returned from API
        if (data.token && data.data) {
          // Store token
          localStorage.setItem("auth_token", data.token);

          // Store user data
          localStorage.setItem("user_data", JSON.stringify(data.data));

          // Check if password needs to be changed
          const hasChangedPassword = data.data.has_changed_password;

          if (!hasChangedPassword) {
            showSuccessToast(
              "Please change your default password to continue."
            );
            setTimeout(() => {
              router.push("/change-password");
            }, 1000);
          } else {
            showSuccessToast("Welcome back! Redirecting to dashboard...");
            setTimeout(() => {
              router.push("/dashboard");
            }, 1000);
          }
        } else {
          // If no user data returned, just redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } else {
        showErrorToast(data.message || "Invalid OTP code. Please try again.");
        setErrors({ otp: data.message || "Invalid OTP code" });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      showErrorToast("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);

    try {
      // Call the resend two-factor code API (GET request)
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${apiUrl}resend-two-factor-code`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && (data.success || data.status === "success")) {
        showSuccessToast("New OTP sent to your email/phone");
        setTimeLeft(300);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();

        // If the response contains a new code, show it in toast
        if (data.code) {
          setTimeout(() => {
            showSuccessToast(`Your new OTP code is: ${data.code}`);
          }, 1500);
        }
      } else {
        showErrorToast(
          data.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showErrorToast("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your account"
      subtitle="We've sent a 6-digit verification code to your registered email/phone"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter verification code
          </label>
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                // @ts-ignore
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] focus:border-transparent transition-all duration-200 ${
                  errors.otp
                    ? "border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                } text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed`}
                disabled={isVerifying}
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

        {/* Timer and Resend */}
        <div className="text-center space-y-2">
          {!canResend ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Code expires in{" "}
              <span className="font-medium text-[#00B5A5] dark:text-[#00D4C7]">
                {formatTime(timeLeft)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?
            </p>
          )}

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || isResending}
            className={`text-sm font-medium transition-all duration-200 ${
              canResend && !isResending
                ? "text-[#00B5A5] dark:text-[#00D4C7] hover:underline cursor-pointer"
                : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
          >
            {isResending ? "Sending..." : "Resend verification code"}
          </button>
        </div>

        {/* Submit Button */}
        <AuthButton
          type="submit"
          loading={isVerifying}
          loadingText="Verifying..."
          disabled={isVerifying || otp.join("").length !== 6}
        >
          Verify & Continue
        </AuthButton>

        {/* Back to Login */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Want to use a different account?{" "}
            <AuthLink href="/login" className="font-semibold">
              Back to login
            </AuthLink>
          </p>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Having trouble with verification?
          </h3>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>• Check your email inbox and spam folder</p>
            <p>• Make sure you have network connectivity</p>
            <p>• The code is valid for 5 minutes only</p>
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
