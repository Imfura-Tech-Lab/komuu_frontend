import { Suspense } from "react";
import ResourcesPage from "@/components/admin/ResourcesPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function AdminResourcesPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "Board", "President"]}>
      <Suspense>
        <ResourcesPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}