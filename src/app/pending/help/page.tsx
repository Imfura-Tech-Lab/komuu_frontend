import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import PendingHelpClient from "@/components/pending/pending-help-client";

export default function PendingHelpPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Pending"]}>
      <PendingHelpClient />
    </SecureDashboardLayout>
  );
}
