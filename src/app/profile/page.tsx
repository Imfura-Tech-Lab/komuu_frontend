import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import ProfilePage from "@/components/profile-page";

export default function Profile() {
  return (
    <SecureDashboardLayout
      requiredPermissions={["view_profile", "update_profile"]}
    >
      <ProfilePage />
    </SecureDashboardLayout>
  );
}
