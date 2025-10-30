"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { BaseTable, BaseTableColumn } from "../ui/BaseTable";
import { 
  RefreshCw, 
  AlertCircle, 
  Users, 
  CheckCircle, 
  Shield, 
  UserCheck,
  UserPlus,
  Clock,
  Download,
  Mail
} from "lucide-react";

interface Member {
  id: string;
  title?: string;
  surname: string;
  first_name: string;
  middle_name?: string;
  incompliance: boolean;
  membership_type: string;
  membership_number: string;
  certificate_status: string;
  country_of_residency: string;
  application_status: string;
  email?: string;
  phone_number?: string;
  role?: string;
  verified?: boolean;
  active?: boolean;
  has_changed_password?: boolean;
  date_of_birth?: string;
  national_ID?: string;
  passport?: string;
  whatsapp_number?: string;
  secondary_email?: string;
  alternative_phone?: string;
  public_profile?: string;
  created_at?: string;
  updated_at?: string;
}

export default function MembersClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view members");
        return;
      }

      const response = await fetch(`${apiUrl}members`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const membersData = data.data?.data || data.data || [];
        setMembers(Array.isArray(membersData) ? membersData : []);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch members");
      showErrorToast("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (membershipType: string) => {
    switch (membershipType.toLowerCase()) {
      case "full member":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "associate member":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "student member":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "honorary member":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "corporate member":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFullName = (member: Member) => {
    const parts = [
      member.title,
      member.first_name,
      member.middle_name,
      member.surname,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Enhanced data processing for table
  const processedMembers = useMemo(() => {
    return members.map((member) => ({
      ...member,
      fullName: getFullName(member),
      initials: getUserInitials(getFullName(member)),
    }));
  }, [members]);

  // Table columns configuration
  const columns: BaseTableColumn<Member & { fullName: string; initials: string }>[] = [
    {
      key: "fullName",
      label: "Member",
      sortable: true,
      filterable: true,
      width: 300,
      render: (member) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#00B5A5] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-xs">
              {member.initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <button
              onClick={() => router.push(`/members/${member.id}`)}
              className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#00B5A5] transition-colors text-left"
            >
              {member.fullName}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {member.email || "No email"}
            </p>
          </div>
        </div>
      ),
      exportRender: (member) => member.fullName,
    },
    {
      key: "membership_number",
      label: "Membership #",
      sortable: true,
      filterable: true,
      width: 150,
      render: (member, value) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "membership_type",
      label: "Type",
      sortable: true,
      filterable: true,
      filterComponent: {
        type: "select",
        options: [
          { label: "Full Member", value: "Full Member" },
          { label: "Associate Member", value: "Associate Member" },
          { label: "Student Member", value: "Student Member" },
          { label: "Honorary Member", value: "Honorary Member" },
          { label: "Corporate Member", value: "Corporate Member" },
        ],
      },
      width: 150,
      render: (member, value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
            value
          )}`}
        >
          {value}
        </span>
      ),
      exportRender: (member, value) => value,
    },
    {
      key: "certificate_status",
      label: "Certificate",
      sortable: true,
      filterable: true,
      filterComponent: {
        type: "select",
        options: [
          { label: "Approved", value: "Approved" },
          { label: "Pending", value: "Pending" },
          { label: "Rejected", value: "Rejected" },
        ],
      },
      width: 120,
      render: (member, value) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "Approved":
              return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
            case "Pending":
              return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
            case "Rejected":
              return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
            default:
              return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
          }
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              value
            )}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "incompliance",
      label: "Compliance",
      sortable: true,
      filterable: true,
      filterComponent: {
        type: "select",
        options: [
          { label: "Compliant", value: "true" },
          { label: "Non-compliant", value: "false" },
        ],
      },
      width: 120,
      render: (member, value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {value ? "Compliant" : "Non-compliant"}
        </span>
      ),
      exportRender: (member, value) => (value ? "Compliant" : "Non-compliant"),
    },
    {
      key: "country_of_residency",
      label: "Country",
      sortable: true,
      filterable: true,
      width: 150,
    },
    {
      key: "verified",
      label: "Verified",
      sortable: true,
      filterable: true,
      filterComponent: {
        type: "select",
        options: [
          { label: "Verified", value: "true" },
          { label: "Unverified", value: "false" },
        ],
      },
      width: 100,
      render: (member, value) => (
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
            value
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
          }`}
        >
          {value ? "✓" : "✗"}
        </span>
      ),
      exportRender: (member, value) => (value ? "Yes" : "No"),
    },
    {
      key: "phone_number",
      label: "Phone",
      sortable: true,
      filterable: true,
      width: 150,
      render: (member, value) => (
        <span className="text-sm">{value || "-"}</span>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      filterable: true,
      filterComponent: { type: "date" },
      width: 120,
      render: (member, value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? formatDate(value) : "-"}
        </span>
      ),
      exportRender: (member, value) => (value ? formatDate(value) : ""),
    },
  ];

  // Statistics
  const stats = useMemo(() => {
    return members.reduce(
      (acc, member) => {
        const type = member.membership_type.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        acc.total++;
        acc.approved += member.certificate_status === "Approved" ? 1 : 0;
        acc.compliant += member.incompliance ? 1 : 0;
        acc.pending += member.application_status === "Pending" ? 1 : 0;
        acc.verified += member.verified ? 1 : 0;
        return acc;
      },
      {
        total: 0,
        approved: 0,
        compliant: 0,
        pending: 0,
        verified: 0,
        "full member": 0,
        "associate member": 0,
        "student member": 0,
        "honorary member": 0,
        "corporate member": 0,
      } as Record<string, number>
    );
  }, [members]);

  // Bulk actions with Lucide icons
  const bulkActions = [
    {
      label: "Export Selected",
      action: (selectedMembers: Member[]) => {
        console.log("Exporting selected members:", selectedMembers);
        showSuccessToast(`Exporting ${selectedMembers.length} members`);
      },
      icon: <Download className="h-4 w-4" />,
    },
    {
      label: "Send Email",
      action: (selectedMembers: Member[]) => {
        console.log("Sending email to:", selectedMembers);
        showSuccessToast(`Email sent to ${selectedMembers.length} members`);
      },
      icon: <Mail className="h-4 w-4" />,
    },
  ];

  // ============================================================================
  // SKELETON LOADER
  // ============================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            </div>

            {/* Table Body Skeleton */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <th key={i} className="px-6 py-3 text-left">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          </div>
                        </div>
                      </td>
                      {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Skeleton */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
              Error Loading Members
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
            <button
              onClick={fetchMembers}
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
        {/* Header with Refresh Button */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Members
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and view organization members
              </p>
            </div>

            <button
              onClick={fetchMembers}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards with Icons */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </div>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Members
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.approved}
              </div>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.compliant}
              </div>
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compliant
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.verified}
              </div>
              <UserCheck className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats["full member"] || 0}
              </div>
              <UserPlus className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full Members
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.pending || 0}
              </div>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>
        </div>

        {/* Enhanced Table */}
        <BaseTable
          data={processedMembers}
          columns={columns}
          loading={loading}
          title="Members Directory"
          exportFileName="members"
          searchable={true}
          searchFields={[
            "fullName",
            "membership_number",
            "country_of_residency",
          ]}
          pagination={true}
          pageSize={25}
          onRowClick={(member) => router.push(`/members/${member.id}`)}
          emptyMessage="No members found matching your criteria"
          enableExcelExport={true}
          enablePDFExport={true}
          enableBulkSelection={true}
          bulkActions={bulkActions}
          virtualScrolling={members.length > 100}
          enableColumnManagement={true}
          stickyHeader={true}
          className="shadow-lg"
        />
      </div>
    </div>
  );
}