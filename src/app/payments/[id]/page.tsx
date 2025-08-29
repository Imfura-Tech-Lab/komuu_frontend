import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import SinglePaymentClient from "@/components/payments/single-payment-client";

export default async function PaymentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <SinglePaymentClient paymentId={id} />
    </SecureDashboardLayout>
  );
}
