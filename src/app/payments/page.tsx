import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import PaymentsClient from "@/components/payments/payments-client";

export default function PaymentsPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <PaymentsClient />
    </SecureDashboardLayout>
  );
}
