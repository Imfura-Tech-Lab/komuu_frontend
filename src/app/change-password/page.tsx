"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout, {
  AuthInput,
  AuthButton,
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";

interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth: string;
  national_ID: string;
  passport: string | null;
  public_profile: string;
}

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();

  // Load user data on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem("user_data");
    const token = localStorage.getItem("auth_token");

    if (!storedUserData || !token) {
      showErrorToast("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);

      // If password is already changed, redirect to dashboard
      if (parsedUserData.has_changed_password) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      showErrorToast("Invalid session data. Please login again.");
      router.push("/login");
    }
  }, [router]);

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

      // PATCH request to change-password endpoint with query parameters
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
        showSuccessToast(
          "Password changed successfully! Redirecting to dashboard..."
        );

        // Update user data to reflect password change
        if (userData) {
          const updatedUserData = { ...userData, has_changed_password: true };
          localStorage.setItem("user_data", JSON.stringify(updatedUserData));
        }

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        showErrorToast(
          data.message || "Failed to change password. Please try again."
        );

        // Handle specific field errors
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
    // Clear field error when user starts typing
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

  return (
    <AuthLayout
      title="Change Your Password"
      subtitle={`Welcome ${userData.name}! For security, please change your default password`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Current Password"
          id="current-password"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => handleInputChange("currentPassword", e.target.value)}
          placeholder="Enter your current (temporary) password"
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

        <AuthButton
          type="submit"
          loading={isChanging}
          loadingText="Changing Password..."
          disabled={isChanging}
        >
          Change Password
        </AuthButton>

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

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-2">
            🔒 Security Notice
          </h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            You received a temporary password during registration. Please enter
            this temporary password in the "Current Password" field and set a
            new secure password to complete your account setup.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
