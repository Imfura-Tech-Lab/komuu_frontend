"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  VideoCameraIcon,
  LinkIcon,
  ShareIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMemberEvents, Event } from "@/lib/hooks/useMemberEvents";
import { showSuccessToast } from "@/components/layouts/auth-layer-out";
import { useDpoPayment } from "@/lib/hooks/useDpoPayment";

// ============================================================================
// HELPERS
// ============================================================================

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function isPast(e: Event) {
  return new Date(e.start_end || e.start_time) < new Date();
}
function isUpcoming(e: Event) {
  return !isPast(e) && (e.status === "Scheduled" || e.status === "Ongoing");
}
function timeUntil(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  if (diff < 0) return "Started";
  const days = Math.floor(diff / 864e5);
  if (days > 30) return `${Math.floor(days / 30)}mo`;
  if (days > 0) return `${days}d`;
  const hrs = Math.floor(diff / 36e5);
  if (hrs > 0) return `${hrs}h`;
  return `${Math.floor(diff / 6e4)}m`;
}
function modeIcon(m: string) {
  if (m === "Online") return <GlobeAltIcon className="w-3.5 h-3.5" />;
  if (m === "Hybrid") return <VideoCameraIcon className="w-3.5 h-3.5" />;
  return <BuildingOfficeIcon className="w-3.5 h-3.5" />;
}
function googleCalUrl(e: Event) {
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = e.start_end || new Date(new Date(e.start_time).getTime() + 72e5).toISOString();
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${fmt(e.start_time)}/${fmt(end)}`, details: e.description || "", location: e.location || e.attendance_link || "" })}`;
}
function downloadIcs(e: Event) {
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = e.start_end || new Date(new Date(e.start_time).getTime() + 72e5).toISOString();
  const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${fmt(e.start_time)}\r\nDTEND:${fmt(end)}\r\nSUMMARY:${e.title}\r\nDESCRIPTION:${(e.description || "").replace(/\n/g, "\\n")}\r\nLOCATION:${e.location || e.attendance_link || ""}\r\nEND:VEVENT\r\nEND:VCALENDAR`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `${e.title.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  a.click();
}
async function shareEvent(e: Event) {
  const text = `${e.title}\n${fmtDate(e.start_time)} at ${fmtTime(e.start_time)}${e.location ? `\n${e.location}` : ""}`;
  if (navigator.share) { try { await navigator.share({ title: e.title, text }); } catch { /* cancelled */ } }
  else { await navigator.clipboard.writeText(text); showSuccessToast("Copied to clipboard"); }
}
function getDaysInMonth(y: number, m: number) {
  const days: Date[] = [];
  const d = new Date(y, m, 1);
  while (d.getMonth() === m) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return days;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ============================================================================
// SKELETON
// ============================================================================

const Skeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" /><div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" /></div>)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" /><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" /></div>)}
    </div>
  </div>
);

// ============================================================================
// EVENT ROW (compact card for list)
// ============================================================================

const EventRow = ({ event, onClick, isActive }: { event: Event; onClick: () => void; isActive: boolean }) => {
  const past = isPast(event);
  const cap = event.capacity || 0;
  const reg = event.registrations || 0;
  const full = cap > 0 && reg >= cap;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-md transition-all ${
        isActive ? "border-[#00B5A5] ring-1 ring-[#00B5A5]" : "border-gray-200 dark:border-gray-700"
      } ${past ? "opacity-65" : ""}`}
    >
      <div className={`h-1 ${past ? "bg-gray-300 dark:bg-gray-600" : "bg-[#00B5A5]"}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">{event.title}</h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {event.is_registered && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
            {event.is_paid && <span className="text-xs font-medium text-amber-600 dark:text-amber-400">${event.price}</span>}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{fmtDate(event.start_time)}</span>
          <span className="flex items-center gap-1">{modeIcon(event.event_mode)}{event.event_mode}</span>
          {cap > 0 && <span className="flex items-center gap-1"><UserGroupIcon className="w-3 h-3" />{reg}/{cap}</span>}
        </div>
        {!past && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[#00B5A5] font-medium">{timeUntil(event.start_time)}</span>
            {full && <span className="text-xs text-red-500 font-medium">Full</span>}
          </div>
        )}
      </div>
    </button>
  );
};

// ============================================================================
// EVENT DETAIL SHEET (right side)
// ============================================================================

const EventSheet = ({ event, onClose, onRegister, onCancel }: {
  event: Event;
  onClose: () => void;
  onRegister: (e: Event) => void;
  onCancel: (e: Event) => void;
}) => {
  const [showCalMenu, setShowCalMenu] = useState(false);
  const past = isPast(event);
  const cap = event.capacity || 0;
  const reg = event.registrations || 0;
  const full = cap > 0 && reg >= cap;
  const fill = cap > 0 ? Math.min((reg / cap) * 100, 100) : 0;
  const canReg = !past && !full && !event.is_registered && event.status !== "Cancelled";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-4">Event Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title & badges */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{event.title}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{event.type}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${event.event_mode === "Online" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : event.event_mode === "Hybrid" ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"}`}>
                {modeIcon(event.event_mode)}{event.event_mode}
              </span>
              {event.is_paid && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <CurrencyDollarIcon className="w-3.5 h-3.5" />${event.price}
                </span>
              )}
              {!event.is_paid && <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">Free</span>}
              {event.is_registered && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircleIcon className="w-3.5 h-3.5" />Registered
                </span>
              )}
              {past && <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">Ended</span>}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">About</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Details */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Details</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-[#00B5A5] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{fmtDate(event.start_time)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fmtTime(event.start_time)}
                    {event.start_end && ` — ${fmtTime(event.start_end)}`}
                    {event.start_end && !sameDay(new Date(event.start_time), new Date(event.start_end)) && ` (${fmtDate(event.start_end)})`}
                  </p>
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-[#00B5A5] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{event.location}</p>
                </div>
              )}
              {event.attendance_link && (
                <div className="flex items-start gap-3">
                  <LinkIcon className="w-5 h-5 text-[#00B5A5] mt-0.5 flex-shrink-0" />
                  <a href={event.attendance_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00B5A5] hover:underline break-all">
                    {past ? "Meeting link" : "Join online"}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Capacity */}
          {cap > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Capacity</h4>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 dark:text-gray-300">{reg} of {cap} registered</span>
                {!past && !full && cap - reg <= 10 && <span className="text-amber-600 font-medium">{cap - reg} left</span>}
                {full && <span className="text-red-600 font-medium">Full</span>}
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${fill >= 90 ? "bg-red-500" : fill >= 70 ? "bg-amber-500" : "bg-[#00B5A5]"}`} style={{ width: `${fill}%` }} />
              </div>
            </div>
          )}

          {/* Calendar & Share */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Add to Calendar</h4>
            <div className="flex gap-2">
              <a href={googleCalUrl(event)} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <CalendarIcon className="w-4 h-4" />Google
              </a>
              <button onClick={() => downloadIcs(event)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <CalendarDaysIcon className="w-4 h-4" />.ics
              </button>
              <button onClick={() => shareEvent(event)} className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <ShareIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sticky footer action */}
        {!past && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            {event.is_registered ? (
              <button onClick={() => onCancel(event)} className="w-full py-2.5 text-sm font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <XCircleIcon className="w-4 h-4 inline mr-1.5" />Cancel Registration
              </button>
            ) : (
              <button onClick={() => onRegister(event)} disabled={!canReg} className="w-full py-2.5 text-sm font-medium rounded-lg text-white bg-[#00B5A5] hover:bg-[#008F82] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <UserPlusIcon className="w-4 h-4 inline mr-1.5" />
                {full ? "Fully Booked" : event.is_paid ? `Register — $${event.price}` : "Register — Free"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CALENDAR VIEW
// ============================================================================

const CalendarView = ({ events, onSelect }: { events: Event[]; onSelect: (e: Event) => void }) => {
  const [cur, setCur] = useState(new Date());
  const y = cur.getFullYear(), m = cur.getMonth();
  const days = getDaysInMonth(y, m);
  const pad = Array(new Date(y, m, 1).getDay()).fill(null);
  const today = new Date();

  const byDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((e) => {
      const k = new Date(e.start_time).toDateString();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    });
    return map;
  }, [events]);

  const [selDate, setSelDate] = useState<Date | null>(null);
  const selEvents = selDate ? byDate.get(selDate.toDateString()) || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCur(new Date(y, m - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{cur.toLocaleString("en-US", { month: "long", year: "numeric" })}</h3>
          <button onClick={() => setCur(new Date(y, m + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {pad.map((_, i) => <div key={`p${i}`} className="aspect-square" />)}
          {days.map((day) => {
            const k = day.toDateString();
            const de = byDate.get(k) || [];
            const has = de.length > 0;
            const isTd = sameDay(day, today);
            const isSel = selDate && sameDay(day, selDate);
            return (
              <button key={k} onClick={() => setSelDate(day)} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${isSel ? "bg-[#00B5A5] text-white" : isTd ? "bg-[#00B5A5]/10 text-[#00B5A5] font-bold" : has ? "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium" : "text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}>
                <span>{day.getDate()}</span>
                {has && <div className="flex gap-0.5 mt-0.5">{de.slice(0, 3).map((_, i) => <div key={i} className={`w-1 h-1 rounded-full ${isSel ? "bg-white" : de.some(ev => ev.is_registered) ? "bg-green-500" : "bg-[#00B5A5]"}`} />)}</div>}
              </button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-[#00B5A5]" />Events</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-green-500" />Registered</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {selDate ? selDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Select a date"}
          </h3>
        </div>
        <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
          {selEvents.length > 0 ? selEvents.map((ev) => (
            <button key={ev.id} onClick={() => onSelect(ev)} className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ev.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>{fmtTime(ev.start_time)}</span>
                <span className="flex items-center gap-0.5">{modeIcon(ev.event_mode)}{ev.event_mode}</span>
                {ev.is_paid && <span className="text-amber-600">${ev.price}</span>}
                {ev.is_registered && <CheckCircleIcon className="w-3 h-3 text-green-500" />}
              </div>
            </button>
          )) : (
            <div className="py-8 text-center">
              <CalendarIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{selDate ? "No events" : "Click a date"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAGINATION
// ============================================================================

const Pagination = ({ current, last, onChange }: { current: number; last: number; onChange: (p: number) => void }) => {
  if (last <= 1) return null;
  const pages: number[] = [];
  for (let i = 1; i <= last; i++) {
    if (i === 1 || i === last || Math.abs(i - current) <= 1) pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button onClick={() => onChange(current - 1)} disabled={current === 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Prev</button>
      {pages.map((p, i) => {
        const prev = pages[i - 1];
        return (
          <React.Fragment key={p}>
            {prev && p - prev > 1 && <span className="px-1 text-gray-400">...</span>}
            <button onClick={() => onChange(p)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${p === current ? "bg-[#00B5A5] text-white" : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>{p}</button>
          </React.Fragment>
        );
      })}
      <button onClick={() => onChange(current + 1)} disabled={current === last} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Next</button>
    </div>
  );
};

// ============================================================================
// MAIN
// ============================================================================

type TabId = "upcoming" | "registered" | "past";
type ViewMode = "list" | "calendar";

export default function MemberEventsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabId>("upcoming");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("list");
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Event | null>(null);

  const { initiateEventPayment } = useDpoPayment();
  const { events, loading, pagination, fetchEvents, registerForEvent, cancelRegistration } = useMemberEvents();

  useEffect(() => { fetchEvents(1); }, [fetchEvents]);

  const upcoming = events.filter(isUpcoming);
  const registered = events.filter((e) => e.is_registered);
  const past = events.filter(isPast);

  const filtered = useMemo(() => {
    let list = tab === "upcoming" ? upcoming : tab === "registered" ? registered : past;
    return list.filter((e) => {
      const s = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.type?.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase());
      const t = typeFilter === "all" || e.type?.toLowerCase() === typeFilter.toLowerCase();
      return s && t;
    });
  }, [tab, upcoming, registered, past, search, typeFilter]);

  const types = Array.from(new Set(events.map((e) => e.type).filter(Boolean))).sort();

  const handleRefresh = async () => { setRefreshing(true); await fetchEvents(pagination.currentPage); setRefreshing(false); };
  const handleRegister = async (e: Event) => {
    if (e.is_paid) { const url = await initiateEventPayment(e.id); if (url) window.location.href = url; return; }
    const ok = await registerForEvent({ event_id: e.id, is_paid: false });
    if (ok && selected?.id === e.id) setSelected({ ...e, is_registered: true, registrations: (e.registrations || 0) + 1 });
  };
  const handleCancel = async (e: Event) => {
    if (!confirm("Cancel your registration?")) return;
    const ok = await cancelRegistration(e.id);
    if (ok && selected?.id === e.id) setSelected({ ...e, is_registered: false, registrations: Math.max((e.registrations || 0) - 1, 0) });
  };

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "registered", label: "Registered", count: registered.length },
    { id: "past", label: "Past", count: past.length },
  ];

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events & Conferences</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Discover, register, and add events to your calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5">
            <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-[#00B5A5] text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}><ListBulletIcon className="w-4 h-4" /></button>
            <button onClick={() => setView("calendar")} className={`p-1.5 rounded-md transition-colors ${view === "calendar" ? "bg-[#00B5A5] text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}><CalendarDaysIcon className="w-4 h-4" /></button>
          </div>
          <button onClick={handleRefresh} disabled={loading || refreshing} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors">
            <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>
      </div>

      {loading && !refreshing ? <Skeleton /> : view === "calendar" ? (
        <>
          <CalendarView events={events} onSelect={setSelected} />
          {selected && <EventSheet event={selected} onClose={() => setSelected(null)} onRegister={handleRegister} onCancel={handleCancel} />}
        </>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{upcoming.length}</p></div>
              <div className="p-2 bg-[#00B5A5]/10 rounded-lg"><CalendarIcon className="w-6 h-6 text-[#00B5A5]" /></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Registered</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{registered.length}</p></div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><UserGroupIcon className="w-6 h-6 text-blue-600" /></div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">Past</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{past.length}</p></div>
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><ClockIcon className="w-6 h-6 text-gray-500" /></div>
            </div>
          </div>

          {/* Tabs + Search */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? "border-[#00B5A5] text-[#00B5A5]" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}>
                  {t.label} ({t.count})
                </button>
              ))}
            </div>
            <div className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white" />
              </div>
              {types.length > 1 && (
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:bg-gray-700 dark:text-white">
                  <option value="all">All Types</option>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Events Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((e) => (
                <EventRow key={e.id} event={e} onClick={() => setSelected(e)} isActive={selected?.id === e.id} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <CalendarIcon className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-medium text-gray-900 dark:text-white">{tab === "upcoming" ? "No upcoming events" : tab === "registered" ? "No registrations" : "No past events"}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tab === "upcoming" ? "Check back later" : tab === "registered" ? "Browse upcoming events" : "Past events appear here"}</p>
            </div>
          )}

          {/* Pagination */}
          <Pagination current={pagination.currentPage} last={pagination.lastPage} onChange={(p) => fetchEvents(p)} />

          {/* Detail Sheet */}
          {selected && <EventSheet event={selected} onClose={() => setSelected(null)} onRegister={handleRegister} onCancel={handleCancel} />}
        </>
      )}
    </div>
  );
}
