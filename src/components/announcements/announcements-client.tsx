"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MegaphoneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  UserGroupIcon,
  UsersIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
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
  target: "all" | "members" | "board" | "group";
  target_group?: string;
  send_email: boolean;
  is_pinned: boolean;
  email_sent_count: number;
  published_at: string | null;
  created_at: string;
  created_by?: { id: number; name: string; role: string };
}

interface Group {
  id: string;
  name: string;
  slug: string;
}

const ADMIN_ROLES = ["Administrator", "President", "Board"];

function targetLabel(target: string) {
  if (target === "all") return "Everyone";
  if (target === "members") return "Members Only";
  if (target === "board") return "Board & Admin";
  if (target === "group") return "Specific Group";
  return target;
}

function targetColor(target: string) {
  if (target === "all") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  if (target === "members") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (target === "board") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  if (target === "group") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  return "bg-gray-100 text-gray-700";
}

function targetIcon(target: string) {
  if (target === "all") return <GlobeAltIcon className="w-3.5 h-3.5" />;
  if (target === "members") return <UsersIcon className="w-3.5 h-3.5" />;
  if (target === "board") return <UserGroupIcon className="w-3.5 h-3.5" />;
  if (target === "group") return <UserGroupIcon className="w-3.5 h-3.5" />;
  return null;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtRelative(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return fmtDate(d);
}

// ============================================================================
// COMPOSE MODAL
// ============================================================================

function ComposeModal({ isOpen, onClose, onSubmit, groups, loading }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; target: string; target_group_id?: string; send_email: boolean; is_pinned: boolean }) => void;
  groups: Group[];
  loading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("all");
  const [targetGroupId, setTargetGroupId] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      target,
      target_group_id: target === "group" ? targetGroupId : undefined,
      send_email: sendEmail,
      is_pinned: isPinned,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Announcement</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" maxLength={200}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white" />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your announcement..." rows={5}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white resize-none" />
            <p className="text-xs text-gray-400 mt-1">{content.length} characters</p>
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "all", label: "Everyone", icon: <GlobeAltIcon className="w-4 h-4" /> },
                { value: "members", label: "Members Only", icon: <UsersIcon className="w-4 h-4" /> },
                { value: "board", label: "Board & Admin", icon: <UserGroupIcon className="w-4 h-4" /> },
                { value: "group", label: "Specific Group", icon: <UserGroupIcon className="w-4 h-4" /> },
              ].map(opt => (
                <button key={opt.value} onClick={() => setTarget(opt.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${target === opt.value ? "border-[#00B5A5] bg-[#00B5A5]/10 text-[#00B5A5]" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
            {target === "group" && (
              <select value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)} className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Select a group</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Send Email</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Also send this announcement via email to all targeted users</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin Announcement</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Keep this announcement at the top of the list</p>
              </div>
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
          <button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || loading || (target === "group" && !targetGroupId)}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            <MegaphoneIcon className="w-4 h-4" />
            {loading ? "Publishing..." : "Publish"}
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composing, setComposing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Announcement | null>(null);

  useEffect(() => {
    try {
      const ud = JSON.parse(localStorage.getItem("user_data") || "{}");
      setIsAdmin(ADMIN_ROLES.includes(ud.role));
    } catch {}
    fetchAnnouncements();
    fetchGroups();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const client = getAuthenticatedClient();
      const res = await client.get<{ status: string; data: { data: Announcement[] } }>("announcements");
      if (res.data.status === "success") setAnnouncements(res.data.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const fetchGroups = async () => {
    try {
      const client = getAuthenticatedClient();
      // Try admin endpoint first, fallback to shared
      const res = await client.get<{ status: string; data: { data: Array<Record<string, unknown>> } | Array<Record<string, unknown>> }>("communication/groups/all");
      const rawData = res.data.data;
      const groupsArr = Array.isArray(rawData) ? rawData : (rawData as { data: Array<Record<string, unknown>> })?.data || [];
      setGroups(groupsArr.map((g: Record<string, unknown>) => ({
        id: String(g.id),
        name: String(g.name || ""),
        slug: String(g.slug || ""),
      })));
    } catch {}
  };

  const handlePublish = async (data: { title: string; content: string; target: string; target_group_id?: string; send_email: boolean; is_pinned: boolean }) => {
    setComposing(true);
    try {
      const client = getAuthenticatedClient();
      await client.post("community/announcements", data);
      showSuccessToast("Announcement published" + (data.send_email ? " and emails sent" : ""));
      setShowCompose(false);
      fetchAnnouncements();
    } catch (err) {
      showErrorToast((err as ApiError).message || "Failed to publish");
    } finally { setComposing(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      const client = getAuthenticatedClient();
      await client.delete(`community/announcements/${id}`);
      showSuccessToast("Announcement deleted");
      if (selected?.id === id) setSelected(null);
      fetchAnnouncements();
    } catch { showErrorToast("Failed to delete"); }
  };

  const handleResendEmails = async (id: number) => {
    if (!confirm("Resend emails for this announcement?")) return;
    try {
      const client = getAuthenticatedClient();
      await client.post(`community/announcements/${id}/resend`, {});
      showSuccessToast("Emails queued for delivery");
      fetchAnnouncements();
    } catch { showErrorToast("Failed to resend"); }
  };

  const filtered = announcements.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter(a => a.is_pinned);
  const regular = filtered.filter(a => !a.is_pinned);

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Communicate with your community</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setShowCompose(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors">
              <PlusIcon className="w-4 h-4" />New Announcement
            </button>
          )}
          <button onClick={fetchAnnouncements} disabled={loading} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <ArrowPathIcon className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-800 dark:text-white bg-white" />
      </div>

      {/* Announcements List */}
      {loading && announcements.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <MegaphoneIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white">{search ? "No announcements match your search" : "No announcements yet"}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isAdmin ? "Create your first announcement" : "Check back later"}</p>
          {isAdmin && !search && (
            <button onClick={() => setShowCompose(true)} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] rounded-lg hover:bg-[#008F82]">
              <PlusIcon className="w-4 h-4 inline mr-1" />New Announcement
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Pinned */}
          {pinned.map(a => (
            <div key={a.id} onClick={() => setSelected(a)} className={`bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow ${selected?.id === a.id ? "ring-2 ring-[#00B5A5]" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-500 text-xs">&#128204;</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${targetColor(a.target)}`}>
                      {targetIcon(a.target)}{targetLabel(a.target)}
                    </span>
                    {a.send_email && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"><EnvelopeIcon className="w-3 h-3" />{a.email_sent_count}</span>}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{a.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{a.created_by?.name}</span>
                    <span>{fmtRelative(a.published_at || a.created_at)}</span>
                  </div>
                </div>
                {isAdmin && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}

          {/* Regular */}
          {regular.map(a => (
            <div key={a.id} onClick={() => setSelected(a)} className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow ${selected?.id === a.id ? "ring-2 ring-[#00B5A5]" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${targetColor(a.target)}`}>
                      {targetIcon(a.target)}{targetLabel(a.target)}
                    </span>
                    {a.send_email && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"><EnvelopeIcon className="w-3 h-3" />{a.email_sent_count}</span>}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{a.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{a.created_by?.name}</span>
                    <span>{fmtRelative(a.published_at || a.created_at)}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    {a.send_email && (
                      <button onClick={(e) => { e.stopPropagation(); handleResendEmails(a.id); }} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Resend emails"><EnvelopeIcon className="w-4 h-4" /></button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Announcement</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${targetColor(selected.target)}`}>
                  {targetIcon(selected.target)}{targetLabel(selected.target)}
                </span>
                {selected.target_group && <span className="text-xs text-gray-500">{selected.target_group}</span>}
                {selected.is_pinned && <span className="text-amber-500 text-xs">&#128204; Pinned</span>}
                {selected.send_email && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                    <EnvelopeIcon className="w-3 h-3" />{selected.email_sent_count} emails sent
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selected.title}</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm text-gray-500">
                {selected.created_by && <p>Published by <span className="font-medium text-gray-700 dark:text-gray-300">{selected.created_by.name}</span> ({selected.created_by.role})</p>}
                <p>{fmtDate(selected.published_at || selected.created_at)}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
                {selected.send_email && (
                  <button onClick={() => handleResendEmails(selected.id)} className="flex-1 py-2 text-sm font-medium rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-1.5">
                    <EnvelopeIcon className="w-4 h-4" />Resend Emails
                  </button>
                )}
                <button onClick={() => handleDelete(selected.id)} className="flex-1 py-2 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-1.5">
                  <TrashIcon className="w-4 h-4" />Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      <ComposeModal isOpen={showCompose} onClose={() => setShowCompose(false)} onSubmit={handlePublish} groups={groups} loading={composing} />
    </div>
  );
}
