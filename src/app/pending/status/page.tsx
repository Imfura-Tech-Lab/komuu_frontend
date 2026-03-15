import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import PendingStatusClient from "@/components/pending/pending-status-client";

export default function PendingStatusPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Pending"]}>
      <PendingStatusClient />
    </SecureDashboardLayout>
  );
}
