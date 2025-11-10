import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import MemberResourcesPage from "@/components/admin/MemberResourcesPage";

export default function MemberCommunityResourcesPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <MemberResourcesPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}