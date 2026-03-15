"use client";

import PhoneInputWithCountry from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  defaultCountry?: Country;
  id?: string;
  name?: string;
}

export function PhoneInput({
  value,
  onChange,
  label,
  error,
  hint,
  required,
  placeholder = "Enter phone number",
  disabled,
  defaultCountry = "RW",
  id,
  name,
}: PhoneInputProps) {
  return (
    <div className="w-full phone-input-wrapper">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <PhoneInputWithCountry
        international
        countryCallingCodeEditable={false}
        defaultCountry={defaultCountry}
        value={value}
        onChange={(val) => onChange(val || "")}
        placeholder={placeholder}
        disabled={disabled}
        id={id || name}
        className={`
          phone-input
          ${error ? "phone-input-error" : ""}
          ${disabled ? "phone-input-disabled" : ""}
        `}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}

      <style jsx global>{`
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .phone-input-wrapper .PhoneInputCountry {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background-color: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .phone-input-wrapper .PhoneInputCountry:hover {
          border-color: #00B5A5;
        }

        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1rem;
          border-radius: 2px;
          overflow: hidden;
        }

        .phone-input-wrapper .PhoneInputCountrySelectArrow {
          margin-left: 0.5rem;
          border-color: #6b7280;
        }

        .phone-input-wrapper .PhoneInputCountrySelect {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          border: 0;
          opacity: 0;
          cursor: pointer;
        }

        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          line-height: 1.5rem;
          background-color: white;
          color: #111827;
          outline: none;
          transition: all 0.2s;
        }

        .phone-input-wrapper .PhoneInputInput:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px #00B5A5;
        }

        .phone-input-wrapper .PhoneInputInput::placeholder {
          color: #9ca3af;
        }

        .phone-input-wrapper .PhoneInputInput:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Error state */
        .phone-input-wrapper .phone-input-error .PhoneInputInput,
        .phone-input-wrapper .phone-input-error .PhoneInputCountry {
          border-color: #ef4444;
        }

        .phone-input-wrapper .phone-input-error .PhoneInputInput:focus {
          box-shadow: 0 0 0 2px #ef4444;
        }

        /* Disabled state */
        .phone-input-wrapper .phone-input-disabled .PhoneInputCountry {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Dark mode */
        .dark .phone-input-wrapper .PhoneInputCountry {
          background-color: #374151;
          border-color: #4b5563;
        }

        .dark .phone-input-wrapper .PhoneInputCountry:hover {
          border-color: #00B5A5;
        }

        .dark .phone-input-wrapper .PhoneInputCountrySelectArrow {
          border-color: #9ca3af;
        }

        .dark .phone-input-wrapper .PhoneInputInput {
          background-color: #374151;
          border-color: #4b5563;
          color: white;
        }

        .dark .phone-input-wrapper .PhoneInputInput::placeholder {
          color: #6b7280;
        }

        .dark .phone-input-wrapper .PhoneInputInput:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px #00B5A5;
        }

        /* Dark mode error state */
        .dark .phone-input-wrapper .phone-input-error .PhoneInputInput,
        .dark .phone-input-wrapper .phone-input-error .PhoneInputCountry {
          border-color: #ef4444;
        }
      `}</style>
    </div>
  );
}

// Re-export validation function for use in forms
export { isValidPhoneNumber } from "react-phone-number-input";
