import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import EventDetailClient from "@/components/events/EventDetailClient";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President", "Member"]}
    >
      <EventDetailClient eventId={id} />
    </SecureDashboardLayout>
  );
}
