import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import BillingClient from "@/components/billing/billing-client";

export default function BillingPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "President"]}
    >
      <BillingClient />
    </SecureDashboardLayout>
  );
}
