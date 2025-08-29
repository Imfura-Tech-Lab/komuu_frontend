"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast } from "@/components/layouts/auth-layer-out";

interface Country {
  id: number;
  country: string;
}

interface Payment {
  id: number;
  member: string;
  amount_paid: string;
  payment_method: string;
  transaction_number: string;
  gateway: string;
  status: string;
  is_certificate_generated: boolean;
  payment_date: string;
}

interface Certificate {
  id: number;
  name: string;
  member_number: string;
  certificate: string | null;
  signed_date: string;
  valid_from: string;
  valid_until: string;
  next_payment_date: string;
  status: string;
  token: string;
  membership_term: string;
  created_at: string;
  payment: Payment;
}

interface Member {
  id: string;
  title: string;
  surname: string;
  first_name: string;
  middle_name: string | null;
  email: string;
  date_of_birth: string | null;
  national_id: string | null;
  passport: string | null;
  phone_number: string | null;
  secondary_email: string | null;
  alternative_phone: string | null;
  whatsapp_number: string | null;
  account_status: boolean;
  public_profile: string;
  incompliance: boolean;
  membership_type: string;
  membership_number: string;
  certificate_status: string;
  application_status: string;
  employement: string | null;
  forensic_field_of_practice: string;
  qualification: string;
  cv_resume: string;
  associate_category: string;
  university: string;
  degree: string;
  degree_year: string;
  country_of_study: string;
  proof_of_registration: string;
  name_of_organization: string;
  Abbreviation: string;
  application_date: string;
  country_of_residency: Country;
  country_of_practice: Country[];
  field_of_practice: any[];
  sector_of_employment: any[];
  latest_certificate: Certificate;
  certificates: Certificate[];
  payments: Payment[];
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
}

interface ProfileImageProps {
  imageUrl?: string;
  member: Member;
  size?: "small" | "large";
}

function ProfileImage({ imageUrl, member, size = "large" }: ProfileImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const getUserInitials = (member: Member) => {
    const initials = [];
    if (member.first_name) {
      initials.push(member.first_name[0]);
    }
    if (member.surname) {
      initials.push(member.surname[0]);
    }
    return initials.join("").substring(0, 2).toUpperCase();
  };

  const getDisplayName = (member: Member) => {
    const parts = [
      member.first_name,
      member.middle_name,
      member.surname,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const sizeClasses =
    size === "large" ? "w-32 h-32 text-2xl" : "w-24 h-24 text-xl";

  const isValidImageUrl =
    imageUrl && imageUrl !== "NA" && imageUrl.trim() !== "";

  // Reset states when imageUrl changes
  useEffect(() => {
    if (isValidImageUrl) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [imageUrl]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    console.log(
      `Profile image loaded successfully for: ${getDisplayName(member)}`
    );
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.log(`Profile image failed to load for: ${getDisplayName(member)}`, {
      imageUrl,
      memberId: member.id,
      fallbackInitials: getUserInitials(member),
    });
  };

  // Show abbreviation if no valid image URL or image failed to load
  if (!isValidImageUrl || imageError) {
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-br from-[#00B5A5] to-[#009985] rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-md`}
      >
        <span className="text-white font-bold">{getUserInitials(member)}</span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} relative rounded-lg overflow-hidden border-2 border-white dark:border-gray-700 shadow-md flex-shrink-0`}
    >
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#00B5A5] border-t-transparent rounded-full"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={`${getDisplayName(member)}'s profile`}
        className={`w-full h-full object-cover ${
          imageLoading ? "opacity-0" : "opacity-100"
        } transition-opacity`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}

interface SingleMemberPageProps {
  memberId: string;
}

export default function SingleMemberPage({ memberId }: SingleMemberPageProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view member");
        return;
      }

      console.group(`Member API Request for ID: ${memberId}`);
      console.log("API URL:", `${apiUrl}members/${memberId}`);
      console.log("Request timestamp:", new Date().toISOString());

      const response = await fetch(`${apiUrl}members/${memberId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Member not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Clean and detailed logging of the response
      console.log("Response Status:", response.status);
      console.log(
        "Response Headers:",
        Object.fromEntries(response.headers.entries())
      );
      console.log("API Response Structure:", {
        status: responseData.status,
        message: responseData.message,
        hasData: !!responseData.data,
        dataKeys: responseData.data
          ? Object.keys(responseData.data)
          : "No data object",
      });

      if (responseData.data) {
        console.log("Member Summary:", {
          id: responseData.data.id,
          name: `${responseData.data.first_name} ${responseData.data.surname}`,
          email: responseData.data.email,
          membershipType: responseData.data.membership_type,
          membershipNumber: responseData.data.membership_number,
          certificateStatus: responseData.data.certificate_status,
          applicationStatus: responseData.data.application_status,
          accountStatus: responseData.data.account_status,
          incompliance: responseData.data.incompliance,
          hasProfileImage:
            responseData.data.public_profile &&
            responseData.data.public_profile !== "NA",
          profileImageValue: responseData.data.public_profile,
          countriesOfPractice:
            responseData.data.country_of_practice?.length || 0,
          certificatesCount: responseData.data.certificates?.length || 0,
          paymentsCount: responseData.data.payments?.length || 0,
        });
      }
      console.groupEnd();

      if (responseData.status === "success") {
        setMember(responseData.data);
      } else {
        throw new Error(responseData.message || "Failed to fetch member");
      }
    } catch (err) {
      console.error("Failed to fetch member:", {
        memberId,
        error: err instanceof Error ? err.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
      setError(err instanceof Error ? err.message : "Failed to fetch member");
      showErrorToast("Failed to load member details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getDisplayName = (member: Member) => {
    const parts = [
      member.title,
      member.first_name,
      member.middle_name,
      member.surname,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const getUserInitials = (member: Member) => {
    const initials = [];
    if (member.first_name) {
      initials.push(member.first_name[0]);
    }
    if (member.surname) {
      initials.push(member.surname[0]);
    }
    return initials.join("").substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading member details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              ⚠️
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Member
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={fetchMember}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/members")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Back to Members
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              👤
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              Member Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              The requested member could not be found.
            </p>
            <button
              onClick={() => router.push("/members")}
              className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
            >
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  const validProfileImageUrl =
    member.public_profile && member.public_profile !== "NA"
      ? member.public_profile
      : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/members")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Members
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Member Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed information for {member.name_of_organization} member
          </p>
        </div>

        {/* Member Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start space-x-6">
            <ProfileImage
              imageUrl={validProfileImageUrl}
              member={member}
              size="small"
            />

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {getDisplayName(member)}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {member.email}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {member.membership_number}
                    </p>
                    <span className="text-sm bg-[#00B5A5]/10 text-[#00B5A5] px-2 py-1 rounded">
                      {member.membership_type}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {member.incompliance && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Compliant
                    </span>
                  )}

                  {member.account_status ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Active Account
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      Inactive Account
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Details Sections */}
        <div className="space-y-6">
          {/* Personal Information */}
          <CollapsibleSection title="Personal Information" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName(member)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.phone_number || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    WhatsApp
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.whatsapp_number || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Secondary Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.secondary_email || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Country of Residency
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.country_of_residency?.country || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(member.date_of_birth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    National ID
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.national_id || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Passport
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.passport || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Alternative Phone
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.alternative_phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Professional Information */}
          <CollapsibleSection
            title="Professional Information"
            defaultOpen={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Forensic Field of Practice
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.forensic_field_of_practice}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Employment
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.employement || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Countries of Practice
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.country_of_practice &&
                    member.country_of_practice.length > 0 ? (
                      member.country_of_practice.map((country) => (
                        <span
                          key={country.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {country.country}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Not specified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    University
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.university && member.university !== "NA"
                      ? member.university
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Degree
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.degree && member.degree !== "NA"
                      ? member.degree
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Graduation Year
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.degree_year && member.degree_year !== "NA"
                      ? member.degree_year
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Membership Status */}
          <CollapsibleSection title="Membership Status" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Membership Type
                  </p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {member.membership_type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Certificate Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      member.certificate_status === "Approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {member.certificate_status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Application Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      member.application_status === "Approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                    }`}
                  >
                    {member.application_status}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Application Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDateTime(member.application_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Compliance Status
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      member.incompliance
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {member.incompliance ? "Compliant" : "Non-compliant"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Organization
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.name_of_organization} ({member.Abbreviation})
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Certificate Information */}
          {member.latest_certificate && (
            <CollapsibleSection title="Current Certificate" defaultOpen={true}>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Certificate Status
                      </p>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {member.latest_certificate.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Valid Period
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(member.latest_certificate.valid_from)} -{" "}
                        {formatDate(member.latest_certificate.valid_until)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Membership Term
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.latest_certificate.membership_term}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Next Payment Due
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(
                          member.latest_certificate.next_payment_date
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Signed Date
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(member.latest_certificate.signed_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Certificate Token
                      </p>
                      <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {member.latest_certificate.token}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Payment Information */}
          {member.latest_certificate?.payment && (
            <CollapsibleSection title="Latest Payment" defaultOpen={true}>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Amount Paid
                      </p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        {member.latest_certificate.payment.amount_paid}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Payment Method
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.latest_certificate.payment.payment_method}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Gateway
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.latest_certificate.payment.gateway}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Transaction Number
                      </p>
                      <code className="text-xs bg-white dark:bg-gray-700 px-2 py-1 rounded border">
                        {member.latest_certificate.payment.transaction_number}
                      </code>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Payment Date
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDateTime(
                          member.latest_certificate.payment.payment_date
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          member.latest_certificate.payment.status ===
                          "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {member.latest_certificate.payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Documents */}
          <CollapsibleSection title="Documents" defaultOpen={false}>
            <div className="space-y-4">
              {member.qualification && member.qualification !== "NA" && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Qualification Document
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.qualification}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors">
                    Download
                  </button>
                </div>
              )}

              {member.cv_resume && member.cv_resume !== "NA" && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      CV/Resume
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {member.cv_resume}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors">
                    Download
                  </button>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Profile Picture Section */}
          <CollapsibleSection title="Profile Picture" defaultOpen={false}>
            <div className="flex items-start space-x-6">
              <ProfileImage
                imageUrl={validProfileImageUrl}
                member={member}
                size="large"
              />
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Profile Picture Status
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {validProfileImageUrl
                        ? "Available"
                        : "No image uploaded (showing initials)"}
                    </p>
                  </div>

                  {validProfileImageUrl && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Image URL
                      </p>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all flex-1">
                          {member.public_profile}
                        </code>
                        <a
                          href={member.public_profile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors flex-shrink-0"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Fallback System:</strong> When profile images fail
                      to load or are set to "NA", the system displays styled
                      initials ({getUserInitials(member)}) with a gradient
                      background. All image load attempts and failures are
                      logged to the browser console.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Payment History */}
          {member.payments && member.payments.length > 0 && (
            <CollapsibleSection title="Payment History" defaultOpen={false}>
              <div className="space-y-3">
                {member.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Amount
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {payment.amount_paid}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(payment.payment_date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Transaction
                        </p>
                        <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">
                          {payment.transaction_number}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>
    </div>
  );
}
