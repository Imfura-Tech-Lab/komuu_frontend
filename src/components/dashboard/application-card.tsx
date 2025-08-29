import { useState } from "react";
import CollapsibleSection from "./collapsible-section";
import { Application } from "@/types";

export interface ApplicationCardProps {
  application: Application;
  index: number;
  getStatusColor: (status: string) => string;
  formatDate: (dateString: string) => string;
  formatBoolean: (value: boolean) => string;
  userRole: string;
  router: any;
  onCertificateSign?: (applicationId: string) => void;
}

export default function ApplicationCard({
  application,
  index,
  getStatusColor,
  formatDate,
  formatBoolean,
  userRole,
  router,
  onCertificateSign,
}: ApplicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSigningCertificate, setIsSigningCertificate] = useState(false);

  // Generate a meaningful title based on application data
  const getApplicationTitle = () => {
    if (application.member || application.member_details?.name) {
      return application.member || application.member_details.name;
    }
    return `Application ${formatDate(application.application_date)}`;
  };

  // Handle certificate signing
  const handleSignCertificate = async () => {
    if (!application.id) return;

    setIsSigningCertificate(true);
    try {
      const formData = new FormData();
      formData.append(`applications[0][id]`, application.id);
      const token = localStorage.getItem("auth_token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}applications/sign-certificates`,
        {
          method: "POST",
          body: formData,
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (response.ok) {
        // Success feedback
        if (onCertificateSign) {
          onCertificateSign(application.id);
        }
        // You might want to show a success toast here
        console.log("Certificate signed successfully");
      } else {
        throw new Error("Failed to sign certificate");
      }
    } catch (error) {
      console.error("Error signing certificate:", error);
      // You might want to show an error toast here
    } finally {
      setIsSigningCertificate(false);
    }
  };

  // Check if application is eligible for certificate signing
  const canSignCertificate = () => {
    return (
      userRole === "President" &&
      application.application_status === "Approved" &&
      application.abide_with_code_of_conduct &&
      application.comply_with_current_constitution &&
      application.declaration &&
      application.incompliance
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Application Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00B5A5] to-[#00D3A0] rounded-full flex items-center justify-center text-white font-bold">
                {getApplicationTitle().charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {getApplicationTitle()}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {application.name_of_organization}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {application.membership_type}
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {application.country_of_residency}
              </span>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  application.application_status
                )}`}
              >
                {application.application_status}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-4">
            {/* Certificate Signing Button */}
            {canSignCertificate() && (
              <button
                onClick={handleSignCertificate}
                disabled={isSigningCertificate}
                className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                title="Sign Certificate"
              >
                {isSigningCertificate ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing...
                  </>
                ) : (
                  <>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Generate Certificate
                  </>
                )}
              </button>
            )}

            {userRole !== "Member" && (
              <button
                onClick={() => router.push(`/applications/${application.id}`)}
                className="p-2 text-gray-500 hover:text-[#00B5A5] dark:text-gray-400 dark:hover:text-[#00B5A5] transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="View details"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  isExpanded ? "rotate-180" : ""
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
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-700/30">
          {/* Application Details Section */}
          <CollapsibleSection
            title="Application Details"
            defaultOpen={true}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Application Date
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(application.application_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Membership Type
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {application.membership_type}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Field of Practice
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {application.forensic_field_of_practice}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-6 0H5m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Organization
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {application.name_of_organization} (
                      {application.Abbreviation})
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Country of Residency
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {application.country_of_residency}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Company Email
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {application.company_email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Member Information Section */}
          {application.member_details && (
            <CollapsibleSection
              title="Member Information"
              defaultOpen={true}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Full Name
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {application.member_details.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Email
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {application.member_details.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {application.member_details.phone_number}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        National ID
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {application.member_details.national_ID}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Date of Birth
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(
                          application.member_details.date_of_birth
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 text-[#00B5A5] mt-0.5 mr-3">
                      <svg
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Account Status
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {application.member_details.verified
                          ? "Verified"
                          : "Pending Verification"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {(application.qualification || application.cv_resume) && (
            <CollapsibleSection
              title="Documents"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.qualification && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Qualification Document
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          PDF Document
                        </p>
                      </div>
                    </div>
                    <a
                      href={application.qualification}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </a>
                  </div>
                )}

                {application.cv_resume && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600 dark:text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          CV/Resume
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          PDF Document
                        </p>
                      </div>
                    </div>
                    <a
                      href={application.cv_resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </a>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Declaration Section */}
          <CollapsibleSection
            title="Declaration"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div
                  className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                    application.abide_with_code_of_conduct
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {application.abide_with_code_of_conduct ? (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Abide with Code of Conduct
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div
                  className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                    application.comply_with_current_constitution
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {application.comply_with_current_constitution ? (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Comply with Constitution
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div
                  className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                    application.declaration
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {application.declaration ? (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Declaration Signed
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div
                  className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                    application.incompliance
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {application.incompliance ? (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    In Compliance
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Countries of Practice Section */}
          {application.countriesOfPractice &&
            application.countriesOfPractice.length > 0 && (
              <CollapsibleSection
                title="Countries of Practice"
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {application.countriesOfPractice.map((country) => (
                    <span
                      key={country.id}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {country.country} ({country.region})
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}
        </div>
      )}
    </div>
  );
}
