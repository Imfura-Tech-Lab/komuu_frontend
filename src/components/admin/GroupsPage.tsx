"use client";

import React, { useEffect, useState } from "react";
import {
  UserGroupIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { BaseTable, BaseTableColumn } from "../ui/BaseTable";
import {
  useGroups,
  Group,
  CreateGroupParams,
  UpdateGroupParams,
} from "@/lib/hooks/useGroups";
import { GroupModal, GroupFormData } from "./modals/GroupModal";
import { AddMemberModal } from "./modals/AddMemberModal";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";

import { useTeams, Team } from "@/lib/hooks/useTeams";


const TableSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
    <div className="animate-pulse">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function GroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<
    string | null
  >(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    groups,
    loading,
    error,
    pagination,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember,
    blockMember,
  } = useGroups();

  const { 
    teams: availableMembers,
    loading: membersLoading,
    fetchTeams: fetchAvailableMembers
  } = useTeams();

  useEffect(() => {
    fetchGroups(1);
    fetchAvailableMembers(1);
  }, []);

  const handlePageRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        fetchGroups(pagination.currentPage),
        fetchAvailableMembers(1)
      ]);
      showSuccessToast("Page refreshed successfully");
    } catch (error) {
      showErrorToast("Failed to refresh page");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateGroup = async (formData: GroupFormData) => {
    try {
      const createParams: CreateGroupParams = {
        name: formData.name,
        description: formData.description,
      };

      const result = await createGroup(createParams);
      if (result) {
        showSuccessToast("Group created successfully");
        setShowCreateModal(false);
      }
    } catch (error) {}
  };

  const handleEditGroup = async (formData: GroupFormData) => {
    if (!selectedGroup) return;

    try {
      setActionLoading(selectedGroup.slug);
      const updateParams: UpdateGroupParams = {
        slug: selectedGroup.slug,
        name: formData.name,
        description: formData.description,
      };

      const result = await updateGroup(updateParams);
      if (result) {
        showSuccessToast("Group updated successfully");
        setShowEditModal(false);
        setSelectedGroup(null);
      }
    } catch (error) {
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteGroup = async (slug: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this group? This action cannot be undone."
      )
    )
      return;

    try {
      setActionLoading(slug);
      await deleteGroup(slug);
      showSuccessToast("Group deleted successfully");
    } catch (error) {
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenAddMemberModal = (slug: string) => {
    setSelectedGroupForMembers(slug);
    setShowAddMemberModal(true);
  };

  const handleAddMembers = async (memberIds: number[]) => {
    if (!selectedGroupForMembers) return;

    try {
      setActionLoading(`add-member-${selectedGroupForMembers}`);

      for (const memberId of memberIds) {
        await addMember({
          slug: selectedGroupForMembers,
          memberId: memberId.toString(),
          role: "Member",
        });
      }

      showSuccessToast(`${memberIds.length} member(s) added successfully`);
      setShowAddMemberModal(false);
      setSelectedGroupForMembers(null);
      fetchGroups(pagination.currentPage);
      fetchAvailableMembers(1);
    } catch (error) {
      showErrorToast("Failed to add members to group");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewGroup = (group: Group) => {
    console.log("View group:", group);
  };

  const handleRowClick = (group: Group) => {
    setSelectedGroup(group);
  };

  const totalGroups = groups.length;
  const totalMembers = groups.reduce((sum, group) => sum + group.members, 0);
  const publicGroups = groups.filter((g) => g.privacy === "Public").length;
  const highActivityGroups = groups.filter((g) => g.activity === "High").length;

  const columns: BaseTableColumn<Group>[] = [
    {
      key: "name",
      label: "Group Name",
      sortable: true,
      filterable: true,
      render: (group) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#00B5A5] to-[#008f82] flex items-center justify-center">
              <UserGroupIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {group.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {group.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      sortable: false,
      filterable: true,
      render: (group) => (
        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
          {group.description}
        </div>
      ),
    },
    {
      key: "members",
      label: "Members",
      sortable: true,
      render: (group) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {group.members}
        </div>
      ),
    },
    {
      key: "privacy",
      label: "Privacy",
      sortable: true,
      filterable: true,
      render: (group) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            group.privacy === "Public"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {group.privacy}
        </span>
      ),
    },
    {
      key: "activity",
      label: "Activity",
      sortable: true,
      render: (group) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            group.activity === "High"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : group.activity === "Medium"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {group.activity}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (group) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewGroup(group);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            title="View Group"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedGroup(group);
              setShowEditModal(true);
            }}
            disabled={actionLoading === group.slug}
            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:opacity-50"
            title="Edit Group"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenAddMemberModal(group.slug);
            }}
            disabled={actionLoading === `add-member-${group.slug}`}
            className="text-green-400 hover:text-green-600 dark:hover:text-green-300 disabled:opacity-50"
            title="Add Member"
          >
            <UserPlusIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteGroup(group.slug);
            }}
            disabled={actionLoading === group.slug}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-300 disabled:opacity-50"
            title="Delete Group"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const getEditInitialData = (): GroupFormData | undefined => {
    if (!selectedGroup) return undefined;
    return {
      name: selectedGroup.name,
      description: selectedGroup.description,
      category: selectedGroup.category,
      privacy: selectedGroup.privacy,
    };
  };

  const bulkActions = [
    {
      label: "Delete Selected",
      action: async (selectedRows: Group[]) => {
        if (
          !confirm(
            `Are you sure you want to delete ${selectedRows.length} group(s)? This action cannot be undone.`
          )
        )
          return;

        try {
          setActionLoading("bulk-delete");
          await Promise.all(
            selectedRows.map((group) => deleteGroup(group.slug))
          );
          showSuccessToast(
            `${selectedRows.length} group(s) deleted successfully`
          );
        } catch (error) {
          showErrorToast("Failed to delete some groups");
        } finally {
          setActionLoading(null);
        }
      },
      className: "text-red-600 hover:text-red-700",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Groups Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your organization groups and members
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading || isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008f82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Group
          </button>

          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button
                disabled={loading || isRefreshing}
                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 disabled:opacity-50"
              >
                Actions
                <EllipsisVerticalIcon
                  className="-mr-1 ml-2 h-5 w-5"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        disabled={loading}
                      >
                        <PlusIcon className="mr-3 h-4 w-4" />
                        Create New Group
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handlePageRefresh}
                        className={`${
                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                        } flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                        disabled={isRefreshing || loading}
                      >
                        <ArrowPathIcon
                          className={`mr-3 h-4 w-4 ${
                            isRefreshing ? "animate-spin" : ""
                          }`}
                        />
                        Refresh Page
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Groups
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalGroups}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Members
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalMembers}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Public Groups
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {publicGroups}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              High Activity
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {highActivityGroups}
            </p>
          </div>
        </div>
      )}

      {loading || isRefreshing ? (
        <TableSkeleton />
      ) : (
        <BaseTable<Group>
          data={groups}
          columns={columns}
          loading={loading}
          title="Groups"
          exportFileName="groups-export"
          searchable={true}
          searchFields={["name", "description", "category"]}
          pagination={false}
          onRowClick={handleRowClick}
          emptyMessage="No groups found. Create your first group to get started."
          enableExcelExport={true}
          enablePDFExport={true}
          enableBulkSelection={true}
          bulkActions={bulkActions}
          enableColumnManagement={true}
          stickyHeader={true}
          rowKey="slug"
          className="shadow-lg"
        />
      )}

      {!loading && pagination.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              groups
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchGroups(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === pagination.lastPage ||
                      Math.abs(page - pagination.currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => fetchGroups(page)}
                          disabled={loading}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            page === pagination.currentPage
                              ? "bg-[#00B5A5] text-white"
                              : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => fetchGroups(pagination.currentPage + 1)}
                disabled={
                  pagination.currentPage === pagination.lastPage || loading
                }
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <GroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        mode="create"
        loading={loading}
      />

      <GroupModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGroup(null);
        }}
        onSubmit={handleEditGroup}
        mode="edit"
        initialData={getEditInitialData()}
        loading={actionLoading === selectedGroup?.slug}
      />

      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setSelectedGroupForMembers(null);
        }}
        onAddMembers={handleAddMembers}
        loading={actionLoading !== null}
        slug={selectedGroupForMembers || ""}
        availableMembers={availableMembers}
        membersLoading={membersLoading}
      />
    </div>
  );
}