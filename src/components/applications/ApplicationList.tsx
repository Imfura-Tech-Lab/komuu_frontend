"use client";

import { useMemo, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Menu, Transition } from "@headlessui/react";
import {
  EyeIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  XCircleIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/24/solid";
import { Application } from "@/types";
import { BaseTable, BaseTableColumn } from "@/components/ui/BaseTable";
import { useApplicationActions } from "@/lib/hooks/useApplicationActions";

interface ApplicationListProps {
  applications: Application[];
  filteredApplications: Application[];
  userRole: string;
  getStatusColor: (status: string) => string;
  formatDate: (date: string) => string;
  formatBoolean: (value: boolean) => string;
  onGeneratePDF: (application: Application) => Promise<void>;
  onViewDetails?: (application: Application) => void;
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const getConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("approved") || statusLower.includes("generated")) {
      return {
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: CheckCircleIcon,
        dotColor: "bg-emerald-500",
      };
    }
    if (statusLower.includes("pending")) {
      return {
        color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        icon: ClockIcon,
        dotColor: "bg-amber-500",
      };
    }
    if (statusLower.includes("rejected")) {
      return {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircleIcon,
        dotColor: "bg-red-500",
      };
    }
    return {
      color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      icon: ClockIcon,
      dotColor: "bg-gray-500",
    };
  };

  const config = getConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {status}
    </span>
  );
}

// Payment Badge Component
function PaymentBadge({ isPaid }: { isPaid: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        isPaid
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
      }`}
    >
      {isPaid ? (
        <>
          <CheckCircleSolid className="w-3.5 h-3.5" />
          Paid
        </>
      ) : (
        <>
          <ClockIcon className="w-3.5 h-3.5" />
          Unpaid
        </>
      )}
    </span>
  );
}

// Action Dropdown Component
function ActionDropdown({
  application,
  canApprove,
  canSign,
  canDelete,
  onView,
  onGeneratePDF,
  onApprove,
  onSign,
  onDelete,
  loading,
}: {
  application: Application;
  canApprove: boolean;
  canSign: boolean;
  canDelete: boolean;
  onView: () => void;
  onGeneratePDF: () => void;
  onApprove: () => void;
  onSign: () => void;
  onDelete: () => void;
  loading: string | null;
}) {
  const statusLower = application.application_status.toLowerCase();
  const canApproveApp = canApprove && !statusLower.includes("approved") && !statusLower.includes("generated");
  const canSignApp = canSign && statusLower.includes("approved") && !statusLower.includes("generated");

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        disabled={!!loading}
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none overflow-hidden">
          <div className="py-1">
            {/* View Details */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onView}
                  className={`${
                    active ? "bg-gray-50 dark:bg-gray-700" : ""
                  } flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200`}
                >
                  <EyeIcon className="w-4 h-4 text-gray-400" />
                  View Details
                </button>
              )}
            </Menu.Item>

            {/* Generate PDF */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onGeneratePDF}
                  className={`${
                    active ? "bg-gray-50 dark:bg-gray-700" : ""
                  } flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200`}
                >
                  <DocumentArrowDownIcon className="w-4 h-4 text-gray-400" />
                  Export PDF
                </button>
              )}
            </Menu.Item>

            {/* Action Divider */}
            {(canApproveApp || canSignApp || canDelete) && (
              <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            )}

            {/* Approve */}
            {canApproveApp && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onApprove}
                    disabled={loading === "approving"}
                    className={`${
                      active ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                    } flex w-full items-center gap-3 px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 disabled:opacity-50`}
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    {loading === "approving" ? "Approving..." : "Approve Application"}
                  </button>
                )}
              </Menu.Item>
            )}

            {/* Sign Certificate */}
            {canSignApp && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onSign}
                    disabled={loading === "signing"}
                    className={`${
                      active ? "bg-purple-50 dark:bg-purple-900/20" : ""
                    } flex w-full items-center gap-3 px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 disabled:opacity-50`}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    {loading === "signing" ? "Signing..." : "Sign Certificate"}
                  </button>
                )}
              </Menu.Item>
            )}

            {/* Delete */}
            {canDelete && (
              <>
                {(canApproveApp || canSignApp) && (
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onDelete}
                      disabled={loading === "deleting"}
                      className={`${
                        active ? "bg-red-50 dark:bg-red-900/20" : ""
                      } flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 disabled:opacity-50`}
                    >
                      <TrashIcon className="w-4 h-4" />
                      {loading === "deleting" ? "Deleting..." : "Delete Application"}
                    </button>
                  )}
                </Menu.Item>
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default function ApplicationList({
  applications,
  filteredApplications,
  userRole,
  getStatusColor,
  formatDate,
  formatBoolean,
  onGeneratePDF,
  onViewDetails,
}: ApplicationListProps) {
  const router = useRouter();
  const {
    approveApplication,
    signCertificate,
    deleteApplication,
    loadingActions,
  } = useApplicationActions();

  // Permission checks
  const isPresident = userRole === "President";
  const isAdmin = userRole === "Administrator";
  const isMember = userRole === "Member";
  const canApprove = isAdmin;
  const canSign = isPresident;
  const canDelete = isAdmin;

  const handleViewDetails = (application: Application) => {
    // If custom handler provided (for members), use it
    if (onViewDetails) {
      onViewDetails(application);
    } else {
      // Default: navigate to detail page (for admin/staff)
      router.push(`/applications/${application.id}`);
    }
  };

  // Column definitions for BaseTable
  const columns = useMemo<BaseTableColumn<Application>[]>(() => {
    const baseColumns: BaseTableColumn<Application>[] = [
      {
        key: "member_details.name",
        label: "Applicant",
        sortable: true,
        filterable: true,
        width: 280,
        render: (item) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {item.member_details?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.member_details?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {item.member_details?.email || "N/A"}
              </p>
            </div>
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
            { label: "Certificate Generated", value: "certificate generated" },
          ],
        },
        width: 180,
        render: (item) => <StatusBadge status={item.application_status} />,
      },
      {
        key: "membership_type",
        label: "Type",
        sortable: true,
        filterable: true,
        width: 150,
        render: (item) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
            {item.membership_type}
          </span>
        ),
      },
      {
        key: "application_date",
        label: "Applied",
        sortable: true,
        filterable: true,
        filterComponent: { type: "date" },
        width: 130,
        render: (item) => (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4" />
            {formatDate(item.application_date)}
          </div>
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
        width: 100,
        render: (item) => {
          const isPaid = item.payments && item.payments.length > 0;
          return <PaymentBadge isPaid={isPaid} />;
        },
        exportRender: (item) =>
          item.payments && item.payments.length > 0 ? "Paid" : "Unpaid",
      },
    ];

    // Only show actions column for non-members
    if (!isMember) {
      baseColumns.push({
        key: "actions",
        label: "",
        sortable: false,
        filterable: false,
        width: 60,
        render: (item) => {
          const currentLoading = loadingActions[item.id];

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <ActionDropdown
                application={item}
                canApprove={canApprove}
                canSign={canSign}
                canDelete={canDelete}
                onView={() => handleViewDetails(item)}
                onGeneratePDF={() => onGeneratePDF(item)}
                onApprove={() => approveApplication(item)}
                onSign={() => signCertificate(item)}
                onDelete={() => deleteApplication(item)}
                loading={currentLoading}
              />
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [
    canApprove,
    canSign,
    canDelete,
    isMember,
    formatDate,
    onGeneratePDF,
    loadingActions,
    approveApplication,
    signCertificate,
    deleteApplication,
  ]);

  // Bulk actions (only for non-members)
  const bulkActions = useMemo(() => {
    if (isMember) return [];

    const actions = [];

    if (canApprove) {
      actions.push({
        label: "Approve Selected",
        icon: <CheckCircleIcon className="w-4 h-4" />,
        action: async (selectedItems: Application[]) => {
          const pendingItems = selectedItems.filter(
            (item) => !item.application_status.toLowerCase().includes("approved")
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
        label: "Sign Certificates",
        icon: <PencilSquareIcon className="w-4 h-4" />,
        action: async (selectedItems: Application[]) => {
          const approvedItems = selectedItems.filter((item) => {
            const status = item.application_status.toLowerCase();
            return status.includes("approved") && !status.includes("generated");
          });

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
        icon: <TrashIcon className="w-4 h-4" />,
        action: async (selectedItems: Application[]) => {
          if (
            confirm(
              `Delete ${selectedItems.length} application${
                selectedItems.length > 1 ? "s" : ""
              }? This action cannot be undone.`
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
  }, [
    isMember,
    canApprove,
    canSign,
    canDelete,
    approveApplication,
    signCertificate,
    deleteApplication,
  ]);

  return (
    <BaseTable
      data={filteredApplications}
      columns={columns}
      title={isMember ? "My Application" : "Applications"}
      exportFileName="applications"
      searchable={!isMember}
      searchFields={[
        "member_details.name",
        "member_details.email",
        "application_status",
        "membership_type",
      ]}
      pagination={!isMember}
      pageSize={10}
      onRowClick={(item) => handleViewDetails(item)}
      emptyMessage={
        isMember
          ? "You haven't submitted any applications yet."
          : "No applications found matching your filters."
      }
      enableExcelExport={!isMember}
      enablePDFExport={!isMember}
      enableBulkSelection={!isMember && (canApprove || canSign || canDelete)}
      bulkActions={bulkActions}
      enableColumnManagement={!isMember}
      stickyHeader={true}
      rowKey="id"
    />
  );
}