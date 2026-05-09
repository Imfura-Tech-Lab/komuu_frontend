"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout, {
  AuthButton,
  AuthInput,
  AuthLink,
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /\d/.test(p), label: "One number" },
];

function AcceptInviteInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const code = params.get("code") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkValid, setLinkValid] = useState<"checking" | "valid" | "invalid">(
    "checking"
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  useEffect(() => {
    if (!email || !code) {
      setLinkValid("invalid");
      setValidationMessage(
        "This invitation link is missing information. Please request a new one."
      );
      return;
    }
    if (!apiUrl) {
      setLinkValid("invalid");
      setValidationMessage("Service is not reachable. Please try again later.");
      return;
    }

    let cancelled = false;

    const validate = async () => {
      try {
        const response = await fetch(
          `${apiUrl}code/check?code=${encodeURIComponent(code)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        if (cancelled) return;

        const ok =
          response.ok &&
          (data.message === "code is valid" ||
            data.status === true ||
            data.status === "success");

        if (ok) {
          setLinkValid("valid");
        } else {
          setLinkValid("invalid");
          setValidationMessage(
            data.message ||
              "This invitation link is invalid or has expired. Ask an administrator to send a new one."
          );
        }
      } catch {
        if (cancelled) return;
        setLinkValid("invalid");
        setValidationMessage(
          "Couldn't reach the server. Please check your connection and retry."
        );
      }
    };

    validate();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, code, email]);

  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(password) })),
    [password]
  );

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!password) next.password = "Choose a password.";
    else if (ruleResults.some((r) => !r.ok))
      next.password = "Password does not meet the requirements above.";
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (password !== confirmPassword)
      next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (linkValid !== "valid" || !apiUrl) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${apiUrl}password/reset?code=${encodeURIComponent(
          code
        )}&password=${encodeURIComponent(
          password
        )}&password_confirmation=${encodeURIComponent(confirmPassword)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();

      const ok =
        response.ok &&
        (data.message === "password has been successfully reset" ||
          data.status === true ||
          data.status === "success");

      if (ok) {
        showSuccessToast(
          "Password set! Redirecting you to sign in."
        );
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      const message =
        data.message ||
        "Could not set your password. The link may have expired.";
      showErrorToast(message);
      if (data.errors?.password) {
        setErrors({
          password: Array.isArray(data.errors.password)
            ? data.errors.password[0]
            : data.errors.password,
        });
      }
    } catch {
      showErrorToast("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (linkValid === "checking") {
    return (
      <AuthLayout title="Setting up your invitation" subtitle="Just a moment…">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#00B5A5] border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  if (linkValid === "invalid") {
    return (
      <AuthLayout
        title="Invitation unavailable"
        subtitle={validationMessage ?? "This link cannot be used."}
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If you already set up your account, sign in normally. Otherwise ask
            an administrator to resend your invitation.
          </p>
          <AuthLink href="/login">Back to sign in</AuthLink>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set your password"
      subtitle={`Welcome${email ? `, ${email}` : ""}. Choose a password to finish setting up your account.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <ul className="space-y-1 text-xs">
          {ruleResults.map((rule) => (
            <li
              key={rule.label}
              className={
                rule.ok
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }
            >
              {rule.ok ? "✓" : "•"} {rule.label}
            </li>
          ))}
        </ul>

        <AuthInput
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <AuthButton
          type="submit"
          loading={isSubmitting}
          loadingText="Saving…"
        >
          Activate my account
        </AuthButton>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already set up?{" "}
          <AuthLink href="/login">Sign in</AuthLink>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Loading invitation" subtitle="Just a moment…">
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#00B5A5] border-t-transparent rounded-full animate-spin" />
          </div>
        </AuthLayout>
      }
    >
      <AcceptInviteInner />
    </Suspense>
  );
}
