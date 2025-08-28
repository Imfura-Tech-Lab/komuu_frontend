"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

interface Member {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth: string;
  national_ID: string;
  passport?: string;
  whatsapp_number?: string;
  secondary_email?: string;
  alternative_phone?: string;
  public_profile?: string;
  created_at?: string;
  updated_at?: string;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
}

interface SingleMemberPageProps {
  memberId: string;
}

export default function SingleMemberPage({ memberId }: SingleMemberPageProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    role: "",
    active: true,
    verified: true,
  });

  const router = useRouter();

  useEffect(() => {
    fetchMember();
  }, [memberId]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view member");
        return;
      }

      const response = await fetch(`${apiUrl}members/${memberId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Member not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setMember(data.data);
        setEditForm({
          role: data.data.role,
          active: data.data.active,
          verified: data.data.verified,
        });
      } else {
        throw new Error(data.message || "Failed to fetch member");
      }
    } catch (err) {
      console.error("Failed to fetch member:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch member");
      showErrorToast("Failed to load member details");
    } finally {
      setLoading(false);
    }
  };

  const updateMember = async () => {
    try {
      setIsUpdating(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to update member");
        return;
      }

      const response = await fetch(`${apiUrl}members/${memberId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        showSuccessToast("Member updated successfully");
        setShowEditModal(false);
        await fetchMember();
      } else {
        throw new Error(data.message || "Failed to update member");
      }
    } catch (err) {
      console.error("Failed to update member:", err);
      showErrorToast(
        err instanceof Error ? err.message : "Failed to update member"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "administrator":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "president":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "board":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "member":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading member details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              ⚠️
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Member
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={fetchMember}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/members")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                Back to Members
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              👤
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              Member Not Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              The requested member could not be found.
            </p>
            <button
              onClick={() => router.push("/members")}
              className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors"
            >
              Back to Members
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/members")}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Members
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Edit Member
            </button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Member Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed information about the member
          </p>
        </div>

        {/* Member Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-[#00B5A5] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">
                {getUserInitials(member.name)}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {member.name}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {member.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Member ID: {member.id}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>

                  {member.verified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Verified
                    </span>
                  )}

                  {!member.active && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Details Sections */}
        <div className="space-y-6">
          {/* Personal Information */}
          <CollapsibleSection title="Personal Information" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Full Name
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.phone_number}
                  </p>
                </div>

                {member.whatsapp_number && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      WhatsApp
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.whatsapp_number}
                    </p>
                  </div>
                )}

                {member.secondary_email && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Secondary Email
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.secondary_email}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    National ID
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.national_ID}
                  </p>
                </div>

                {member.passport && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Passport
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.passport}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Date of Birth
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(member.date_of_birth)}
                  </p>
                </div>

                {member.alternative_phone && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Alternative Phone
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.alternative_phone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* Account Information */}
          <CollapsibleSection title="Account Information" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Role
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                      member.role
                    )}`}
                  >
                    {member.role}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Account Status
                  </p>
                  <div className="flex items-center space-x-2">
                    {member.active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Verification Status
                  </p>
                  <div className="flex items-center space-x-2">
                    {member.verified ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Password Changed
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {member.has_changed_password ? "Yes" : "No"}
                  </p>
                </div>

                {member.created_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Member Since
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(member.created_at)}
                    </p>
                  </div>
                )}

                {member.updated_at && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDateTime(member.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* Profile Image */}
          {member.public_profile && (
            <CollapsibleSection title="Profile Image">
              <div className="flex items-center space-x-4">
                <img
                  src={member.public_profile}
                  alt={`${member.name}'s profile`}
                  className="w-32 h-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Profile Picture
                  </p>
                  <a
                    href={member.public_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#00B5A5] hover:bg-[#009985] text-white text-sm rounded-md transition-colors"
                  >
                    View Full Size
                  </a>
                </div>
              </div>
            </CollapsibleSection>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Edit Member
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                  >
                    <option value="Member">Member</option>
                    <option value="Board">Board</option>
                    <option value="President">President</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.active}
                      onChange={(e) =>
                        setEditForm({ ...editForm, active: e.target.checked })
                      }
                      className="mr-2 text-[#00B5A5] focus:ring-[#00B5A5]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Active Account
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.verified}
                      onChange={(e) =>
                        setEditForm({ ...editForm, verified: e.target.checked })
                      }
                      className="mr-2 text-[#00B5A5] focus:ring-[#00B5A5]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Verified
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateMember}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Updating..." : "Update Member"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
