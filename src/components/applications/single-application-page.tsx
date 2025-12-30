"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { showSuccessToast } from "@/components/layouts/auth-layer-out";
import {
  ArrowLeft,
  FileText,
  Eye,
  CreditCard,
  Briefcase,
  Building2,
  GraduationCap,
  MapPin,
  Shield,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { DeleteModal } from "../admin/modals/Deletemodal";
import { ActionsButtons } from "../admin/ActionsDropdown";
import { CollapsibleSection } from "../admin/CollapsibleSection";
import { InfoRow } from "../admin/InfoRow";
import { UserData } from "@/types/application.types";
import { ApprovalHistorySection } from "../admin/ApprovalHistorySection";
import { PersonalInformationSection } from "../admin/PersonalInformationSection";
import {
  formatBoolean,
  formatDate,
  getStatusColor,
} from "@/lib/utils/formatters";
import { useApplicationManager } from "@/lib/hooks/useApplicationManager";
import { useFileViewer } from "@/lib/hooks/useFileViewer";
import { FileViewer } from "@/components/ui/FileViwer";

interface SingleApplicationPageProps {
  applicationId: string;
}

export default function SingleApplicationPage({
  applicationId,
}: SingleApplicationPageProps) {
  const router = useRouter();

  const [userData] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_data");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const {
    application,
    loading,
    error,
    isUpdating,
    isDeleting,
    fetchApplication,
    approveApplication,
    signCertificate,
    deleteApplication,
  } = useApplicationManager({ applicationId });

  const {
    isOpen: fileViewerOpen,
    fileUrl: currentFileUrl,
    fileName: currentFileName,
    fileType: currentFileType,
    openFile,
    closeFile,
  } = useFileViewer();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<"soft" | "force">("soft");

  const isApproved =
    application?.application_status?.toLowerCase() === "approved";
  const isPresident = userData?.role === "President";

  const hasUserApproved =
    application?.approved_by?.some(
      (approval) => approval.id === userData?.id
    ) ?? false;

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleRefresh = async () => {
    showSuccessToast("Refreshing application data...");
    await fetchApplication();
  };

  const handleApprove = async () => {
    await approveApplication();
  };

  const handleSign = async () => {
    await signCertificate();
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDelete = async (forceDelete: boolean) => {
    const success = await deleteApplication(forceDelete);
    if (success) {
      setShowDeleteModal(false);
    }
  };

  const getFileType = (path: string): "pdf" | "image" | "document" => {
    const ext = path.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return "image";
    return "document";
  };

  const handleViewDocument = (doc: {
    document_path: string;
    document_type: string;
  }) => {
    const type = getFileType(doc.document_path);
    openFile(doc.document_path, doc.document_type, type);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
            <div className="flex items-center justify-between">
              <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6"
            >
              <div className="flex items-center mb-6">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded mr-3 animate-pulse"></div>
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {error ? "Error Loading Application" : "Application Not Found"}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error ||
                  "This application could not be found or you don't have permission to view it."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/applications")}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Applications
                </button>

                <button
                  onClick={fetchApplication}
                  disabled={loading}
                  className="inline-flex items-center justify-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] disabled:bg-gray-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.push("/applications")}
            className="flex items-center text-[#00B5A5] hover:text-[#009985] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Applications
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Application Details
            </h1>

            <ActionsButtons
              loading={loading}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              isApproved={isApproved}
              isPresident={isPresident}
              hasUserApproved={hasUserApproved}
              onRefresh={handleRefresh}
              onApprove={handleApprove}
              onSign={handleSign}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Application Status
                </h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    application.application_status
                  )}`}
                >
                  {application.application_status}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Membership Type
                </h2>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {application.membership_type}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Application Date
                </h2>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(application.application_date)}
                </p>
              </div>
            </div>
          </div>

          <PersonalInformationSection
            memberDetails={application.member_details}
          />

          <CollapsibleSection
            title="Organization Information"
            icon={<Building2 className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow
                label="Organization Name"
                value={application.name_of_organization}
                highlight
              />
              <InfoRow label="Abbreviation" value={application.Abbreviation} />
              <InfoRow
                label="Company Email"
                value={application.company_email}
              />
              <InfoRow
                label="Country of Residency"
                value={application.country_of_residency}
              />
              <InfoRow
                label="Country of Operation"
                value={application.country_of_operation}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Membership Information"
            icon={<Briefcase className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow
                label="Membership Type"
                value={application.membership_type}
                highlight
              />
              <InfoRow
                label="Membership Number"
                value={application.membership_number || "Not Assigned"}
              />
              <InfoRow
                label="Associate Category"
                value={application.associate_category}
              />
              <InfoRow label="Employment" value={application.employement} />
              <InfoRow
                label="Qualification"
                value={application.qualification}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Education Information"
            icon={<GraduationCap className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoRow label="University" value={application.university} />
              <InfoRow label="Degree" value={application.degree} />
              <InfoRow
                label="Graduation Year"
                value={application.graduation_year}
              />
              <InfoRow
                label="Country of Study"
                value={application.country_of_study}
              />
            </div>
          </CollapsibleSection>

          {application.documents && application.documents.length > 0 && (
            <CollapsibleSection
              title="Uploaded Documents"
              icon={<FileText className="w-5 h-5 text-[#00B5A5]" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          doc.document_type === "CV/Resume"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                        }`}
                      >
                        <FileText
                          className={`w-5 h-5 ${
                            doc.document_type === "CV/Resume"
                              ? "text-green-600 dark:text-green-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.document_type}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Uploaded: {formatDate(doc.uploaded_at)}
                        </p>
                        {doc.current && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mt-1">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewDocument(doc)}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors ml-4"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {application.payments && application.payments.length > 0 && (
            <CollapsibleSection
              title="Payment Information"
              icon={<CreditCard className="w-5 h-5 text-[#00B5A5]" />}
            >
              <div className="space-y-4">
                {application.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {payment.amount_paid}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {payment.member}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === "Completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <InfoRow
                        label="Payment Method"
                        value={payment.payment_method}
                      />
                      <InfoRow
                        label="Transaction Number"
                        value={payment.transaction_number}
                      />
                      <InfoRow label="Gateway" value={payment.gateway} />
                      <InfoRow
                        label="Payment Date"
                        value={formatDate(payment.payment_date)}
                      />
                      <InfoRow
                        label="Certificate Generated"
                        value={formatBoolean(payment.is_certificate_generated)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {application.fieldsOfPractices &&
            application.fieldsOfPractices.length > 0 && (
              <CollapsibleSection
                title="Fields of Practice"
                icon={<Briefcase className="w-5 h-5 text-[#00B5A5]" />}
              >
                <div className="flex flex-wrap gap-2">
                  {application.fieldsOfPractices.map((field, index) => (
                    <span
                      key={`${field.id}-${index}`}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        field.is_primary
                          ? "bg-[#00B5A5] text-white border-[#00B5A5]"
                          : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {field.field_of_practice} ({field.code})
                      {field.is_primary && " • Primary"}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

          {application.countriesOfPractice &&
            application.countriesOfPractice.length > 0 && (
              <CollapsibleSection
                title="Countries of Practice"
                icon={<MapPin className="w-5 h-5 text-[#00B5A5]" />}
              >
                <div className="flex flex-wrap gap-2">
                  {application.countriesOfPractice.map((country) => (
                    <span
                      key={country.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    >
                      {country.country}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {country.region}
                      </span>
                      {country.is_primary && (
                        <span className="ml-2 text-[#00B5A5]">• Primary</span>
                      )}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

          <CollapsibleSection
            title="Declaration & Compliance"
            icon={<Shield className="w-5 h-5 text-[#00B5A5]" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    application.abide_with_code_of_conduct
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {application.abide_with_code_of_conduct ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Code of Conduct
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatBoolean(application.abide_with_code_of_conduct)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    application.comply_with_current_constitution
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {application.comply_with_current_constitution ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Constitution Compliance
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatBoolean(
                      application.comply_with_current_constitution
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    application.declaration
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {application.declaration ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Declaration Signed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatBoolean(application.declaration)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    application.incompliance
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {application.incompliance ? (
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <span className="text-red-600 dark:text-red-400">✕</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    In Compliance
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatBoolean(application.incompliance)}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <ApprovalHistorySection approvals={application.approved_by} />
        </div>

        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          deleteType={deleteType}
          onDeleteTypeChange={setDeleteType}
        />

        <FileViewer
          fileUrl={currentFileUrl}
          fileName={currentFileName}
          fileType={currentFileType}
          isOpen={fileViewerOpen}
          onClose={closeFile}
        />
      </div>
    </div>
  );
}
