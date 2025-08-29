import { Suspense } from "react";
import ApplicationClient from "@/components/applications/ApplicationClient";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function MyApplicationPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <ApplicationClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}