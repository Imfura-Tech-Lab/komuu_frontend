import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import SettingsDetailsClient from "@/components/settings/SettingsDetailsClient";

export default function SettingsPage() {
  return (
    <SecureDashboardLayout requiredRoles={["President","Administrator", "Board"]}>
      <SettingsDetailsClient />
    </SecureDashboardLayout>
  );
}
