import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import EventsMemberClient from "@/components/events/EventsMemberClient";

export default function EventsPage() {
  return (
     <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense fallback={<div>Loading events...</div>}>
        <EventsMemberClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}
