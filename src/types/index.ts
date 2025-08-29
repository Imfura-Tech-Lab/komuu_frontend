export interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  secondary_email: string | null;
  alternative_phone: string | null;
  whatsapp_number: string | null;
  role: UserRole;
  verified: boolean;
  active: boolean;
  has_changed_password: boolean;
  date_of_birth: string;
  national_ID: string;
  passport: string | null;
  public_profile: string;
  application_status?: "pending" | "approved" | "rejected";
}

export const ROLE_HIERARCHY = {
  Administrator: 4,
  President: 3,
  Board: 2,
  Member: 1,
  Pending: 0,
} as const;

export const ROLE_PERMISSIONS = {
  Administrator: [
    "manage_users",
    "manage_board_members",
    "approve_applications",
    "reject_applications",
    "manage_roles",
    "system_settings",
    "send_notifications",
    "manage_notifications",
    "view_all_applications",
    "view_all_payments",
    "view_all_members",
    "view_all_certificates",
    "view_all_analytics",
    "view_profile",
    "update_profile",
    "member_dashboard",
  ],
  President: [
    "sign_certificates",
    "certificate_authority",
    "view_all_applications",
    "view_all_payments",
    "view_all_members",
    "view_all_certificates",
    "view_all_analytics",
    "strategic_planning",
    "executive_dashboard",
    "presidential_reports",
    "view_profile",
    "update_profile",
    "member_dashboard",
    "application_settings",
  ],
  Board: [
    "view_all_applications",
    "view_all_payments",
    "view_all_members",
    "view_all_certificates",
    "view_all_analytics",
    "board_meetings",
    "board_dashboard",
    "policy_decisions",
    "board_discussions",
    "view_profile",
    "update_profile",
    "member_dashboard",
  ],
  Member: [
    "view_profile",
    "update_profile",
    "member_dashboard",
    "member_resources",
    "member_events",
    "view_own_payments",
    "view_own_certificates",
    "member_community",
  ],
  Pending: [
    "view_profile",
    "update_profile",
    "application_status",
    "application_help",
  ],
} as const;

// Utility types derived from the constants
export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number];

// Navigation Item Type
export interface NavigationItemType {
  name: string;
  href: string;
  permission: Permission; // Use the Permission type here
  icon?: string;
  description?: string;
  badge?: string;
}

// Function to create navigation items (can stay here or be moved if it has many dependencies)
export const createNavigationItems = (role: UserRole): NavigationItemType[] => {
  const baseItems: NavigationItemType[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      permission: "member_dashboard",
      icon: "dashboard",
      description: "Overview and summary",
    },
    {
      name: "Profile",
      href: "/profile",
      permission: "view_profile",
      icon: "profile",
      description: "Personal information",
    },
  ];

  const roleSpecificItems: { [key in UserRole]?: NavigationItemType[] } = {
    Administrator: [
      {
        name: "Application Management",
        href: "/applications",
        permission: "approve_applications",
        icon: "applications",
        description: "Review and approve membership applications",
        badge: "pending_count",
      },
      {
        name: "Member Management",
        href: "/members",
        permission: "manage_users",
        icon: "members",
        description: "Manage all members and their details",
      },
      {
        name: "Payment Overview",
        href: "/payments",
        permission: "view_all_payments",
        icon: "payments",
        description: "View all member payments and transactions",
      },
      {
        name: "Certificates",
        href: "/certificates",
        permission: "view_all_certificates",
        icon: "certificates",
        description: "View all member certificates",
      },
      {
        name: "Analytics & Reports",
        href: "/analytics",
        permission: "view_all_analytics",
        icon: "analytics",
        description: "Comprehensive system analytics",
      },
      {
        name: "Notifications",
        href: "/notifications",
        permission: "send_notifications",
        icon: "notifications",
        description: "Send notifications to members",
      },
      {
        name: "System Settings",
        href: "/settings",
        permission: "system_settings",
        icon: "settings",
        description: "Configure system settings",
      },
    ],
    President: [
      {
        name: "Certificates",
        href: "/certificates",
        permission: "sign_certificates",
        icon: "certificate_sign",
        description: "Sign and authorize member certificates",
        badge: "unsigned_count",
      },
      {
        name: "Applications",
        href: "/applications",
        permission: "view_all_applications",
        icon: "applications",
        description: "Review membership applications",
      },
      {
        name: "Members",
        href: "/members",
        permission: "view_all_members",
        icon: "members",
        description: "All members overview",
      },
      {
        name: "Financial",
        href: "/payments",
        permission: "view_all_payments",
        icon: "payments",
        description: "Financial transactions overview",
      },
      {
        name: "Settings",
        href: "/settings",
        permission: "view_all_analytics",
        icon: "settings",
        description: "applications settings",
      },
    ],
    Board: [
      {
        name: "Applications",
        href: "/applications",
        permission: "view_all_applications",
        icon: "applications",
        description: "View membership applications",
      },
      {
        name: "Member",
        href: "/members",
        permission: "view_all_members",
        icon: "members",
        description: "View all members",
      },
      {
        name: "Payment",
        href: "/payments",
        permission: "view_all_payments",
        icon: "payments",
        description: "View payment records",
      },
      {
        name: "Certificates",
        href: "/certificates",
        permission: "view_all_certificates",
        icon: "certificates",
        description: "View issued certificates",
      },
      {
        name: "Policy Management",
        href: "/policies",
        permission: "policy_decisions",
        icon: "policies",
        description: "Organizational policies",
      },
    ],
    Member: [
      {
        name: "Application",
        href: "/my-application",
        permission: "view_own_payments",
        icon: "applications",
        description: "View your payment history",
      },
      {
        name: "Payments",
        href: "/my-payments",
        permission: "view_own_payments",
        icon: "payments",
        description: "View your payment history",
      },
      {
        name: "Certificates",
        href: "/my-certificates",
        permission: "view_own_certificates",
        icon: "certificates",
        description: "View your certificates",
      },
      {
        name: "Resources",
        href: "/resources",
        permission: "member_resources",
        icon: "resources",
        description: "Member resources and downloads",
      },
      {
        name: "Events",
        href: "/events",
        permission: "member_events",
        icon: "events",
        description: "Upcoming events and activities",
      },
      {
        name: "Community",
        href: "/community",
        permission: "member_community",
        icon: "community",
        description: "Connect with other members",
      },
    ],
    Pending: [
      {
        name: "Application Status",
        href: "/pending/status",
        permission: "application_status",
        icon: "status",
        description: "Check your application status",
      },
      {
        name: "Help & Support",
        href: "/pending/help",
        permission: "application_help",
        icon: "help",
        description: "Get help with your application",
      },
    ],
  };

  return [...baseItems, ...(roleSpecificItems[role] || [])];
};


export interface Application {
  id: string;
  member: string;
  application_status: string;
  application_date: string;
  membership_type: string;
  membership_number: string | null;
  employement: string | null;
  forensic_field_of_practice: string;
  qualification: string;
  cv_resume: string;
  associate_category: string;
  university: string;
  degree: string;
  graduation_year: string;
  proof_of_registration: string;
  country_of_study: string;
  name_of_organization: string;
  Abbreviation: string;
  country_of_residency: string;
  country_of_operation: string | null;
  company_email: string;
  abide_with_code_of_conduct: boolean;
  comply_with_current_constitution: boolean;
  declaration: boolean;
  incompliance: boolean;
  member_details: {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    secondary_email: string | null;
    alternative_phone: string | null;
    whatsapp_number: string | null;
    role: string;
    verified: boolean;
    active: boolean;
    has_changed_password: boolean;
    date_of_birth: string;
    national_ID: string;
    passport: string | null;
    public_profile: string;
  };
  fieldsOfPractices: any[];
  sectorOfEmployments: any[];
  countriesOfPractice: Array<{
    id: number;
    country: string;
    region: string;
  }>;
}

export interface ApplicationResponse {
  status: string;
  message: string;
  data: Application;
}

// certificates type

export interface Certificate {
  id: number;
  member_id: number;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string | null;
  status: "active" | "expired" | "revoked" | "pending";
  download_url: string;
  verification_url: string;
  created_at: string;
  updated_at: string;
}

export interface CertificatesResponse {
  status: string;
  message: string;
  data: Certificate[];
}