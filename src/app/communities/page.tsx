import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import CommunitiesClient from "@/components/communities/CommunitiesClient";

export default function CommunitiesPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "Board", "President"]}>
      <Suspense fallback={<div>Loading communities...</div>}>
        <CommunitiesClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}