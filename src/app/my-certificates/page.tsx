import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import MyCertificatesClient from "@/components/certificates/my-certificate-client";

export default function CertificatesPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <MyCertificatesClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}
