import { Suspense } from "react";
import TeamsPage from "@/components/admin/TeamsPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function AdminTeamsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "Board", "President"]}>
      <Suspense>
        <TeamsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}