import { Suspense } from "react";
import MemberResourcesPage from "@/components/resources/MemberResourcesPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function MemberCommunityResourcesPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <MemberResourcesPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}