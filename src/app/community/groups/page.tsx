import { Suspense } from "react";
import MemberGroupsPage from "@/components/groups/MemberGroupsPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function CommunityGroupsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member", "Board", "President", "Administrator"]}>
      <Suspense>
        <MemberGroupsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}
