"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, Upload, X } from "lucide-react";
import MembershipLayout from "@/components/layouts/membership-layout";
import { authService } from "@/services/auth-service";
import { membershipService } from "@/services/membership-service";
import { ApiError } from "@/lib/api-client";

// Type Definitions
export type CountryOfOperation = {
  id: string;
  name?: string; // Optional name, useful for displaying selected country
};

export type FormDataType = {
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

  membership_type: string;
  country_of_residence: string;
  forensic_field_of_practice: string;
  associate_category: string;

  // Student Fields
  university: string;
  degree: string;
  degree_year: string;
  country_of_study: string; // This will store the country ID
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
  incompliance: boolean;

  // Payment
  amount_paid: number;
  payment_method: string;
  transaction_number: string;
};

interface MasterData {
  countries: Array<{ id: string; name: string }>;
  titles: Array<{ id: string; name: string }>;
  membershipTypes: Array<{ id: string; name: string; price?: number }>;
  fieldsOfPractice: Array<{ id: string; name: string }>;
  associateCategories: Array<{ id: string; name: string }>;
}

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
    Abbreviation: "",
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

  // Master data state
  const [masterData, setMasterData] = useState<MasterData>({
    countries: [],
    titles: [],
    membershipTypes: [],
    fieldsOfPractice: [],
    associateCategories: [],
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);

        const data = await membershipService.getAllMasterData();
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
  }, []);

  const steps = [
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

  // Show loading state while fetching data
  if (isLoadingData) {
    return (
      <MembershipLayout
        currentStep={1}
        steps={steps}
        currentStepTitle="Loading..."
        currentStepDescription="Fetching form data..."
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5]"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading form data...
          </span>
        </div>
      </MembershipLayout>
    );
  }

  // Show error state if data fetch failed
  if (dataError) {
    return (
      <MembershipLayout
        currentStep={1}
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
    // Clear error for the field if it exists
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
    // Clear error for the field if it exists
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
    // Clear countries_of_operation error if all removed or valid
    if (
      errors.countries_of_operation &&
      formData.countries_of_operation.length - 1 === 0
    ) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.countries_of_operation;
        return newErrors;
      });
    }
  };

  const updateCountryOfOperation = (index: number, countryId: string) => {
    const selectedCountry = masterData.countries.find(
      (c) => c.id === countryId
    );

    setFormData((prev) => ({
      ...prev,
      countries_of_operation: prev.countries_of_operation.map((country, i) =>
        i === index
          ? { id: countryId, name: selectedCountry?.name || "" }
          : country
      ),
    }));

    // Clear specific error if all countries now have valid IDs
    if (errors.countries_of_operation) {
      const updatedCountries = formData.countries_of_operation.map(
        (country, i) =>
          i === index
            ? { id: countryId, name: selectedCountry?.name || "" }
            : country
      );

      if (updatedCountries.length > 0 && updatedCountries.every((c) => c.id)) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.countries_of_operation;
          return newErrors;
        });
      }
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.membership_type) {
          newErrors.membership_type = "Membership type is required";
        }
        if (!formData.country_of_residence) {
          newErrors.country_of_residence = "Country of residence is required";
        }
        // Check if selected country of residence is a valid ID from master data
        if (
          formData.country_of_residence &&
          !masterData.countries.some(
            (c) => c.id === formData.country_of_residence
          )
        ) {
          newErrors.country_of_residence =
            "Invalid country of residence selected";
        }

        if (!formData.forensic_field_of_practice) {
          newErrors.forensic_field_of_practice =
            "Field of practice is required";
        }
        // Validate if forensic_field_of_practice is a valid name
        if (
          formData.forensic_field_of_practice &&
          !masterData.fieldsOfPractice.some(
            (f) => f.name === formData.forensic_field_of_practice
          )
        ) {
          newErrors.forensic_field_of_practice =
            "Invalid forensic field of practice selected";
        }

        if (
          formData.membership_type === "Associate Member" &&
          !formData.associate_category
        ) {
          newErrors.associate_category = "Associate category is required";
        }
        break;

      case 2:
        // Required fields validation
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

        // Email validation
        if (
          formData.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          newErrors.email = "Please enter a valid email address";
        }

        // Age validation (18+)
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
        if (formData.membership_type === "Student") {
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

          // Validate selected country of study
          if (
            formData.country_of_study &&
            !masterData.countries.some(
              (c) => c.id === formData.country_of_study
            )
          ) {
            newErrors.country_of_study = "Invalid country of study selected";
          }

          if (!formData.proof_of_registration) {
            newErrors.proof_of_registration =
              "Proof of registration is required";
          } else if (
            formData.proof_of_registration &&
            !["application/pdf", "image/jpeg", "image/png"].includes(
              formData.proof_of_registration.type
            )
          ) {
            newErrors.proof_of_registration =
              "Proof of registration must be a PDF, JPG, or PNG file";
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
          } else if (
            formData.qualification &&
            !["application/pdf"].includes(formData.qualification.type)
          ) {
            newErrors.qualification = "Qualification must be a PDF file";
          }

          if (!formData.cv_resume) {
            newErrors.cv_resume = "CV/Resume is required";
          } else if (
            formData.cv_resume &&
            ![
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ].includes(formData.cv_resume.type)
          ) {
            newErrors.cv_resume = "CV/Resume must be a PDF, DOC, or DOCX file";
          }

          // Validate company email
          if (
            formData.company_email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)
          ) {
            newErrors.company_email =
              "Please enter a valid company email address";
          }

          // Validate countries of operation
          if (
            !formData.countries_of_operation ||
            formData.countries_of_operation.length === 0
          ) {
            newErrors.countries_of_operation =
              "At least one country of operation is required";
          } else if (
            formData.countries_of_operation.some(
              (country) =>
                !country.id ||
                !masterData.countries.some((c) => c.id === country.id)
            )
          ) {
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
          { key: "incompliance", label: "You must confirm compliance" },
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

  // Helper function to navigate to the step containing the error field
  const navigateToErrorStep = (fieldName: string) => {
    const stepFieldMap = {
      1: [
        "membership_type",
        "country_of_residence",
        "forensic_field_of_practice",
        "associate_category",
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
        "incompliance",
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
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Update getMembershipFee function to use real data
  const getMembershipFee = () => {
    const selectedType = masterData.membershipTypes.find(
      (type) => type.name === formData.membership_type
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
    for (let step = 1; step <= steps.length - 1; step++) {
      // Don't validate payment step
      if (!validateStep(step)) {
        hasErrors = true;
        setCurrentStep(step); // Go to first step with errors
        break;
      }
    }

    if (hasErrors) {
      alert("Please correct the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a FormData object for file uploads
      const submitFormData = new FormData();

      // Handle text and select fields
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
        "country_of_residence",
        "forensic_field_of_practice",
        "associate_category",
        "university",
        "degree",
        "degree_year",
        "country_of_study",
        "name_of_organization",
        "Abbreviation",
        "company_email",
        "payment_method",
        "transaction_number",
      ];

      textFields.forEach((field) => {
        const value = formData[field as keyof FormDataType];
        // Send all fields, even if empty (Laravel expects them to be present)
        submitFormData.append(field, value ? String(value) : "");
      });

      // Handle boolean fields - send as "1" or "0" for Laravel
      const booleanFields = [
        "abide_with_code_of_conduct",
        "comply_with_current_constitution",
        "declaration",
        "incompliance",
      ];

      booleanFields.forEach((field) => {
        const value = formData[field as keyof FormDataType] as boolean;
        submitFormData.append(field, value ? "1" : "0");
      });

      // FIXED: Handle countries_of_operation array - send as FormData array
      if (
        formData.countries_of_operation &&
        formData.countries_of_operation.length > 0
      ) {
        // Filter out countries without IDs and send each as array element
        formData.countries_of_operation
          .filter(country => country.id) // Only include countries with valid IDs
          .forEach((country, index) => {
            submitFormData.append(`countries_of_operation[${index}][id]`, country.id);
          });
      }

      // Handle file uploads
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

      // Set amount_paid based on membership type
      const membershipFee = getMembershipFee();
      submitFormData.append("amount_paid", membershipFee.toString());

      // Debug: Log FormData content
      console.log("FormData being sent:");
      for (let pair of submitFormData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await authService.register(submitFormData);

      console.log("Registration successful:", response.data);
      alert("Registration successful! Your application has been submitted.");

      // Redirect or update UI as needed
      // router.push("/dashboard"); // if using Next.js router
    } catch (error: any) {
      console.error("Registration failed:", error);

      if (error.response?.data?.errors) {
        // Backend validation errors (Laravel-style)
        const backendErrors = error.response.data.errors;

        // Convert array error messages to strings
        const processedErrors: Record<string, string> = {};
        Object.keys(backendErrors).forEach((key) => {
          const errorArray = backendErrors[key];
          processedErrors[key] = Array.isArray(errorArray)
            ? errorArray[0]
            : errorArray;
        });

        setErrors(processedErrors);

        // Navigate to the step with the first error
        const firstErrorField = Object.keys(processedErrors)[0];
        navigateToErrorStep(firstErrorField);

        alert(
          "Registration failed due to validation errors. Please check the form."
        );
      } else if (error.response?.status === 422) {
        alert("Please check your form data and try again.");
      } else if (error.response?.status === 409) {
        alert("User with this email already exists.");
      } else {
        alert("Registration failed. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced input field styles with dark mode support
  const inputStyles =
    "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] focus:border-[#00B5A5] dark:focus:border-[#00D4C7] text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300";

  const selectStyles =
    "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] focus:border-[#00B5A5] dark:focus:border-[#00D4C7] text-gray-900 dark:text-white bg-white dark:bg-gray-800 transition-all duration-300";

  const renderMembershipCategory = () => (
    <div className="space-y-6">
      {/* Welcome Message */}
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

      {/* Membership Type Selection */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
            Select Your Membership Type <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {masterData.membershipTypes.map((type) => (
              <div
                key={type.id}
                className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-300 ${
                  formData.membership_type === type.name
                    ? "border-[#00B5A5] dark:border-[#00D4C7] bg-[#00B5A5]/5 dark:bg-[#00D4C7]/5 shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-[#00B5A5] dark:hover:border-[#00D4C7] hover:shadow-md"
                } bg-white dark:bg-gray-800`}
                onClick={() => handleInputChange("membership_type", type.name)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="membership_type"
                    value={type.name}
                    checked={formData.membership_type === type.name}
                    onChange={() =>
                      handleInputChange("membership_type", type.name)
                    }
                    className="h-4 w-4 text-[#00B5A5] dark:text-[#00D4C7] focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {type.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {getMembershipDescription(type.name)}
                    </p>
                    <div className="mt-2 text-sm font-medium text-[#00B5A5] dark:text-[#00D4C7]">
                      ${type.price || 0}/year
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.membership_type && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-2 transition-colors duration-300">
              {errors.membership_type}
            </p>
          )}
        </div>

        {/* Additional fields after membership type is selected */}
        {formData.membership_type && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                  {masterData.countries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country_of_residence && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                    {errors.country_of_residence}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Forensic Field of Practice{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.forensic_field_of_practice}
                  onChange={(e) =>
                    handleInputChange(
                      "forensic_field_of_practice",
                      e.target.value
                    )
                  }
                  className={selectStyles}
                >
                  <option value="">Select Field</option>
                  {masterData.fieldsOfPractice.map((field, index) => (
                    <option key={index} value={field.name}>
                      {field.name}
                    </option>
                  ))}
                </select>
                {errors.forensic_field_of_practice && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                    {errors.forensic_field_of_practice}
                  </p>
                )}
              </div>
            </div>

            {formData.membership_type === "Associate Member" && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                  {masterData.associateCategories.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.associate_category && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                    {errors.associate_category}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Membership Benefits Preview */}
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

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            Title <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={selectStyles}
          >
            <option value="">Select Title</option>
            {masterData.titles.map((title, index) => (
              <option key={index} value={title.name}>
                {title.name}
              </option>
            ))}
          </select>
          {errors.title && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
              {errors.first_name}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
              {errors.surname}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            className={inputStyles}
          />
          {errors.date_of_birth && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
              {errors.date_of_birth}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
              {errors.phone_number}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
              {errors.national_id}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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

  const renderAdditionalInfo = () => (
    <div className="space-y-6">
      {formData.membership_type === "Student Member" && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                  {errors.university}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                  {errors.degree}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Degree Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.degree_year}
                onChange={(e) =>
                  handleInputChange("degree_year", e.target.value)
                }
                className={inputStyles}
                placeholder="e.g., 2024"
              />
              {errors.degree_year && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                  {errors.degree_year}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                {masterData.countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.country_of_study && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                  {errors.country_of_study}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {formData.proof_of_registration.name}
                    <button
                      type="button"
                      onClick={() =>
                        handleFileUpload("proof_of_registration", null)
                      }
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </p>
                )}
              </div>
              {errors.proof_of_registration && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                  {errors.proof_of_registration}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {formData.membership_type === "Full Member" && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
            Full Member Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                    {errors.name_of_organization}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Abbreviation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.Abbreviation}
                  onChange={(e) =>
                    handleInputChange("Abbreviation", e.target.value)
                  }
                  className={inputStyles}
                  placeholder="e.g., AFSA"
                />
                {errors.Abbreviation && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                    {errors.Abbreviation}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                    {errors.company_email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
                      {masterData.countries.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCountryOfOperation(index)}
                      className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-300"
                      aria-label={`Remove country ${index + 1}`}
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
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                  {errors.countries_of_operation}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Qualification Document <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#00B5A5] dark:hover:border-[#00D4C7] transition-colors duration-300 bg-white dark:bg-gray-800">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div className="mt-4">
                    <label
                      htmlFor="qualification_upload"
                      className="cursor-pointer"
                    >
                      <span className="bg-[#00B5A5] dark:bg-[#00D4C7] text-white px-4 py-2 rounded-lg hover:bg-[#008A7C] dark:hover:bg-[#00B5A5] transition-colors duration-300">
                        Upload Qualification
                      </span>
                      <input
                        type="file"
                        id="qualification_upload"
                        name="qualification"
                        className="hidden"
                        accept=".pdf"
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
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: {formData.qualification.name}
                      <button
                        type="button"
                        onClick={() => handleFileUpload("qualification", null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </p>
                  )}
                </div>
                {errors.qualification && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                    {errors.qualification}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  CV/Resume <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#00B5A5] dark:hover:border-[#00D4C7] transition-colors duration-300 bg-white dark:bg-gray-800">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <div className="mt-4">
                    <label
                      htmlFor="cv_resume_upload"
                      className="cursor-pointer"
                    >
                      <span className="bg-[#00B5A5] dark:bg-[#00D4C7] text-white px-4 py-2 rounded-lg hover:bg-[#008A7C] dark:hover:bg-[#00B5A5] transition-colors duration-300">
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
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: {formData.cv_resume.name}
                      <button
                        type="button"
                        onClick={() => handleFileUpload("cv_resume", null)}
                        className="ml-2 text-red-500 hover:text-red-700"
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </p>
                  )}
                </div>
                {errors.cv_resume && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-300">
                    {errors.cv_resume}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show message if no membership type selected for this step */}
      {!formData.membership_type && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
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
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg transition-colors duration-300">
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
              className="mt-1 w-4 h-4 text-[#00B5A5] dark:text-[#00D4C7] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] transition-colors duration-300"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors duration-300">
                I agree to abide by the code of conduct{" "}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                I understand and agree to follow all professional standards and
                ethical guidelines established by the African Forensic Science
                Association.
              </p>
            </div>
          </label>
          {errors.abide_with_code_of_conduct && (
            <p className="text-red-500 dark:text-red-400 text-sm transition-colors duration-300">
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
              className="mt-1 w-4 h-4 text-[#00B5A5] dark:text-[#00D4C7] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] transition-colors duration-300"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors duration-300">
                I agree to comply with the current constitution{" "}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                I acknowledge that I have read and understood the AFSA
                constitution and agree to comply with all its provisions.
              </p>
            </div>
          </label>
          {errors.comply_with_current_constitution && (
            <p className="text-red-500 dark:text-red-400 text-sm transition-colors duration-300">
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
              className="mt-1 w-4 h-4 text-[#00B5A5] dark:text-[#00D4C7] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] transition-colors duration-300"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors duration-300">
                Declaration of accuracy <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                I declare that all information provided in this application is
                true and accurate to the best of my knowledge.
              </p>
            </div>
          </label>
          {errors.declaration && (
            <p className="text-red-500 dark:text-red-400 text-sm transition-colors duration-300">
              {errors.declaration}
            </p>
          )}

          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.incompliance}
              onChange={(e) =>
                handleInputChange("incompliance", e.target.checked)
              }
              className="mt-1 w-4 h-4 text-[#00B5A5] dark:text-[#00D4C7] bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00B5A5] dark:focus:ring-[#00D4C7] transition-colors duration-300"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-[#00B5A5] dark:group-hover:text-[#00D4C7] transition-colors duration-300">
                Compliance confirmation <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-300">
                I confirm that I am in compliance with all applicable laws and
                regulations in my jurisdiction.
              </p>
            </div>
          </label>
          {errors.incompliance && (
            <p className="text-red-500 dark:text-red-400 text-sm transition-colors duration-300">
              {errors.incompliance}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-lg transition-colors duration-300">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
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
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You will be redirected to our secure payment processor to complete
              your payment.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Transaction Number (Auto-generated)
              </label>
              <input
                type="text"
                value={
                  "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase()
                }
                disabled
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {formData.payment_method === "Bank Transfer" && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
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
              <p className="pt-2 font-semibold">
                Please make your payment and click "Complete Registration" to
                finalize. Your membership will be activated upon payment
                verification.
              </p>
            </div>
          </div>
        )}

        {formData.payment_method === "Mobile Money" && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-lg transition-colors duration-300 animate-in fade-in slide-in-from-top-2">
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
              <p className="pt-2 font-semibold">
                Please make your payment and click "Complete Registration" to
                finalize. Your membership will be activated upon payment
                verification.
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
        return renderMembershipCategory();
      case 2:
        return renderPersonalInfo();
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
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            currentStep === 1
              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm hover:shadow-md"
          }`}
        >
          <ChevronLeft size={20} className="mr-2" />
          Previous
        </button>

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#00B5A5] to-[#008A7C] dark:from-[#00D4C7] dark:to-[#00B5A5] text-white rounded-lg font-medium hover:from-[#008A7C] hover:to-[#006D5D] dark:hover:from-[#00B5A5] dark:hover:to-[#008A7C] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
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