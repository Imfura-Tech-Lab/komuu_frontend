import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import PoliciesClient from "@/components/policies/policies-client";

export default function PoliciesPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Board", "Administrator", "President"]}
    >
      <PoliciesClient />
    </SecureDashboardLayout>
  );
}
