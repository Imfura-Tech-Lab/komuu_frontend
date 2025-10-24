import { Suspense } from "react";
import GroupsPage from "@/components/admin/GroupsPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function AdminGroupsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "Board", "President"]}>
      <Suspense>
        <GroupsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}