"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftIcon,
  GlobeAltIcon,
  LockClosedIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  useMemberGroups,
  MemberGroup,
} from "@/lib/hooks/use-member-groups";
import {
  showSuccessToast,
  showErrorToast,
} from "@/components/layouts/auth-layer-out";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getAuthenticatedClient } from "@/lib/api-client";

const ADMIN_ROLES = ["Administrator", "President", "Board"];

// ============================================================================
// HELPERS
// ============================================================================

function fmtRelative(d: string): string {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function activityColor(a: string) {
  if (a === "High") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (a === "Medium") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
}

// ============================================================================
// SKELETON
// ============================================================================

const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" /><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /></div>)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" /></div>)}
    </div>
  </div>
);

// ============================================================================
// GROUP CARD
// ============================================================================

const GroupCard = ({ group, onClick, isActive, onJoin, onLeave, actionLoading }: {
  group: MemberGroup;
  onClick: () => void;
  isActive: boolean;
  onJoin: (slug: string) => void;
  onLeave: (slug: string) => void;
  actionLoading: string | null;
}) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-md transition-all cursor-pointer ${isActive ? "border-[#00B5A5] ring-1 ring-[#00B5A5]" : "border-gray-200 dark:border-gray-700"}`}
  >
    <div className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2.5 rounded-lg bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex-shrink-0">
          <UserGroupIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{group.name}</h3>
            {group.is_member && <CheckCircleIcon className="w-4 h-4 text-[#00B5A5] flex-shrink-0" />}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{group.category}</p>
        </div>
        <div className="flex items-center gap-1">
          {group.privacy === "Public" ? (
            <GlobeAltIcon className="w-4 h-4 text-green-500" />
          ) : (
            <LockClosedIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {group.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{group.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" />{group.members}</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${activityColor(group.activity)}`}>{group.activity}</span>
        </div>
        {group.is_member ? (
          <button
            onClick={(e) => { e.stopPropagation(); onLeave(group.slug); }}
            disabled={actionLoading === group.slug}
            className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 disabled:opacity-50"
          >
            Leave
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onJoin(group.slug); }}
            disabled={actionLoading === group.slug}
            className="text-xs font-medium text-[#00B5A5] hover:text-[#008F82] disabled:opacity-50"
          >
            Join
          </button>
        )}
      </div>
    </div>
  </div>
);

// ============================================================================
// GROUP DETAIL SHEET
// ============================================================================

const GroupSheet = ({ group, onClose, onJoin, onLeave, onOpen, onDelete, actionLoading, isAdmin }: {
  group: MemberGroup;
  onClose: () => void;
  onJoin: (slug: string) => void;
  onLeave: (slug: string) => void;
  onOpen: (slug: string) => void;
  onDelete?: (slug: string) => void;
  actionLoading: string | null;
  isAdmin?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex justify-end">
    <div className="absolute inset-0 bg-black/30" onClick={onClose} />
    <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">Group Details</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
      </div>

      <div className="p-6 space-y-6">
        {/* Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00B5A5] to-[#008F82] flex-shrink-0">
            <UserGroupIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{group.name}</h3>
              {group.is_member && <CheckCircleIcon className="w-5 h-5 text-[#00B5A5]" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{group.category}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${group.privacy === "Public" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                {group.privacy === "Public" ? <><GlobeAltIcon className="w-3 h-3 inline mr-0.5" />Public</> : <><LockClosedIcon className="w-3 h-3 inline mr-0.5" />Private</>}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${activityColor(group.activity)}`}>{group.activity} activity</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {group.description && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">About</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{group.description}</p>
          </div>
        )}

        {/* Stats */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Info</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{group.members}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{group.activity}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Activity</p>
            </div>
          </div>
        </div>

        {/* Created by */}
        {group.created_by?.name && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Created by</h4>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 rounded-full bg-[#00B5A5]/10 flex items-center justify-center">
                <span className="text-xs font-medium text-[#00B5A5]">{group.created_by.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-medium">{group.created_by.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{group.created_by.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Created date */}
        <div className="text-xs text-gray-400 dark:text-gray-500">
          Created {fmtRelative(group.created_at)}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
        {group.is_member && (
          <button
            onClick={() => onOpen(group.slug)}
            className="w-full py-2.5 text-sm font-medium rounded-lg text-white bg-[#00B5A5] hover:bg-[#008F82] transition-colors flex items-center justify-center gap-2"
          >
            <ChatBubbleLeftIcon className="w-4 h-4" />Open Group
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        )}
        {group.is_member ? (
          <button
            onClick={() => onLeave(group.slug)}
            disabled={actionLoading === group.slug}
            className="w-full py-2.5 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />Leave Group
          </button>
        ) : (
          <button
            onClick={() => onJoin(group.slug)}
            disabled={actionLoading === group.slug}
            className="w-full py-2.5 text-sm font-medium rounded-lg text-white bg-[#00B5A5] hover:bg-[#008F82] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />Join Group
          </button>
        )}
        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(group.slug)}
            className="w-full py-2 text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-1.5 mt-1"
          >
            <TrashIcon className="w-3.5 h-3.5" />Delete Group
          </button>
        )}
      </div>
    </div>
  </div>
);

// ============================================================================
// PAGINATION
// ============================================================================

const PaginationBar = ({ current, last, onChange }: { current: number; last: number; onChange: (p: number) => void }) => {
  if (last <= 1) return null;
  const pages: number[] = [];
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || Math.abs(i - current) <= 1) pages.push(i);
  }
  return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={() => onChange(current - 1)} disabled={current === 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Prev</button>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && <span className="px-1 text-gray-400">...</span>}
            <button onClick={() => onChange(p)} className={`px-3 py-1.5 text-sm rounded-lg ${p === current ? "bg-[#00B5A5] text-white" : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>{p}</button>
          </React.Fragment>
        );
      })}
      <button onClick={() => onChange(current + 1)} disabled={current === last} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">Next</button>
    </div>
  );
};

// ============================================================================
// MAIN
// ============================================================================

type TabId = "all" | "joined";

export default function MemberGroupsPage() {
  const router = useRouter();
  const [isAdmin] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const ud = JSON.parse(localStorage.getItem("user_data") || "{}");
      return ADMIN_ROLES.includes(ud.role);
    } catch {
      return false;
    }
  });
  const [tab, setTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const [filterPrivacy, setFilterPrivacy] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<MemberGroup | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const { groups, joinedGroups, loading, pagination, fetchAllGroups, fetchJoinedGroups, joinGroup, leaveGroup } = useMemberGroups();

  useEffect(() => {
    fetchAllGroups(1);
    if (!isAdmin) fetchJoinedGroups(1);
  }, [isAdmin]);

  const handleCreateGroup = async () => {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const client = getAuthenticatedClient();
      await client.post("community/groups", { name: createName.trim(), description: createDesc.trim() });
      showSuccessToast("Group created");
      setShowCreateModal(false);
      setCreateName("");
      setCreateDesc("");
      fetchAllGroups(1);
    } catch {
      showErrorToast("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (slug: string) => {
    if (!confirm("Delete this group permanently? All conversations will be lost.")) return;
    try {
      const client = getAuthenticatedClient();
      await client.delete(`community/groups/${slug}`);
      showSuccessToast("Group deleted");
      setSelected(null);
      fetchAllGroups(pagination.currentPage);
    } catch {
      showErrorToast("Failed to delete group");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isAdmin) {
      await fetchAllGroups(pagination.currentPage);
    } else {
      await Promise.all([fetchAllGroups(pagination.currentPage), fetchJoinedGroups(1)]);
    }
    setRefreshing(false);
  };

  const handleJoin = async (slug: string) => {
    setActionLoading(slug);
    const ok = await joinGroup(slug);
    setActionLoading(null);
    if (ok) {
      showSuccessToast("Joined group");
      if (selected?.slug === slug) setSelected({ ...selected, is_member: true });
    }
  };

  const handleLeave = async (slug: string) => {
    if (!confirm("Leave this group? You can rejoin anytime.")) return;
    setActionLoading(slug);
    const ok = await leaveGroup(slug);
    setActionLoading(null);
    if (ok) {
      showSuccessToast("Left group");
      if (selected?.slug === slug) setSelected({ ...selected, is_member: false });
    }
  };

  const handleTabChange = (t: TabId) => {
    setTab(t);
    if (t === "all") fetchAllGroups(1);
    else fetchJoinedGroups(1);
  };

  const activeGroups = tab === "all" ? groups : joinedGroups;
  const filtered = activeGroups.filter(g => {
    const s = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    const p = filterPrivacy === "all" || g.privacy === filterPrivacy;
    return s && p;
  });

  const totalGroups = groups.length;
  const myGroups = joinedGroups.length;
  const publicGroups = groups.filter(g => g.privacy === "Public").length;

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "all", label: "All Groups", count: totalGroups },
    { id: "joined", label: "My Groups", count: myGroups },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Discover and join groups in your community</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors">
            <PlusIcon className="w-4 h-4" />Create Group
          </button>
        )}
        <button onClick={handleRefresh} disabled={loading || refreshing} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
          <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
        </button>
      </div>

      {loading && !refreshing ? <Skeleton /> : (
        <>
          {/* Stats */}
          <div className={`grid grid-cols-1 ${isAdmin ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-4`}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">{isAdmin ? "Total Groups" : "Available"}</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{totalGroups}</p></div>
              <div className="p-2 bg-[#00B5A5]/10 rounded-lg"><UserGroupIcon className="w-6 h-6 text-[#00B5A5]" /></div>
            </div>
            {!isAdmin && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
                <div><p className="text-sm text-gray-500 dark:text-gray-400">My Groups</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{myGroups}</p></div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><UsersIcon className="w-6 h-6 text-blue-600" /></div>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Public</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{publicGroups}</p></div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><GlobeAltIcon className="w-6 h-6 text-green-600" /></div>
            </div>
          </div>

          {/* Tabs (members only) + Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {!isAdmin && (
              <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => handleTabChange(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? "border-[#00B5A5] text-[#00B5A5]" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>
                    {t.label} ({t.count})
                  </button>
                ))}
              </div>
            )}
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white" />
              </div>
              <select value={filterPrivacy} onChange={e => setFilterPrivacy(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white">
                <option value="all">All</option>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(g => (
                <GroupCard key={g.slug} group={g} onClick={() => setSelected(g)} isActive={selected?.slug === g.slug} onJoin={handleJoin} onLeave={handleLeave} actionLoading={actionLoading} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <UserGroupIcon className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-900 dark:text-white">{tab === "joined" ? "No groups joined yet" : "No groups found"}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tab === "joined" ? "Browse available groups to get started" : "Try adjusting your search"}</p>
            </div>
          )}

          {/* Pagination */}
          <PaginationBar current={pagination.currentPage} last={pagination.lastPage} onChange={p => tab === "all" ? fetchAllGroups(p) : fetchJoinedGroups(p)} />

          {/* Detail Sheet */}
          {selected && (
            <GroupSheet
              group={selected}
              onClose={() => setSelected(null)}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onOpen={(slug) => { setSelected(null); router.push(`/community/groups/${slug}`); }}
              onDelete={isAdmin ? handleDeleteGroup : undefined}
              actionLoading={actionLoading}
              isAdmin={isAdmin}
            />
          )}
        </>
      )}

      {/* Create Group Sheet */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col rounded-l-2xl overflow-hidden animate-in slide-in-from-right">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                <input type="text" value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Enter group name" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Describe this group" rows={4} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 flex-shrink-0">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={handleCreateGroup} disabled={!createName.trim() || creating} className="flex-1 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 transition-colors">
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
