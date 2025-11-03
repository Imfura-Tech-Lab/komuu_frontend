"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  Eye,
  Download,
  Calendar,
  CreditCard,
  Shield
} from "lucide-react";
import { BaseTable, BaseTableColumn } from "@/components/ui/BaseTable";
import { PDFViewer } from "@/components/ui/FileViwer";

interface Certificate {
  id: number;
  name?: string;
  member_number?: string;
  certificate?: string;
  status: string;
  valid_from?: string;
  valid_until?: string;
  membership_term?: string;
  signed_date?: string;
  created_at?: string;
  token?: string;
  next_payment_date?: string;
  payment?: {
    id: number;
    member: string;
    amount_paid: string;
    payment_method: string;
    transaction_number: string;
    gateway: string;
    status: string;
    is_certificate_generated: boolean;
    payment_date: string;
  };
}

interface UserData {
  role: string;
}

// Helper function to clean malformed URLs
function cleanCertificateUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  if (url.includes('/storage/https://') || url.includes('/storage/http://')) {
    const match = url.match(/\/storage\/(https?:\/\/.+)/);
    return match ? match[1] : url;
  }
  
  return url;
}

export default function CertificatesClient() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // PDF Viewer State
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentPdfFileName, setCurrentPdfFileName] = useState("");

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    const parsedUserData: UserData | null = userData
      ? JSON.parse(userData)
      : null;
    const role = parsedUserData?.role || null;
    setUserRole(role);

    if (role !== null) {
      fetchCertificates(role);
    }
  }, []);

  const fetchCertificates = async (role: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view certificates");
        router.push("/login");
        return;
      }

      if (!apiUrl) {
        showErrorToast("Backend API URL is not configured.");
        setError("Configuration error: Backend API URL missing.");
        return;
      }

      const endpoint =
        role === "Member"
          ? `${apiUrl}membership/certificates`
          : `${apiUrl}certificates`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const certificatesData = data.data?.data || data.data || [];
        setCertificates(
          Array.isArray(certificatesData)
            ? certificatesData.map((cert: any) => ({
                id: cert.id,
                name: cert.name,
                member_number: cert.member_number,
                certificate: cleanCertificateUrl(cert.certificate),
                status: cert.status,
                valid_from: cert.valid_from,
                valid_until: cert.valid_until,
                membership_term: cert.membership_term,
                signed_date: cert.signed_date,
                next_payment_date: cert.next_payment_date,
                created_at: cert.created_at,
                token: cert.token,
                payment: cert.payment
                  ? {
                      id: cert.payment.id,
                      member: cert.payment.member,
                      amount_paid: cert.payment.amount_paid,
                      payment_method: cert.payment.payment_method,
                      transaction_number: cert.payment.transaction_number,
                      gateway: cert.payment.gateway,
                      status: cert.payment.status,
                      is_certificate_generated: cert.payment.is_certificate_generated,
                      payment_date: cert.payment.payment_date,
                    }
                  : undefined,
              }))
            : []
        );
      } else {
        throw new Error(data.message || "Failed to fetch certificates");
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch certificates"
      );
      showErrorToast("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = (pdfUrl: string, fileName: string) => {
    setCurrentPdfUrl(pdfUrl);
    setCurrentPdfFileName(fileName);
    setPdfViewerOpen(true);
  };

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
          {cert.certificate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewPDF(cert.certificate!, `${cert.member_number || cert.id}.pdf`);
              }}
              className="inline-flex items-center px-2 py-1 text-xs bg-[#00B5A5] hover:bg-[#009985] text-white rounded transition-colors"
              title="View Certificate"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </button>
          )}
        </div>
      ),
    },
  ], [userRole]);

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
        label: "Download PDFs",
        icon: <FileText className="w-4 h-4" />,
        action: async (selectedCerts: Certificate[]) => {
          const certsWithPdf = selectedCerts.filter(c => c.certificate);
          if (certsWithPdf.length === 0) {
            showErrorToast("No certificates with PDFs selected");
            return;
          }
          showSuccessToast(`Downloading ${certsWithPdf.length} certificate PDF${certsWithPdf.length > 1 ? 's' : ''}`);
        },
      });
    }

    return actions;
  }, [userRole]);

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

      {/* PDF Viewer Modal */}
      <PDFViewer
        pdfUrl={currentPdfUrl}
        fileName={currentPdfFileName}
        isOpen={pdfViewerOpen}
        onClose={() => setPdfViewerOpen(false)}
      />
    </div>
  );
}