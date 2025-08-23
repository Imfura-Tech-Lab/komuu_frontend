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

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
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
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );

  // Handle image load error (for blob URLs this shouldn't happen)
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.currentTarget;
    if (process.env.NODE_ENV === 'development') {
      console.log("🚨 Blob image failed to load:");
      console.log("  URL:", imgElement.src);
      console.log("  This should not happen with blob URLs");
    }
    setProfileImagePreview(null);
  };

  // Handle image load success
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.currentTarget;
    if (process.env.NODE_ENV === 'development') {
      console.log("✅ Image loaded successfully:");
      console.log("  URL:", imgElement.src);
      console.log("  Natural width:", imgElement.naturalWidth);
      console.log("  Natural height:", imgElement.naturalHeight);
      console.log("  Complete:", imgElement.complete);
    }
  };

  // Better name parsing function
  const parseFullName = (fullName: string) => {
    if (!fullName) return { title: "", first_name: "", middle_name: "", surname: "" };

    const nameParts = fullName.trim().split(" ").filter(part => part.length > 0);
    
    // Common titles to filter out
    const titles = ["Mr", "Mrs", "Ms", "Dr", "Prof", "Sir", "Madam"];
    
    // Find and extract title
    let title = "";
    let namePartsWithoutTitle = [...nameParts];
    
    if (nameParts.length > 0 && titles.includes(nameParts[0])) {
      title = nameParts[0];
      namePartsWithoutTitle = nameParts.slice(1);
    }
    
    // Handle remaining name parts
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
      // 3+ parts: first, middle(s), last
      return {
        title,
        first_name: namePartsWithoutTitle[0],
        middle_name: namePartsWithoutTitle.slice(1, -1).join(" "),
        surname: namePartsWithoutTitle[namePartsWithoutTitle.length - 1]
      };
    }
  };

  // Check if profile image is valid
  const hasValidProfileImage = (profileUrl: string | null | undefined) => {
    if (!profileUrl || profileUrl.trim() === "") return false;
    
    // Check for invalid/placeholder URLs
    const invalidUrls = [
      "null",
      "undefined",
      "/storage", // Just the path without domain
      "https://membership-portal-master-s83ce2.laravel.cloud/storage" // Base storage URL without file
    ];
    
    // Check if it's a valid URL format and not in the invalid list
    const isValidUrl = profileUrl.startsWith("http") && 
                       !invalidUrls.includes(profileUrl.trim()) &&
                       profileUrl.includes(".") && // Should have a file extension
                       (profileUrl.includes(".jpg") || 
                        profileUrl.includes(".jpeg") || 
                        profileUrl.includes(".png") || 
                        profileUrl.includes(".gif") || 
                        profileUrl.includes(".webp"));
    
    return isValidUrl;
  };

  // Monitor profile image state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("🔄 profileImagePreview state changed to:", profileImagePreview);
    }
  }, [profileImagePreview]);

  // Load user data - simplified since auth is handled by SecureDashboardLayout
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUserData = localStorage.getItem("user_data");
        if (!storedUserData) {
          setIsLoading(false);
          return;
        }

        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);

        // Parse the name field into components using improved logic
        const parsedName = parseFullName(parsedUserData.name || "");

        // Initialize form data
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

        // Set profile image preview if available
        const imageUrl = parsedUserData.public_profile;
        if (process.env.NODE_ENV === 'development') {
          console.log("📸 Setting up profile image:");
          console.log("  Raw profile URL from API:", imageUrl);
        }
        
        const isValidImage = hasValidProfileImage(imageUrl);
        if (process.env.NODE_ENV === 'development') {
          console.log("  Validation result:", isValidImage);
        }
        
        if (isValidImage) {
          if (process.env.NODE_ENV === 'development') {
            console.log("  ✅ Profile image passed validation");
            console.log("  🔐 Fetching image with authentication (403 error expected without auth)");
          }
          
          // Since images require authentication, fetch with auth token directly
          // fetchImageWithAuth(imageUrl);
          
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log("  ❌ Profile image failed validation, clearing preview");
          }
          setProfileImagePreview(null);
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        showErrorToast("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Validation
  const validateForm = (): boolean => {
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

    if (
      formData.secondary_email &&
      formData.secondary_email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.secondary_email)
    ) {
      newErrors.secondary_email = "Please enter a valid email address";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      // Check if date is not in the future and person is at least 16 years old
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

    // Validate alternative phone if provided
    if (formData.alternative_phone && formData.alternative_phone.trim() && 
        !/^\+?[\d\s\-\(\)]+$/.test(formData.alternative_phone)) {
      newErrors.alternative_phone = "Please enter a valid phone number";
    }

    // Validate WhatsApp number if provided
    if (formData.whatsapp_number && formData.whatsapp_number.trim() && 
        !/^\+?[\d\s\-\(\)]+$/.test(formData.whatsapp_number)) {
      newErrors.whatsapp_number = "Please enter a valid WhatsApp number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
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

      // Create FormData for file upload
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
        
        // Handle validation errors from backend
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

      // Update localStorage and state
      localStorage.setItem("user_data", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setIsEditing(false);
      showSuccessToast("Profile updated successfully!");
      
      // Clear any previous errors
      setErrors({});
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

  // Handle input changes
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select a valid image file (JPG, PNG, GIF, etc.).");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Image size must be less than 5MB.");
        return;
      }

      setFormData((prev) => ({ ...prev, public_profile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cancel editing
  const handleCancel = () => {
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

      // Reset profile image
      if (hasValidProfileImage(userData.public_profile)) {
        setProfileImagePreview(userData.public_profile);
      } else {
        setProfileImagePreview(null);
      }
    }
    setErrors({});
    setIsEditing(false);
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // Role color mapping
  const getRoleColor = (role: string) => {
    const colors = {
      Administrator: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      President: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      Board: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      Member: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      MemberUnverified: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    };
    return colors[role as keyof typeof colors] || colors.Member;
  };

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
      {/* Debug Information - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🐛 Debug Info</h3>
          <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
            <div><strong>Raw API URL:</strong> {userData.public_profile || 'null'}</div>
            <div><strong>Profile Preview State:</strong> {profileImagePreview || 'null'}</div>
            <div><strong>Has Valid Image:</strong> {hasValidProfileImage(userData.public_profile) ? 'Yes' : 'No'}</div>
            <div><strong>URL Validation:</strong></div>
            <div className="ml-4">
              <div>• Starts with http: {userData.public_profile?.startsWith('http') ? 'Yes' : 'No'}</div>
              <div>• Not null string: {userData.public_profile !== 'null' ? 'Yes' : 'No'}</div>
              <div>• Length {">"} 10: {(userData.public_profile?.length || 0) > 10 ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      )}

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
                    onError={handleImageError}
                    onLoad={handleImageLoad}
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
              { id: "overview", name: "Overview", icon: "user" },
              { id: "contact", name: "Contact", icon: "phone" },
              { id: "security", name: "Security", icon: "shield" },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Picture */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Profile Picture
                </label>
                {isEditing ? (
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-[#00B5A5] dark:bg-[#008F82] flex items-center justify-center overflow-hidden">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
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
                    <div className="h-16 w-16 rounded-full bg-[#00B5A5] dark:bg-[#008F82] flex items-center justify-center overflow-hidden">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          onLoad={handleImageLoad}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Title
                </label>
                {isEditing ? (
                  <select
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Title</option>
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                    <option value="Prof">Prof</option>
                  </select>
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.title || "Not specified"}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  First Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleInputChange("first_name", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.first_name
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your first name"
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.first_name}
                  </p>
                )}
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Middle Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.middle_name}
                    onChange={(e) =>
                      handleInputChange("middle_name", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your middle name (optional)"
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.middle_name || "Not specified"}
                  </p>
                )}
              </div>

              {/* Surname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Surname *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) =>
                      handleInputChange("surname", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.surname
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your surname"
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.surname}
                  </p>
                )}
                {errors.surname && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.surname}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Date of Birth *
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) =>
                      handleInputChange("date_of_birth", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.date_of_birth
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.date_of_birth
                      ? new Date(formData.date_of_birth).toLocaleDateString()
                      : "Not specified"}
                  </p>
                )}
                {errors.date_of_birth && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.date_of_birth}
                  </p>
                )}
              </div>

              {/* National ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  National ID *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.national_id}
                    onChange={(e) =>
                      handleInputChange("national_id", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.national_id
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your national ID"
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.national_id}
                  </p>
                )}
                {errors.national_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.national_id}
                  </p>
                )}
              </div>

              {/* Passport Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Passport Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.passport}
                    onChange={(e) =>
                      handleInputChange("passport", e.target.value)
                    }
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
        )}

        {activeTab === "contact" && (
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 transition-colors duration-200">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Primary Email *
                </label>
                {isEditing ? (
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
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.email}
                  </p>
                )}
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Secondary Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Secondary Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.secondary_email}
                    onChange={(e) =>
                      handleInputChange("secondary_email", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.secondary_email
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter secondary email (optional)"
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.secondary_email || "Not specified"}
                  </p>
                )}
                {errors.secondary_email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.secondary_email}
                  </p>
                )}
              </div>

              {/* Primary Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Primary Phone *
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      handleInputChange("phone_number", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.phone_number
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.phone_number}
                  </p>
                )}
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.phone_number}
                  </p>
                )}
              </div>

              {/* Alternative Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Alternative Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.alternative_phone}
                    onChange={(e) =>
                      handleInputChange("alternative_phone", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.alternative_phone
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter alternative phone (optional)"
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.alternative_phone || "Not specified"}
                  </p>
                )}
                {errors.alternative_phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.alternative_phone}
                  </p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  WhatsApp Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.whatsapp_number}
                    onChange={(e) =>
                      handleInputChange("whatsapp_number", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-transparent transition-colors duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.whatsapp_number
                        ? "border-red-300 dark:border-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="Enter WhatsApp number (optional)"
                  />
                ) : (
                  <p className="py-2 text-gray-900 dark:text-white transition-colors duration-200">
                    {formData.whatsapp_number || "Not specified"}
                  </p>
                )}
                {errors.whatsapp_number && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 transition-colors duration-200">
                    {errors.whatsapp_number}
                  </p>
                )}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex justify-between sm:flex-col sm:justify-start">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Account Active
                    </span>
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        userData.active
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {userData.active ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:justify-start">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Email Verified
                    </span>
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        userData.verified
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {userData.verified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between sm:flex-col sm:justify-start">
                    <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Password Status
                    </span>
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        userData.has_changed_password
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {userData.has_changed_password ? "Custom" : "Default"}
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