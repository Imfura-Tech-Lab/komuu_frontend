"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

interface Member {
  id: string;
  title?: string;
  surname: string;
  first_name: string;
  middle_name?: string;
  incompliance: boolean;
  membership_type: string;
  membership_number: string;
  certificate_status: string;
  country_of_residency: string;
  application_status: string;
  email?: string;
  phone_number?: string;
  role?: string;
  verified?: boolean;
  active?: boolean;
  has_changed_password?: boolean;
  date_of_birth?: string;
  national_ID?: string;
  passport?: string;
  whatsapp_number?: string;
  secondary_email?: string;
  alternative_phone?: string;
  public_profile?: string;
  created_at?: string;
  updated_at?: string;
}

interface MemberCardProps {
  member: Member;
  onMemberClick: (memberId: string) => void;
  getRoleColor: (role: string) => string;
  formatDate: (dateString: string) => string;
}

function MemberCard({
  member,
  onMemberClick,
  getRoleColor,
  formatDate,
}: MemberCardProps) {
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getFullName = (member: Member) => {
    const parts = [
      member.title,
      member.first_name,
      member.middle_name,
      member.surname,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const fullName = getFullName(member);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-[#00B5A5] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {getUserInitials(fullName)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <button
              onClick={() => onMemberClick(member.id)}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#00B5A5] transition-colors text-left truncate block w-full"
            >
              {fullName}
            </button>

            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
              {member.email || "No email provided"}
            </p>
            {member.phone_number && (
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                Phone: {member.phone_number}
              </p>
            )}

            <div className="flex flex-wrap items-center space-x-2 mt-2 gap-y-1">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                  member.membership_type
                )}`}
              >
                {member.membership_type}
              </span>

              {member.certificate_status === "Approved" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Approved
                </span>
              )}

              {member.application_status === "Pending" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  Pending
                </span>
              )}

              {!member.incompliance && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  Non-compliant
                </span>
              )}

              {member.verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Verified
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{member.membership_number}</span>
              <span>{member.country_of_residency}</span>
            </div>
            {member.created_at && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                Joined: {formatDate(member.created_at)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MembersClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipTypeFilter, setMembershipTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const router = useRouter();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view members");
        return;
      }

      const response = await fetch(`${apiUrl}members`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const membersData = data.data?.data || data.data || [];
        setMembers(Array.isArray(membersData) ? membersData : []);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch members");
      showErrorToast("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (membershipType: string) => {
    switch (membershipType.toLowerCase()) {
      case "full member":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "associate member":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "student member":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "honorary member":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "corporate member":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
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

  const handleMemberClick = (memberId: string) => {
    router.push(`/members/${memberId}`);
  };

  const filteredMembers = members.filter((member) => {
    const fullName = `${member.title || ""} ${member.first_name} ${
      member.middle_name || ""
    } ${member.surname}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (member.email &&
        member.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.membership_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.country_of_residency
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesMembershipType =
      membershipTypeFilter === "all" ||
      member.membership_type.toLowerCase() ===
        membershipTypeFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "approved" &&
        member.certificate_status === "Approved") ||
      (statusFilter === "pending" && member.application_status === "Pending") ||
      (statusFilter === "compliant" && member.incompliance) ||
      (statusFilter === "non-compliant" && !member.incompliance);

    return matchesSearch && matchesMembershipType && matchesStatus;
  });

  const getMembershipStats = () => {
    const stats = members.reduce(
      (acc, member) => {
        const type = member.membership_type.toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        acc.total++;
        acc.approved += member.certificate_status === "Approved" ? 1 : 0;
        acc.compliant += member.incompliance ? 1 : 0;
        acc.pending += member.application_status === "Pending" ? 1 : 0;
        return acc;
      },
      {
        total: 0,
        approved: 0,
        compliant: 0,
        pending: 0,
        "full member": 0,
        "associate member": 0,
        "student member": 0,
        "honorary member": 0,
        "corporate member": 0,
      } as Record<string, number>
    );
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading members...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">
              ⚠️
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Members
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchMembers}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getMembershipStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Members
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and view organization members
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Members
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.approved}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.compliant}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compliant
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats["full member"] || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full Members
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.pending || 0}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Search Members
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, membership number..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="membership-type-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter by Membership Type
              </label>
              <select
                id="membership-type-filter"
                value={membershipTypeFilter}
                onChange={(e) => setMembershipTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="full member">Full Member</option>
                <option value="associate member">Associate Member</option>
                <option value="student member">Student Member</option>
                <option value="honorary member">Honorary Member</option>
                <option value="corporate member">Corporate Member</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="compliant">Compliant</option>
                <option value="non-compliant">Non-compliant</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredMembers.length} of {members.length} members
          </p>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
              👥
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">
              No Members Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {searchTerm ||
              membershipTypeFilter !== "all" ||
              statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No members are available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onMemberClick={handleMemberClick}
                getRoleColor={getRoleColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Members
          </button>
        </div>
      </div>
    </div>
  );
}
