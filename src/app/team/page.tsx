import { Suspense } from "react";
import TeamManagementPage from "@/components/admin/TeamManagementPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function AdminTeamManagementPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "Board", "President"]}>
      <Suspense>
        <TeamManagementPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}