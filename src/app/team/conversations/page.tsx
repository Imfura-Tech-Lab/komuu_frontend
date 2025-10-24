import { Suspense } from "react";
import ConversationsPage from "@/components/admin/ConversationsPage";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function AdminConversationsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "Board", "President"]}>
      <Suspense>
        <ConversationsPage />
      </Suspense>
    </SecureDashboardLayout>
  );
}