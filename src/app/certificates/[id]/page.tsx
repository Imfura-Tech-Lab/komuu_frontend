import SingleCertificatePage from "@/components/certificates/single-certificate-page";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default async function CertificateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <SingleCertificatePage certificateId={id} />
    </SecureDashboardLayout>
  );
}
