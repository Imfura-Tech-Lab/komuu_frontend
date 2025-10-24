import { Suspense } from "react";
import CommunityConversationsPage from "@/components/community/CommunityConversationsPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function ConversationsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <CommunityConversationsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}