"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { getAuthenticatedClient } from "@/lib/api-client";
import { showSuccessToast, showErrorToast } from "@/components/layouts/auth-layer-out";

interface OnboardMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Category { id: number; category: string; price: string; }
interface Country { id: number; country: string; }

export default function OnboardMemberModal({ isOpen, onClose, onSuccess }: OnboardMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [recordPayment, setRecordPayment] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (isOpen) { fetchCategories(); fetchCountries(); }
  }, [isOpen]);

  const fetchCategories = async () => {
    try { const c = getAuthenticatedClient(); const r = await c.get<{ status: string; data: Category[] }>("membership/categories"); if (r.data.data) setCategories(Array.isArray(r.data.data) ? r.data.data : []); } catch {}
  };

  const fetchCountries = async () => {
    try { const r = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}countries`); const data = await r.json(); if (data.data) setCountries(data.data); } catch {}
  };

  const handleSubmit = async () => {
    if (!firstName || !surname || !email || !phone || !categoryId || !countryId) { showErrorToast("Fill all required fields"); return; }
    setLoading(true); setErrors({});
    try {
      const fd = new FormData();
      fd.append("title", title); fd.append("first_name", firstName);
      if (middleName) fd.append("middle_name", middleName);
      fd.append("surname", surname); fd.append("email", email); fd.append("phone_number", phone);
      if (dob) fd.append("date_of_birth", dob);
      fd.append("membership_category", categoryId); fd.append("country_of_residence", countryId);
      fd.append("record_payment", recordPayment ? "1" : "0");
      if (recordPayment && amount) { fd.append("amount_paid", amount); fd.append("currency", "USD"); }

      const client = getAuthenticatedClient();
      const res = await client.postFormData<{ status: string; message: string; errors?: Record<string, string[]> }>("applications/add-new", fd);
      if (res.data.status === "success") { showSuccessToast("Member added — welcome email sent"); resetForm(); onSuccess(); onClose(); }
      else { if (res.data.errors) setErrors(res.data.errors); showErrorToast(res.data.message || "Failed"); }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      if (e.response?.data?.errors) setErrors(e.response.data.errors);
      showErrorToast(e.response?.data?.message || "Failed to add member");
    } finally { setLoading(false); }
  };

  const resetForm = () => { setTitle("Mr"); setFirstName(""); setMiddleName(""); setSurname(""); setEmail(""); setPhone(""); setDob(""); setCategoryId(""); setCountryId(""); setRecordPayment(false); setAmount(""); setErrors({}); };

  if (!isOpen) return null;

  const fieldErr = (f: string) => errors[f]?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
          <div className="flex items-center gap-2"><UserPlusIcon className="w-5 h-5 text-[#00B5A5]" /><h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Member</h3></div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
              <select value={title} onChange={e => setTitle(e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                {["Mr", "Mrs", "Ms", "Dr", "Prof", "Rev", "Hon"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">First *</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              {fieldErr("first_name") && <p className="text-[10px] text-red-500">{fieldErr("first_name")}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Middle</label>
              <input type="text" value={middleName} onChange={e => setMiddleName(e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Surname *</label>
              <input type="text" value={surname} onChange={e => setSurname(e.target.value)} className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              {fieldErr("surname") && <p className="text-[10px] text-red-500">{fieldErr("surname")}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@example.com" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              {fieldErr("email") && <p className="text-[10px] text-red-500">{fieldErr("email")}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+250..." className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              {fieldErr("phone_number") && <p className="text-[10px] text-red-500">{fieldErr("phone_number")}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Membership *</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Select</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.category} (${c.price})</option>)}
              </select>
              {fieldErr("membership_category") && <p className="text-[10px] text-red-500">{fieldErr("membership_category")}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Country *</label>
              <select value={countryId} onChange={e => setCountryId(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Select</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.country}</option>)}
              </select>
              {fieldErr("country_of_residence") && <p className="text-[10px] text-red-500">{fieldErr("country_of_residence")}</p>}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input type="checkbox" checked={recordPayment} onChange={e => setRecordPayment(e.target.checked)} className="w-4 h-4 text-[#00B5A5] border-gray-300 rounded focus:ring-[#00B5A5]" />
              <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Record payment now</p></div>
            </label>
            {recordPayment && (
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (USD)" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            )}
          </div>
          <p className="text-xs text-gray-400">A welcome email with login credentials will be sent.</p>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            <UserPlusIcon className="w-4 h-4" />{loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
