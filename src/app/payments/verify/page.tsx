"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useDpoPayment } from "@/lib/hooks/useDpoPayment";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyPayment, loading } = useDpoPayment();
  const [result, setResult] = useState<{ status: string; type: string; amount: number; currency: string } | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    const token = searchParams.get("token");

    if (!ref && !token) {
      router.push("/dashboard");
      return;
    }

    const verify = async () => {
      const data = await verifyPayment({ ref: ref || undefined, token: token || undefined });
      if (data) {
        setResult(data);
      }
      setVerified(true);
    };

    verify();
  }, [searchParams, router, verifyPayment]);

  const isPaid = result?.status === "paid";

  if (loading || !verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00B5A5] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Verifying Payment...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we confirm your transaction</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        {isPaid ? (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your payment of {result?.currency} {result?.amount} has been confirmed.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Payment {result?.status === "pending" ? "Pending" : "Failed"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {result?.status === "pending"
                ? "Your payment is being processed. You will be notified once confirmed."
                : "Your payment could not be completed. Please try again."}
            </p>
          </>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
          {result?.type === "membership" && (
            <button
              onClick={() => router.push("/my-payments")}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              View Payments
            </button>
          )}
          {result?.type === "subscription" && (
            <button
              onClick={() => router.push("/billing")}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              View Billing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 text-[#00B5A5] animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
