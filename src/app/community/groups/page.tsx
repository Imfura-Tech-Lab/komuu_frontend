import { Suspense } from "react";
import MemberGroupsPage from "@/components/groups/MemberGroupsPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function MemberCommunityGroupsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <MemberGroupsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}