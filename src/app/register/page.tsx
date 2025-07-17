"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Upload, X } from "lucide-react";
import MembershipLayout from "@/components/layouts/MembershipLayout";

// Type Definitions
type Country = {
  id: number;
  name: string;
};

type CountryOfOperation = {
  id: string;
  name?: string;
};

type FormDataType = {
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
  membership_type: "Full Member" | "Associate Member" | "Student" | "";
  country_of_residence: string;
  forensic_field_of_practice: string;
  associate_category: string;

  // Student Fields
  university: string;
  degree: string;
  degree_year: string;
  country_of_study: string;
  proof_of_registration: File | null;

  // Full Member Fields
  qualification: File | null;
  cv_resume: File | null;
  name_of_organization: string;
  abbreviation: string;
  countries_of_operation: CountryOfOperation[];
  company_email: string;

  // Declarations
  abide_with_code_of_conduct: boolean;
  comply_with_current_constitution: boolean;
  declaration: boolean;
  incompliance: boolean;

  // Payment
  amount_paid: number;
  payment_method: string;
  transaction_number: string;
};

const MembershipSignupForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({
    // Personal Information
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

    // Membership Details
    membership_type: "",
    country_of_residence: "",
    forensic_field_of_practice: "",
    associate_category: "",

    // Student Fields
    university: "",
    degree: "",
    degree_year: "",
    country_of_study: "",
    proof_of_registration: null,

    // Full Member Fields
    qualification: null,
    cv_resume: null,
    name_of_organization: "",
    abbreviation: "",
    countries_of_operation: [],
    company_email: "",

    // Declarations
    abide_with_code_of_conduct: false,
    comply_with_current_constitution: false,
    declaration: false,
    incompliance: false,

    // Payment
    amount_paid: 0,
    payment_method: "Credit Card",
    transaction_number: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const mockData = {
    titles: ["Mr", "Mrs", "Ms", "Dr", "Prof"],
    membershipTypes: ["Full Member", "Associate Member", "Student"],
    countries: [
      { id: 1, name: "United States" },
      { id: 12, name: "Rwanda" },
      { id: 14, name: "Kenya" },
      { id: 15, name: "Uganda" },
    ] as Country[],
    fieldsOfPractice: [
      "Biology",
      "Chemistry",
      "Physics",
      "Digital Forensics",
      "Psychology",
    ],
    associateCategories: ["Academic", "Industry", "Government", "NGO"],
  };

  const steps = [
    {
      id: 1,
      title: "Personal Information",
      description: "Basic details and contact information",
      icon: "👤",
    },
    {
      id: 2,
      title: "Membership Details",
      description: "Choose your membership type and specialization",
      icon: "🏛️",
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

  const addCountryOfOperation = () => {
    setFormData((prev) => ({
      ...prev,
      countries_of_operation: [...prev.countries_of_operation, { id: "" }],
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

  const updateCountryOfOperation = (index: number, countryId: string) => {
    setFormData((prev) => ({
      ...prev,
      countries_of_operation: prev.countries_of_operation.map((country, i) =>
        i === index ? { id: countryId } : country
      ),
    }));
    if (errors.countries_of_operation) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.countries_of_operation;
        return newErrors;
      });
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title) newErrors.title = "Title is required";
        if (!formData.first_name)
          newErrors.first_name = "First name is required";
        if (!formData.surname) newErrors.surname = "Surname is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
          newErrors.email = "Email address is invalid";
        if (!formData.date_of_birth)
          newErrors.date_of_birth = "Date of birth is required";
        if (!formData.phone_number)
          newErrors.phone_number = "Phone number is required";
        if (!formData.national_id)
          newErrors.national_id = "National ID is required";
        break;

      case 2:
        if (!formData.membership_type)
          newErrors.membership_type = "Membership type is required";
        if (!formData.country_of_residence)
          newErrors.country_of_residence = "Country of residence is required";
        if (!formData.forensic_field_of_practice)
          newErrors.forensic_field_of_practice =
            "Field of practice is required";
        if (
          formData.membership_type === "Associate Member" &&
          !formData.associate_category
        ) {
          newErrors.associate_category = "Associate category is required";
        }
        break;

      case 3:
        if (formData.membership_type === "Student") {
          if (!formData.university)
            newErrors.university = "University is required";
          if (!formData.degree) newErrors.degree = "Degree is required";
          if (!formData.degree_year)
            newErrors.degree_year = "Degree year is required";
          if (!formData.country_of_study)
            newErrors.country_of_study = "Country of study is required";
          if (!formData.proof_of_registration)
            newErrors.proof_of_registration =
              "Proof of registration is required";
        }

        if (formData.membership_type === "Full Member") {
          if (!formData.qualification)
            newErrors.qualification = "Qualification is required";
          if (!formData.cv_resume)
            newErrors.cv_resume = "CV/Resume is required";
          if (!formData.name_of_organization)
            newErrors.name_of_organization = "Organization name is required";
          if (!formData.abbreviation)
            newErrors.abbreviation = "Abbreviation is required";
          if (!formData.company_email)
            newErrors.company_email = "Company email is required";
          if (
            formData.countries_of_operation.length === 0 ||
            formData.countries_of_operation.some((country) => !country.id)
          ) {
            newErrors.countries_of_operation =
              "At least one country of operation is required and must be selected";
          }
        }
        break;

      case 4:
        if (!formData.abide_with_code_of_conduct)
          newErrors.abide_with_code_of_conduct =
            "You must agree to abide by the code of conduct";
        if (!formData.comply_with_current_constitution)
          newErrors.comply_with_current_constitution =
            "You must agree to comply with the constitution";
        if (!formData.declaration)
          newErrors.declaration = "You must agree to the declaration";
        if (!formData.incompliance)
          newErrors.incompliance = "You must confirm compliance";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Form submitted:", formData);
    setIsSubmitting(false);
    alert("Registration successful!");
  };

  // Input field styles with proper text visibility using auth layout colors
  const inputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] text-gray-900 bg-white placeholder-gray-500 transition-colors";
  const selectStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] text-gray-900 bg-white transition-colors";

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={selectStyles}
          >
            <option value="">Select Title</option>
            {mockData.titles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            className={inputStyles}
            placeholder="Enter your first name"
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Middle Name
          </label>
          <input
            type="text"
            value={formData.middle_name}
            onChange={(e) => handleInputChange("middle_name", e.target.value)}
            className={inputStyles}
            placeholder="Enter your middle name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Surname <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.surname}
            onChange={(e) => handleInputChange("surname", e.target.value)}
            className={inputStyles}
            placeholder="Enter your surname"
          />
          {errors.surname && (
            <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={inputStyles}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Email
          </label>
          <input
            type="email"
            value={formData.secondary_email}
            onChange={(e) =>
              handleInputChange("secondary_email", e.target.value)
            }
            className={inputStyles}
            placeholder="Enter secondary email (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            className={inputStyles}
          />
          {errors.date_of_birth && (
            <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone_number}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
            className={inputStyles}
            placeholder="+250790340400"
          />
          {errors.phone_number && (
            <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alternative Phone
          </label>
          <input
            type="tel"
            value={formData.alternative_phone}
            onChange={(e) =>
              handleInputChange("alternative_phone", e.target.value)
            }
            className={inputStyles}
            placeholder="Alternative phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Number
          </label>
          <input
            type="tel"
            value={formData.whatsapp_number}
            onChange={(e) =>
              handleInputChange("whatsapp_number", e.target.value)
            }
            className={inputStyles}
            placeholder="+250780343405"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            National ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.national_id}
            onChange={(e) => handleInputChange("national_id", e.target.value)}
            className={inputStyles}
            placeholder="Enter your national ID"
          />
          {errors.national_id && (
            <p className="text-red-500 text-sm mt-1">{errors.national_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Passport Number
          </label>
          <input
            type="text"
            value={formData.passport}
            onChange={(e) => handleInputChange("passport", e.target.value)}
            className={inputStyles}
            placeholder="Enter passport number"
          />
        </div>
      </div>
    </div>
  );

  const renderMembershipDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Membership Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.membership_type}
            onChange={(e) =>
              handleInputChange(
                "membership_type",
                e.target.value as FormDataType["membership_type"]
              )
            }
            className={selectStyles}
          >
            <option value="">Select Membership Type</option>
            {mockData.membershipTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.membership_type && (
            <p className="text-red-500 text-sm mt-1">
              {errors.membership_type}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country of Residence <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.country_of_residence}
            onChange={(e) =>
              handleInputChange("country_of_residence", e.target.value)
            }
            className={selectStyles}
          >
            <option value="">Select Country</option>
            {mockData.countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country_of_residence && (
            <p className="text-red-500 text-sm mt-1">
              {errors.country_of_residence}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Forensic Field of Practice <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.forensic_field_of_practice}
            onChange={(e) =>
              handleInputChange("forensic_field_of_practice", e.target.value)
            }
            className={selectStyles}
          >
            <option value="">Select Field</option>
            {mockData.fieldsOfPractice.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
          {errors.forensic_field_of_practice && (
            <p className="text-red-500 text-sm mt-1">
              {errors.forensic_field_of_practice}
            </p>
          )}
        </div>

        {formData.membership_type === "Associate Member" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Associate Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.associate_category}
              onChange={(e) =>
                handleInputChange("associate_category", e.target.value)
              }
              className={selectStyles}
            >
              <option value="">Select Category</option>
              {mockData.associateCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.associate_category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.associate_category}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAdditionalInfo = () => (
    <div className="space-y-6">
      {formData.membership_type === "Student" && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) =>
                  handleInputChange("university", e.target.value)
                }
                className={inputStyles}
                placeholder="Enter university name"
              />
              {errors.university && (
                <p className="text-red-500 text-sm mt-1">{errors.university}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => handleInputChange("degree", e.target.value)}
                className={inputStyles}
                placeholder="Enter degree program"
              />
              {errors.degree && (
                <p className="text-red-500 text-sm mt-1">{errors.degree}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.degree_year}
                onChange={(e) =>
                  handleInputChange("degree_year", e.target.value)
                }
                className={inputStyles}
                placeholder="2024"
              />
              {errors.degree_year && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.degree_year}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country of Study <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.country_of_study}
                onChange={(e) =>
                  handleInputChange("country_of_study", e.target.value)
                }
                className={selectStyles}
              >
                <option value="">Select Country</option>
                {mockData.countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country_of_study && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.country_of_study}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof of Registration <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00B5A5] transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label
                    htmlFor="proof_of_registration_upload"
                    className="cursor-pointer"
                  >
                    <span className="bg-[#00B5A5] text-white px-4 py-2 rounded-lg hover:bg-[#008A7C] transition-colors">
                      Upload File
                    </span>
                    <input
                      type="file"
                      id="proof_of_registration_upload"
                      name="proof_of_registration"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        handleFileUpload(
                          "proof_of_registration",
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                    />
                  </label>
                </div>
                {formData.proof_of_registration && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formData.proof_of_registration.name}
                  </p>
                )}
              </div>
              {errors.proof_of_registration && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.proof_of_registration}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {formData.membership_type === "Full Member" && (
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Full Member Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_of_organization}
                  onChange={(e) =>
                    handleInputChange("name_of_organization", e.target.value)
                  }
                  className={inputStyles}
                  placeholder="Enter organization name"
                />
                {errors.name_of_organization && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name_of_organization}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abbreviation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.abbreviation}
                  onChange={(e) =>
                    handleInputChange("abbreviation", e.target.value)
                  }
                  className={inputStyles}
                  placeholder="Enter abbreviation"
                />
                {errors.abbreviation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.abbreviation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.company_email}
                  onChange={(e) =>
                    handleInputChange("company_email", e.target.value)
                  }
                  className={inputStyles}
                  placeholder="Enter company email"
                />
                {errors.company_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.company_email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Countries of Operation <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.countries_of_operation.map((country, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={country.id}
                      onChange={(e) =>
                        updateCountryOfOperation(index, e.target.value)
                      }
                      className={`flex-1 ${selectStyles}`}
                    >
                      <option value="">Select Country</option>
                      {mockData.countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCountryOfOperation(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      aria-label={`Remove country ${index + 1}`}
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCountryOfOperation}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#00B5A5] hover:text-[#00B5A5] transition-colors"
                >
                  + Add Country of Operation
                </button>
              </div>
              {errors.countries_of_operation && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.countries_of_operation}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification Document <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00B5A5] transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label
                      htmlFor="qualification_upload"
                      className="cursor-pointer"
                    >
                      <span className="bg-[#00B5A5] text-white px-4 py-2 rounded-lg hover:bg-[#008A7C] transition-colors">
                        Upload Qualification
                      </span>
                      <input
                        type="file"
                        id="qualification_upload"
                        name="qualification"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileUpload(
                            "qualification",
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                      />
                    </label>
                  </div>
                  {formData.qualification && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formData.qualification.name}
                    </p>
                  )}
                </div>
                {errors.qualification && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.qualification}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV/Resume <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#00B5A5] transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label
                      htmlFor="cv_resume_upload"
                      className="cursor-pointer"
                    >
                      <span className="bg-[#00B5A5] text-white px-4 py-2 rounded-lg hover:bg-[#008A7C] transition-colors">
                        Upload CV/Resume
                      </span>
                      <input
                        type="file"
                        id="cv_resume_upload"
                        name="cv_resume"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          handleFileUpload(
                            "cv_resume",
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                      />
                    </label>
                  </div>
                  {formData.cv_resume && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {formData.cv_resume.name}
                    </p>
                  )}
                </div>
                {errors.cv_resume && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cv_resume}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!formData.membership_type && (
        <div className="text-center py-8 text-gray-500">
          Please select a membership type in the previous step to continue.
        </div>
      )}
    </div>
  );

  const renderDeclarations = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">
          Terms and Conditions
        </h3>
        <div className="space-y-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.abide_with_code_of_conduct}
              onChange={(e) =>
                handleInputChange(
                  "abide_with_code_of_conduct",
                  e.target.checked
                )
              }
              className="mt-1 w-4 h-4 text-[#00B5A5] bg-gray-100 border-gray-300 rounded focus:ring-[#00B5A5]"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                I agree to abide by the code of conduct{" "}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 mt-1">
                I understand and agree to follow all professional standards and
                ethical guidelines established by the African Forensic Science
                Association.
              </p>
            </div>
          </label>
          {errors.abide_with_code_of_conduct && (
            <p className="text-red-500 text-sm">
              {errors.abide_with_code_of_conduct}
            </p>
          )}

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.comply_with_current_constitution}
              onChange={(e) =>
                handleInputChange(
                  "comply_with_current_constitution",
                  e.target.checked
                )
              }
              className="mt-1 w-4 h-4 text-[#00B5A5] bg-gray-100 border-gray-300 rounded focus:ring-[#00B5A5]"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                I agree to comply with the current constitution{" "}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 mt-1">
                I acknowledge that I have read and understood the AFSA
                constitution and agree to comply with all its provisions.
              </p>
            </div>
          </label>
          {errors.comply_with_current_constitution && (
            <p className="text-red-500 text-sm">
              {errors.comply_with_current_constitution}
            </p>
          )}

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.declaration}
              onChange={(e) =>
                handleInputChange("declaration", e.target.checked)
              }
              className="mt-1 w-4 h-4 text-[#00B5A5] bg-gray-100 border-gray-300 rounded focus:ring-[#00B5A5]"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Declaration of accuracy <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 mt-1">
                I declare that all information provided in this application is
                true and accurate to the best of my knowledge.
              </p>
            </div>
          </label>
          {errors.declaration && (
            <p className="text-red-500 text-sm">{errors.declaration}</p>
          )}

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.incompliance}
              onChange={(e) =>
                handleInputChange("incompliance", e.target.checked)
              }
              className="mt-1 w-4 h-4 text-[#00B5A5] bg-gray-100 border-gray-300 rounded focus:ring-[#00B5A5]"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Compliance confirmation <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 mt-1">
                I confirm that I am in compliance with all applicable laws and
                regulations in my jurisdiction.
              </p>
            </div>
          </label>
          {errors.incompliance && (
            <p className="text-red-500 text-sm">{errors.incompliance}</p>
          )}
        </div>
      </div>
    </div>
  );

  const getMembershipFee = () => {
    switch (formData.membership_type) {
      case "Full Member":
        return 100;
      case "Associate Member":
        return 75;
      case "Student":
        return 25;
      default:
        return 0;
    }
  };

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-4">
          Payment Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Membership Type:</span>
            <span className="font-medium text-gray-900">
              {formData.membership_type || "Not selected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Membership Fee:</span>
            <span className="font-medium text-gray-900">
              ${getMembershipFee()}
            </span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span className="text-gray-700">Total Amount:</span>
              <span className="text-green-600">${getMembershipFee()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              You will be redirected to our secure payment processor to complete
              your payment.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Number (Auto-generated)
              </label>
              <input
                type="text"
                value={
                  "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase()
                }
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>
          </div>
        )}

        {formData.payment_method === "Bank Transfer" && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Bank Transfer Details
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
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
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">
              Mobile Money Payment
            </h4>
            <div className="text-sm text-orange-700 space-y-1">
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
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderMembershipDetails();
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
      currentStepTitle={steps[currentStep - 1].title}
      currentStepDescription={steps[currentStep - 1].description}
    >
      {renderCurrentStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
            currentStep === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <ChevronLeft size={20} className="mr-2" />
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center px-6 py-3 bg-[#00B5A5] text-white rounded-lg font-medium hover:bg-[#008A7C] transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Next
            <ChevronRight size={20} className="ml-2" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg hover:shadow-xl ${
              isSubmitting
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
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
