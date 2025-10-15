import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import CommunitiesMemberClient from "@/components/communities/CommunitiesMemberClient";

export default function CommunitiesPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense fallback={<div>Loading communities...</div>}>
        <CommunitiesMemberClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}