import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import ExportsClient from "@/components/exports/exports-client";

export default function ExportsPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "President", "Board"]}
    >
      <ExportsClient />
    </SecureDashboardLayout>
  );
}
