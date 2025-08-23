"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout, {
  AuthInput,
  AuthButton,
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { UserData } from "@/types";

export default function ChangePasswordClient() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isOptional, setIsOptional] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();
  const searchParams = useSearchParams();

  // Load user data on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem("user_data");
    const token = localStorage.getItem("auth_token");

    const fromProfile = searchParams.get("from") === "profile";
    const optional = searchParams.get("optional") === "true";
    setIsOptional(fromProfile || optional);

    if (!storedUserData || !token) {
      showErrorToast("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);

      if (parsedUserData.has_changed_password && !fromProfile && !optional) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      showErrorToast("Invalid session data. Please login again.");
      router.push("/login");
    }
  }, [router, searchParams]);

  // Form validation
  const validateForm = () => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain uppercase, lowercase, and numbers";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isChanging) return;

    setErrors({});

    if (!validateForm()) {
      showErrorToast("Please fix the errors below and try again.");
      return;
    }

    setIsChanging(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${apiUrl}change-password?current_password=${encodeURIComponent(
          currentPassword
        )}&password=${encodeURIComponent(
          newPassword
        )}&password_confirmation=${encodeURIComponent(confirmPassword)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && (data.success || data.status === "success")) {
        const successMessage = isOptional
          ? "Password updated successfully!"
          : "Password changed successfully! Redirecting to dashboard...";

        showSuccessToast(successMessage);

        if (userData) {
          const updatedUserData = { ...userData, has_changed_password: true };
          localStorage.setItem("user_data", JSON.stringify(updatedUserData));
        }

        setTimeout(() => {
          if (isOptional) {
            router.push("/dashboard/profile");
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } else {
        showErrorToast(
          data.message || "Failed to change password. Please try again."
        );

        if (data.errors) {
          const apiErrors: any = {};
          if (data.errors.current_password) {
            apiErrors.currentPassword = data.errors.current_password[0];
          }
          if (data.errors.password) {
            apiErrors.newPassword = data.errors.password[0];
          }
          if (data.errors.password_confirmation) {
            apiErrors.confirmPassword = data.errors.password_confirmation[0];
          }
          setErrors(apiErrors);
        }
      }
    } catch (error) {
      console.error("Password change error:", error);
      showErrorToast("An unexpected error occurred. Please try again.");
    } finally {
      setIsChanging(false);
    }
  };

  const handleInputChange = (
    field: "currentPassword" | "newPassword" | "confirmPassword",
    value: string
  ) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (field === "currentPassword") {
      setCurrentPassword(value);
    } else if (field === "newPassword") {
      setNewPassword(value);
    } else {
      setConfirmPassword(value);
    }
  };

  const handleCancel = () => {
    if (isOptional) {
      router.push("/dashboard/profile");
    } else {
      router.push("/dashboard");
    }
  };

  if (!userData) {
    return (
      <AuthLayout
        title="Loading..."
        subtitle="Please wait while we verify your session"
      >
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5]"></div>
        </div>
      </AuthLayout>
    );
  }

  const getTitle = () => {
    if (isOptional) {
      return "Update Your Password";
    }
    return "Change Your Password";
  };

  const getSubtitle = () => {
    if (isOptional) {
      return `Update your password for enhanced security`;
    }
    return `Welcome ${userData.name}! For security, please change your default password`;
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Current Password"
          id="current-password"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => handleInputChange("currentPassword", e.target.value)}
          placeholder={
            isOptional
              ? "Enter your current password"
              : "Enter your current (temporary) password"
          }
          disabled={isChanging}
          error={errors.currentPassword}
          autoComplete="current-password"
        />

        <AuthInput
          label="New Password"
          id="new-password"
          type="password"
          required
          value={newPassword}
          onChange={(e) => handleInputChange("newPassword", e.target.value)}
          placeholder="Enter your new password"
          disabled={isChanging}
          error={errors.newPassword}
          autoComplete="new-password"
        />

        <AuthInput
          label="Confirm New Password"
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          placeholder="Confirm your new password"
          disabled={isChanging}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div className="flex gap-3">
          <AuthButton
            type="submit"
            loading={isChanging}
            loadingText="Updating Password..."
            disabled={isChanging}
            className="flex-1"
          >
            {isOptional ? "Update Password" : "Change Password"}
          </AuthButton>

          {isOptional && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isChanging}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Password Requirements */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Password Requirements:
          </h3>
          <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
            <p>• At least 8 characters long</p>
            <p>• Contains uppercase letters (A-Z)</p>
            <p>• Contains lowercase letters (a-z)</p>
            <p>• Contains numbers (0-9)</p>
            <p>• Different from your current password</p>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Account Information:
          </h3>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>
              <span className="font-medium">Name:</span> {userData.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {userData.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {userData.role}
            </p>
            <p>
              <span className="font-medium">Phone:</span>{" "}
              {userData.phone_number}
            </p>
          </div>
        </div>

        {/* Context-specific Security Notice */}
        {!isOptional && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2">
              🔒 Security Notice
            </h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              You received a temporary password during registration. Please
              enter this temporary password in the "Current Password" field and
              set a new secure password to complete your account setup.
            </p>
          </div>
        )}

        {isOptional && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">
              🔐 Password Update
            </h3>
            <p className="text-xs text-green-700 dark:text-green-300">
              Updating your password regularly helps keep your account secure.
              Enter your current password and create a new strong password.
            </p>
          </div>
        )}
      </form>
    </AuthLayout>
  );
}
