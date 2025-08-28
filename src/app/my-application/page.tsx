import { Suspense } from "react";
import ApplicationClient from "@/components/applications/ApplicationClient";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function MyApplicationPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense fallback={<div>Loading your application...</div>}>
        <ApplicationClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}