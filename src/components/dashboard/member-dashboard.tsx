"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { MemberDashboardData } from "@/types/dashboard";

interface MemberDashboardProps {
  data: MemberDashboardData;
  message: string;
  refetch: () => void;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getStatusColor(status: string) {
  const s = status?.toLowerCase();
  if (s === "pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (s === "waiting for payment") return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  if (s === "review" || s === "under review") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (s === "approved" || s === "certgenerated" || s === "certificate generated") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  if (s === "rejected") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}

function getStatusLabel(status: string): string {
  const s = status?.toLowerCase();
  if (s === "certgenerated" || s === "certificate generated") return "Active";
  if (s === "waiting for payment") return "Awaiting Payment";
  return status;
}

function getWelcomeMessage(status: string, hasApp: boolean): string {
  if (!hasApp) return "Submit your application to get started";
  const s = status.toLowerCase();
  if (s === "pending") return "Your application is under review";
  if (s === "waiting for payment") return "Complete your payment to activate membership";
  if (s === "approved") return "Payment received — awaiting certificate";
  if (s === "certgenerated" || s === "certificate generated") return "Track your membership, certificates, and events";
  if (s === "rejected") return "Your application was not approved — contact support";
  return "Track your membership, certificates, and events";
}

// Membership validity progress bar
function MembershipProgress({ certificate }: { certificate: MemberDashboardData["certificate"] }) {
  if (!certificate?.valid_until) return null;

  const validFrom = certificate.next_renewal ? new Date(new Date(certificate.valid_until).getTime() - 365 * 24 * 60 * 60 * 1000) : new Date();
  const validUntil = new Date(certificate.valid_until);
  const now = new Date();
  const totalDays = differenceInDays(validUntil, validFrom);
  const elapsedDays = differenceInDays(now, validFrom);
  const remainingDays = differenceInDays(validUntil, now);
  const progress = totalDays > 0 ? Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100) : 0;

  const isExpired = remainingDays < 0;
  const isExpiringSoon = remainingDays >= 0 && remainingDays <= 60;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Membership Validity</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isExpired ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : isExpiringSoon ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
          {isExpired ? "Expired" : isExpiringSoon ? `${remainingDays}d left` : `${remainingDays}d remaining`}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${isExpired ? "bg-red-500" : isExpiringSoon ? "bg-amber-500" : "bg-[#00B5A5]"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{formatDate(validFrom.toISOString())}</span>
        <span>{formatDate(certificate.valid_until)}</span>
      </div>
    </div>
  );
}

export default function MemberDashboard({ data, refetch }: MemberDashboardProps) {
  const router = useRouter();
  const { application, certificate, renewal_due, next_renewal_date, events, messages } = data;
  const appStatus = application?.status || "No Application";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00B5A5] to-[#00D4C7] rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back!</h2>
            <p className="text-[#E6FFFD] text-sm">{getWelcomeMessage(appStatus, !!application)}</p>
            {application?.membership_number && (
              <p className="text-white/60 text-xs mt-1">Member No: {application.membership_number}</p>
            )}
          </div>
          <button onClick={refetch} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" title="Refresh">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Renewal Alert */}
      {renewal_due && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Membership Renewal Due</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {certificate?.is_expired ? "Your membership has expired" : "Your membership is expiring soon"}
                </p>
              </div>
            </div>
            <button onClick={() => router.push("/my-payments")} className="px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:text-amber-200 dark:hover:bg-amber-700 rounded-lg transition-colors">
              Renew Now
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "My Application", href: "/my-application", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
          { label: "My Payments", href: "/my-payments", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600" },
          { label: "My Certificates", href: "/my-certificates", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "bg-green-100 dark:bg-green-900/30 text-green-600" },
          { label: "Community", href: "/community/groups", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
        ].map((action) => (
          <button key={action.href} onClick={() => router.push(action.href)} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm transition-all">
            <div className={`p-2 rounded-lg ${action.color}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} /></svg>
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Membership Overview — 3 cards + progress bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Application Status */}
        <button onClick={() => router.push("/my-application")} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-left hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appStatus)}`}>{getStatusLabel(appStatus)}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Application</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{application?.organization || "View your membership application"}</p>
          {application?.membership_type && (
            <p className="text-[10px] text-[#00B5A5] font-medium mt-1">{application.membership_type}</p>
          )}
        </button>

        {/* Upcoming Events */}
        <button onClick={() => router.push("/my-events")} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-left hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{events?.total || 0}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Upcoming Events</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Conferences and workshops</p>
        </button>

        {/* Payment Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            {application?.has_paid ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Paid</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Unpaid</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Status</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {next_renewal_date ? `Next renewal: ${formatDate(next_renewal_date)}` : "No renewal scheduled"}
          </p>
        </div>
      </div>

      {/* Membership Progress Bar */}
      <MembershipProgress certificate={certificate} />

      {/* Two-column: Events + Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upcoming Events</h3>
            <button onClick={() => router.push("/my-events")} className="text-xs text-[#00B5A5] hover:underline">View All</button>
          </div>
          {events?.upcoming && events.upcoming.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.upcoming.map((event) => (
                <div key={event.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">{event.title}</p>
                    {event.is_paid && <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-[#00B5A5]/10 text-[#00B5A5]">${event.price}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {formatDate(event.start_time)}
                    </span>
                    {event.location && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming events</p>
            </div>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Messages</h3>
            <button onClick={() => router.push("/community/groups")} className="text-xs text-[#00B5A5] hover:underline">View All</button>
          </div>
          {messages && messages.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {messages.map((msg) => (
                <div key={msg.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00B5A5]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-[#00B5A5]">{msg.sender_name?.charAt(0)?.toUpperCase() || "?"}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{msg.sender_name || "Unknown"}</p>
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {msg.conversation_title && <span className="font-medium">{msg.conversation_title}: </span>}
                        {msg.body || ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
