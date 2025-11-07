"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChatBubbleLeftIcon,
  UsersIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  EyeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { BaseTable, BaseTableColumn } from "../ui/BaseTable";
import {
  useMemberGroups,
  MemberGroup,
} from "@/lib/hooks/use-member-groups";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { ViewGroupModal } from "../admin/modals/ViewGroupModal";

const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      </div>
      <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </div>
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

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
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

type ViewTab = "all" | "joined";

export default function MemberGroupsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [activeTab, setActiveTab] = useState<ViewTab>("all");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<MemberGroup | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingGroupDetails, setIsLoadingGroupDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrivacy, setFilterPrivacy] = useState<string>("all");
  const [filterActivity, setFilterActivity] = useState<string>("all");

  const {
    groups,
    joinedGroups,
    loading,
    error,
    pagination,
    fetchAllGroups,
    fetchJoinedGroups,
    fetchGroup,
    joinGroup,
    leaveGroup,
  } = useMemberGroups();

  useEffect(() => {
    fetchAllGroups(1);
    fetchJoinedGroups(1);
  }, []);

  const handlePageRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        fetchAllGroups(pagination.currentPage),
        fetchJoinedGroups(1),
      ]);
      showSuccessToast("Page refreshed successfully");
    } catch (error) {
      showErrorToast("Failed to refresh page");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleJoinGroup = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setActionLoading(slug);
      const success = await joinGroup(slug);
      if (success) {
        showSuccessToast("Successfully joined the group");
      }
    } catch (error) {
      showErrorToast("Failed to join group");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveGroup = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure you want to leave this group? You can rejoin anytime."
      )
    )
      return;

    try {
      setActionLoading(slug);
      const success = await leaveGroup(slug);
      if (success) {
        showSuccessToast("Successfully left the group");
      }
    } catch (error) {
      showErrorToast("Failed to leave group");
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewModal = async (group: MemberGroup) => {
    setSelectedGroup(group);
    setShowViewModal(true);

    setIsLoadingGroupDetails(true);
    try {
      const detailedGroup = await fetchGroup(group.slug);
      if (detailedGroup) {
        setSelectedGroup(detailedGroup);
      }
    } catch (error) {
      showErrorToast("Failed to load group details");
    } finally {
      setIsLoadingGroupDetails(false);
    }
  };

  const handleGoToPage = (group: MemberGroup) => {
    router.push(`/member/groups/${group.slug}`);
  };

  const handleRowClick = (group: MemberGroup) => {
    router.push(`/member/groups/${group.slug}`);
  };

  const handleTabChange = (tab: ViewTab) => {
    setActiveTab(tab);
    if (tab === "all") {
      fetchAllGroups(1);
    } else {
      fetchJoinedGroups(1);
    }
  };

  const activeGroups = activeTab === "all" ? groups : joinedGroups;

  const filteredGroups = activeGroups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPrivacy =
      filterPrivacy === "all" || group.privacy === filterPrivacy;
    const matchesActivity =
      filterActivity === "all" || group.activity === filterActivity;

    return matchesSearch && matchesPrivacy && matchesActivity;
  });

  const totalGroups = groups.length;
  const myGroups = joinedGroups.length;
  const publicGroups = groups.filter((g) => g.privacy === "Public").length;

  const columns: BaseTableColumn<MemberGroup>[] = [
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
            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {group.name}
              {group.is_member && (
                <CheckCircleIcon className="h-4 w-4 text-[#00B5A5]" />
              )}
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
        <div className="flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewModal(group);
            }}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          {group.is_member ? (
            <button
              onClick={(e) => handleLeaveGroup(group.slug, e)}
              disabled={actionLoading === group.slug}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            >
              <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1" />
              Leave
            </button>
          ) : (
            <button
              onClick={(e) => handleJoinGroup(group.slug, e)}
              disabled={actionLoading === group.slug}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#00B5A5] border border-transparent rounded-md hover:bg-[#008f82] disabled:opacity-50"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
              Join
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Groups
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discover and join groups in your community
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePageRefresh}
            disabled={loading || isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`h-5 w-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-[#00B5A5]" />
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available Groups
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalGroups}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-[#00B5A5]" />
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  My Groups
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {myGroups}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex items-center">
              <ChatBubbleLeftIcon className="h-8 w-8 text-[#00B5A5]" />
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Public Groups
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {publicGroups}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabChange("all")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "all"
                  ? "border-[#00B5A5] text-[#00B5A5]"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              All Groups
            </button>
            <button
              onClick={() => handleTabChange("joined")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "joined"
                  ? "border-[#00B5A5] text-[#00B5A5]"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              My Groups ({myGroups})
            </button>
          </nav>
        </div>

        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-3">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filterPrivacy}
                onChange={(e) => setFilterPrivacy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Privacy</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>

              <select
                value={filterActivity}
                onChange={(e) => setFilterActivity(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Activity</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <div className="border-l border-gray-300 dark:border-gray-600 pl-3 flex items-center space-x-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-[#00B5A5] text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="Grid view"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md ${
                    viewMode === "table"
                      ? "bg-[#00B5A5] text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="Table view"
                >
                  <TableCellsIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading || isRefreshing ? (
        viewMode === "grid" ? (
          <GridSkeleton />
        ) : (
          <TableSkeleton />
        )
      ) : viewMode === "grid" ? (
        filteredGroups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No groups found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Try adjusting your search"
                : activeTab === "joined"
                ? "You haven't joined any groups yet"
                : "No groups available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <div
                key={group.slug}
                onClick={() => handleGoToPage(group)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#00B5A5] to-[#008f82] flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {group.name}
                          {group.is_member && (
                            <CheckCircleIcon className="h-5 w-5 text-[#00B5A5]" />
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {group.category}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.privacy === "Public"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {group.privacy}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
                    {group.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <UsersIcon className="h-4 w-4 mr-1" />
                        <span>{group.members}</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          group.activity === "High"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : group.activity === "Medium"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {group.activity}
                      </span>
                    </div>

                    {group.is_member ? (
                      <button
                        onClick={(e) => handleLeaveGroup(group.slug, e)}
                        disabled={actionLoading === group.slug}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1" />
                        Leave
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleJoinGroup(group.slug, e)}
                        disabled={actionLoading === group.slug}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#00B5A5] border border-transparent rounded-md hover:bg-[#008f82] disabled:opacity-50"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <BaseTable<MemberGroup>
          data={filteredGroups}
          columns={columns}
          loading={loading}
          title="Groups"
          exportFileName="member-groups-export"
          searchable={false}
          pagination={false}
          onRowClick={handleRowClick}
          emptyMessage={
            activeTab === "joined"
              ? "You haven't joined any groups yet. Browse available groups to get started."
              : "No groups found. Try adjusting your filters."
          }
          enableExcelExport={false}
          enablePDFExport={false}
          enableBulkSelection={false}
          enableColumnManagement={true}
          stickyHeader={true}
          rowKey="slug"
          className="shadow-lg"
        />
      )}

      {!loading && pagination.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {pagination.from} to {pagination.to} of {pagination.total}{" "}
              groups
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  activeTab === "all"
                    ? fetchAllGroups(pagination.currentPage - 1)
                    : fetchJoinedGroups(pagination.currentPage - 1)
                }
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
                          onClick={() =>
                            activeTab === "all"
                              ? fetchAllGroups(page)
                              : fetchJoinedGroups(page)
                          }
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
                onClick={() =>
                  activeTab === "all"
                    ? fetchAllGroups(pagination.currentPage + 1)
                    : fetchJoinedGroups(pagination.currentPage + 1)
                }
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

      <ViewGroupModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedGroup(null);
          setIsLoadingGroupDetails(false);
        }}
        group={selectedGroup}
        loading={isLoadingGroupDetails}
      />
    </div>
  );
}