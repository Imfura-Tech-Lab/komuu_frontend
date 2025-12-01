import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import MemberEventsPage from "@/components/members/MemberEventsPage";

export default function MemberCommunityEventsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <MemberEventsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}