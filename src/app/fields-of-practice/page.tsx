import { Metadata } from "next";
import SecureDashboardLayout from "@/components/dashboard/secure-dashboard-layout";
import FieldsOfPracticeClient from "@/components/fields-of-practice/fields-of-practice-client";

export const metadata: Metadata = {
  title: "Fields of Practice - AFSA Portal",
  description: "Manage forensic practice specializations and fields",
};

export default function FieldsOfPracticePage() {
  return (
    <SecureDashboardLayout
      requiredRoles={["Administrator", "Board", "President"]}
    >
      <FieldsOfPracticeClient />
    </SecureDashboardLayout>
  );
}
