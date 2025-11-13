"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";
import { 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  Eye,
  Download,
} from "lucide-react";
import { BaseTable, BaseTableColumn } from "@/components/ui/BaseTable";
import { FileViewer } from "@/components/ui/FileViwer";
import { useCertificates, Certificate  } from "@/lib/hooks/useCertificates";
import { useAuth } from "@/lib/hooks/Use-auth";
import { useFileViewer } from "@/lib/hooks/useFileViewer";
import { generateCertificatePDF } from "@/lib/utils/certificateGenerator";

// Skeleton Loader Component
function CertificatesTableSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Skeleton */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Search and Filters Skeleton */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="h-10 w-full sm:w-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="w-12 px-6 py-3">
                <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
              <th className="px-6 py-3">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(10)].map((_, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                </td>
                <td className="px-6 py-4">
                  <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesClient() {
  const router = useRouter();
  const { role: userRole } = useAuth();
  const { certificates, loading, error, fetchingCertificate, fetchCertificates, getCertificateData } = useCertificates();
  const { isOpen: fileViewerOpen, fileUrl: currentFileUrl, fileName: currentFileName, openFile, closeFile } = useFileViewer();

  useEffect(() => {
    if (userRole !== null) {
      fetchCertificates(userRole);
    }
  }, [userRole, fetchCertificates]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "valid":
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "revoked":
      case "abandoned":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const handleCertificateClick = (certificateId: number) => {
    const detailPath =
      userRole === "Member"
        ? `/my-certificates/${certificateId}`
        : `/certificates/${certificateId}`;
    router.push(detailPath);
  };

  const handleViewCertificate = async (certificateId: number, memberNumber?: string) => {
    try {
      // Get certificate data from backend
      const certificateData = await getCertificateData(certificateId);
      
      if (!certificateData) {
        showErrorToast("Failed to load certificate data");
        return;
      }

      // Generate PDF blob from the data
      const pdfBlob = await generateCertificatePDF(certificateData);
      
      // Create blob URL
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // Open in file viewer
      openFile(blobUrl, `Certificate-${memberNumber || certificateId}.pdf`, "pdf");
    } catch (error) {
      console.error("Error viewing certificate:", error);
      showErrorToast("Failed to generate certificate preview");
    }
  };

  // Table columns configuration
  const columns: BaseTableColumn<Certificate>[] = useMemo(() => [
    {
      key: "member_number",
      label: "Member Number",
      sortable: true,
      filterable: true,
      width: 150,
      render: (cert, value) => (
        <span className="font-mono text-sm">{value || `#${cert.id.toString().padStart(4, "0")}`}</span>
      ),
    },
    {
      key: "name",
      label: "Member Name",
      sortable: true,
      filterable: true,
      width: 200,
      render: (cert, value) => (
        <span className="text-sm">{value || "N/A"}</span>
      ),
    },
    {
      key: "membership_term",
      label: "Term",
      sortable: true,
      filterable: true,
      width: 120,
      render: (cert, value) => (
        <span className="text-sm">{value || "N/A"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      filterComponent: {
        type: "select",
        options: [
          { label: "Approved", value: "Approved" },
          { label: "Active", value: "Active" },
          { label: "Expired", value: "Expired" },
          { label: "Suspended", value: "Suspended" },
          { label: "Pending", value: "Pending" },
        ],
      },
      width: 120,
      render: (cert, value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: "valid_from",
      label: "Valid From",
      sortable: true,
      filterable: true,
      filterComponent: { type: "date" },
      width: 120,
      render: (cert, value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(value)}
        </span>
      ),
      exportRender: (cert, value) => formatDate(value),
    },
    {
      key: "valid_until",
      label: "Valid Until",
      sortable: true,
      filterable: true,
      filterComponent: { type: "date" },
      width: 120,
      render: (cert, value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(value)}
        </span>
      ),
      exportRender: (cert, value) => formatDate(value),
    },
    {
      key: "signed_date",
      label: "Signed Date",
      sortable: true,
      filterable: true,
      filterComponent: { type: "date" },
      width: 120,
      render: (cert, value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(value)}
        </span>
      ),
      exportRender: (cert, value) => formatDate(value),
    },
    {
      key: "payment.status",
      label: "Payment",
      sortable: true,
      filterable: true,
      filterComponent: {
        type: "select",
        options: [
          { label: "Completed", value: "Completed" },
          { label: "Pending", value: "Pending" },
          { label: "Failed", value: "Failed" },
        ],
      },
      width: 100,
      render: (cert) => {
        const paymentStatus = cert.payment?.status;
        if (!paymentStatus) return <span className="text-sm">N/A</span>;
        
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            paymentStatus === "Completed"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
          }`}>
            {paymentStatus}
          </span>
        );
      },
      exportRender: (cert) => cert.payment?.status || "N/A",
    },
    {
      key: "certificate",
      label: "Actions",
      sortable: false,
      filterable: false,
      width: 100,
      render: (cert) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewCertificate(cert.id, cert.member_number);
            }}
            disabled={fetchingCertificate}
            className="inline-flex items-center px-2 py-1 text-xs bg-[#00B5A5] hover:bg-[#009985] text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="View Certificate"
          >
            <Eye className="w-3 h-3 mr-1" />
            {fetchingCertificate ? "Loading..." : "View"}
          </button>
        </div>
      ),
    },
  ], [userRole, fetchingCertificate]);

  // Bulk actions
  const bulkActions = useMemo(() => {
    const actions = [];

    actions.push({
      label: "Export Selected",
      icon: <Download className="w-4 h-4" />,
      action: async (selectedCerts: Certificate[]) => {
        showSuccessToast(`Exporting ${selectedCerts.length} certificate${selectedCerts.length > 1 ? 's' : ''}`);
      },
    });

    if (userRole !== "Member") {
      actions.push({
        label: "Generate PDFs",
        icon: <FileText className="w-4 h-4" />,
        action: async (selectedCerts: Certificate[]) => {
          if (selectedCerts.length === 0) {
            showErrorToast("No certificates selected");
            return;
          }
          
          showSuccessToast(`Generating ${selectedCerts.length} certificate${selectedCerts.length > 1 ? 's' : ''}...`);
          
          for (const cert of selectedCerts) {
            await handleViewCertificate(cert.id, cert.member_number);
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        },
      });
    }

    return actions;
  }, [userRole]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CertificatesTableSkeleton />
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Certificates
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
            <button
              onClick={() => fetchCertificates(userRole)}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN CONTENT
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BaseTable
          data={certificates}
          columns={columns}
          loading={loading}
          title="Certificates"
          exportFileName="certificates"
          searchable={true}
          searchFields={[
            "member_number",
            "name",
            "membership_term",
            "status",
          ]}
          pagination={true}
          pageSize={10}
          onRowClick={(cert) => handleCertificateClick(cert.id)}
          emptyMessage="No certificates found matching your criteria"
          enableExcelExport={true}
          enablePDFExport={true}
          enableBulkSelection={true}
          bulkActions={bulkActions}
          enableColumnManagement={true}
          stickyHeader={true}
          rowKey="id"
        />
      </div>

      {/* File Viewer Modal */}
      <FileViewer
        fileUrl={currentFileUrl}
        fileName={currentFileName}
        fileType="pdf"
        isOpen={fileViewerOpen}
        onClose={closeFile}
      />
    </div>
  );
}