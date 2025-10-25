"use client";

import React, { useState } from "react";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { BaseTable } from "../ui/BaseTable";
import { useTeams } from "@/lib/hooks/useTeams";
import { CreateMemberModal } from "./modals/CreateMemberModal";
import { TeamActionsModal } from "./modals/TeamActionsModal";

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const {
    teams,
    loading,
    error,
    pagination,
    fetchTeams,
    addTeamMember,
    blockMemberAccess,
    activateMemberAccess,
    sendPasswordResetLink,
    deleteTeamMember,
  } = useTeams();

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.lead?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.phone &&
        team.phone.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || team.status === statusFilter;

    const matchesRole = roleFilter === "all" || team.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleMemberActions = (member: any) => {
    setSelectedMember(member);
    setShowActionsModal(true);
  };

  const columns = [
    {
      key: "name",
      label: "Member",
      sortable: true,
      render: (item: any) => (
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0 h-10 w-10 bg-[#00B5A5] rounded-lg flex items-center justify-center">
            <UserCircleIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.name || "Unknown"}
              </span>
              {item.verified && (
                <CheckCircleIcon
                  className="h-4 w-4 text-green-500 flex-shrink-0"
                  title="Verified"
                />
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {item.email || "No email"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (item: any) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {item.role || "N/A"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Contact",
      sortable: true,
      render: (item: any) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {item.phone || "N/A"}
        </span>
      ),
    },
    {
      key: "hasChangedPassword",
      label: "Password",
      render: (item: any) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.hasChangedPassword
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
          }`}
        >
          {item.hasChangedPassword ? "Changed" : "Default"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (item: any) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {item.status || "inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: any) => (
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMemberActions(item);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="More Actions"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const handleRefresh = async () => {
    await fetchTeams(pagination?.currentPage || 1);
    setIsDropdownOpen(false);
  };

  const handleCreateMember = () => {
    setShowCreateModal(true);
    setIsDropdownOpen(false);
  };

  const handleDeleteMember = async (memberId: number) => {
    await deleteTeamMember(memberId);
    await fetchTeams(pagination?.currentPage || 1);
  };

  const handleBlockAccess = async (memberId: number): Promise<boolean> => {
    try {
      const success = await blockMemberAccess(memberId);
      if (success) {
        await fetchTeams(pagination?.currentPage || 1);
      }
      return success;
    } catch (error) {
      return false;
    }
  };

  const handleActivateAccess = async (memberId: number): Promise<boolean> => {
    try {
      const success = await activateMemberAccess(memberId);
      if (success) {
        await fetchTeams(pagination?.currentPage || 1);
      }
      return success;
    } catch (error) {
      return false;
    }
  };

  const handleSendPasswordReset = async (
    memberId: number
  ): Promise<boolean> => {
    try {
      const success = await sendPasswordResetLink(memberId);
      return success;
    } catch (error) {
      return false;
    }
  };

const handleCreateMemberSubmit = async (memberData: any): Promise<boolean> => {
  try {
    await addTeamMember(memberData);
    setShowCreateModal(false);
    await fetchTeams(pagination?.currentPage || 1);
    return true;
  } catch (error) {
    console.error('Failed to add member:', error);
    return false;
  }
};

  const uniqueRoles = Array.from(
    new Set(teams.map((team) => team.role).filter(Boolean))
  );

  const totalMembers = teams.length;
  const activeMembers = teams.filter((team) => team.status === "active").length;
  const verifiedMembers = teams.filter((team) => team.verified).length;
  const passwordChangedMembers = teams.filter(
    (team) => team.hasChangedPassword
  ).length;

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your team members and their permissions
            </p>
          </div>

          <div className="mt-4 sm:mt-0 relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors shadow-sm"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Actions
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-3" />
                    Refresh List
                  </button>
                  <button
                    onClick={handleCreateMember}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserPlusIcon className="h-5 w-5 mr-3" />
                    Add Member
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Click outside to close dropdown */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Members
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalMembers}
                </p>
              </div>
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Members
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {activeMembers}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verified
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {verifiedMembers}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Password Changed
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {passwordChangedMembers}
                </p>
              </div>
              <svg
                className="h-8 w-8 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 w-full relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Members Table */}
        {filteredTeams.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <BaseTable
              columns={columns}
              data={filteredTeams}
              searchable={false}
              pagination={false}
              enableExcelExport={true}
              enablePDFExport={true}
              rowKey="id"
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow text-center py-12">
            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No members found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {teams.length === 0
                ? "No team members have been added yet."
                : "Try adjusting your search or filters"}
            </p>
            {teams.length === 0 && (
              <button
                onClick={handleCreateMember}
                className="mt-4 inline-flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Your First Member
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.lastPage > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{pagination.from}</span> to{" "}
              <span className="font-medium">{pagination.to}</span> of{" "}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchTeams(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="hidden sm:flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {pagination.currentPage} of {pagination.lastPage}
              </div>
              <button
                onClick={() => fetchTeams(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateMemberModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateMemberSubmit}
      />

      <TeamActionsModal
        isOpen={showActionsModal}
        onClose={() => {
          setShowActionsModal(false);
          setSelectedMember(null);
        }}
        team={selectedMember}
        onDelete={handleDeleteMember}
        onBlockAccess={handleBlockAccess}
        onActivateAccess={handleActivateAccess}
        onSendPasswordReset={handleSendPasswordReset}
      />
    </>
  );
}
