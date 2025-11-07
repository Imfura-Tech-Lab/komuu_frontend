import { Suspense } from "react";
import EventsPage from "@/components/admin/EventsPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function AdminEventsPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <Suspense>
        <EventsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}
