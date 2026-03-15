import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import NotificationsClient from "@/components/notifications/notifications-client";

export default function NotificationsPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator"]}
      requiredPermissions={["send_notifications"]}
    >
      <NotificationsClient />
    </SecureDashboardLayout>
  );
}
