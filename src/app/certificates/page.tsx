import { Suspense } from "react";
import CertificatesClient from "@/components/certificates/certificates-client";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";

export default function CertificatesPage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <Suspense>
        <CertificatesClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}
