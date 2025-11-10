"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";

interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  secondary_email: string | null;
  alternative_phone: string | null;
  whatsapp_number: string | null;
  role: "Administrator" | "President" | "Board" | "Member" | "MemberUnverified" | "Pending";
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth: string;
  national_ID: string;
  passport: string | null;
  public_profile: string;
}

interface ProfileFormData {
  title: string;
  first_name: string;
  surname: string;
  middle_name: string;
  email: string;
  phone_number: string;
  secondary_email: string;
  alternative_phone: string;
  whatsapp_number: string;
  date_of_birth: string;
  national_id: string;
  passport: string;
  public_profile: File | null;
}

const ROLE_COLORS = {
  Administrator: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  President: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Board: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Member: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  MemberUnverified: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const TITLES = ["Mr", "Mrs", "Ms", "Dr", "Prof", "Sir", "Madam"];

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [formData, setFormData] = useState<ProfileFormData>({
    title: "",
    first_name: "",
    surname: "",
    middle_name: "",
    email: "",
    phone_number: "",
    secondary_email: "",
    alternative_phone: "",
    whatsapp_number: "",
    date_of_birth: "",
    national_id: "",
    passport: "",
    public_profile: null,
  });
  
  const router = useRouter();

  // Utility Functions
  const parseFullName = useCallback((fullName: string) => {
    if (!fullName) return { title: "", first_name: "", middle_name: "", surname: "" };

    const nameParts = fullName.trim().split(" ").filter(part => part.length > 0);
    let title = "";
    let namePartsWithoutTitle = [...nameParts];
    
    if (nameParts.length > 0 && TITLES.includes(nameParts[0])) {
      title = nameParts[0];
      namePartsWithoutTitle = nameParts.slice(1);
    }
    
    if (namePartsWithoutTitle.length === 0) {
      return { title, first_name: "", middle_name: "", surname: "" };
    } else if (namePartsWithoutTitle.length === 1) {
      return { title, first_name: namePartsWithoutTitle[0], middle_name: "", surname: "" };
    } else if (namePartsWithoutTitle.length === 2) {
      return { 
        title, 
        first_name: namePartsWithoutTitle[0], 
        middle_name: "", 
        surname: namePartsWithoutTitle[1] 
      };
    } else {
      return {
        title,
        first_name: namePartsWithoutTitle[0],
        middle_name: namePartsWithoutTitle.slice(1, -1).join(" "),
        surname: namePartsWithoutTitle[namePartsWithoutTitle.length - 1]
      };
    }
  }, []);

  const hasValidProfileImage = useCallback((profileUrl: string | null | undefined) => {
    if (!profileUrl || profileUrl.trim() === "") return false;
    
    const invalidUrls = ["null", "undefined", "/storage", "https://membership-portal-master-s83ce2.laravel.cloud/storage"];
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    
    return profileUrl.startsWith("http") && 
           !invalidUrls.includes(profileUrl.trim()) &&
           validExtensions.some(ext => profileUrl.includes(ext));
  }, []);

  const getUserInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, []);

  const getRoleColor = useCallback((role: string) => {
    return ROLE_COLORS[role as keyof typeof ROLE_COLORS] || ROLE_COLORS.Member;
  }, []);

  // Image Handling
  const fetchImageWithAuth = useCallback(async (imageUrl: string): Promise<string | null> => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.error("No auth token found for image fetch");
        return null;
      }

      const response = await fetch(imageUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status}`);
        return null;
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching authenticated image:", error);
      return null;
    }
  }, []);

  // Form Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid phone number";
    }

    if (!formData.national_id.trim()) {
      newErrors.national_id = "National ID is required";
    }

    if (formData.secondary_email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.secondary_email)) {
      newErrors.secondary_email = "Please enter a valid email address";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      const selectedDate = new Date(formData.date_of_birth);
      const today = new Date();
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 16);

      if (selectedDate > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      } else if (selectedDate > minAge) {
        newErrors.date_of_birth = "You must be at least 16 years old";
      }
    }

    if (formData.alternative_phone?.trim() && !/^\+?[\d\s\-\(\)]+$/.test(formData.alternative_phone)) {
      newErrors.alternative_phone = "Please enter a valid phone number";
    }

    if (formData.whatsapp_number?.trim() && !/^\+?[\d\s\-\(\)]+$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = "Please enter a valid WhatsApp number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Load User Data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserData = localStorage.getItem("user_data");
        if (!storedUserData) {
          setIsLoading(false);
          return;
        }

        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);

        const parsedName = parseFullName(parsedUserData.name || "");

        setFormData({
          title: parsedName.title,
          first_name: parsedName.first_name,
          surname: parsedName.surname,
          middle_name: parsedName.middle_name,
          email: parsedUserData.email || "",
          phone_number: parsedUserData.phone_number || "",
          secondary_email: parsedUserData.secondary_email || "",
          alternative_phone: parsedUserData.alternative_phone || "",
          whatsapp_number: parsedUserData.whatsapp_number || "",
          date_of_birth: parsedUserData.date_of_birth
            ? new Date(parsedUserData.date_of_birth).toISOString().split("T")[0]
            : "",
          national_id: parsedUserData.national_ID || "",
          passport: parsedUserData.passport || "",
          public_profile: null,
        });

        // Load profile image
        const imageUrl = parsedUserData.public_profile;
        if (hasValidProfileImage(imageUrl)) {
          const blobUrl = await fetchImageWithAuth(imageUrl);
          if (blobUrl) {
            setProfileImagePreview(blobUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        showErrorToast("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [parseFullName, hasValidProfileImage, fetchImageWithAuth]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (profileImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  // Form Handlers
  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select a valid image file (JPG, PNG, GIF, etc.).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Image size must be less than 5MB.");
      return;
    }

    setFormData((prev) => ({ ...prev, public_profile: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSave = async () => {
    if (!validateForm()) {
      showErrorToast("Please fix the errors in the form.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const formDataPayload = new FormData();
      formDataPayload.append("_method", "PATCH");
      formDataPayload.append("title", formData.title);
      formDataPayload.append("first_name", formData.first_name);
      formDataPayload.append("surname", formData.surname);
      formDataPayload.append("middle_name", formData.middle_name);
      formDataPayload.append("email", formData.email);
      formDataPayload.append("phone_number", formData.phone_number);
      formDataPayload.append("secondary_email", formData.secondary_email);
      formDataPayload.append("alternative_phone", formData.alternative_phone);
      formDataPayload.append("whatsapp_number", formData.whatsapp_number);
      formDataPayload.append("date_of_birth", formData.date_of_birth);
      formDataPayload.append("national_id", formData.national_id);
      formDataPayload.append("passport", formData.passport);

      if (formData.public_profile) {
        formDataPayload.append("public_profile", formData.public_profile);
      }

      const response = await fetch(`${apiUrl}change-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formDataPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.errors) {
          const backendErrors: Partial<ProfileFormData> = {};
          Object.keys(errorData.errors).forEach(key => {
            if (Array.isArray(errorData.errors[key])) {
              backendErrors[key as keyof ProfileFormData] = errorData.errors[key][0];
            }
          });
          setErrors(backendErrors);
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update profile`);
      }

      const data = await response.json();
      const updatedUserData = data.data;

      localStorage.setItem("user_data", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setIsEditing(false);
      showSuccessToast("Profile updated successfully!");
      setErrors({});
      
      // Reload profile image if updated
      if (hasValidProfileImage(updatedUserData.public_profile)) {
        const blobUrl = await fetchImageWithAuth(updatedUserData.public_profile);
        if (blobUrl) {
          setProfileImagePreview(blobUrl);
        }
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      if (error instanceof Error) {
        showErrorToast(error.message);
      } else {
        showErrorToast("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (userData) {
      const parsedName = parseFullName(userData.name || "");

      setFormData({
        title: parsedName.title,
        first_name: parsedName.first_name,
        surname: parsedName.surname,
        middle_name: parsedName.middle_name,
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        secondary_email: userData.secondary_email || "",
        alternative_phone: userData.alternative_phone || "",
        whatsapp_number: userData.whatsapp_number || "",
        date_of_birth: userData.date_of_birth
          ? new Date(userData.date_of_birth).toISOString().split("T")[0]
          : "",
        national_id: userData.national_ID || "",
        passport: userData.passport || "",
        public_profile: null,
      });

      if (hasValidProfileImage(userData.public_profile)) {
        fetchImageWithAuth(userData.public_profile).then(blobUrl => {
          if (blobUrl) setProfileImagePreview(blobUrl);
        });
      } else {
        setProfileImagePreview(null);
      }
    }
    setErrors({});
    setIsEditing(false);
  }, [userData, parseFullName, hasValidProfileImage, fetchImageWithAuth]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // No Data State
  if (!userData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Profile Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to load profile information. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00B5A5] hover:bg-[#008F82] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] transition-colors duration-200"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 rounded-lg transition-colors duration-200">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 rounded-full bg-[#00B5A5] dark:bg-[#008F82] flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {getUserInitials(userData.name)}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200 truncate">
                  {userData.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-200 truncate">
                  {userData.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${getRoleColor(
                      userData.role
                    )}`}
                  >
                    {userData.role === "MemberUnverified"
                      ? "Member (Unverified)"
                      : userData.role}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                      userData.verified
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {userData.verified ? "Verified" : "Unverified"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                      userData.active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {userData.active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00B5A5] hover:bg-[#008F82] dark:bg-[#008F82] dark:hover:bg-[#00B5A5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00B5A5] hover:bg-[#008F82] dark:bg-[#008F82] dark:hover:bg-[#00B5A5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-offset-gray-800 transition-colors duration-200 disabled:opacity-50 shadow-sm"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <nav
            className="-mb-px flex space-x-8 px-6 overflow-x-auto"
            aria-label="Tabs"
          >
            {[
              { id: "overview", name: "Overview" },
              { id: "contact", name: "Contact" },
              { id: "security", name: "Security" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#00B5A5] text-[#00B5A5] dark:text-[#00B5A5]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/20 rounded-lg transition-colors duration-200">
        {activeTab === "overview" && (
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              Personal Information
            </h3>
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0">
                  Profile Picture
                </label>
                {isEditing ? (
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-[#00B5A5] dark:bg-[#008F82] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-white">
                          {getUserInitials(userData.name)}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#00B5A5] file:text-white hover:file:bg-[#008F82] transition-colors duration-200"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-[#00B5A5] dark:bg-[#008F82] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-white">
                          {getUserInitials(userData.name)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {profileImagePreview
                        ? "Profile picture uploaded"
                        : "No profile picture"}
                    </p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3">
                  Title
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <select
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Title</option>
                      {TITLES.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.title || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              {/* First Name */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  First Name *
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange("first_name", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.first_name
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter your first name"
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.first_name}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.first_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Middle Name */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3">
                  Middle Name
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.middle_name}
                      onChange={(e) => handleInputChange("middle_name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your middle name (optional)"
                    />
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.middle_name || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              {/* Surname */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  Surname *
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => handleInputChange("surname", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.surname
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter your surname"
                      />
                      {errors.surname && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.surname}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.surname}
                    </p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  Date of Birth *
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.date_of_birth
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      />
                      {errors.date_of_birth && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.date_of_birth}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.date_of_birth
                        ? new Date(formData.date_of_birth).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              {/* National ID */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  National ID *
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={formData.national_id}
                        onChange={(e) => handleInputChange("national_id", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.national_id
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter your national ID"
                      />
                      {errors.national_id && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.national_id}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.national_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Passport Number */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3">
                  Passport Number
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.passport}
                      onChange={(e) => handleInputChange("passport", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter your passport number (optional)"
                    />
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.passport || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              Contact Information
            </h3>
            <div className="space-y-6">
              {/* Primary Email */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  Primary Email *
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.email
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter your email address"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Secondary Email */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  Secondary Email
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        value={formData.secondary_email}
                        onChange={(e) => handleInputChange("secondary_email", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.secondary_email
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter secondary email (optional)"
                      />
                      {errors.secondary_email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.secondary_email}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.secondary_email || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              {/* Primary Phone */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  Primary Phone *
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange("phone_number", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.phone_number
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone_number && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.phone_number}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.phone_number}
                    </p>
                  )}
                </div>
              </div>

              {/* Alternative Phone */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  Alternative Phone
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        value={formData.alternative_phone}
                        onChange={(e) => handleInputChange("alternative_phone", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.alternative_phone
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter alternative phone (optional)"
                      />
                      {errors.alternative_phone && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.alternative_phone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.alternative_phone || "Not specified"}
                    </p>
                  )}
                </div>
              </div>

              {/* WhatsApp Number */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 flex-shrink-0 sm:w-1/3 sm:pt-2">
                  WhatsApp Number
                </label>
                <div className="flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        value={formData.whatsapp_number}
                        onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                          errors.whatsapp_number
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        placeholder="Enter WhatsApp number (optional)"
                      />
                      {errors.whatsapp_number && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                          {errors.whatsapp_number}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                      {formData.whatsapp_number || "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              Security Information
            </h3>
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg transition-colors duration-200">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-200">
                  Account Status
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Account Active
                    </span>
                    <span className={`flex items-center ${userData.active ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {userData.active ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Email Verified
                    </span>
                    <span className={`flex items-center ${userData.verified ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                      {userData.verified ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Password Status
                    </span>
                    <span className={`flex items-center ${userData.has_changed_password ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
                      {userData.has_changed_password ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 transition-colors duration-200">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                  Security Actions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => router.push("/change-password?from=profile")}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm"
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Update Password
                  </button>

                  {!userData.verified && (
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("auth_token");
                          const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
                          
                          if (!token) {
                            showErrorToast("Authentication token not found");
                            return;
                          }
                          
                          const response = await fetch(`${apiUrl}resend-verification`, {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                          });
                          
                          if (response.ok) {
                            showSuccessToast("Verification email sent successfully!");
                          } else {
                            const error = await response.json();
                            showErrorToast(error.message || "Failed to send verification email");
                          }
                        } catch (error) {
                          console.error("Error sending verification email:", error);
                          showErrorToast("Failed to send verification email");
                        }
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 border border-[#00B5A5] dark:border-[#008F82] text-sm font-medium rounded-md text-[#00B5A5] dark:text-[#008F82] bg-white dark:bg-gray-800 hover:bg-[#00B5A5] hover:text-white dark:hover:bg-[#008F82] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00B5A5] dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm"
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
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Resend Verification
                    </button>
                  )}
                </div>

                {!userData.has_changed_password && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Security Recommendation
                        </h3>
                        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                          You're still using the default password. For security
                          reasons, please change your password as soon as
                          possible.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!userData.verified && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Email Verification Required
                        </h3>
                        <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                          Please verify your email address to access all
                          features. Check your inbox for the verification email.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}