"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MegaphoneIcon,
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  UserGroupIcon,
  UsersIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { getAuthenticatedClient, ApiError } from "@/lib/api-client";
import { showSuccessToast, showErrorToast } from "@/components/layouts/auth-layer-out";

// ============================================================================
// TYPES
// ============================================================================

interface Announcement {
  id: number;
  title: string;
  content: string;
  target: string;
  target_group?: string;
  categories?: Array<{ id: number; name: string }>;
  send_email: boolean;
  is_pinned: boolean;
  email_sent_count: number;
  published_at: string | null;
  created_at: string;
  created_by?: { id: number; name: string; role: string };
}

interface Group { id: string; name: string; slug: string; }
interface MembershipCategory { id: number; category: string; }

const ADMIN_ROLES = ["Administrator", "President", "Board"];

// ============================================================================
// HELPERS
// ============================================================================

function targetLabel(t: string) {
  if (t === "All") return "Everyone";
  if (t === "Members") return "Members";
  if (t === "Board") return "Board & Admin";
  if (t === "Group") return "Group";
  if (t === "Membership Category") return "By Category";
  return t;
}

function targetColor(t: string) {
  if (t === "All") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  if (t === "Members") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (t === "Board") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  if (t === "Group") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  if (t === "Membership Category") return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300";
  return "bg-gray-100 text-gray-700";
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function fmtRelative(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return fmtDate(d);
}

// ============================================================================
// SEARCHABLE DROPDOWN (single + multi)
// ============================================================================

interface DropdownOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  sublabel?: string;
}

function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder,
  multiple = false,
  searchable = true,
  disabled = false,
  emptyHint,
}: {
  options: DropdownOption[];
  value: string | number | Array<string | number> | null;
  onChange: (v: string | number | Array<string | number>) => void;
  placeholder: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  emptyHint?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const filtered = !search ? options : options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
    || (o.sublabel || "").toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (v: string | number) => multiple
    ? Array.isArray(value) && value.includes(v)
    : value === v;

  const handlePick = (v: string | number) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      onChange(current.includes(v) ? current.filter(x => x !== v) : [...current, v]);
    } else {
      onChange(v);
      setOpen(false);
      setSearch("");
    }
  };

  const triggerLabel = (() => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.length === 0) return placeholder;
      if (arr.length === 1) {
        const opt = options.find(o => o.value === arr[0]);
        return opt?.label ?? `${arr.length} selected`;
      }
      return `${arr.length} selected`;
    }
    const opt = options.find(o => o.value === value);
    return opt?.label ?? placeholder;
  })();

  const triggerIcon = (() => {
    if (multiple) return null;
    return options.find(o => o.value === value)?.icon ?? null;
  })();

  const isPlaceholder = multiple
    ? !Array.isArray(value) || value.length === 0
    : value === null || value === undefined || value === "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm border rounded-lg text-left transition-all ${
          open ? "border-[#00B5A5] ring-2 ring-[#00B5A5]/20" : "border-gray-300 dark:border-gray-600"
        } ${disabled ? "bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed" : "bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"} dark:text-white`}
      >
        {triggerIcon && <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">{triggerIcon}</span>}
        <span className={`flex-1 truncate ${isPlaceholder ? "text-gray-400 dark:text-gray-500" : ""}`}>
          {triggerLabel}
        </span>
        {multiple && Array.isArray(value) && value.length > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#00B5A5]/10 text-[#00B5A5] flex-shrink-0">
            {value.length}
          </span>
        )}
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {searchable && options.length > 5 && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-[#00B5A5]/30 focus:border-[#00B5A5] dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
          <ul className="max-h-64 overflow-y-auto py-1">
            {options.length === 0 ? (
              <li className="px-3 py-4 text-xs text-center text-gray-500 dark:text-gray-400">
                {emptyHint ?? "No options available"}
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-4 text-xs text-center text-gray-500 dark:text-gray-400">No results for &quot;{search}&quot;</li>
            ) : (
              filtered.map(o => {
                const sel = isSelected(o.value);
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      onClick={() => handlePick(o.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                        sel ? "bg-[#00B5A5]/10 text-[#00B5A5]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {multiple && (
                        <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${sel ? "bg-[#00B5A5] border-[#00B5A5]" : "border-gray-300 dark:border-gray-600"}`}>
                          {sel && <CheckIcon className="w-3 h-3 text-white" />}
                        </span>
                      )}
                      {o.icon && <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">{o.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{o.label}</p>
                        {o.sublabel && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{o.sublabel}</p>}
                      </div>
                      {!multiple && sel && <CheckIcon className="w-4 h-4 text-[#00B5A5] flex-shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ANNOUNCEMENT COMPOSE SHEET
// ============================================================================

const AUDIENCE_OPTIONS: DropdownOption[] = [
  { value: "All", label: "Everyone", icon: <GlobeAltIcon className="w-4 h-4" />, sublabel: "All members of the institution" },
  { value: "Members", label: "Members", icon: <UsersIcon className="w-4 h-4" />, sublabel: "Members only — excludes board / admin" },
  { value: "Board", label: "Board & Admin", icon: <UserGroupIcon className="w-4 h-4" />, sublabel: "Administrators, President, Board, VP" },
  { value: "Group", label: "Specific Group", icon: <UserGroupIcon className="w-4 h-4" />, sublabel: "Members of one community group" },
  { value: "Membership Category", label: "By Membership Category", icon: <TagIcon className="w-4 h-4" />, sublabel: "Members in selected categories" },
];

function AnnouncementModal({ isOpen, onClose, onSubmit, groups, categories, loading }: {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
  groups: Group[]; categories: MembershipCategory[]; loading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("All");
  const [targetGroupId, setTargetGroupId] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [sendEmail, setSendEmail] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setContent("");
      setTarget("All");
      setTargetGroupId("");
      setSelectedCategories([]);
      setSendEmail(false);
      setIsPinned(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAudienceChange = (v: string | number | Array<string | number>) => {
    setTarget(v as string);
    setTargetGroupId("");
    setSelectedCategories([]);
  };

  const groupOptions: DropdownOption[] = groups.map(g => ({ value: g.id, label: g.name }));
  const categoryOptions: DropdownOption[] = categories.map(c => ({ value: c.id, label: c.category }));

  const canSubmit = !!title.trim() && !!content.trim() && !loading
    && !(target === "Group" && !targetGroupId)
    && !(target === "Membership Category" && selectedCategories.length === 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      target,
      target_group_id: target === "Group" ? targetGroupId : undefined,
      categories: target === "Membership Category" ? selectedCategories.map(id => ({ id })) : undefined,
      send_email: sendEmail,
      is_pinned: isPinned,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-gray-800 shadow-2xl flex flex-col rounded-l-2xl overflow-hidden animate-in slide-in-from-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Announcement</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Broadcast to the people you choose</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Announcement title"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5]/30 focus:border-[#00B5A5] dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your announcement..."
              rows={6}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5]/30 focus:border-[#00B5A5] dark:bg-gray-700 dark:text-white resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">{content.length} characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Audience</label>
            <SearchableDropdown
              options={AUDIENCE_OPTIONS}
              value={target}
              onChange={handleAudienceChange}
              placeholder="Choose audience"
              searchable={false}
            />
          </div>

          {target === "Group" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Group <span className="text-red-500">*</span>
              </label>
              {groups.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
                  No groups exist yet. Create one under <span className="font-medium">Community → Groups</span> first.
                </div>
              ) : (
                <SearchableDropdown
                  options={groupOptions}
                  value={targetGroupId}
                  onChange={(v) => setTargetGroupId(v as string)}
                  placeholder={`Select a group (${groups.length} available)`}
                />
              )}
            </div>
          )}

          {target === "Membership Category" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Categories <span className="text-red-500">*</span>
              </label>
              {categories.length === 0 ? (
                <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
                  No membership categories defined yet. Add one under <span className="font-medium">Memberships → Categories</span> first.
                </div>
              ) : (
                <>
                  <SearchableDropdown
                    options={categoryOptions}
                    value={selectedCategories}
                    onChange={(v) => setSelectedCategories(v as number[])}
                    placeholder={`Select categories (${categories.length} available)`}
                    multiple
                  />
                  {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedCategories.map(id => {
                        const c = categories.find(x => x.id === id);
                        if (!c) return null;
                        return (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#00B5A5]/10 text-[#00B5A5]">
                            {c.category}
                            <button
                              type="button"
                              onClick={() => setSelectedCategories(prev => prev.filter(x => x !== id))}
                              className="hover:text-[#008F82]"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer pt-3">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={e => setSendEmail(e.target.checked)}
                className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]"
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Also send via email</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Members get an email in addition to the in-app notification</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]"
              />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin to top</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Highlight at the top of the feed</p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            <MegaphoneIcon className="w-4 h-4" />{loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export default function AnnouncementsClient() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [showAnnCompose, setShowAnnCompose] = useState(false);
  const [annComposing, setAnnComposing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<MembershipCategory[]>([]);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  useEffect(() => {
    try { const ud = JSON.parse(localStorage.getItem("user_data") || "{}"); setIsAdmin(ADMIN_ROLES.includes(ud.role)); } catch {}
    fetchAnnouncements();
    fetchGroups();
    fetchCategories();
  }, []);

  // ============================================================================
  // FETCHERS
  // ============================================================================

  const fetchAnnouncements = async () => {
    try { setAnnLoading(true); const c = getAuthenticatedClient(); const r = await c.get<{ status: string; data: { data: Announcement[] } }>("announcements"); if (r.data.status === "success") setAnnouncements(r.data.data.data || []); } catch {} finally { setAnnLoading(false); }
  };
  const fetchGroups = async () => {
    try {
      const c = getAuthenticatedClient();
      // Admin-side: community/groups returns ALL groups in the institution (paginator). Walk all pages so the dropdown is complete.
      type RawGroup = Record<string, unknown>;
      type Paginated = { data: RawGroup[]; current_page?: number; last_page?: number };
      const collected: RawGroup[] = [];
      let page = 1;
      let lastPage = 1;
      do {
        const r = await c.get<{ status: string; data: Paginated }>(`community/groups?page=${page}`);
        const raw = r.data?.data;
        const items = Array.isArray(raw?.data) ? raw.data : [];
        collected.push(...items);
        lastPage = Number(raw?.last_page ?? 1);
        page += 1;
      } while (page <= lastPage && page < 20); // safety cap
      setGroups(collected.map(g => ({ id: String(g.id), name: String(g.name || ""), slug: String(g.slug || "") })));
    } catch {}
  };
  const fetchCategories = async () => {
    try {
      const c = getAuthenticatedClient();
      const r = await c.get<{ status: string; data: Array<{ id: number; category: string }> | { data: Array<{ id: number; category: string }> } }>("membership/categories");
      const raw = r.data.data;
      setCategories(Array.isArray(raw) ? raw : (raw?.data ?? []));
    } catch {}
  };

  // ============================================================================
  // ANNOUNCEMENT HANDLERS
  // ============================================================================

  const publishAnnouncement = async (data: Record<string, unknown>) => {
    setAnnComposing(true);
    try { const c = getAuthenticatedClient(); await c.post("community/announcements", data); showSuccessToast(data.send_email ? "Published — emails sending" : "Published"); setShowAnnCompose(false); fetchAnnouncements(); } catch (e) { showErrorToast((e as ApiError).message || "Failed"); } finally { setAnnComposing(false); }
  };
  const deleteAnnouncement = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    try { const c = getAuthenticatedClient(); await c.delete(`community/announcements/${id}`); showSuccessToast("Deleted"); if (selectedAnn?.id === id) setSelectedAnn(null); fetchAnnouncements(); } catch { showErrorToast("Failed"); }
  };
  const resendAnnouncement = async (id: number) => {
    if (!confirm("Resend emails?")) return;
    try { const c = getAuthenticatedClient(); await c.post(`community/announcements/${id}/resend`, {}); showSuccessToast("Emails sent"); fetchAnnouncements(); } catch { showErrorToast("Failed"); }
  };

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredAnn = announcements.filter(a =>
    !search ||
    (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.content || "").toLowerCase().includes(search.toLowerCase())
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Broadcast updates to members</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setShowAnnCompose(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg">
              <PlusIcon className="w-4 h-4" />Announcement
            </button>
          )}
          <button onClick={fetchAnnouncements} disabled={annLoading} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <ArrowPathIcon className={`w-4 h-4 mr-1.5 ${annLoading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-800 dark:text-white bg-white" />
      </div>

      {/* List */}
      {annLoading && announcements.length === 0 ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" /></div>)}</div>
      ) : filteredAnn.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <MegaphoneIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white">{search ? "No results" : "No announcements"}</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnn.filter(a => a.is_pinned).map(a => (
            <div key={a.id} onClick={() => setSelectedAnn(a)} className={`bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${selectedAnn?.id === a.id ? "ring-2 ring-[#00B5A5]" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-amber-500 text-xs">&#128204;</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${targetColor(a.target)}`}>{targetLabel(a.target)}</span>
                    {a.categories?.map(c => <span key={c.id} className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{c.name}</span>)}
                    {a.send_email && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"><EnvelopeIcon className="w-3 h-3" />{a.email_sent_count}</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{a.created_by?.name} · {fmtRelative(a.published_at || a.created_at)}</p>
                </div>
                {isAdmin && <button onClick={e => { e.stopPropagation(); deleteAnnouncement(a.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><TrashIcon className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
          {filteredAnn.filter(a => !a.is_pinned).map(a => (
            <div key={a.id} onClick={() => setSelectedAnn(a)} className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow ${selectedAnn?.id === a.id ? "ring-2 ring-[#00B5A5]" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${targetColor(a.target)}`}>{targetLabel(a.target)}</span>
                    {a.categories?.map(c => <span key={c.id} className="px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{c.name}</span>)}
                    {a.send_email && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600"><EnvelopeIcon className="w-3 h-3" />{a.email_sent_count}</span>}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{a.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{a.created_by?.name} · {fmtRelative(a.published_at || a.created_at)}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-1">
                    {a.send_email && <button onClick={e => { e.stopPropagation(); resendAnnouncement(a.id); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg"><EnvelopeIcon className="w-4 h-4" /></button>}
                    <button onClick={e => { e.stopPropagation(); deleteAnnouncement(a.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail sheet */}
      {selectedAnn && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedAnn(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Announcement</h2>
              <button onClick={() => setSelectedAnn(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${targetColor(selectedAnn.target)}`}>{targetLabel(selectedAnn.target)}</span>
                {selectedAnn.categories?.map(c => <span key={c.id} className="px-2 py-0.5 rounded-lg text-xs bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{c.name}</span>)}
                {selectedAnn.is_pinned && <span className="text-amber-500 text-xs">&#128204; Pinned</span>}
                {selectedAnn.send_email && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600"><EnvelopeIcon className="w-3 h-3" />{selectedAnn.email_sent_count} emails</span>}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAnn.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedAnn.content}</p>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                {selectedAnn.created_by && <p>By {selectedAnn.created_by.name} ({selectedAnn.created_by.role})</p>}
                <p>{fmtDate(selectedAnn.published_at || selectedAnn.created_at)}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
                {selectedAnn.send_email && <button onClick={() => resendAnnouncement(selectedAnn.id)} className="flex-1 py-2 text-sm rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 flex items-center justify-center gap-1.5"><EnvelopeIcon className="w-4 h-4" />Resend</button>}
                <button onClick={() => deleteAnnouncement(selectedAnn.id)} className="flex-1 py-2 text-sm rounded-lg border border-red-200 dark:border-red-800 text-red-600 flex items-center justify-center gap-1.5"><TrashIcon className="w-4 h-4" />Delete</button>
              </div>
            )}
          </div>
        </div>
      )}

      <AnnouncementModal isOpen={showAnnCompose} onClose={() => setShowAnnCompose(false)} onSubmit={publishAnnouncement} groups={groups} categories={categories} loading={annComposing} />
    </div>
  );
}
