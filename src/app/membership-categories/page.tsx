import { Suspense } from "react";
import MembershipCategoriesClient from "@/components/membership-categories/membership-categories-client";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function MembershipCategoriesPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <Suspense>
        <MembershipCategoriesClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}