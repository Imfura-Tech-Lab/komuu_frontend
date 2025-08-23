import { Suspense } from "react";
import ApplicationClient from "./ApplicationClient";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function MyApplicationPage() {
  return (
    <SecureDashboardLayout>
    <Suspense
      fallback={
          
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading applications...
              </p>
            </div>
          </div>
        </div>
      }
      >
      <ApplicationClient />
    </Suspense>
    </SecureDashboardLayout>
  );
}
