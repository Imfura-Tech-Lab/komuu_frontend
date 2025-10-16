import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import EventsClient from "@/components/events/EventsClient";

export default function EventsPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <Suspense fallback={<div>Loading events...</div>}>
        <EventsClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}
