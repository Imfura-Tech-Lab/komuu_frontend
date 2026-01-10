"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  TagIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
} from "@heroicons/react/24/solid";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

// Types matching API response
interface MembershipCategory {
  id: number;
  category: string;
  price: string;
  currency: string;
  frequency: string;
  details: string | null;
  requirements: string | null;
  can_be_applied: boolean;
  total_applications: number;
  created_at?: string;
  updated_at?: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

interface CategoriesResponse {
  current_page: number;
  data: MembershipCategory[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="p-5 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// Category Row Component
function CategoryRow({
  category,
  onView,
  onEdit,
  onDelete,
  deleting,
}: {
  category: MembershipCategory;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:border-[#00B5A5]/50 transition-all">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Left: Icon & Name */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00B5A5] to-[#008F82] text-white flex-shrink-0">
            <TagIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {category.category}
              </p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  category.can_be_applied
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {category.can_be_applied ? (
                  <>
                    <CheckCircleSolid className="w-3 h-3" />
                    Open
                  </>
                ) : (
                  "Closed"
                )}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
              {category.details || `${category.frequency} membership`}
            </p>
          </div>
        </div>

        {/* Center: Details */}
        <div className="grid flex-1 grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {parseFloat(category.price) === 0 ? "Free" : `${category.price} ${category.currency}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {category.frequency}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-gray-500 dark:text-gray-400">Applications</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {category.total_applications}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onView}
            className="p-2 text-gray-500 hover:text-[#00B5A5] hover:bg-[#00B5A5]/10 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Edit"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
            title="Delete"
          >
            {deleting ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <TrashIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile: Extra Info */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-700/50 sm:hidden">
        <div className="flex items-center gap-2 text-sm">
          <UserGroupIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">
            {category.total_applications} application{category.total_applications !== 1 ? "s" : ""}
          </span>
        </div>
        <span className={`text-xs font-medium ${category.can_be_applied ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500"}`}>
          {category.can_be_applied ? "Accepting" : "Not Accepting"}
        </span>
      </div>
    </div>
  );
}

// Loading Skeleton
function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="w-20 h-4 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                <div className="w-12 h-8 mt-2 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* List Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              <div className="flex-1">
                <div className="w-40 h-5 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                <div className="h-4 mt-2 bg-gray-200 rounded w-60 dark:bg-gray-700 animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="bg-gray-200 rounded-lg h-9 w-9 dark:bg-gray-700 animate-pulse" />
                <div className="bg-gray-200 rounded-lg h-9 w-9 dark:bg-gray-700 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="p-12 text-center bg-white border border-gray-200 dark:bg-gray-800 rounded-2xl dark:border-gray-700">
      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full dark:bg-gray-700">
        <TagIcon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        No Membership Categories
      </h3>
      <p className="max-w-sm mx-auto mb-6 text-gray-600 dark:text-gray-400">
        Create your first membership category to define membership types and pricing.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
      >
        <PlusIcon className="w-5 h-5" />
        Add Category
      </button>
    </div>
  );
}

// View Details Modal
function ViewDetailsModal({
  isOpen,
  onClose,
  category,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: MembershipCategory | null;
}) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-[#00B5A5] to-[#008F82] px-6 py-5 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{category.category}</h3>
                <p className="mt-1 text-sm text-white/80">Membership Category</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 transition-colors rounded-lg text-white/80 hover:text-white hover:bg-white/20"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Price & Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {parseFloat(category.price) === 0 ? "Free" : `${category.price} ${category.currency}`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{category.frequency}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  category.can_be_applied
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                }`}
              >
                {category.can_be_applied ? (
                  <>
                    <CheckCircleSolid className="w-4 h-4" />
                    Open for Applications
                  </>
                ) : (
                  <>
                    <XCircleIcon className="w-4 h-4" />
                    Closed
                  </>
                )}
              </span>
            </div>

            {/* Applications Count */}
            <div className="flex items-center gap-3 p-4 bg-[#00B5A5]/10 rounded-xl">
              <UserGroupIcon className="w-8 h-8 text-[#00B5A5]" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.total_applications}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Application{category.total_applications !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Details */}
            {category.details && (
              <div>
                <h4 className="mb-2 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Details
                </h4>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {category.details}
                </p>
              </div>
            )}

            {/* Requirements */}
            {category.requirements && (
              <div>
                <h4 className="mb-2 text-sm font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Requirements
                </h4>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {category.requirements}
                </p>
              </div>
            )}

            {/* No details message */}
            {!category.details && !category.requirements && (
              <div className="py-4 text-center">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No additional details or requirements specified
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Modal Component
function CategoryModal({
  isOpen,
  onClose,
  category,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: MembershipCategory | null;
  onSave: (data: FormData) => void;
  saving: boolean;
}) {
  const [formData, setFormData] = useState({
    category: "",
    price: "",
    currency: "USD",
    frequency: "Yearly",
    details: "",
    requirements: "",
    can_be_applied: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        category: category.category,
        price: category.price,
        currency: category.currency,
        frequency: category.frequency,
        details: category.details || "",
        requirements: category.requirements || "",
        can_be_applied: category.can_be_applied,
      });
    } else {
      setFormData({
        category: "",
        price: "",
        currency: "USD",
        frequency: "Yearly",
        details: "",
        requirements: "",
        can_be_applied: true,
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("currency", formData.currency);
    data.append("frequency", formData.frequency);
    data.append("details", formData.details);
    data.append("requirements", formData.requirements);
    data.append("can_be_applied", formData.can_be_applied ? "1" : "0");
    
    if (category) {
      data.append("_method", "PUT");
    }
    
    onSave(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {category ? "Edit Category" : "Add Category"}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 dark:hover:text-gray-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                placeholder="e.g., Full Member, Associate Member, Honorary"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="RWF">RWF</option>
                  <option value="KES">KES</option>
                  <option value="UGX">UGX</option>
                  <option value="ZAR">ZAR</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent"
              >
                <option value="One-time">One-time</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
                <option value="Biennial">Biennial (2 years)</option>
                <option value="Non-Renewable">Non-Renewable</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Details
              </label>
              <textarea
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                rows={3}
                placeholder="Brief description of this membership type..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Requirements
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                rows={3}
                placeholder="List the requirements for this membership type..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="can_be_applied"
                checked={formData.can_be_applied}
                onChange={(e) =>
                  setFormData({ ...formData, can_be_applied: e.target.checked })
                }
                className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]"
              />
              <label
                htmlFor="can_be_applied"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Open for applications (members can apply for this category)
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#009985] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <ArrowPathIcon className="w-4 h-4 animate-spin" />}
                {category ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function MembershipCategoriesClient() {
  const [categoriesData, setCategoriesData] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MembershipCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<MembershipCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchCategories = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      if (!token) {
        showErrorToast("Please login to view membership categories");
        router.push("/login");
        return;
      }

      const response = await fetch(`${apiUrl}membership/categories?page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          showErrorToast("Unauthorized. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (responseData.status === "success") {
        setCategoriesData(responseData.data);
      } else {
        throw new Error(responseData.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
      showErrorToast("Failed to load membership categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: FormData) => {
    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      const url = editingCategory
        ? `${apiUrl}membership/categories/${editingCategory.id}`
        : `${apiUrl}membership/categories`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to save category");
      }

      showSuccessToast(
        editingCategory ? "Category updated successfully" : "Category created successfully"
      );
      setModalOpen(false);
      setEditingCategory(null);
      fetchCategories(currentPage);
    } catch (err) {
      console.error("Failed to save category:", err);
      showErrorToast(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: MembershipCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.category}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(category.id);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${apiUrl}membership/categories/${category.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Failed to delete category");
      }

      showSuccessToast("Category deleted successfully");
      fetchCategories(currentPage);
    } catch (err) {
      console.error("Failed to delete category:", err);
      showErrorToast(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (category: MembershipCategory) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleView = (category: MembershipCategory) => {
    setViewingCategory(category);
    setViewModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  // Get categories array
  const categories = categoriesData?.data || [];

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.details?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "open" && category.can_be_applied) ||
      (statusFilter === "closed" && !category.can_be_applied);

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: categoriesData?.total || categories.length,
    open: categories.filter((c) => c.can_be_applied).length,
    closed: categories.filter((c) => !c.can_be_applied).length,
    totalApplications: categories.reduce((sum, c) => sum + c.total_applications, 0),
  };

  // Error State
  if (error && !loading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl px-4 mx-auto">
          <div className="p-8 text-center bg-white border border-red-200 dark:bg-gray-800 rounded-2xl dark:border-red-900">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
              <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Error Loading Categories
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => fetchCategories(currentPage)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Membership Categories
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Manage membership types and pricing
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchCategories(currentPage)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <CategoriesSkeleton />
        ) : !categoriesData || categories.length === 0 ? (
          <EmptyState onAdd={handleAdd} />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
              <StatCard
                title="Total Categories"
                value={stats.total}
                icon={TagIcon}
                color="text-gray-900 dark:text-white"
                bgColor="bg-gray-100 dark:bg-gray-700"
              />
              <StatCard
                title="Open"
                value={stats.open}
                icon={CheckCircleIcon}
                color="text-emerald-600 dark:text-emerald-400"
                bgColor="bg-emerald-100 dark:bg-emerald-900/30"
              />
              <StatCard
                title="Closed"
                value={stats.closed}
                icon={XCircleIcon}
                color="text-gray-600 dark:text-gray-400"
                bgColor="bg-gray-100 dark:bg-gray-700"
              />
              <StatCard
                title="Total Applications"
                value={stats.totalApplications}
                icon={UserGroupIcon}
                color="text-[#00B5A5]"
                bgColor="bg-[#00B5A5]/10"
              />
            </div>

            {/* Filters */}
            <div className="p-4 mb-6 bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700">
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open for Applications</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Active Filters */}
              {(searchTerm || statusFilter !== "all") && (
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
                      Search: {searchTerm}
                      <button onClick={() => setSearchTerm("")} className="hover:text-red-500">
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter("all")} className="hover:text-red-500">
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="text-sm text-[#00B5A5] hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCategories.length} of {categories.length} categor
                {categories.length !== 1 ? "ies" : "y"}
              </p>
            </div>

            {/* Categories List */}
            {filteredCategories.length === 0 ? (
              <div className="p-12 text-center bg-white border border-gray-200 dark:bg-gray-800 rounded-xl dark:border-gray-700">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-700">
                  <TagIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  No Matching Categories
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No categories match your current filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onView={() => handleView(category)}
                    onEdit={() => handleEdit(category)}
                    onDelete={() => handleDelete(category)}
                    deleting={deletingId === category.id}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {categoriesData && categoriesData.last_page > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 mt-8 sm:flex-row">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {categoriesData.from} to {categoriesData.to} of{" "}
                  {categoriesData.total} categories
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!categoriesData.prev_page_url}
                    className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {categoriesData.links
                    .filter((link) => link.page !== null)
                    .map((link) => (
                      <button
                        key={link.page}
                        onClick={() => setCurrentPage(link.page!)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                          link.active
                            ? "bg-[#00B5A5] text-white"
                            : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {link.page}
                      </button>
                    ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!categoriesData.next_page_url}
                    className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingCategory(null);
        }}
        category={viewingCategory}
      />

      {/* Add/Edit Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}