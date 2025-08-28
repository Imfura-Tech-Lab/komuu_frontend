import SingleApplicationPage from "@/components/applications/single-application-page";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <SingleApplicationPage applicationId={id} />
    </SecureDashboardLayout>
  );
}
