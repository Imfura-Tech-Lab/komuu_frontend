import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import MembersClient from "@/components/members/members-client";

export default function MembersPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <MembersClient />
    </SecureDashboardLayout>
  );
}
