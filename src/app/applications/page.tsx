import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import ApplicationClient from "@/components/applications/ApplicationClient";

export default function ApplicationsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "Board", "President"]}>
      <Suspense>
        <ApplicationClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}