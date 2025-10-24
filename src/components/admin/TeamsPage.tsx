"use client";

import React, { useState } from "react";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { BaseTable } from "../ui/BaseTable";
import { useTeams } from "@/lib/hooks/useTeams";
import { CreateMemberModal } from "./modals/CreateMemberModal";
import { CreateTeamModal } from "./modals/CreateTeamModal";
import { EditTeamModal } from "./modals/EditTeamModal";
import { TeamActionsModal } from "./modals/TeamActionsModal";

export default function TeamsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "createMember" | "createTeam" | "editTeam" | "teamActions" | null
  >(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const {
    teams,
    loading,
    error,
    pagination,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    blockMemberAccess,
    activateMemberAccess,
    sendPasswordResetLink,
    deleteTeamMember,
  } = useTeams();

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.lead.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || team.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "name",
      label: "Team",
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-[#00B5A5] rounded-lg flex items-center justify-center">
            <UserCircleIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {row.original.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.original.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "lead",
      label: "Team Lead",
      cell: ({ row }: { row: { original: any } }) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {row.original.lead}
        </span>
      ),
    },
    {
      key: "members",
      label: "Members",
      cell: ({ row }: { row: { original: any } }) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {row.original.members}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      cell: ({ row }: { row: { original: any } }) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.original.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      cell: ({ row }: { row: { original: any } }) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      cell: ({ row }: { row: { original: any } }) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleEditTeam(row.original)}
            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Edit Team"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => handleTeamActions(row.original)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="More Actions"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  const handleRefresh = async () => {
    await fetchTeams(pagination.currentPage);
    setIsDropdownOpen(false);
  };

  const handleCreateMember = () => {
    setActiveModal("createMember");
    setIsDropdownOpen(false);
  };

  const handleCreateTeam = () => {
    setActiveModal("createTeam");
  };

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team);
    setActiveModal("editTeam");
  };

  const handleTeamActions = (team: any) => {
    setSelectedTeam(team);
    setActiveModal("teamActions");
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (confirm("Are you sure you want to delete this team?")) {
      const success = await deleteTeam(teamId);
      if (success) {
        setActiveModal(null);
        setSelectedTeam(null);
      }
    }
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedTeam(null);
  };

  // Calculate stats from actual data
  const totalTeams = teams.length;
  const activeTeams = teams.filter((team) => team.status === "active").length;
  const totalMembers = teams.reduce((sum, team) => sum + team.members, 0);
  const avgTeamSize =
    totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teams
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage organizational teams and structures
            </p>
          </div>
          <div className="relative">
            <button
              disabled
              className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Loading skeleton for stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Loading skeleton for table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teams
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage organizational teams and structures
            </p>
          </div>
          <div className="relative">
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-red-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-red-800 dark:text-red-300 font-medium">
                Error Loading Teams
              </h3>
              <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchTeams()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teams
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage organizational teams and structures
            </p>
          </div>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-3" />
                    Refresh
                  </button>
                  <button
                    onClick={handleCreateMember}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-3" />
                    Create Member
                  </button>
                  <button
                    onClick={handleCreateTeam}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserPlusIcon className="h-4 w-4 mr-3" />
                    Create Team
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close dropdown when clicking outside */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setIsDropdownOpen(false)}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Teams
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalTeams}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active Teams
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTeams}
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
              Avg Team Size
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {avgTeamSize}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Teams Table */}
        {filteredTeams.length > 0 ? (
          <BaseTable columns={columns} data={filteredTeams} />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow text-center py-12">
            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No teams found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {teams.length === 0
                ? "No teams have been created yet."
                : "Try adjusting your search or filters"}
            </p>
            {teams.length === 0 && (
              <button
                onClick={handleCreateTeam}
                className="mt-4 px-4 py-2 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors"
              >
                Create Your First Team
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.lastPage > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(pagination.currentPage - 1) * pagination.perPage + 1} to{" "}
              {Math.min(
                pagination.currentPage * pagination.perPage,
                pagination.total
              )}{" "}
              of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchTeams(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => fetchTeams(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.lastPage}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateMemberModal
        isOpen={activeModal === "createMember"}
        onClose={closeModal}
        onSubmit={addTeamMember}
      />

      <CreateTeamModal
        isOpen={activeModal === "createTeam"}
        onClose={closeModal}
        onSubmit={createTeam}
      />

      <EditTeamModal
        isOpen={activeModal === "editTeam"}
        onClose={closeModal}
        onSubmit={updateTeam}
        team={selectedTeam}
      />

      <TeamActionsModal
        isOpen={activeModal === "teamActions"}
        onClose={closeModal}
        team={selectedTeam}
        onEdit={() => {
          setActiveModal("editTeam");
        }}
        onDelete={handleDeleteTeam}
        onBlockAccess={blockMemberAccess}
        onActivateAccess={activateMemberAccess}
        onSendPasswordReset={sendPasswordResetLink}
      />
    </>
  );
}
