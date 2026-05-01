"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, UserPlusIcon, ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { getAuthenticatedClient, getCompanyHeaders, ApiError } from "@/lib/api-client";
import { showSuccessToast, showErrorToast } from "@/components/layouts/auth-layer-out";

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }
interface Category { id: number; category: string; price: string; }
interface Country { id: number; country: string; }
interface FieldOfPractice { id: number; field: string; }

const TITLES = ["Mr", "Mrs", "Ms", "Dr", "Prof", "Eng", "Chief", "Hon"];
const CURRENCIES = ["USD", "EUR", "GBP", "RWF", "AUD", "CAD"];
const STEPS = ["Personal Info", "Membership", "Professional", "Payment"];

export default function OnboardMemberModal({ isOpen, onClose, onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [fields, setFields] = useState<FieldOfPractice[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [countrySearch, setCountrySearch] = useState("");
  const [fieldSearch, setFieldSearch] = useState("");

  // Step 1: Personal
  const [title, setTitle] = useState("Mr");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [passport, setPassport] = useState("");
  const [passportFrom, setPassportFrom] = useState("");

  // Step 2: Membership
  const [categoryId, setCategoryId] = useState("");
  const [countryId, setCountryId] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<Array<{ country: string; isPrimary: boolean }>>([]);

  // Step 3: Professional
  const [selectedFields, setSelectedFields] = useState<Array<{ field: string; isPrimary: boolean }>>([]);
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [degreeYear, setDegreeYear] = useState("");
  const [countryOfStudy, setCountryOfStudy] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [qualFile, setQualFile] = useState<File | null>(null);

  // Step 4: Payment
  const [recordPayment, setRecordPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [generateCertificate, setGenerateCertificate] = useState(false);

  useEffect(() => {
    if (isOpen) { fetchData(); setStep(0); resetForm(); }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const client = getAuthenticatedClient();
      const companyId = typeof window !== "undefined" ? localStorage.getItem("company_id") : null;
      if (!companyId) {
        showErrorToast("Institution context missing — please reload and try again");
        return;
      }
      const headers = getCompanyHeaders();
      const [catRes, countryRes, fieldRes] = await Promise.all([
        client.get<{ status: string; data: { data?: Category[] } | Category[] }>("membership/categories", { headers }),
        client.get<{ status: string; countries: Country[] }>("countries"),
        client.get<{ status: string; data: { data?: FieldOfPractice[] } | FieldOfPractice[] }>(`${companyId}/get-fields-of-practices`),
      ]);

      const catPayload = catRes.data.data;
      setCategories(Array.isArray(catPayload) ? catPayload : (catPayload?.data ?? []));

      setCountries(Array.isArray(countryRes.data.countries) ? countryRes.data.countries : []);

      const fieldPayload = fieldRes.data.data;
      setFields(Array.isArray(fieldPayload) ? fieldPayload : (fieldPayload?.data ?? []));
    } catch {
      showErrorToast("Failed to load form data — please try again");
    }
  };

  const resetForm = () => {
    setTitle("Mr"); setFirstName(""); setMiddleName(""); setSurname(""); setEmail(""); setPhone("");
    setDob(""); setSecondaryEmail(""); setAltPhone(""); setWhatsapp(""); setPassport(""); setPassportFrom("");
    setCategoryId(""); setCountryId(""); setSelectedCountries([]); setSelectedFields([]);
    setUniversity(""); setDegree(""); setDegreeYear(""); setCountryOfStudy("");
    setCvFile(null); setQualFile(null); setRecordPayment(false); setAmount(""); setCurrency("USD");
    setGenerateCertificate(false);
    setErrors({}); setCountrySearch(""); setFieldSearch("");
  };

  const handleSubmit = async () => {
    setLoading(true); setErrors({});
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("first_name", firstName);
      if (middleName) fd.append("middle_name", middleName);
      fd.append("surname", surname);
      fd.append("email", email);
      fd.append("phone_number", phone);
      if (dob) fd.append("date_of_birth", dob);
      if (secondaryEmail) fd.append("secondary_email", secondaryEmail);
      if (altPhone) fd.append("alternative_phone", altPhone);
      if (whatsapp) fd.append("whatsapp_number", whatsapp);
      if (passport) fd.append("passport", passport);
      if (passportFrom) fd.append("passport_from", passportFrom);
      fd.append("membership_category", categoryId);
      fd.append("country_of_residence", countryId);
      selectedCountries.forEach((c, i) => { fd.append(`countries_of_operation[${i}][country]`, c.country); fd.append(`countries_of_operation[${i}][isPrimary]`, c.isPrimary ? "1" : "0"); });
      selectedFields.forEach((f, i) => { fd.append(`field_of_practice[${i}][field]`, f.field); fd.append(`field_of_practice[${i}][isPrimary]`, f.isPrimary ? "1" : "0"); });
      if (university) fd.append("university", university);
      if (degree) fd.append("degree", degree);
      if (degreeYear) fd.append("degree_year", degreeYear);
      if (countryOfStudy) fd.append("country_of_study", countryOfStudy);
      if (cvFile) fd.append("cv_resume", cvFile);
      if (qualFile) fd.append("qualification", qualFile);
      fd.append("record_payment", recordPayment ? "1" : "0");
      if (recordPayment) { fd.append("amount_paid", amount || "0"); fd.append("currency", currency); }
      fd.append("generate_certificate", recordPayment && generateCertificate ? "1" : "0");

      const client = getAuthenticatedClient();
      const res = await client.postFormData<{ status: string; message?: string; errors?: Record<string, string[]> }>("applications/add-new", fd);
      if (res.data.status === "success" || res.data.status === true as unknown as string) {
        const successMsg = recordPayment && generateCertificate
          ? "Member onboarded with certificate — appears in Members list now"
          : recordPayment
          ? "Member added with payment recorded — ready for certificate signing"
          : "Member added — awaiting payment";
        showSuccessToast(successMsg);
        onSuccess(); onClose();
      } else {
        if (res.data.errors) { setErrors(res.data.errors); findStepWithError(res.data.errors); }
        showErrorToast(res.data.message || "Failed to add member");
      }
    } catch (err: unknown) {
      const e = err as ApiError;
      if (e.errors) {
        setErrors(e.errors as Record<string, string[]>);
        findStepWithError(e.errors as Record<string, string[]>);
      }
      showErrorToast(e.message || "Failed to add member");
    } finally { setLoading(false); }
  };

  const findStepWithError = (errs: Record<string, string[]>) => {
    const step1 = ["email", "title", "first_name", "surname", "phone_number", "date_of_birth", "secondary_email", "alternative_phone", "whatsapp_number", "passport", "passport_from", "middle_name"];
    const step2 = ["membership_category", "country_of_residence", "countries_of_operation"];
    const step3 = ["field_of_practice", "university", "degree", "degree_year", "country_of_study", "cv_resume", "qualification"];
    const keys = Object.keys(errs).map(k => k.split(".")[0]);
    if (keys.some(k => step1.includes(k))) setStep(0);
    else if (keys.some(k => step2.includes(k))) setStep(1);
    else if (keys.some(k => step3.includes(k))) setStep(2);
    else setStep(3);
  };

  const err = (f: string) => errors[f]?.[0];
  const canNext = () => {
    if (step === 0) return !!firstName && !!surname && !!email && !!phone;
    if (step === 1) return !!categoryId && !!countryId;
    return true;
  };

  if (!isOpen) return null;

  const inputCls = "w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent dark:bg-gray-700 dark:text-white";
  const labelCls = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";
  const errCls = "text-[10px] text-red-500 mt-0.5";

  const errorEntries = Object.entries(errors).flatMap(([key, msgs]) =>
    (msgs ?? []).map(m => ({ key, message: m }))
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => !loading && onClose()} />
      <div className="relative bg-white dark:bg-gray-800 shadow-2xl w-full max-w-2xl h-full overflow-y-auto rounded-l-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><UserPlusIcon className="w-5 h-5 text-[#00B5A5]" /><h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Member</h3></div>
            <button onClick={onClose} disabled={loading} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"><XMarkIcon className="w-5 h-5 text-gray-500" /></button>
          </div>
          {/* Steps */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <button onClick={() => i <= step && setStep(i)} className={`flex items-center gap-1.5 text-xs font-medium ${i === step ? "text-[#00B5A5]" : i < step ? "text-green-600" : "text-gray-400"}`}>
                  {i < step ? <CheckCircleIcon className="w-4 h-4" /> : <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === step ? "bg-[#00B5A5] text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>{i + 1}</span>}
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorEntries.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-300">
              <p className="font-semibold mb-1">Please fix the following:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {errorEntries.map((e, i) => (
                  <li key={i}><span className="font-mono text-[10px] text-red-500">{e.key}</span> — {e.message}</li>
                ))}
              </ul>
            </div>
          )}
          {/* STEP 1: Personal */}
          {step === 0 && (<>
            <div className="grid grid-cols-4 gap-2">
              <div><label className={labelCls}>Title *</label><select value={title} onChange={e => setTitle(e.target.value)} className={inputCls}>{TITLES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className={labelCls}>First *</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} />{err("first_name") && <p className={errCls}>{err("first_name")}</p>}</div>
              <div><label className={labelCls}>Middle</label><input type="text" value={middleName} onChange={e => setMiddleName(e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Surname *</label><input type="text" value={surname} onChange={e => setSurname(e.target.value)} className={inputCls} />{err("surname") && <p className={errCls}>{err("surname")}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Email *</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="member@example.com" className={inputCls} />{err("email") && <p className={errCls}>{err("email")}</p>}</div>
              <div><label className={labelCls}>Phone *</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+250..." className={inputCls} />{err("phone_number") && <p className={errCls}>{err("phone_number")}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Date of Birth</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} className={inputCls} />{err("date_of_birth") && <p className={errCls}>{err("date_of_birth")}</p>}</div>
              <div><label className={labelCls}>WhatsApp</label><input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inputCls} />{err("whatsapp_number") && <p className={errCls}>{err("whatsapp_number")}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Secondary Email</label><input type="email" value={secondaryEmail} onChange={e => setSecondaryEmail(e.target.value)} className={inputCls} />{err("secondary_email") && <p className={errCls}>{err("secondary_email")}</p>}</div>
              <div><label className={labelCls}>Alt Phone</label><input type="tel" value={altPhone} onChange={e => setAltPhone(e.target.value)} className={inputCls} />{err("alternative_phone") && <p className={errCls}>{err("alternative_phone")}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Passport/ID No.</label><input type="text" value={passport} onChange={e => setPassport(e.target.value)} className={inputCls} />{err("passport") && <p className={errCls}>{err("passport")}</p>}</div>
              <div><label className={labelCls}>Passport From</label><input type="text" value={passportFrom} onChange={e => setPassportFrom(e.target.value)} className={inputCls} />{err("passport_from") && <p className={errCls}>{err("passport_from")}</p>}</div>
            </div>
          </>)}

          {/* STEP 2: Membership */}
          {step === 1 && (<>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Membership Category *</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
                  <option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.category} (${c.price})</option>)}
                </select>{err("membership_category") && <p className={errCls}>{err("membership_category")}</p>}
              </div>
              <div><label className={labelCls}>Country of Residence *</label>
                <select value={countryId} onChange={e => setCountryId(e.target.value)} className={inputCls}>
                  <option value="">Select</option>{countries.map(c => <option key={c.id} value={c.id}>{c.country}</option>)}
                </select>{err("country_of_residence") && <p className={errCls}>{err("country_of_residence")}</p>}
              </div>
            </div>
            <div>
              <label className={labelCls}>Countries of Operation</label>
              <input
                type="text"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Search countries..."
                className={`${inputCls} mb-2`}
              />
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {countries
                  .filter(c => c.country.toLowerCase().includes(countrySearch.toLowerCase()))
                  .map(c => {
                    const sel = selectedCountries.find(s => s.country === String(c.id));
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                        <input type="checkbox" checked={!!sel} onChange={() => {
                          if (sel) setSelectedCountries(prev => prev.filter(s => s.country !== String(c.id)));
                          else setSelectedCountries(prev => [...prev, { country: String(c.id), isPrimary: false }]);
                        }} className="w-3.5 h-3.5 text-[#00B5A5] rounded" />
                        <span className="text-gray-700 dark:text-gray-300">{c.country}</span>
                      </label>
                    );
                  })}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{selectedCountries.length} selected · {countries.length} available</p>
            </div>
          </>)}

          {/* STEP 3: Professional */}
          {step === 2 && (<>
            <div>
              <label className={labelCls}>Fields of Practice</label>
              <input
                type="text"
                value={fieldSearch}
                onChange={e => setFieldSearch(e.target.value)}
                placeholder="Search fields..."
                className={`${inputCls} mb-2`}
              />
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                {fields.length === 0 && (
                  <p className="text-[11px] text-gray-400 italic px-1 py-2">No fields configured for this institution.</p>
                )}
                {fields
                  .filter(f => f.field?.toLowerCase().includes(fieldSearch.toLowerCase()))
                  .map(f => {
                    const sel = selectedFields.find(s => s.field === String(f.id));
                    return (
                      <label key={f.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                        <input type="checkbox" checked={!!sel} onChange={() => {
                          if (sel) setSelectedFields(prev => prev.filter(s => s.field !== String(f.id)));
                          else setSelectedFields(prev => [...prev, { field: String(f.id), isPrimary: prev.length === 0 }]);
                        }} className="w-3.5 h-3.5 text-[#00B5A5] rounded" />
                        <span className="text-gray-700 dark:text-gray-300">{f.field}</span>
                      </label>
                    );
                  })}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{selectedFields.length} selected · {fields.length} available</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>University</label><input type="text" value={university} onChange={e => setUniversity(e.target.value)} className={inputCls} />{err("university") && <p className={errCls}>{err("university")}</p>}</div>
              <div><label className={labelCls}>Degree</label><input type="text" value={degree} onChange={e => setDegree(e.target.value)} className={inputCls} />{err("degree") && <p className={errCls}>{err("degree")}</p>}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Graduation Year</label><input type="number" value={degreeYear} onChange={e => setDegreeYear(e.target.value)} placeholder="2024" min="1900" max={new Date().getFullYear()} className={inputCls} />{err("degree_year") && <p className={errCls}>{err("degree_year")}</p>}</div>
              <div><label className={labelCls}>Country of Study</label>
                <select value={countryOfStudy} onChange={e => setCountryOfStudy(e.target.value)} className={inputCls}>
                  <option value="">Select</option>{countries.map(c => <option key={c.id} value={c.id}>{c.country}</option>)}
                </select>{err("country_of_study") && <p className={errCls}>{err("country_of_study")}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>CV/Resume (PDF, max 2MB)</label><input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#00B5A5]/10 file:text-[#00B5A5]" />{err("cv_resume") && <p className={errCls}>{err("cv_resume")}</p>}</div>
              <div><label className={labelCls}>Qualification (PDF, max 2MB)</label><input type="file" accept=".pdf" onChange={e => setQualFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#00B5A5]/10 file:text-[#00B5A5]" />{err("qualification") && <p className={errCls}>{err("qualification")}</p>}</div>
            </div>
          </>)}

          {/* STEP 4: Payment */}
          {step === 3 && (<>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Name:</span> {title} {firstName} {surname}</p>
                <p><span className="font-medium">Email:</span> {email}</p>
                <p><span className="font-medium">Phone:</span> {phone}</p>
                <p><span className="font-medium">Category:</span> {categories.find(c => c.id === Number(categoryId))?.category || "—"}</p>
                <p><span className="font-medium">Country:</span> {countries.find(c => c.id === Number(countryId))?.country || "—"}</p>
                <p><span className="font-medium">Fields:</span> {selectedFields.length} selected</p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input type="checkbox" checked={recordPayment} onChange={e => { setRecordPayment(e.target.checked); if (!e.target.checked) setGenerateCertificate(false); }} className="w-4 h-4 text-[#00B5A5] rounded focus:ring-[#00B5A5]" />
                <div><p className="text-sm font-medium text-gray-700 dark:text-gray-300">Record payment now</p><p className="text-xs text-gray-500">Mark as paid during onboarding</p></div>
              </label>
              {recordPayment && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Amount</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={categories.find(c => c.id === Number(categoryId))?.price || "50"} className={inputCls} />{err("amount_paid") && <p className={errCls}>{err("amount_paid")}</p>}</div>
                    <div><label className={labelCls}>Currency</label>
                      <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>{err("currency") && <p className={errCls}>{err("currency")}</p>}
                    </div>
                  </div>
                  <label className="mt-3 flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={generateCertificate} onChange={e => setGenerateCertificate(e.target.checked)} className="w-4 h-4 text-[#00B5A5] rounded focus:ring-[#00B5A5]" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sign certificate immediately</p>
                      <p className="text-xs text-gray-500">Mints the membership number and lands the member in the Members list right away.</p>
                    </div>
                  </label>
                </>
              )}
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/30 p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p className="font-semibold text-gray-700 dark:text-gray-300">What happens after submit:</p>
              {recordPayment && generateCertificate ? (
                <p>→ Welcome email sent · payment recorded · certificate signed · <span className="text-[#00B5A5] font-medium">appears in Members list</span></p>
              ) : recordPayment ? (
                <p>→ Welcome email sent · payment recorded · status <span className="font-medium">Approved</span> · <span className="font-medium">President can sign certificate</span></p>
              ) : (
                <p>→ Welcome email sent · status <span className="font-medium">Waiting for Payment</span> · appears in <span className="font-medium">Applications list</span></p>
              )}
            </div>
          </>)}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} disabled={loading} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50">
              <ArrowLeftIcon className="w-4 h-4" />Back
            </button>
          )}
          <div className="flex-1" />
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext() || loading}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 flex items-center gap-1.5">
              Next<ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !canNext()}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg disabled:opacity-50 flex items-center gap-1.5">
              <UserPlusIcon className="w-4 h-4" />{loading ? "Adding..." : "Add Member"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
