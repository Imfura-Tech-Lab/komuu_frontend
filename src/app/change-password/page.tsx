import { Suspense } from "react";
import ChangePasswordClient from "./ChangePasswordClient";
import AuthLayout from "@/components/layouts/auth-layer-out";

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout
          title="Loading..."
          subtitle="Please wait while we load the page"
        >
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5]"></div>
          </div>
        </AuthLayout>
      }
    >
      <ChangePasswordClient />
    </Suspense>
  );
}
