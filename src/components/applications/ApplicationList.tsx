"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  FileText, 
  PenTool, 
  CheckCircle, 
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Application } from "@/types";
import { BaseTable, BaseTableColumn } from "@/components/ui/BaseTable";
import { useApplicationActions } from "@/lib/hooks/useApplicationActions";
import { Dropdown, DropdownItem, DropdownSeparator } from "../ui/Dropdown";

interface ApplicationListProps {
  applications: Application[];
  filteredApplications: Application[];
  userRole: string;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
  formatBoolean: (value: boolean) => string;
  onGeneratePDF: (application: Application) => Promise<void>;
}

export default function ApplicationList({
  applications,
  filteredApplications,
  userRole,
  getStatusColor,
  formatDate,
  formatBoolean,
  onGeneratePDF,
}: ApplicationListProps) {
  const router = useRouter();
  const {
    approveApplication,
    signCertificate,
    deleteApplication,
    loadingActions,
    isLoading,
  } = useApplicationActions();

  // Permission checks
  const isPresident = userRole === "President";
  const isAdmin = userRole === "Administrator";
  const canApprove = isAdmin;
  const canSign = isPresident;
  const canDelete = isAdmin;

  // Navigate to application details
  const handleViewDetails = (applicationId: string) => {
    router.push(`/applications/${applicationId}`);
  };

  // Column definitions
  const columns = useMemo<BaseTableColumn<Application>[]>(() => {
    const baseColumns: BaseTableColumn<Application>[] = [
      {
        key: "member_details.name",
        label: "Applicant",
        sortable: true,
        filterable: true,
        width: 250,
        render: (item) => (
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {item.member_details?.name || "N/A"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {item.member_details?.email || "N/A"}
            </p>
          </div>
        ),
        exportRender: (item) => item.member_details?.name || "N/A",
      },
      {
        key: "application_status",
        label: "Status",
        sortable: true,
        filterable: true,
        filterComponent: {
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ],
        },
        width: 150,
        render: (item) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              item.application_status
            )}`}
          >
            {item.application_status}
          </span>
        ),
      },
      {
        key: "membership_type",
        label: "Type",
        sortable: true,
        filterable: true,
        width: 150,
      },
      {
        key: "application_date",
        label: "Application Date",
        sortable: true,
        filterable: true,
        filterComponent: { type: "date" },
        width: 150,
        render: (item) => (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(item.application_date)}
          </span>
        ),
        exportRender: (item) => formatDate(item.application_date),
      },
      {
        key: "payments",
        label: "Payment",
        sortable: true,
        filterable: true,
        filterComponent: {
          type: "select",
          options: [
            { label: "Paid", value: "paid" },
            { label: "Unpaid", value: "unpaid" },
          ],
        },
        width: 120,
        render: (item) => {
          const isPaid = item.payments && item.payments.length > 0;
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isPaid
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {isPaid ? "Paid" : "Unpaid"}
            </span>
          );
        },
        exportRender: (item) =>
          item.payments && item.payments.length > 0 ? "Paid" : "Unpaid",
      },
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        filterable: false,
        width: 80,
        render: (item) => {
          const currentLoading = loadingActions[item.id];
          const canApproveApp =
            canApprove && item.application_status.toLowerCase() !== "approved";
          const canSignApp =
            canSign && item.application_status.toLowerCase() === "approved";

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Dropdown
                align="right"
                trigger={
                  <button
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    title="Actions"
                    disabled={!!currentLoading}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                }
              >
                <DropdownItem
                  onClick={() => handleViewDetails(item.id)}
                  className="text-gray-700 dark:text-gray-300"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </DropdownItem>

                <DropdownItem
                  onClick={() => onGeneratePDF(item)}
                  className="text-gray-700 dark:text-gray-300"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Generate PDF
                </DropdownItem>

                {(canApproveApp || canSignApp || canDelete) && (
                  <DropdownSeparator />
                )}

                {canApproveApp && (
                  <DropdownItem
                    onClick={() => approveApplication(item)}
                    disabled={currentLoading === "approving"}
                    className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <CheckCircle className="w-4 h-4 mr-3" />
                    {currentLoading === "approving"
                      ? "Approving..."
                      : "Approve Application"}
                  </DropdownItem>
                )}

                {canSignApp && (
                  <DropdownItem
                    onClick={() => signCertificate(item)}
                    disabled={currentLoading === "signing"}
                    className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <PenTool className="w-4 h-4 mr-3" />
                    {currentLoading === "signing"
                      ? "Signing..."
                      : "Sign Certificate"}
                  </DropdownItem>
                )}

                {canDelete && (
                  <>
                    {(canApproveApp || canSignApp) && <DropdownSeparator />}
                    <DropdownItem
                      onClick={() => deleteApplication(item)}
                      disabled={currentLoading === "deleting"}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      {currentLoading === "deleting"
                        ? "Deleting..."
                        : "Delete Application"}
                    </DropdownItem>
                  </>
                )}
              </Dropdown>
            </div>
          );
        },
      },
    ];

    return baseColumns;
  }, [
    canApprove,
    canSign,
    canDelete,
    formatDate,
    getStatusColor,
    onGeneratePDF,
    loadingActions,
    approveApplication,
    signCertificate,
    deleteApplication,
  ]);

  // Bulk actions for admin
  const bulkActions = useMemo(() => {
    const actions = [];

    if (canApprove) {
      actions.push({
        label: "Approve Selected",
        icon: <CheckCircle className="w-4 h-4" />,
        action: async (selectedItems: Application[]) => {
          const pendingItems = selectedItems.filter(
            (item) => item.application_status.toLowerCase() !== "approved"
          );

          if (pendingItems.length === 0) {
            return;
          }

          if (
            confirm(
              `Approve ${pendingItems.length} application${
                pendingItems.length > 1 ? "s" : ""
              }?`
            )
          ) {
            for (const item of pendingItems) {
              await approveApplication(item);
            }
          }
        },
      });
    }

    if (canSign) {
      actions.push({
        label: "Sign Selected Certificates",
        icon: <PenTool className="w-4 h-4" />,
        action: async (selectedItems: Application[]) => {
          const approvedItems = selectedItems.filter(
            (item) => item.application_status.toLowerCase() === "approved"
          );

          if (approvedItems.length === 0) {
            return;
          }

          if (
            confirm(
              `Sign ${approvedItems.length} certificate${
                approvedItems.length > 1 ? "s" : ""
              }?`
            )
          ) {
            for (const item of approvedItems) {
              await signCertificate(item);
            }
          }
        },
      });
    }

    if (canDelete) {
      actions.push({
        label: "Delete Selected",
        icon: <Trash2 className="w-4 h-4" />,
        action: async (selectedItems: Application[]) => {
          if (
            confirm(
              `Delete ${selectedItems.length} application${
                selectedItems.length > 1 ? "s" : ""
              }?`
            )
          ) {
            for (const item of selectedItems) {
              await deleteApplication(item);
            }
          }
        },
      });
    }

    return actions;
  }, [canApprove, canSign, canDelete, approveApplication, signCertificate, deleteApplication]);

  return (
    <BaseTable
      data={filteredApplications}
      columns={columns}
      title="Applications"
      exportFileName="applications"
      searchable={true}
      searchFields={[
        "member_details.name",
        "member_details.email",
        "application_status",
        "membership_type",
      ]}
      pagination={true}
      pageSize={10}
      onRowClick={undefined}
      emptyMessage="No applications found matching your filters."
      enableExcelExport={true}
      enablePDFExport={true}
      enableBulkSelection={canApprove || canSign || canDelete}
      bulkActions={bulkActions}
      enableColumnManagement={true}
      stickyHeader={true}
      rowKey="id"
    />
  );
}