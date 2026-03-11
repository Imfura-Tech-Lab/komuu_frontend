import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import CommunityClient from "@/components/community/community-client";

export default function CommunityPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member", "Board", "President", "Administrator"]}>
      <CommunityClient />
    </SecureDashboardLayout>
  );
}
