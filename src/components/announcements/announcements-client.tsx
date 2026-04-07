"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  ClockIcon,
  ExclamationCircleIcon,
  TagIcon,
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

interface Campaign {
  id: string;
  subject: string;
  message: string;
  user_category: string;
  status: string;
  total_contacts: number;
  sent: number;
  failed: number;
  opened: number;
  scheduled_at: string | null;
  created_at: string;
  creator?: { id: number; name: string; role: string };
  logs?: Array<{ id: number; status: string; error_message: string | null; sent_at: string | null; member?: { id: number; name: string; email: string } }>;
}

interface Group { id: string; name: string; slug: string; }
interface MembershipCategory { id: number; category: string; }

type ActiveTab = "announcements" | "campaigns";
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

function campaignStatusColor(s: string) {
  const l = s.toLowerCase();
  if (l === "sent") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
  if (l === "sending") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  if (l === "scheduled") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
  if (l === "failed") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
}

function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function fmtDateTime(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
function fmtRelative(d: string) {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return fmtDate(d);
}

// ============================================================================
// ANNOUNCEMENT COMPOSE MODAL
// ============================================================================

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

  if (!isOpen) return null;

  const toggleCategory = (id: number) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Announcement</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your announcement..." rows={4} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Audience</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: "All", l: "Everyone", icon: <GlobeAltIcon className="w-4 h-4" /> },
                { v: "Members", l: "Members", icon: <UsersIcon className="w-4 h-4" /> },
                { v: "Board", l: "Board & Admin", icon: <UserGroupIcon className="w-4 h-4" /> },
                { v: "Group", l: "Specific Group", icon: <UserGroupIcon className="w-4 h-4" /> },
                { v: "Membership Category", l: "By Category", icon: <TagIcon className="w-4 h-4" /> },
              ].map(o => (
                <button key={o.v} onClick={() => setTarget(o.v)} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-colors ${target === o.v ? "border-[#00B5A5] bg-[#00B5A5]/10 text-[#00B5A5]" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                  {o.icon}{o.l}
                </button>
              ))}
            </div>
            {target === "Group" && (
              <select value={targetGroupId} onChange={e => setTargetGroupId(e.target.value)} className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Select a group</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            )}
            {target === "Membership Category" && categories.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => toggleCategory(c.id)} className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{c.category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]" />
              <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Also send via email</p></div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)} className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]" />
              <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin to top</p></div>
            </label>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
          <button onClick={() => { if (title.trim() && content.trim()) onSubmit({ title: title.trim(), content: content.trim(), target, target_group_id: target === "Group" ? targetGroupId : undefined, categories: target === "Membership Category" ? selectedCategories.map(id => ({ id })) : undefined, send_email: sendEmail, is_pinned: isPinned }); }}
            disabled={!title.trim() || !content.trim() || loading || (target === "Group" && !targetGroupId) || (target === "Membership Category" && selectedCategories.length === 0)}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            <MegaphoneIcon className="w-4 h-4" />{loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CAMPAIGN COMPOSE MODAL
// ============================================================================

function CampaignModal({ isOpen, onClose, onSubmit, loading }: {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: { subject: string; message: string; user_category: string; scheduled_at?: string }) => void;
  loading: boolean;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("All");
  const [scheduleDate, setScheduleDate] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Email Campaign</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Email content..." rows={5} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="All">All Members</option>
              <option value="Members">Members Only</option>
              <option value="Board">Board & Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Schedule (optional)</label>
            <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            <p className="text-xs text-gray-400 mt-1">Leave empty to save as draft</p>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
          <button onClick={() => { if (subject.trim() && message.trim()) onSubmit({ subject: subject.trim(), message: message.trim(), user_category: category, scheduled_at: scheduleDate || undefined }); }}
            disabled={!subject.trim() || !message.trim() || loading}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            <EnvelopeIcon className="w-4 h-4" />{loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN
// ============================================================================

export default function CommunicationsClient() {
  const [tab, setTab] = useState<ActiveTab>("announcements");
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState("");

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [showAnnCompose, setShowAnnCompose] = useState(false);
  const [annComposing, setAnnComposing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<MembershipCategory[]>([]);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  // Campaigns state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campLoading, setCampLoading] = useState(true);
  const [showCampCompose, setShowCampCompose] = useState(false);
  const [campComposing, setCampComposing] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<Campaign | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try { const ud = JSON.parse(localStorage.getItem("user_data") || "{}"); setIsAdmin(ADMIN_ROLES.includes(ud.role)); } catch {}
    fetchAnnouncements();
    fetchGroups();
    fetchCategories();
    if (ADMIN_ROLES.includes(JSON.parse(localStorage.getItem("user_data") || "{}").role || "")) fetchCampaigns();
  }, []);

  // ============================================================================
  // FETCHERS
  // ============================================================================

  const fetchAnnouncements = async () => {
    try { setAnnLoading(true); const c = getAuthenticatedClient(); const r = await c.get<{ status: string; data: { data: Announcement[] } }>("announcements"); if (r.data.status === "success") setAnnouncements(r.data.data.data || []); } catch {} finally { setAnnLoading(false); }
  };
  const fetchCampaigns = async () => {
    try { setCampLoading(true); const c = getAuthenticatedClient(); const r = await c.get<{ status: string; data: { data: Campaign[] } }>("bulk-messaging"); if (r.data.status === "success") setCampaigns(r.data.data?.data || []); } catch {} finally { setCampLoading(false); }
  };
  const fetchGroups = async () => {
    try { const c = getAuthenticatedClient(); const r = await c.get<{ status: string; data: { data: Array<Record<string, unknown>> } | Array<Record<string, unknown>> }>("communication/groups/all"); const raw = r.data.data; const arr = Array.isArray(raw) ? raw : (raw as { data: Array<Record<string, unknown>> })?.data || []; setGroups(arr.map(g => ({ id: String(g.id), name: String(g.name || ""), slug: String(g.slug || "") }))); } catch {}
  };
  const fetchCategories = async () => {
    try { const c = getAuthenticatedClient(); const r = await c.get<{ status: string; data: Array<{ id: number; category: string }> }>("membership/categories"); if (r.data.data) setCategories(Array.isArray(r.data.data) ? r.data.data : []); } catch {}
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
  // CAMPAIGN HANDLERS
  // ============================================================================

  const createCampaign = async (data: { subject: string; message: string; user_category: string; scheduled_at?: string }) => {
    setCampComposing(true);
    try { const c = getAuthenticatedClient(); await c.post("bulk-messaging/create", data); showSuccessToast("Campaign created"); setShowCampCompose(false); fetchCampaigns(); } catch (e) { showErrorToast((e as ApiError).message || "Failed"); } finally { setCampComposing(false); }
  };
  const sendCampaign = async (id: string) => {
    if (!confirm("Send this campaign?")) return;
    setSending(true);
    try { const c = getAuthenticatedClient(); await c.get(`bulk-messaging/${id}/send`); showSuccessToast("Sending..."); fetchCampaigns(); if (selectedCamp?.id === id) { const r = await c.get<{ status: string; data: Campaign }>(`bulk-messaging/${id}`); if (r.data.data) setSelectedCamp(r.data.data); } } catch (e) { showErrorToast((e as ApiError).message || "Failed"); } finally { setSending(false); }
  };
  const deleteCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try { const c = getAuthenticatedClient(); await c.delete(`bulk-messaging/${id}`); showSuccessToast("Deleted"); if (selectedCamp?.id === id) setSelectedCamp(null); fetchCampaigns(); } catch { showErrorToast("Failed"); }
  };
  const selectCampaign = async (camp: Campaign) => {
    try { const c = getAuthenticatedClient(); const r = await c.get<{ status: string; data: Campaign }>(`bulk-messaging/${camp.id}`); setSelectedCamp(r.data.data || camp); } catch { setSelectedCamp(camp); }
  };

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredAnn = announcements.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()));
  const filteredCamp = campaigns.filter(c => !search || c.subject.toLowerCase().includes(search.toLowerCase()));

  const loading = tab === "announcements" ? annLoading : campLoading;
  const handleRefresh = () => { if (tab === "announcements") fetchAnnouncements(); else fetchCampaigns(); };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communications</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Announcements and email campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && tab === "announcements" && (
            <button onClick={() => setShowAnnCompose(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg">
              <PlusIcon className="w-4 h-4" />Announcement
            </button>
          )}
          {isAdmin && tab === "campaigns" && (
            <button onClick={() => setShowCampCompose(true)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg">
              <PlusIcon className="w-4 h-4" />Campaign
            </button>
          )}
          <button onClick={handleRefresh} disabled={loading} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
            <ArrowPathIcon className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      {isAdmin ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => { setTab("announcements"); setSearch(""); }} className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${tab === "announcements" ? "border-[#00B5A5] text-[#00B5A5]" : "border-transparent text-gray-500"}`}>
              <MegaphoneIcon className="w-4 h-4 inline mr-1.5" />Announcements ({announcements.length})
            </button>
            <button onClick={() => { setTab("campaigns"); setSearch(""); }} className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${tab === "campaigns" ? "border-[#00B5A5] text-[#00B5A5]" : "border-transparent text-gray-500"}`}>
              <EnvelopeIcon className="w-4 h-4 inline mr-1.5" />Email Campaigns ({campaigns.length})
            </button>
          </div>
          <div className="p-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === "announcements" ? "Search announcements..." : "Search campaigns..."}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-800 dark:text-white bg-white" />
        </div>
      )}

      {/* ============ ANNOUNCEMENTS TAB ============ */}
      {tab === "announcements" && (
        <>
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
        </>
      )}

      {/* ============ CAMPAIGNS TAB ============ */}
      {tab === "campaigns" && isAdmin && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-gray-900 dark:text-white">{campaigns.length}</p></div>
              <EnvelopeIcon className="w-5 h-5 text-[#00B5A5]" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Sent</p><p className="text-xl font-bold text-green-600">{campaigns.filter(c => c.status === "Sent").length}</p></div>
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Drafts</p><p className="text-xl font-bold text-gray-600">{campaigns.filter(c => ["Draft", "Created"].includes(c.status)).length}</p></div>
              <EnvelopeIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div><p className="text-xs text-gray-500">Scheduled</p><p className="text-xl font-bold text-purple-600">{campaigns.filter(c => c.status === "Scheduled").length}</p></div>
              <ClockIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>

          {/* Campaign list */}
          {campLoading && campaigns.length === 0 ? (
            <div className="space-y-3">{[1, 2].map(i => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" /></div>)}</div>
          ) : filteredCamp.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <EnvelopeIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 dark:text-white">{search ? "No results" : "No campaigns"}</h3>
              <button onClick={() => setShowCampCompose(true)} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] rounded-lg hover:bg-[#008F82]"><PlusIcon className="w-4 h-4 inline mr-1" />New Campaign</button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCamp.map(c => (
                <button key={c.id} onClick={() => selectCampaign(c)} className={`w-full text-left bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-md transition-all ${selectedCamp?.id === c.id ? "border-[#00B5A5] ring-1 ring-[#00B5A5]" : "border-gray-200 dark:border-gray-700"}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.subject}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${campaignStatusColor(c.status)}`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{c.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{c.user_category}</span>
                      <span>{c.sent}/{c.total_contacts} sent</span>
                      <span>{fmtRelative(c.created_at)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============ DETAIL SHEETS ============ */}

      {/* Announcement detail */}
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

      {/* Campaign detail */}
      {selectedCamp && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedCamp(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Campaign Details</h2>
              <button onClick={() => setSelectedCamp(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${campaignStatusColor(selectedCamp.status)}`}>{selectedCamp.status}</span>
                <span className="text-xs text-gray-500">{selectedCamp.user_category}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCamp.subject}</h3>
              {selectedCamp.creator && <p className="text-xs text-gray-500">By {selectedCamp.creator.name} · {fmtDateTime(selectedCamp.created_at)}</p>}
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedCamp.message}</p>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"><p className="text-lg font-bold">{selectedCamp.total_contacts}</p><p className="text-[9px] text-gray-500">Total</p></div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><p className="text-lg font-bold text-green-600">{selectedCamp.sent}</p><p className="text-[9px] text-gray-500">Sent</p></div>
                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"><p className="text-lg font-bold text-red-600">{selectedCamp.failed}</p><p className="text-[9px] text-gray-500">Failed</p></div>
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><p className="text-lg font-bold text-blue-600">{selectedCamp.opened}</p><p className="text-[9px] text-gray-500">Opened</p></div>
              </div>
              {selectedCamp.total_contacts > 0 && (
                <div><div className="flex justify-between text-xs text-gray-500 mb-1"><span>Delivery</span><span>{Math.round(((selectedCamp.sent + selectedCamp.failed) / selectedCamp.total_contacts) * 100)}%</span></div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-[#00B5A5] rounded-full" style={{ width: `${((selectedCamp.sent + selectedCamp.failed) / selectedCamp.total_contacts) * 100}%` }} /></div></div>
              )}
              {selectedCamp.scheduled_at && <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"><ClockIcon className="w-4 h-4 text-purple-500" /><span className="text-xs text-purple-700 dark:text-purple-300">Scheduled: {fmtDateTime(selectedCamp.scheduled_at)}</span></div>}
              {/* Logs */}
              {selectedCamp.logs && selectedCamp.logs.length > 0 && (
                <div><h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Log ({selectedCamp.logs.length})</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">{selectedCamp.logs.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs">
                    <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${l.status === "Sent" ? "bg-green-500" : l.status === "Failed" ? "bg-red-500" : "bg-yellow-500"}`} /><span className="truncate text-gray-700 dark:text-gray-300">{l.member?.name || l.member?.email || "Unknown"}</span></div>
                    <span className="text-gray-400 ml-2">{l.sent_at ? fmtDateTime(l.sent_at) : l.status}</span>
                  </div>
                ))}</div></div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
              {["Draft", "Created", "Failed"].includes(selectedCamp.status) && (
                <button onClick={() => sendCampaign(selectedCamp.id)} disabled={sending} className="flex-1 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                  <PaperAirplaneIcon className="w-4 h-4" />{sending ? "Sending..." : "Send Now"}
                </button>
              )}
              <button onClick={() => deleteCampaign(selectedCamp.id)} className="flex-1 py-2.5 text-sm rounded-lg border border-red-200 dark:border-red-800 text-red-600 flex items-center justify-center gap-2">
                <TrashIcon className="w-4 h-4" />Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AnnouncementModal isOpen={showAnnCompose} onClose={() => setShowAnnCompose(false)} onSubmit={publishAnnouncement} groups={groups} categories={categories} loading={annComposing} />
      <CampaignModal isOpen={showCampCompose} onClose={() => setShowCampCompose(false)} onSubmit={createCampaign} loading={campComposing} />
    </div>
  );
}
