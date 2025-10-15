import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import ResourcesClient from "@/components/resources/ResourcesClient";

export default function ResourcesPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "Board", "President"]}>
      <Suspense fallback={<div>Loading resources...</div>}>
        <ResourcesClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}