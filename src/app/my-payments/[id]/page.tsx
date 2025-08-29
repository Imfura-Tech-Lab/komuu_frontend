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
      requiredRoles={["Member"]}
    >
      <SinglePaymentClient paymentId={id} />
    </SecureDashboardLayout>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return {
    title: `Payment Details - ${id}`,
    description: `View payment details for transaction ${id}`,
  };
}