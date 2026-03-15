import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import AnalyticsClient from "@/components/analytics/analytics-client";

export default function AnalyticsPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator"]}
      requiredPermissions={["view_all_analytics"]}
    >
      <AnalyticsClient />
    </SecureDashboardLayout>
  );
}
