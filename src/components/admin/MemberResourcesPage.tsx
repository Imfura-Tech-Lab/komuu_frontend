"use client";

import React, { useState, useEffect } from "react";
import {
  FolderIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowPathIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  LinkIcon,
  HeartIcon,
  UserCircleIcon,
  CalendarIcon,
  HandThumbDownIcon,
  XMarkIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { FileViewer } from "@/components/ui/FileViwer";
import { showSuccessToast } from "@/components/layouts/auth-layer-out";
import { useMemberResources, Resource } from "@/lib/hooks/useMemberResources";
import { ResourceDetailSheet } from "@/components/admin/modals/ResourceDetailSheet";
import { Resource as AdminResource } from "@/lib/hooks/useResources";

// ============================================================================
// HELPERS
// ============================================================================

function fmtSize(bytes?: string | number): string {
  if (!bytes) return "";
  const n = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (isNaN(n) || n === 0) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function fmtRelative(d: string): string {
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function typeIcon(type: string) {
  const t = type.toLowerCase();
  if (t === "pdf") return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
  if (["docx", "doc", "document"].includes(t)) return <DocumentIcon className="w-5 h-5 text-blue-500" />;
  if (t === "video") return <VideoCameraIcon className="w-5 h-5 text-purple-500" />;
  if (t === "image") return <PhotoIcon className="w-5 h-5 text-green-500" />;
  if (t === "link") return <LinkIcon className="w-5 h-5 text-indigo-500" />;
  return <FolderIcon className="w-5 h-5 text-gray-500" />;
}

function typeBg(type: string) {
  const t = type.toLowerCase();
  if (t === "pdf") return "bg-red-50 dark:bg-red-900/20";
  if (["docx", "doc", "document"].includes(t)) return "bg-blue-50 dark:bg-blue-900/20";
  if (t === "video") return "bg-purple-50 dark:bg-purple-900/20";
  if (t === "image") return "bg-green-50 dark:bg-green-900/20";
  if (t === "link") return "bg-indigo-50 dark:bg-indigo-900/20";
  return "bg-gray-50 dark:bg-gray-700";
}

async function shareResource(r: Resource) {
  const text = `${r.title}${r.description ? `\n${r.description}` : ""}${r.link ? `\n${r.link}` : ""}`;
  if (navigator.share) { try { await navigator.share({ title: r.title, text }); } catch { /* cancelled */ } }
  else { await navigator.clipboard.writeText(text); showSuccessToast("Copied to clipboard"); }
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
// RESOURCE ROW (compact card)
// ============================================================================

const ResourceRow = ({ resource, onClick, isActive }: { resource: Resource; onClick: () => void; isActive: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full text-left bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-md transition-all ${isActive ? "border-[#00B5A5] ring-1 ring-[#00B5A5]" : "border-gray-200 dark:border-gray-700"}`}
  >
    <div className="p-4 flex items-start gap-3">
      <div className={`p-2.5 rounded-lg flex-shrink-0 ${typeBg(resource.type)}`}>
        {typeIcon(resource.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{resource.title}</h3>
        {resource.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{resource.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
          <span className="uppercase font-medium">{resource.type}</span>
          {resource.file_size && <span>{fmtSize(resource.file_size)}</span>}
          <span>{fmtRelative(resource.created_at)}</span>
          {(resource.downloads || 0) > 0 && (
            <span className="flex items-center gap-0.5"><ArrowDownTrayIcon className="w-3 h-3" />{resource.downloads}</span>
          )}
        </div>
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {resource.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  </button>
);

// ============================================================================
// RESOURCE DETAIL SHEET
// ============================================================================

const ResourceSheet = ({ resource, onClose, onView, onDownload, onLike, onDislike }: {
  resource: Resource;
  onClose: () => void;
  onView: (url: string, name: string) => void;
  onDownload: (id: number) => void;
  onLike: (id: number) => void;
  onDislike: (id: number) => void;
}) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleLike = () => {
    if (!liked) { setLiked(true); setDisliked(false); onLike(resource.id); }
  };
  const handleDislike = () => {
    if (!disliked) { setDisliked(true); setLiked(false); onDislike(resource.id); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">Resource Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          {resource.type.toLowerCase() === "image" && resource.file_url && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <img src={resource.file_url} alt={resource.title} className="w-full h-48 object-cover" />
            </div>
          )}
          {resource.type.toLowerCase() === "video" && resource.file_url && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <video src={resource.file_url} controls className="w-full" preload="metadata" />
            </div>
          )}

          {/* Title & Type */}
          <div>
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-3 rounded-xl flex-shrink-0 ${typeBg(resource.type)}`}>{typeIcon(resource.type)}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{resource.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{resource.type}</span>
                  {resource.file_size && <span className="text-xs text-gray-400">{fmtSize(resource.file_size)}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${resource.visibility === "Public" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}`}>
                    {resource.visibility}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {resource.description && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{resource.description}</p>
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Meta */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Details</h4>
            <div className="space-y-2.5">
              {resource.uploaded_by && (
                <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                  <UserCircleIcon className="w-5 h-5 text-[#00B5A5] flex-shrink-0" />
                  <span>{resource.uploaded_by}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <CalendarIcon className="w-5 h-5 text-[#00B5A5] flex-shrink-0" />
                <span>{new Date(resource.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <ArrowDownTrayIcon className="w-5 h-5 text-[#00B5A5] flex-shrink-0" />
                <span>{resource.downloads || 0} downloads</span>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Feedback</h4>
            <div className="flex items-center gap-3">
              <button onClick={handleLike} disabled={liked} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${liked ? "border-red-200 dark:border-red-800 text-red-500 bg-red-50 dark:bg-red-900/20" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                {liked ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                {(resource.likes_count || 0) + (liked ? 1 : 0)}
              </button>
              <button onClick={handleDislike} disabled={disliked} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${disliked ? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700" : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
                <HandThumbDownIcon className={`w-4 h-4 ${disliked ? "fill-current" : ""}`} />
                {(resource.dislikes_count || 0) + (disliked ? 1 : 0)}
              </button>
              <button onClick={() => shareResource(resource)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors ml-auto">
                <ShareIcon className="w-4 h-4" />Share
              </button>
            </div>
          </div>
        </div>

        {/* Sticky footer actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
          {resource.file_url && (
            <>
              <button onClick={() => onView(resource.file_url!, resource.title)} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <EyeIcon className="w-4 h-4" />View
              </button>
              <button onClick={() => onDownload(resource.id)} className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg text-white bg-[#00B5A5] hover:bg-[#008F82] transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />Download
              </button>
            </>
          )}
          {resource.link && (
            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg text-white bg-[#00B5A5] hover:bg-[#008F82] transition-colors">
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />Open Link
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN
// ============================================================================

export default function MemberResourcesPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState("");
  const [viewerName, setViewerName] = useState("");

  const { resources, loading, fetchResources, downloadResource, likeResource, dislikeResource } = useMemberResources();

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleRefresh = async () => { setRefreshing(true); await fetchResources(); setRefreshing(false); };
  const handleView = (url: string, name: string) => { setViewerUrl(url); setViewerName(name); setFileViewerOpen(true); };
  const handleDownload = async (id: number) => { await downloadResource(id); };

  const categories = Array.from(new Set(resources.flatMap(r => r.tags || []))).sort();

  const typeCounts = {
    all: resources.length,
    pdf: resources.filter(r => r.type.toLowerCase() === "pdf").length,
    docx: resources.filter(r => ["docx", "doc", "document"].includes(r.type.toLowerCase())).length,
    video: resources.filter(r => r.type.toLowerCase() === "video").length,
    image: resources.filter(r => r.type.toLowerCase() === "image").length,
    link: resources.filter(r => r.type.toLowerCase() === "link").length,
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()) || r.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === "all" || r.tags?.some(t => t.toLowerCase() === categoryFilter.toLowerCase());
    const matchType = activeTab === "all" || (activeTab === "pdf" && r.type.toLowerCase() === "pdf") || (activeTab === "docx" && ["docx", "doc", "document"].includes(r.type.toLowerCase())) || (activeTab === "video" && r.type.toLowerCase() === "video") || (activeTab === "image" && r.type.toLowerCase() === "image") || (activeTab === "link" && r.type.toLowerCase() === "link");
    return matchSearch && matchCat && matchType;
  });

  const typeTabs = [
    { id: "all", label: "All", count: typeCounts.all },
    { id: "pdf", label: "PDFs", count: typeCounts.pdf },
    { id: "docx", label: "Docs", count: typeCounts.docx },
    { id: "video", label: "Videos", count: typeCounts.video },
    { id: "image", label: "Images", count: typeCounts.image },
    { id: "link", label: "Links", count: typeCounts.link },
  ].filter(t => t.id === "all" || t.count > 0);

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Library</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Access resources shared by your community</p>
        </div>
        <button onClick={handleRefresh} disabled={loading || refreshing} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
          <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
        </button>
      </div>

      {loading && !refreshing ? <Skeleton /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Resources</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{resources.length}</p></div>
              <div className="p-2 bg-[#00B5A5]/10 rounded-lg"><FolderIcon className="w-6 h-6 text-[#00B5A5]" /></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Downloads</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{resources.reduce((s, r) => s + (r.downloads || 0), 0).toLocaleString()}</p></div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ArrowDownTrayIcon className="w-6 h-6 text-blue-600" /></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Categories</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p></div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><FolderIcon className="w-6 h-6 text-purple-600" /></div>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {typeTabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === t.id ? "border-[#00B5A5] text-[#00B5A5]" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>
                  {t.label} ({t.count})
                </button>
              ))}
            </div>
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white" />
              </div>
              {categories.length > 0 && (
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Resource Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(r => (
                <ResourceRow key={r.id} resource={r} onClick={() => setSelected(r)} isActive={selected?.id === r.id} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FolderIcon className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-900 dark:text-white">{resources.length === 0 ? "No resources available" : "No resources match your search"}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{resources.length === 0 ? "Check back later" : "Try adjusting your filters"}</p>
            </div>
          )}

          {/* Detail Sheet */}
          {selected && (
            <ResourceDetailSheet
              isOpen={!!selected}
              onClose={() => setSelected(null)}
              resource={selected as unknown as AdminResource}
              onView={handleView}
              onDownload={(url, name) => { handleDownload(selected.id); }}
            />
          )}

          {/* File Viewer */}
          <FileViewer fileUrl={viewerUrl} fileName={viewerName} isOpen={fileViewerOpen} onClose={() => setFileViewerOpen(false)} />
        </>
      )}
    </div>
  );
}
