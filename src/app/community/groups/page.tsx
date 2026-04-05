import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import ChatApp from "@/components/community/ChatApp";

export default function CommunityPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member", "Board", "President", "Administrator"]}>
      <ChatApp />
    </SecureDashboardLayout>
  );
}
