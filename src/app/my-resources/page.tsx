import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import ResourcesMemberClient from "@/components/resources/ResourcesMemberClient";

export default function ResourcesPage() {
  return (
     <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense fallback={<div>Loading resources...</div>}>
        <ResourcesMemberClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}