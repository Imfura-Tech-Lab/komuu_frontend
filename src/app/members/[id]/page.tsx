import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import SingleMemberPage from "@/components/members/single-member-page";

export default async function MemberDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <SingleMemberPage memberId={id} />
    </SecureDashboardLayout>
  );
}
