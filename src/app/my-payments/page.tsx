import { Suspense } from "react";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import MyPaymentsClient from "@/components/payments/my-payments-client";

export default function CertificatesPage() {
  return (
    <SecureDashboardLayout requiredRoles={["Member"]}>
      <Suspense>
        <MyPaymentsClient />
      </Suspense>
    </SecureDashboardLayout>
  );
}
