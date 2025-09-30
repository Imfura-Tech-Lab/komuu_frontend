"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  X,
  AlertCircle,
  FileText,
  User,
  Building,
} from "lucide-react";
import MembershipLayout from "@/components/layouts/membership-layout";
import { authService } from "@/services/auth-service";
import { membershipService, Organization } from "@/services/membership-service";
import { ApiError } from "@/lib/api-client";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { useRouter } from "next/navigation";
// Type Definitions
export type CountryOfOperation = {
  country: number;
  isPrimary: boolean;
};

export type FieldOfPractice = {
  field: number;
  isPrimary: boolean;
};

export type FormDataType = {
  // Organization
  organization_id: string;

  // Personal Information
  title: string;
  first_name: string;
  middle_name: string;
  surname: string;
  email: string;
  secondary_email: string;
  date_of_birth: string;
  phone_number: string;
  alternative_phone: string;
  whatsapp_number: string;
  national_id: string;
  passport: string;

  // Membership Details
  membership_type: string;
  membership_category: number;
  country_of_residence: number;
  field_of_practice: FieldOfPractice[];
  associate_category: string;

  // Student Fields
  university: string;
  degree: string;
  degree_year: string;
  country_of_study: number;
  proof_of_registration: File | null;

  // Full Member Fields
  qualification: File | null;
  cv_resume: File | null;
  name_of_organization: string;
  Abbreviation: string;
  countries_of_operation: CountryOfOperation[];
  company_email: string;

  // Declarations
  abide_with_code_of_conduct: boolean;
  comply_with_current_constitution: boolean;
  declaration: boolean;

  // Payment
  amount_paid: number;
  payment_method: string;
  transaction_number: string;
};

interface MasterData {
  countries: Array<{ id: number; name: string }>;
  titles: Array<{ id: string; name: string }>;
  membershipTypes: Array<{
    id: number;
    category: string;
    price: number;
    frequency: string;
    currency: string;
    can_be_applied: boolean;
  }>;
  fieldsOfPractice: Array<{ id: number; name: string; code: string }>;
}

interface RequirementsPreviewProps {
  membershipType: string;
  onClose: () => void;
}

// Requirements Preview Component
const RequirementsPreview: React.FC<RequirementsPreviewProps> = ({
  membershipType,
  onClose,
}) => {
  const getRequirements = () => {
    switch (membershipType) {
      case "Full Member":
        return {
          title: "Full Member Requirements",
          description:
            "Professional membership for qualified forensic practitioners",
          documents: [
            "Professional qualification certificate (PDF)",
            "Current CV/Resume (PDF, DOC, DOCX)",
          ],
          information: [
            "Organization details and company email",
            "Countries of operation",
            "Professional field of practice",
          ],
          additional: [
            "Must have relevant forensic qualifications",
            "Professional experience in forensic science",
            "Agreement to professional code of conduct",
          ],
        };

      case "Student Member":
        return {
          title: "Student Member Requirements",
          description:
            "Membership for students pursuing forensic science education",
          documents: [
            "Proof of current university registration (PDF, JPG, PNG)",
          ],
          information: [
            "University name and country of study",
            "Degree program and expected graduation year",
            "Field of practice interest",
          ],
          additional: [
            "Must be currently enrolled in relevant program",
            "Valid student registration required",
            "Access to educational resources and mentorship",
          ],
        };

      case "Associate Member":
        return {
          title: "Associate Member Requirements",
          description: "Membership for forensic-related professionals",
          documents: [],
          information: [
            "Field of practice in forensic-related area",
            "Country of residence and practice",
          ],
          additional: [
            "Must work in forensic-related field",
            "Professional background verification",
            "Access to most AFSA resources",
          ],
        };

      case "Affiliate Member":
        return {
          title: "Affiliate Member Requirements",
          description:
            "International membership for organizations and individuals",
          documents: [],
          information: [
            "Professional or organizational background",
            "International forensic science interest",
            "Field of practice or specialization",
          ],
          additional: [
            "Open to international applicants",
            "Organizational memberships welcome",
            "Network access and collaboration opportunities",
          ],
        };

      default:
        return null;
    }
  };

  const requirements = getRequirements();
  if (!requirements) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {requirements.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {requirements.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {requirements.documents.length > 0 && (
              <div>
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  <FileText size={20} className="mr-2 text-blue-500" />
                  Required Documents
                </h3>
                <ul className="space-y-2">
                  {requirements.documents.map((doc, index) => (
                    <li key={index} className="flex items-start">
                      <Check
                        size={16}
                        className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {doc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                <User size={20} className="mr-2 text-green-500" />
                Required Information
              </h3>
              <ul className="space-y-2">
                {requirements.information.map((info, index) => (
                  <li key={index} className="flex items-start">
                    <Check
                      size={16}
                      className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {info}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-white mb-3">
                <AlertCircle size={20} className="mr-2 text-yellow-500" />
                Additional Requirements
              </h3>
              <ul className="space-y-2">
                {requirements.additional.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <Check
                      size={16}
                      className="text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="w-full bg-[#00B5A5] dark:bg-[#00D4C7] text-white py-2 px-4 rounded-lg hover:bg-[#008A7C] dark:hover:bg-[#00B5A5] transition-colors duration-300"
            >
              I Understand - Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Personal Information Component
const PersonalInformationStep: React.FC<{
  formData: FormDataType;
  errors: Record<string, string>;
  masterData: MasterData;
  onInputChange: (name: keyof FormDataType, value: any) => void;
  inputStyles: string;
  selectStyles: string;
}> = ({
  formData,
  errors,
  masterData,
  onInputChange,
  inputStyles,
  selectStyles,
}) => (
  <div className="space-y-6">
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
        Personal Information
      </h3>
      <p className="text-sm text-blue-700 dark:text-blue-400">
        Please provide your basic personal details. All fields marked with * are
        required.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          className={selectStyles}
        >
          <option value="">Select Title</option>
          {masterData.titles.map((title) => (
            <option key={title.id} value={title.name}>
              {title.name}
            </option>
          ))}
        </select>
        {errors.title && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.first_name}
          onChange={(e) => onInputChange("first_name", e.target.value)}
          className={inputStyles}
          placeholder="Enter your first name"
        />
        {errors.first_name && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.first_name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Middle Name
        </label>
        <input
          type="text"
          value={formData.middle_name}
          onChange={(e) => onInputChange("middle_name", e.target.value)}
          className={inputStyles}
          placeholder="Enter your middle name (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Surname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.surname}
          onChange={(e) => onInputChange("surname", e.target.value)}
          className={inputStyles}
          placeholder="Enter your surname"
        />
        {errors.surname && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.surname}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          className={inputStyles}
          placeholder="Enter your email address"
        />
        {errors.email && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Secondary Email
        </label>
        <input
          type="email"
          value={formData.secondary_email}
          onChange={(e) => onInputChange("secondary_email", e.target.value)}
          className={inputStyles}
          placeholder="Enter secondary email (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => onInputChange("date_of_birth", e.target.value)}
          className={inputStyles}
        />
        {errors.date_of_birth && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.date_of_birth}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={formData.phone_number}
          onChange={(e) => onInputChange("phone_number", e.target.value)}
          className={inputStyles}
          placeholder="+250790340400"
        />
        {errors.phone_number && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.phone_number}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Alternative Phone
        </label>
        <input
          type="tel"
          value={formData.alternative_phone}
          onChange={(e) => onInputChange("alternative_phone", e.target.value)}
          className={inputStyles}
          placeholder="Alternative phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          WhatsApp Number
        </label>
        <input
          type="tel"
          value={formData.whatsapp_number}
          onChange={(e) => onInputChange("whatsapp_number", e.target.value)}
          className={inputStyles}
          placeholder="+250780343405"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          National ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.national_id}
          onChange={(e) => onInputChange("national_id", e.target.value)}
          className={inputStyles}
          placeholder="Enter your national ID"
        />
        {errors.national_id && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.national_id}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Passport Number
        </label>
        <input
          type="text"
          value={formData.passport}
          onChange={(e) => onInputChange("passport", e.target.value)}
          className={inputStyles}
          placeholder="Enter passport number (optional)"
        />
      </div>
    </div>
  </div>
);

// Student Information Component
const StudentInformationStep: React.FC<{
  formData: FormDataType;
  errors: Record<string, string>;
  masterData: MasterData;
  onInputChange: (name: keyof FormDataType, value: any) => void;
  onFileUpload: (name: keyof FormDataType, file: File | null) => void;
  inputStyles: string;
  selectStyles: string;
}> = ({
  formData,
  errors,
  masterData,
  onInputChange,
  onFileUpload,
  inputStyles,
  selectStyles,
}) => (
  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
      Student Information
    </h3>

    <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
      <p className="text-sm text-blue-800 dark:text-blue-300">
        <strong>Required for Student Members:</strong> University registration
        proof, degree details, and country of study.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          University <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.university}
          onChange={(e) => onInputChange("university", e.target.value)}
          className={inputStyles}
          placeholder="Enter university name"
        />
        {errors.university && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.university}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Degree <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.degree}
          onChange={(e) => onInputChange("degree", e.target.value)}
          className={inputStyles}
          placeholder="e.g., Bachelor of Forensic Science"
        />
        {errors.degree && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.degree}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expected Graduation Year <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.degree_year}
          onChange={(e) => onInputChange("degree_year", e.target.value)}
          className={inputStyles}
          placeholder="e.g., 2025"
          min="2024"
          max="2030"
        />
        {errors.degree_year && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.degree_year}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Country of Study <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.country_of_study}
          onChange={(e) =>
            onInputChange("country_of_study", parseInt(e.target.value))
          }
          className={selectStyles}
        >
          <option value="0">Select Country</option>
          {masterData.countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.country_of_study && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.country_of_study}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Proof of Registration <span className="text-red-500">*</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#00B5A5] dark:hover:border-[#00D4C7] transition-colors duration-300 bg-white dark:bg-gray-800">
          <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <div className="mt-4">
            <label
              htmlFor="proof_of_registration_upload"
              className="cursor-pointer"
            >
              <span className="bg-[#00B5A5] dark:bg-[#00D4C7] text-white px-4 py-2 rounded-lg hover:bg-[#008A7C] dark:hover:bg-[#00B5A5] transition-colors duration-300">
                Upload Registration Proof
              </span>
              <input
                type="file"
                id="proof_of_registration_upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  onFileUpload(
                    "proof_of_registration",
                    e.target.files ? e.target.files[0] : null
                  )
                }
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Accepted formats: PDF, JPG, PNG (Max 10MB)
          </p>
          {formData.proof_of_registration && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {formData.proof_of_registration.name}
              <button
                type="button"
                onClick={() => onFileUpload("proof_of_registration", null)}
                className="ml-2 text-red-500 hover:text-red-700"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </p>
          )}
        </div>
        {errors.proof_of_registration && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.proof_of_registration}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Full Member Information Component
const FullMemberInformationStep: React.FC<{
  formData: FormDataType;
  errors: Record<string, string>;
  masterData: MasterData;
  onInputChange: (name: keyof FormDataType, value: any) => void;
  onFileUpload: (name: keyof FormDataType, file: File | null) => void;
  inputStyles: string;
  selectStyles: string;
  addCountryOfOperation: () => void;
  removeCountryOfOperation: (index: number) => void;
  updateCountryOfOperation: (
    index: number,
    countryId: number,
    isPrimary: boolean
  ) => void;
}> = ({
  formData,
  errors,
  masterData,
  onInputChange,
  onFileUpload,
  inputStyles,
  selectStyles,
  addCountryOfOperation,
  removeCountryOfOperation,
  updateCountryOfOperation,
}) => (
  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
    <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
      Full Member Information
    </h3>

    <div className="mb-4 p-3 bg-green-100 dark:bg-green-800/30 rounded-lg">
      <p className="text-sm text-green-800 dark:text-green-300">
        <strong>Required for Full Members:</strong> Professional qualifications,
        CV, organization details, and countries of operation.
      </p>
    </div>

    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name_of_organization}
            onChange={(e) =>
              onInputChange("name_of_organization", e.target.value)
            }
            className={inputStyles}
            placeholder="Enter organization name"
          />
          {errors.name_of_organization && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.name_of_organization}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Abbreviation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.Abbreviation}
            onChange={(e) => onInputChange("Abbreviation", e.target.value)}
            className={inputStyles}
            placeholder="e.g., AFSA"
          />
          {errors.Abbreviation && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.Abbreviation}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.company_email}
            onChange={(e) => onInputChange("company_email", e.target.value)}
            className={inputStyles}
            placeholder="Enter company email"
          />
          {errors.company_email && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.company_email}
            </p>
          )}
        </div>
      </div>

      {/* Countries of Operation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Countries of Operation <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {formData.countries_of_operation.map((country, index) => (
            <div key={index} className="flex items-center space-x-2">
              <select
                value={country.country}
                onChange={(e) =>
                  updateCountryOfOperation(
                    index,
                    parseInt(e.target.value),
                    country.isPrimary
                  )
                }
                className={`flex-1 ${selectStyles}`}
              >
                <option value="0">Select Country</option>
                {masterData.countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={country.isPrimary}
                  onChange={(e) =>
                    updateCountryOfOperation(
                      index,
                      country.country,
                      e.target.checked
                    )
                  }
                  className="mr-1"
                />
                Primary
              </label>
              <button
                type="button"
                onClick={() => removeCountryOfOperation(index)}
                className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-300"
              >
                <X size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCountryOfOperation}
            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-[#00B5A5] dark:hover:border-[#00D4C7] hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors duration-300 bg-white dark:bg-gray-800"
          >
            + Add Country of Operation
          </button>
        </div>
        {errors.countries_of_operation && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.countries_of_operation}
          </p>
        )}
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Qualification Document <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#00B5A5] dark:hover:border-[#00D4C7] transition-colors duration-300 bg-white dark:bg-gray-800">
            <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="mt-4">
              <label htmlFor="qualification_upload" className="cursor-pointer">
                <span className="bg-[#00B5A5] dark:bg-[#00D4C7] text-white px-4 py-2 rounded-lg hover:bg-[#008A7C] dark:hover:bg-[#00B5A5] transition-colors duration-300">
                  Upload Qualification
                </span>
                <input
                  type="file"
                  id="qualification_upload"
                  className="hidden"
                  accept=".pdf"
                  onChange={(e) =>
                    onFileUpload(
                      "qualification",
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              PDF only (Max 10MB)
            </p>
            {formData.qualification && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.qualification.name}
                <button
                  type="button"
                  onClick={() => onFileUpload("qualification", null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </p>
            )}
          </div>
          {errors.qualification && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.qualification}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CV/Resume <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#00B5A5] dark:hover:border-[#00D4C7] transition-colors duration-300 bg-white dark:bg-gray-800">
            <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="mt-4">
              <label htmlFor="cv_resume_upload" className="cursor-pointer">
                <span className="bg-[#00B5A5] dark:bg-[#00D4C7] text-white px-4 py-2 rounded-lg hover:bg-[#008A7C] dark:hover:bg-[#00B5A5] transition-colors duration-300">
                  Upload CV/Resume
                </span>
                <input
                  type="file"
                  id="cv_resume_upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) =>
                    onFileUpload(
                      "cv_resume",
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              PDF, DOC, DOCX (Max 10MB)
            </p>
            {formData.cv_resume && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {formData.cv_resume.name}
                <button
                  type="button"
                  onClick={() => onFileUpload("cv_resume", null)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </p>
            )}
          </div>
          {errors.cv_resume && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.cv_resume}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Main Form Component
const MembershipSignupForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showRequirements, setShowRequirements] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);

  const [formData, setFormData] = useState<FormDataType>({
    organization_id: "",
    title: "",
    first_name: "",
    middle_name: "",
    surname: "",
    email: "",
    secondary_email: "",
    date_of_birth: "",
    phone_number: "",
    alternative_phone: "",
    whatsapp_number: "",
    national_id: "",
    passport: "",
    membership_type: "",
    membership_category: 0,
    country_of_residence: 0,
    field_of_practice: [],
    associate_category: "",
    university: "",
    degree: "",
    degree_year: "",
    country_of_study: 0,
    proof_of_registration: null,
    qualification: null,
    cv_resume: null,
    name_of_organization: "",
    Abbreviation: "",
    countries_of_operation: [],
    company_email: "",
    abide_with_code_of_conduct: false,
    comply_with_current_constitution: false,
    declaration: false,
    amount_paid: 0,
    payment_method: "Credit Card",
    transaction_number: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [masterData, setMasterData] = useState<MasterData>({
    countries: [],
    titles: [],
    membershipTypes: [],
    fieldsOfPractice: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoadingOrganizations(true);
        const orgsRes = await membershipService.getOrganizations();
        setOrganizations(orgsRes.data);

        // Auto-select if only one organization
        if (orgsRes.data.length === 1) {
          setFormData((prev) => ({
            ...prev,
            organization_id: orgsRes.data[0].id,
          }));
          setCurrentStep(1);
        }
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        setDataError("Failed to load organizations. Please refresh the page.");
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Fetch master data when organization is selected
  useEffect(() => {
    if (!formData.organization_id) return;

    const fetchMasterData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);
        const data = await membershipService.getAllMasterData(
          formData.organization_id
        );
        setMasterData(data);
      } catch (error) {
        console.error("Failed to fetch master data:", error);
        const apiError = error as ApiError;
        setDataError(
          apiError.message || "Failed to load form data. Please try again."
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchMasterData();
  }, [formData.organization_id]);

  const steps = [
    {
      id: 0,
      title: "Select Organization",
      description: "Choose your organization",
      icon: "🏢",
    },
    {
      id: 1,
      title: "Membership Category",
      description: "Choose your membership type and specialization",
      icon: "🏛️",
    },
    {
      id: 2,
      title: "Personal Information",
      description: "Basic details and contact information",
      icon: "👤",
    },
    {
      id: 3,
      title: "Additional Information",
      description: "Documents and organization details",
      icon: "📄",
    },
    {
      id: 4,
      title: "Declarations",
      description: "Terms and conditions agreement",
      icon: "✅",
    },
    {
      id: 5,
      title: "Payment",
      description: "Complete your membership payment",
      icon: "💳",
    },
  ];

  // Show loading state while fetching organizations
  if (isLoadingOrganizations) {
    return (
      <MembershipLayout
        currentStep={0}
        steps={steps}
        currentStepTitle="Loading..."
        currentStepDescription="Fetching organizations..."
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5]"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading organizations...
          </span>
        </div>
      </MembershipLayout>
    );
  }

  // Show error state if data fetch failed
  if (dataError && !formData.organization_id) {
    return (
      <MembershipLayout
        currentStep={0}
        steps={steps}
        currentStepTitle="Error"
        currentStepDescription="Failed to load data"
      >
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 mb-4">{dataError}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00B5A5] dark:bg-[#00D4C7] text-white px-6 py-2 rounded-lg hover:bg-[#008A7C] dark:hover:bg-[#00B5A5] transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      </MembershipLayout>
    );
  }

  const handleInputChange = (name: keyof FormDataType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (
      name === "membership_type" &&
      value &&
      value !== formData.membership_type
    ) {
      setShowRequirements(true);
    }
  };

  const handleFileUpload = (name: keyof FormDataType, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const addFieldOfPractice = () => {
    setFormData((prev) => ({
      ...prev,
      field_of_practice: [
        ...prev.field_of_practice,
        { field: 0, isPrimary: false },
      ],
    }));
  };

  const removeFieldOfPractice = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      field_of_practice: prev.field_of_practice.filter((_, i) => i !== index),
    }));
  };

  const updateFieldOfPractice = (
    index: number,
    fieldId: number,
    isPrimary: boolean = false
  ) => {
    setFormData((prev) => ({
      ...prev,
      field_of_practice: prev.field_of_practice.map((field, i) =>
        i === index ? { field: fieldId, isPrimary } : field
      ),
    }));
  };

  const addCountryOfOperation = () => {
    setFormData((prev) => ({
      ...prev,
      countries_of_operation: [
        ...prev.countries_of_operation,
        { country: 0, isPrimary: false },
      ],
    }));
  };

  const removeCountryOfOperation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      countries_of_operation: prev.countries_of_operation.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const updateCountryOfOperation = (
    index: number,
    countryId: number,
    isPrimary: boolean = false
  ) => {
    setFormData((prev) => ({
      ...prev,
      countries_of_operation: prev.countries_of_operation.map((country, i) =>
        i === index ? { country: countryId, isPrimary } : country
      ),
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.organization_id) {
          newErrors.organization_id = "Please select an organization";
        }
        break;

      case 1:
        if (!formData.membership_type) {
          newErrors.membership_type = "Membership type is required";
        }
        if (!formData.membership_category) {
          newErrors.membership_category = "Membership category is required";
        }
        if (!formData.country_of_residence) {
          newErrors.country_of_residence = "Country of residence is required";
        }

        if (
          !formData.field_of_practice ||
          formData.field_of_practice.length === 0
        ) {
          newErrors.field_of_practice = "Field of practice is required";
        } else if (formData.field_of_practice.some((f) => !f.field)) {
          newErrors.field_of_practice =
            "Please select valid fields for all entries";
        }
        break;

      case 2:
        const requiredFields = [
          { key: "title", label: "Title" },
          { key: "first_name", label: "First name" },
          { key: "surname", label: "Surname" },
          { key: "email", label: "Email" },
          { key: "date_of_birth", label: "Date of birth" },
          { key: "phone_number", label: "Phone number" },
          { key: "national_id", label: "National ID" },
        ];

        requiredFields.forEach(({ key, label }) => {
          if (!formData[key as keyof FormDataType]) {
            newErrors[key] = `${label} is required`;
          }
        });

        if (
          formData.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          newErrors.email = "Please enter a valid email address";
        }

        if (formData.date_of_birth) {
          const dob = new Date(formData.date_of_birth);
          const eighteenYearsAgo = new Date();
          eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
          if (dob > eighteenYearsAgo) {
            newErrors.date_of_birth = "You must be at least 18 years old";
          }
        }
        break;

      case 3:
        if (formData.membership_type === "Student Member") {
          const studentRequiredFields = [
            { key: "university", label: "University" },
            { key: "degree", label: "Degree" },
            { key: "degree_year", label: "Degree year" },
            { key: "country_of_study", label: "Country of study" },
          ];

          studentRequiredFields.forEach(({ key, label }) => {
            if (!formData[key as keyof FormDataType]) {
              newErrors[key] = `${label} is required`;
            }
          });

          if (!formData.proof_of_registration) {
            newErrors.proof_of_registration =
              "Proof of registration is required";
          }
        }

        if (formData.membership_type === "Full Member") {
          const fullMemberRequiredFields = [
            { key: "name_of_organization", label: "Organization name" },
            { key: "Abbreviation", label: "Abbreviation" },
            { key: "company_email", label: "Company email" },
          ];

          fullMemberRequiredFields.forEach(({ key, label }) => {
            if (!formData[key as keyof FormDataType]) {
              newErrors[key] = `${label} is required`;
            }
          });

          if (!formData.qualification) {
            newErrors.qualification = "Qualification document is required";
          }

          if (!formData.cv_resume) {
            newErrors.cv_resume = "CV/Resume is required";
          }

          if (
            formData.company_email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)
          ) {
            newErrors.company_email =
              "Please enter a valid company email address";
          }

          if (
            !formData.countries_of_operation ||
            formData.countries_of_operation.length === 0
          ) {
            newErrors.countries_of_operation =
              "At least one country of operation is required";
          } else if (formData.countries_of_operation.some((c) => !c.country)) {
            newErrors.countries_of_operation =
              "Please select valid countries for all entries";
          }
        }
        break;

      case 4:
        const declarationFields = [
          {
            key: "abide_with_code_of_conduct",
            label: "You must agree to abide by the code of conduct",
          },
          {
            key: "comply_with_current_constitution",
            label: "You must agree to comply with the constitution",
          },
          { key: "declaration", label: "You must agree to the declaration" },
        ];

        declarationFields.forEach(({ key, label }) => {
          if (!formData[key as keyof FormDataType]) {
            newErrors[key] = label;
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const router = useRouter();

  const navigateToErrorStep = (fieldName: string) => {
    const stepFieldMap = {
      0: ["organization_id"],
      1: [
        "membership_type",
        "membership_category",
        "country_of_residence",
        "field_of_practice",
      ],
      2: [
        "title",
        "first_name",
        "middle_name",
        "surname",
        "email",
        "secondary_email",
        "date_of_birth",
        "phone_number",
        "alternative_phone",
        "whatsapp_number",
        "national_id",
        "passport",
      ],
      3: [
        "university",
        "degree",
        "degree_year",
        "country_of_study",
        "proof_of_registration",
        "qualification",
        "cv_resume",
        "name_of_organization",
        "Abbreviation",
        "countries_of_operation",
        "company_email",
      ],
      4: [
        "abide_with_code_of_conduct",
        "comply_with_current_constitution",
        "declaration",
      ],
      5: ["amount_paid", "payment_method", "transaction_number"],
    };

    for (const [step, fields] of Object.entries(stepFieldMap)) {
      if (fields.includes(fieldName)) {
        setCurrentStep(parseInt(step));
        break;
      }
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getMembershipFee = () => {
    const selectedType = masterData.membershipTypes.find(
      (type) => type.category === formData.membership_type
    );
    return selectedType?.price || 0;
  };

  const getMembershipDescription = (membershipType: string): string => {
    switch (membershipType) {
      case "Full Member":
        return "For qualified forensic professionals with full voting rights and access to all AFSA resources.";
      case "Associate Member":
        return "For professionals working in forensic-related fields with access to most AFSA resources.";
      case "Student Member":
        return "For students pursuing forensic science education with access to educational resources and mentorship.";
      case "Affiliate Member":
        return "For international members and organizations supporting forensic science advancement.";
      default:
        return "Professional membership with access to AFSA resources and networking opportunities.";
    }
  };

 const handleSubmit = async () => {
   // Validate all steps before submission
   let hasErrors = false;
   for (let step = 0; step <= steps.length - 2; step++) {
     if (!validateStep(step)) {
       hasErrors = true;
       setCurrentStep(step);
       break;
     }
   }

   if (hasErrors) {
     showErrorToast("Please correct the errors in the form before submitting.");
     return;
   }

   setIsSubmitting(true);

   try {
     const submitFormData = new FormData();

     // Text fields
     const textFields = [
       "title",
       "first_name",
       "middle_name",
       "surname",
       "email",
       "secondary_email",
       "date_of_birth",
       "phone_number",
       "alternative_phone",
       "whatsapp_number",
       "national_id",
       "passport",
       "membership_type",
       "associate_category",
       "university",
       "degree",
       "degree_year",
       "name_of_organization",
       "Abbreviation",
       "company_email",
       "payment_method",
       "transaction_number",
     ];

     textFields.forEach((field) => {
       const value = formData[field as keyof FormDataType];
       submitFormData.append(field, value ? String(value) : "");
     });

     // Numeric fields - ALWAYS send, even if 0
     submitFormData.append(
       "membership_category",
       formData.membership_category.toString()
     );
     submitFormData.append(
       "country_of_residence",
       formData.country_of_residence.toString()
     );
     // Boolean fields
     const booleanFields = [
       "abide_with_code_of_conduct",
       "comply_with_current_constitution",
       "declaration",
     ];

     booleanFields.forEach((field) => {
       const value = formData[field as keyof FormDataType] as boolean;
       submitFormData.append(field, value ? "1" : "0");
     });

     // Field of practice array
     if (formData.field_of_practice && formData.field_of_practice.length > 0) {
       formData.field_of_practice
         .filter((field) => field.field)
         .forEach((field, index) => {
           submitFormData.append(
             `field_of_practice[${index}][field]`,
             field.field.toString()
           );
           submitFormData.append(
             `field_of_practice[${index}][isPrimary]`,
             field.isPrimary ? "1" : "0"
           );
         });
     }

     // Countries of operation array
     if (
       formData.countries_of_operation &&
       formData.countries_of_operation.length > 0
     ) {
       formData.countries_of_operation
         .filter((country) => country.country)
         .forEach((country, index) => {
           submitFormData.append(
             `countries_of_operation[${index}][country]`,
             country.country.toString()
           );
           submitFormData.append(
             `countries_of_operation[${index}][isPrimary]`,
             country.isPrimary ? "1" : "0"
           );
         });
     }

     // File uploads
     if (formData.qualification) {
       submitFormData.append("qualification", formData.qualification);
     }
     if (formData.cv_resume) {
       submitFormData.append("cv_resume", formData.cv_resume);
     }
     if (formData.proof_of_registration) {
       submitFormData.append(
         "proof_of_registration",
         formData.proof_of_registration
       );
     }

     // Membership fee
     const membershipFee = getMembershipFee();
     submitFormData.append("amount_paid", membershipFee.toString());

     // Submit with organization ID
     const response = await authService.register(
       submitFormData,
       formData.organization_id
     );

     showSuccessToast(
       response.message ||
         "Registration successful! Your application has been submitted."
     );
     setTimeout(() => router.push('/login'), 2000);
   } catch (error: any) {
     console.error("Registration failed:", error);

     // Handle backend validation errors
     if (error.errors && Object.keys(error.errors).length > 0) {
       const backendErrors = error.errors;

       const fieldMap: Record<string, string> = {
         "field_of_practice.0.field": "field_of_practice",
         "countries_of_operation.0.country": "countries_of_operation",
       };

       const processedErrors: Record<string, string> = {};
       Object.keys(backendErrors).forEach((key) => {
         const frontendField = fieldMap[key] || key;
         const errorArray = backendErrors[key];
         processedErrors[frontendField] = Array.isArray(errorArray)
           ? errorArray[0]
           : errorArray;
       });

       setErrors(processedErrors);
       const firstErrorField = Object.keys(processedErrors)[0];
       navigateToErrorStep(firstErrorField);

       // Show specific error message
       const firstErrorMessage = Object.values(processedErrors)[0];
       showErrorToast(firstErrorMessage);
     } else {
       // Handle network/server errors
       showErrorToast(
         error.message || "Registration failed. Please try again later."
       );
     }
   } finally {
     setIsSubmitting(false);
   }
 };
  const inputStyles =
    "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] focus:border-[#00B5A5] dark:focus:border-[#00D4C7] text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300";

  const selectStyles =
    "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] focus:border-[#00B5A5] dark:focus:border-[#00D4C7] text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-all duration-300";

  const renderOrganizationSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Select Your Organization
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the organization you wish to register with. Each organization
          may have different membership types and requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {organizations.map((org) => (
          <div
            key={org.id}
            className={`cursor-pointer rounded-lg border-2 p-6 transition-all duration-300 ${
              formData.organization_id === org.id
                ? "border-[#00B5A5] dark:border-[#00D4C7] bg-[#00B5A5]/5 dark:bg-[#00D4C7]/5 shadow-lg"
                : "border-gray-200 dark:border-gray-700 hover:border-[#00B5A5] dark:hover:border-[#00D4C7] hover:shadow-md"
            } bg-white dark:bg-gray-800`}
            onClick={() => handleInputChange("organization_id", org.id)}
          >
            <div className="flex items-center space-x-4">
              {org.logo && (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="w-16 h-16 object-contain"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {org.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {org.abbreviation}
                </p>
              </div>
              {formData.organization_id === org.id && (
                <Check
                  className="text-[#00B5A5] dark:text-[#00D4C7]"
                  size={24}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {errors.organization_id && (
        <p className="text-red-500 dark:text-red-400 text-sm text-center">
          {errors.organization_id}
        </p>
      )}
    </div>
  );

  const renderMembershipCategory = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to AFSA Membership
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose your membership category to get started. Each membership type
          offers different benefits and requirements tailored to your
          professional needs.
        </p>
      </div>

      {isLoadingData ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5]"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading membership types...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Select Your Membership Type{" "}
              <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {masterData.membershipTypes.map((type) => (
                <div
                  key={type.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-300 ${
                    formData.membership_type === type.category
                      ? "border-[#00B5A5] dark:border-[#00D4C7] bg-[#00B5A5]/5 dark:bg-[#00D4C7]/5 shadow-lg"
                      : "border-gray-200 dark:border-gray-700 hover:border-[#00B5A5] dark:hover:border-[#00D4C7] hover:shadow-md"
                  } bg-white dark:bg-gray-800`}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      membership_type: type.category,
                      membership_category: type.id,
                      amount_paid: type.price,
                    }));
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="membership_type"
                      value={type.category}
                      checked={formData.membership_type === type.category}
                      onChange={() => {
                        setFormData((prev) => ({
                          ...prev,
                          membership_type: type.category,
                          membership_category: type.id,
                          amount_paid: type.price,
                        }));
                      }}
                      className="h-4 w-4 text-[#00B5A5] dark:text-[#00D4C7] focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {type.category}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {getMembershipDescription(type.category)}
                      </p>
                      <div className="mt-2 text-sm font-medium text-[#00B5A5] dark:text-[#00D4C7]">
                        ${type.price}/{type.frequency.toLowerCase()}
                      </div>
                    </div>
                  </div>
                  {formData.membership_type === type.category && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRequirements(true);
                      }}
                      className="mt-4 w-full bg-[#00B5A5] dark:bg-[#00D4C7] text-white py-2 px-4 rounded-lg text-sm hover:bg-[#008A7C] dark:hover:bg-[#00B5A5] transition-colors duration-300"
                    >
                      View Requirements
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.membership_type && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-2">
                {errors.membership_type}
              </p>
            )}
          </div>

          {formData.membership_type && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country of Residence <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.country_of_residence}
                    onChange={(e) =>
                      handleInputChange(
                        "country_of_residence",
                        parseInt(e.target.value)
                      )
                    }
                    className={selectStyles}
                  >
                    <option value="0">Select Country</option>
                    {masterData.countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country_of_residence && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                      {errors.country_of_residence}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Field of Practice <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.field_of_practice.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <select
                        value={field.field}
                        onChange={(e) =>
                          updateFieldOfPractice(
                            index,
                            parseInt(e.target.value),
                            field.isPrimary
                          )
                        }
                        className={`flex-1 ${selectStyles}`}
                      >
                        <option value="0">Select Field</option>
                        {masterData.fieldsOfPractice.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.isPrimary}
                          onChange={(e) =>
                            updateFieldOfPractice(
                              index,
                              field.field,
                              e.target.checked
                            )
                          }
                          className="mr-1"
                        />
                        Primary
                      </label>
                      <button
                        type="button"
                        onClick={() => removeFieldOfPractice(index)}
                        className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-300"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFieldOfPractice}
                    className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-[#00B5A5] dark:hover:border-[#00D4C7] hover:text-[#00B5A5] dark:hover:text-[#00D4C7] transition-colors duration-300 bg-white dark:bg-gray-800"
                  >
                    + Add Field of Practice
                  </button>
                </div>
                {errors.field_of_practice && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.field_of_practice}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {formData.membership_type && (
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {formData.membership_type} Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.membership_type === "Full Member" && (
              <>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Full voting rights in AFSA decisions
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Access to exclusive research publications
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Priority registration for conferences
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Professional certification programs
                </div>
              </>
            )}
            {formData.membership_type === "Associate Member" && (
              <>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Access to AFSA resources and publications
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Networking opportunities with professionals
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Discounted conference registration
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Professional development workshops
                </div>
              </>
            )}
            {formData.membership_type === "Student Member" && (
              <>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Student-focused educational resources
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Mentorship program access
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Scholarship opportunities
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Career guidance and job placement
                </div>
              </>
            )}
            {formData.membership_type === "Affiliate Member" && (
              <>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Access to AFSA publications and resources
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  International collaboration opportunities
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Conference participation discounts
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 mr-2" />
                  Global forensic science network access
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAdditionalInfo = () => (
    <div className="space-y-6">
      {formData.membership_type === "Student Member" && (
        <StudentInformationStep
          formData={formData}
          errors={errors}
          masterData={masterData}
          onInputChange={handleInputChange}
          onFileUpload={handleFileUpload}
          inputStyles={inputStyles}
          selectStyles={selectStyles}
        />
      )}

      {formData.membership_type === "Full Member" && (
        <FullMemberInformationStep
          formData={formData}
          errors={errors}
          masterData={masterData}
          onInputChange={handleInputChange}
          onFileUpload={handleFileUpload}
          inputStyles={inputStyles}
          selectStyles={selectStyles}
          addCountryOfOperation={addCountryOfOperation}
          removeCountryOfOperation={removeCountryOfOperation}
          updateCountryOfOperation={updateCountryOfOperation}
        />
      )}

      {(formData.membership_type === "Associate Member" ||
        formData.membership_type === "Affiliate Member") && (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <Building className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {formData.membership_type} - Ready to Proceed
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No additional documents or information required for{" "}
            {formData.membership_type}. You can proceed to the next step.
          </p>
        </div>
      )}

      {!formData.membership_type && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <p className="mb-2">
            Please select a membership type in the{" "}
            <span className="font-semibold text-[#00B5A5] dark:text-[#00D4C7]">
              Membership Category
            </span>{" "}
            step to view relevant additional information fields.
          </p>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="text-[#00B5A5] dark:text-[#00D4C7] hover:underline text-sm font-medium"
          >
            Go to Membership Category
          </button>
        </div>
      )}
    </div>
  );

  const renderDeclarations = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-4">
          Terms and Conditions
        </h3>
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.abide_with_code_of_conduct}
              onChange={(e) =>
                handleInputChange(
                  "abide_with_code_of_conduct",
                  e.target.checked
                )
              }
              className="mt-1 w-4 h-4 text-[#00B5A5] dark:text-[#00D4C7] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7]"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors duration-300">
                I agree to abide by the code of conduct{" "}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                I understand and agree to follow all professional standards and
                ethical guidelines established by AFSA.
              </p>
            </div>
          </label>
          {errors.abide_with_code_of_conduct && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {errors.abide_with_code_of_conduct}
            </p>
          )}

          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.comply_with_current_constitution}
              onChange={(e) =>
                handleInputChange(
                  "comply_with_current_constitution",
                  e.target.checked
                )
              }
              className="mt-1 w-4 h-4 text-[#00B5A5] dark:text-[#00D4C7] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7]"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors duration-300">
                I agree to comply with the current constitution{" "}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                I acknowledge that I have read and understood the AFSA
                constitution and agree to comply with all its provisions.
              </p>
            </div>
          </label>
          {errors.comply_with_current_constitution && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {errors.comply_with_current_constitution}
            </p>
          )}

          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.declaration}
              onChange={(e) =>
                handleInputChange("declaration", e.target.checked)
              }
              className="mt-1 w-4 h-4 text-[#00B5A5] dark:text-[#00D4C7] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7]"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors duration-300">
                Declaration of accuracy <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                I declare that all information provided in this application is
                true and accurate to the best of my knowledge.
              </p>
            </div>
          </label>
          {errors.declaration && (
            <p className="text-red-500 dark:text-red-400 text-sm">
              {errors.declaration}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
          Payment Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Membership Type:
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formData.membership_type || "Not selected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Membership Fee:
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              ${getMembershipFee()}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-700 dark:text-gray-300">
                Total Amount:
              </span>
              <span className="text-green-600 dark:text-green-400">
                ${getMembershipFee()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Method
          </label>
          <select
            value={formData.payment_method}
            onChange={(e) =>
              handleInputChange("payment_method", e.target.value)
            }
            className={selectStyles}
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Mobile Money">Mobile Money</option>
          </select>
        </div>

        {formData.payment_method === "Credit Card" && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You will be redirected to our secure payment processor to complete
              your payment.
            </p>
          </div>
        )}

        {formData.payment_method === "Bank Transfer" && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              Bank Transfer Details
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <p>
                <strong>Bank:</strong> ABC Bank
              </p>
              <p>
                <strong>Account Name:</strong> African Forensic Science
                Association
              </p>
              <p>
                <strong>Account Number:</strong> 1234567890
              </p>
              <p>
                <strong>Reference:</strong> AFSA-{formData.first_name}-
                {formData.surname}
              </p>
            </div>
          </div>
        )}

        {formData.payment_method === "Mobile Money" && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg animate-in fade-in slide-in-from-top-2">
            <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">
              Mobile Money Payment
            </h4>
            <div className="text-sm text-orange-700 dark:text-orange-400 space-y-1">
              <p>
                <strong>Service:</strong> MTN Mobile Money / Airtel Money
              </p>
              <p>
                <strong>Number:</strong> +250 780 000 000
              </p>
              <p>
                <strong>Reference:</strong> AFSA-{formData.first_name}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderOrganizationSelection();
      case 1:
        return renderMembershipCategory();
      case 2:
        return (
          <PersonalInformationStep
            formData={formData}
            errors={errors}
            masterData={masterData}
            onInputChange={handleInputChange}
            inputStyles={inputStyles}
            selectStyles={selectStyles}
          />
        );
      case 3:
        return renderAdditionalInfo();
      case 4:
        return renderDeclarations();
      case 5:
        return renderPayment();
      default:
        return null;
    }
  };

  return (
    <MembershipLayout
      currentStep={currentStep}
      steps={steps}
      currentStepTitle={steps[currentStep].title}
      currentStepDescription={steps[currentStep].description}
    >
      {showRequirements && formData.membership_type && (
        <RequirementsPreview
          membershipType={formData.membership_type}
          onClose={() => setShowRequirements(false)}
        />
      )}

      {renderCurrentStep()}

      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            currentStep === 0
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm hover:shadow-md"
          }`}
        >
          <ChevronLeft size={20} className="mr-2" />
          Previous
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={currentStep === 0 && !formData.organization_id}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              currentStep === 0 && !formData.organization_id
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white hover:from-[#008A7C] hover:to-[#006D5D] dark:hover:from-[#00B5A5] dark:hover:to-[#008A7C]"
            }`}
          >
            Next
            <ChevronRight size={20} className="ml-2" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isSubmitting
                ? "bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white hover:from-green-600 hover:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Check size={20} className="mr-2" />
                Complete Registration
              </>
            )}
          </button>
        )}
      </div>
    </MembershipLayout>
  );
};

export default MembershipSignupForm;