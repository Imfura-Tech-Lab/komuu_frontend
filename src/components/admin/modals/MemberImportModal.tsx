"use client";

import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useMemberImport } from "@/lib/hooks/useMemberImport";

interface MemberImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function MemberImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: MemberImportModalProps) {
  const { loading, result, importMembers } = useMemberImport();
  const [file, setFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setValidationErrors(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && /\.(csv|xlsx|xls)$/i.test(dropped.name)) {
      setFile(dropped);
      setValidationErrors(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    const res = await importMembers(file);
    if (res.success) {
      onImportComplete();
    } else if (res.errors) {
      setValidationErrors(res.errors);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationErrors(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative w-full max-w-lg h-full bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col rounded-l-2xl overflow-hidden animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00B5A5]/10 rounded-lg">
              <Upload className="w-5 h-5 text-[#00B5A5]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Import Members
            </h3>
          </div>
          <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Template download */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300 mb-2 font-medium">Required columns in your Excel file:</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed">membership_type, membership_no, first_name, surname, email_address, phone_number, application_date, from_date_certif_valid, to_date_certif_valid, next_cycle_payment_date, primary_field, membership_term</p>
            <p className="text-[10px] text-blue-500 dark:text-blue-500 mt-1">Optional: title, middle_name, birth_of_date, whatsapp_number, country_of_residency, country_of_practice, academic_institution, institution</p>
            <button
              onClick={() => {
                const headers = "membership_type,membership_no,first_name,surname,email_address,phone_number,title,middle_name,birth_of_date,whatsapp_number,country_of_residency,country_of_practice,primary_field,academic_institution,institution,application_date,from_date_certif_valid,to_date_certif_valid,next_cycle_payment_date,membership_term,in_compliance,status,icrc,payment_status";
                const example = "Full Member,AFSA00100,John,Doe,john@example.com,+250781000000,Dr,,1990-01-01,,Rwanda,,Biology,University of Rwanda,AFSA,2026-01-01,2026-01-01,2027-06-30,2027-07-30,2026 - 2027,true,Approved,Normal,TXN001";
                const blob = new Blob([headers + "\n" + example], { type: "text/csv" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "member-import-template.csv";
                a.click();
              }}
              className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300 hover:underline"
            >
              Download CSV template
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-[#00B5A5] hover:bg-[#00B5A5]/5 transition-colors"
          >
            <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Drop your file here or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">Supports CSV, XLSX, XLS</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Import result */}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-800 dark:text-green-300">Import Complete</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                  <p className="font-bold text-gray-900 dark:text-white">{result.total}</p>
                  <p className="text-gray-500 text-xs">Total</p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                  <p className="font-bold text-green-600">{result.imported}</p>
                  <p className="text-gray-500 text-xs">Imported</p>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                  <p className="font-bold text-amber-600">{result.skipped}</p>
                  <p className="text-gray-500 text-xs">Skipped</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-3 max-h-32 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Validation errors */}
          {validationErrors && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="font-medium text-red-800 dark:text-red-300">Validation Errors</p>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {Object.entries(validationErrors).map(([field, msgs]) => (
                  <div key={field}>
                    {msgs.map((msg, i) => (
                      <p key={i} className="text-xs text-red-600 dark:text-red-400">
                        <span className="font-medium">{field}:</span> {msg}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#00B5A5] hover:bg-[#008F82] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
