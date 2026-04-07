import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import CommunicationsClient from "@/components/announcements/announcements-client";

export default function CommunicationsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "President", "Board", "Member"]}>
      <CommunicationsClient />
    </SecureDashboardLayout>
  );
}
