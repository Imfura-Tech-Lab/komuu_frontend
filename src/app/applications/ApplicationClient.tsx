"use client";

import { useState, useEffect } from "react";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { Application, ApplicationResponse } from "@/types";

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

export default function ApplicationClient() {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    application: true,
    member: true,
    documents: true,
    declaration: false,
    countries: false,
  });

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view your application");
        return;
      }

      const response = await fetch(`${apiUrl}my-application`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApplicationResponse = await response.json();

      if (data.status === "success") {
        setApplication(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch application");
      }
    } catch (err) {
      console.error("Failed to fetch application:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch application"
      );
      showErrorToast("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBoolean = (value: boolean) => {
    return value ? "Yes" : "No";
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading your application details...
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
            <div className="text-red-600 dark:bg-red-400 text-2xl mb-2">⚠️</div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Application
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchApplication}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              📋
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              No Application Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You haven't submitted an application yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Application
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View your membership application details and status
          </p>
        </div>

        {/* Application Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {application.member}
              </h2>
            </div>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                application.application_status
              )}`}
            >
              {application.application_status}
            </span>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {/* Application Details Section */}
          <CollapsibleSection title="Application Details" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Application Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(application.application_date)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Membership Type
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.membership_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Field of Practice
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.forensic_field_of_practice}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Organization
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.name_of_organization} (
                    {application.Abbreviation})
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Country of Residency
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.country_of_residency}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Company Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.company_email}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Member Information Section */}
          <CollapsibleSection title="Member Information" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.member_details.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.member_details.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.member_details.phone_number}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    National ID
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.member_details.national_ID}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(
                      application.member_details.date_of_birth
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Account Status
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {application.member_details.verified
                      ? "Verified"
                      : "Pending Verification"}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Documents Section */}
          <CollapsibleSection title="Documents">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400">📄</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Qualification
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF Document
                    </p>
                  </div>
                </div>
                <a
                  href={application.qualification}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors"
                >
                  View
                </a>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400">
                      📄
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      CV/Resume
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF Document
                    </p>
                  </div>
                </div>
                <a
                  href={application.cv_resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors"
                >
                  View
                </a>
              </div>
            </div>
          </CollapsibleSection>

          {/* Declaration Section */}
          <CollapsibleSection title="Declaration">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Abide with Code of Conduct
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.abide_with_code_of_conduct)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Comply with Constitution
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.comply_with_current_constitution)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  Declaration Signed
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.declaration)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  In Compliance
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatBoolean(application.incompliance)}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Countries of Practice Section */}
          {application.countriesOfPractice &&
            application.countriesOfPractice.length > 0 && (
              <CollapsibleSection title="Countries of Practice">
                <div className="flex flex-wrap gap-2">
                  {application.countriesOfPractice.map((country) => (
                    <span
                      key={country.id}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {country.country} ({country.region})
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchApplication}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Application
          </button>
        </div>
      </div>
    </div>
  );
}
