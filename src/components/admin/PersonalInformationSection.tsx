import { User } from "lucide-react";
import { CollapsibleSection } from "./CollapsibleSection";
import { InfoRow } from "./InfoRow";
import { MemberDetails } from "@/types/application.types";

// ============================================================================
// PERSONAL INFORMATION SECTION COMPONENT
// ============================================================================

interface PersonalInformationSectionProps {
  memberDetails: MemberDetails;
}

export function PersonalInformationSection({
  memberDetails,
}: PersonalInformationSectionProps) {
  // Format boolean helper
  const formatBoolean = (value: boolean | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return value ? "Yes" : "No";
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <CollapsibleSection
      title="Personal Information"
      icon={<User className="w-5 h-5 text-[#00B5A5]" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoRow
          label="Full Name"
          value={memberDetails.name}
          highlight
        />
        <InfoRow 
          label="Email" 
          value={memberDetails.email} 
        />
        <InfoRow
          label="Phone Number"
          value={memberDetails.phone_number}
        />
        <InfoRow
          label="Secondary Email"
          value={memberDetails.secondary_email}
        />
        <InfoRow
          label="Alternative Phone"
          value={memberDetails.alternative_phone}
        />
        <InfoRow
          label="WhatsApp Number"
          value={memberDetails.whatsapp_number}
        />
        <InfoRow
          label="Date of Birth"
          value={formatDate(memberDetails.date_of_birth)}
        />
        <InfoRow
          label="National ID"
          value={memberDetails.national_ID}
        />
        <InfoRow
          label="Passport"
          value={memberDetails.passport}
        />
        <InfoRow 
          label="Role" 
          value={memberDetails.role} 
        />
        <InfoRow
          label="Verified"
          value={formatBoolean(memberDetails.verified)}
        />
        <InfoRow
          label="Active"
          value={formatBoolean(memberDetails.active)}
        />
      </div>
    </CollapsibleSection>
  );
}