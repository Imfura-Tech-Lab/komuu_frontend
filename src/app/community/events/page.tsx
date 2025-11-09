import { Suspense } from "react";
import MemberEventsPage from "@/components/events/MemberEventsPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function MemberCommunityEventsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <MemberEventsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}