import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import AnnouncementsClient from "@/components/announcements/announcements-client";

export default function AnnouncementsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Administrator", "President", "Board", "Member"]}>
      <AnnouncementsClient />
    </SecureDashboardLayout>
  );
}
