"use client";

import { useState } from "react";
import {
  BellIcon,
  PaperAirplaneIcon,
  UsersIcon,
  UserGroupIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Notification {
  id: string;
  title: string;
  message: string;
  recipients: string;
  sentAt: string;
  status: "sent" | "pending" | "failed";
  type: "email" | "sms" | "push";
}

export default function NotificationsClient() {
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipients: "all",
    channels: [] as string[],
  });

  const recentNotifications: Notification[] = [
    {
      id: "1",
      title: "Annual Membership Renewal Reminder",
      message: "Your membership is due for renewal...",
      recipients: "All Members",
      sentAt: "2024-01-15 10:30 AM",
      status: "sent",
      type: "email",
    },
    {
      id: "2",
      title: "Upcoming Conference Registration",
      message: "Register now for the 2024 Annual Conference...",
      recipients: "Active Members",
      sentAt: "2024-01-14 02:00 PM",
      status: "sent",
      type: "email",
    },
    {
      id: "3",
      title: "Payment Confirmation",
      message: "Your payment has been received...",
      recipients: "John Doe",
      sentAt: "2024-01-13 09:15 AM",
      status: "sent",
      type: "sms",
    },
  ];

  const handleChannelToggle = (channel: string) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle notification send
    alert("Notification functionality coming soon!");
  };

  const getStatusIcon = (status: Notification["status"]) => {
    switch (status) {
      case "sent":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "email":
        return <EnvelopeIcon className="h-5 w-5 text-blue-500" />;
      case "sms":
        return <DevicePhoneMobileIcon className="h-5 w-5 text-purple-500" />;
      case "push":
        return <BellIcon className="h-5 w-5 text-orange-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Send notifications to members via email, SMS, or push notifications
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("compose")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "compose"
                ? "border-[#00B5A5] text-[#00B5A5]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Compose New
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "history"
                ? "border-[#00B5A5] text-[#00B5A5]"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {activeTab === "compose" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                  placeholder="Enter notification title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent resize-none"
                  placeholder="Enter your message..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipients
                </label>
                <select
                  value={formData.recipients}
                  onChange={(e) =>
                    setFormData({ ...formData, recipients: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                >
                  <option value="all">All Members</option>
                  <option value="active">Active Members Only</option>
                  <option value="pending">Pending Applications</option>
                  <option value="board">Board Members</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Channels
                </label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { id: "email", label: "Email", icon: <EnvelopeIcon className="h-5 w-5" /> },
                    { id: "sms", label: "SMS", icon: <DevicePhoneMobileIcon className="h-5 w-5" /> },
                    { id: "push", label: "Push", icon: <BellIcon className="h-5 w-5" /> },
                  ].map((channel) => (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => handleChannelToggle(channel.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        formData.channels.includes(channel.id)
                          ? "border-[#00B5A5] bg-[#00B5A5]/10 text-[#00B5A5]"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {channel.icon}
                      {channel.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#00B5A5] text-white rounded-lg hover:bg-[#008F82] transition-colors font-medium"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                Send Notification
              </button>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Total Recipients</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Active Members</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">987</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Emails Sent Today</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">45</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Templates
              </h3>
              <div className="space-y-2">
                {["Welcome Email", "Payment Reminder", "Event Invitation", "Renewal Notice"].map(
                  (template) => (
                    <button
                      key={template}
                      className="w-full text-left px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {template}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {notification.message}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {notification.recipients}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {notification.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(notification.status)}
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {notification.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {notification.sentAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
