import { FieldOfPractice } from "@/services/membership-service";

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
    "team_management",
    "manage_teams",
    "manage_groups",
    "manage_conversations",
    "manage_events",
    "manage_resources",
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
    "team_management",
    "manage_teams",
    "manage_groups",
    "manage_conversations",
    "manage_events",
    "manage_resources",
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
    "team_management",
    "manage_teams",
    "manage_groups",
    "manage_conversations",
    "manage_events",
    "manage_resources",
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
    "member_conversations",
    "member_groups",
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
  order: number;
  name: string;
  href: string;
  permission: Permission;
  section: string;
  icon?: string;
  description?: string;
  badge?: string;
  children?: NavigationItemType[];
}

// Function to create navigation items
export const createNavigationItems = (role: UserRole): NavigationItemType[] => {
  const baseItems: NavigationItemType[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      permission: "member_dashboard",
      section: "overview",
      icon: "dashboard",
      description: "Overview and summary",
      order: 0,
    },
    {
      name: "Profile",
      href: "/profile",
      permission: "view_profile",
      section: "overview",
      icon: "profile",
      description: "Personal information",
      order: 1,
    },
  ];

  const roleSpecificItems: { [key in UserRole]?: NavigationItemType[] } = {
    Administrator: [
      {
        name: "Application Management",
        href: "/applications",
        permission: "approve_applications",
        section: "membership",
        icon: "applications",
        description: "Review and approve membership applications",
        badge: "pending_count",
        order: 2,
      },
      {
        name: "Member Management",
        href: "/members",
        permission: "manage_users",
        section: "membership",
        icon: "members",
        description: "Manage all members and their details",
        order: 3,
      },
      {
        name: "Certificates",
        href: "/certificates",
        permission: "view_all_certificates",
        section: "membership",
        icon: "certificates",
        description: "View all member certificates",
        order: 4,
      },
      {
        name: "Fields of Practice",
        href: "/fields-of-practice",
        permission: "view_all_members",
        section: "membership",
        icon: "fields_of_practice",
        description: "Manage forensic practice specializations",
        order: 5,
      },
      {
        name: "Payment Overview",
        href: "/payments",
        permission: "view_all_payments",
        section: "finance",
        icon: "payments",
        description: "View all member payments and transactions",
        order: 6,
      },
      {
        name: "Analytics & Reports",
        href: "/analytics",
        permission: "view_all_analytics",
        section: "finance",
        icon: "analytics",
        description: "Comprehensive system analytics",
        order: 7,
      },
      {
        name: "Events & Conferences",
        href: "/events",
        permission: "manage_events",
        section: "engagement",
        icon: "conference",
        description: "Manage events and conferences",
        order: 8,
      },
      {
        name: "Resources",
        href: "/resources",
        permission: "manage_resources",
        section: "engagement",
        icon: "shared_resources",
        description: "Manage shared resources",
        order: 9,
      },
      {
        name: "Community",
        href: "/team",
        permission: "team_management",
        section: "engagement",
        icon: "team",
        description: "Manage community and team activities",
        order: 10,
        children: [
          {
            name: "Teams",
            href: "/team/teams",
            permission: "manage_teams",
            section: "engagement",
            icon: "teams",
            description: "Manage organizational teams",
            order: 0,
          },
          {
            name: "Groups",
            href: "/team/groups",
            permission: "manage_groups",
            section: "engagement",
            icon: "groups",
            description: "Manage member groups",
            order: 1,
          },
        ],
      },
      {
        name: "Notifications",
        href: "/notifications",
        permission: "send_notifications",
        section: "communication",
        icon: "notifications",
        description: "Send notifications to members",
        order: 11,
      },
      {
        name: "System Settings",
        href: "/settings",
        permission: "system_settings",
        section: "settings",
        icon: "settings",
        description: "Configure system settings",
        order: 12,
      },
    ],
    President: [
      {
        name: "Certificates",
        href: "/certificates",
        permission: "sign_certificates",
        section: "membership",
        icon: "certificate_sign",
        description: "Sign and authorize member certificates",
        order: 2,
      },
      {
        name: "Fields of Practice",
        href: "/fields-of-practice",
        permission: "view_all_members",
        section: "membership",
        icon: "fields_of_practice",
        description: "Manage forensic practice specializations",
        order: 3,
      },
      {
        name: "Applications",
        href: "/applications",
        permission: "view_all_applications",
        section: "membership",
        icon: "applications",
        description: "Review membership applications",
        order: 4,
      },
      {
        name: "Members",
        href: "/members",
        permission: "view_all_members",
        section: "membership",
        icon: "members",
        description: "All members overview",
        order: 5,
      },
      {
        name: "Financial",
        href: "/payments",
        permission: "view_all_payments",
        section: "finance",
        icon: "payments",
        description: "Financial transactions overview",
        order: 6,
      },
      {
        name: "Events & Conferences",
        href: "/events",
        permission: "manage_events",
        section: "engagement",
        icon: "conference",
        description: "Manage events and conferences",
        order: 7,
      },
      {
        name: "Resources",
        href: "/resources",
        permission: "manage_resources",
        section: "engagement",
        icon: "shared_resources",
        description: "Manage shared resources",
        order: 8,
      },
      {
        name: "Community",
        href: "/team",
        permission: "team_management",
        section: "engagement",
        icon: "team",
        description: "Manage community and team activities",
        order: 9,
        children: [
          {
            name: "Teams",
            href: "/team/teams",
            permission: "manage_teams",
            section: "engagement",
            icon: "teams",
            description: "Manage organizational teams",
            order: 0,
          },
          {
            name: "Groups",
            href: "/team/groups",
            permission: "manage_groups",
            section: "engagement",
            icon: "groups",
            description: "Manage member groups",
            order: 1,
          },
        ],
      },
      {
        name: "Settings",
        href: "/settings",
        permission: "view_all_analytics",
        section: "settings",
        icon: "settings",
        description: "Application settings",
        order: 10,
      },
    ],
    Board: [
      {
        name: "Applications",
        href: "/applications",
        permission: "view_all_applications",
        section: "membership",
        icon: "applications",
        description: "View membership applications",
        order: 2,
      },
      {
        name: "Members",
        href: "/members",
        permission: "view_all_members",
        section: "membership",
        icon: "members",
        description: "View all members",
        order: 3,
      },
      {
        name: "Fields of Practice",
        href: "/fields-of-practice",
        permission: "view_all_members",
        section: "membership",
        icon: "fields_of_practice",
        description: "Manage forensic practice specializations",
        order: 4,
      },
      {
        name: "Certificates",
        href: "/certificates",
        permission: "view_all_certificates",
        section: "membership",
        icon: "certificates",
        description: "View issued certificates",
        order: 5,
      },
      {
        name: "Payments",
        href: "/payments",
        permission: "view_all_payments",
        section: "finance",
        icon: "payments",
        description: "View payment records",
        order: 6,
      },
      {
        name: "Policy Management",
        href: "/policies",
        permission: "policy_decisions",
        section: "governance",
        icon: "policies",
        description: "Organizational policies",
        order: 7,
      },
      {
        name: "Events & Conferences",
        href: "/events",
        permission: "manage_events",
        section: "engagement",
        icon: "conference",
        description: "Manage events and conferences",
        order: 8,
      },
      {
        name: "Resources",
        href: "/resources",
        permission: "manage_resources",
        section: "engagement",
        icon: "shared_resources",
        description: "Manage shared resources",
        order: 9,
      },
      {
        name: "Community",
        href: "/team",
        permission: "team_management",
        section: "engagement",
        icon: "team",
        description: "Manage community and team activities",
        order: 10,
        children: [
          {
            name: "Teams",
            href: "/team/teams",
            permission: "manage_teams",
            section: "engagement",
            icon: "teams",
            description: "Manage organizational teams",
            order: 0,
          },
          {
            name: "Groups",
            href: "/team/groups",
            permission: "manage_groups",
            section: "engagement",
            icon: "groups",
            description: "Manage member groups",
            order: 1,
          },
        ],
      },
    ],
    Member: [
      {
        name: "Application",
        href: "/my-application",
        permission: "view_own_payments",
        section: "overview",
        icon: "applications",
        description: "View your application details",
        order: 2,
      },
      {
        name: "Payments",
        href: "/my-payments",
        permission: "view_own_payments",
        section: "overview",
        icon: "payments",
        description: "View your payment history",
        order: 3,
      },
      {
        name: "Certificates",
        href: "/my-certificates",
        permission: "view_own_certificates",
        section: "overview",
        icon: "certificates",
        description: "View your certificates",
        order: 4,
      },
      {
        name: "Events",
        href: "/events",
        permission: "member_events",
        section: "engagement",
        icon: "events",
        description: "Upcoming events and activities",
        order: 5,
      },
      {
        name: "Resources",
        href: "/resources",
        permission: "member_resources",
        section: "engagement",
        icon: "resources",
        description: "Member resources and downloads",
        order: 6,
      },
      {
        name: "Community",
        href: "/community",
        permission: "member_community",
        section: "engagement",
        icon: "community",
        description: "Connect with other members",
        order: 7,
        children: [
          {
            name: "Groups",
            href: "/community/groups",
            permission: "member_groups",
            section: "engagement",
            icon: "groups",
            description: "Join specialized groups",
            order: 1,
          },
        ],
      },
    ],
    Pending: [
      {
        name: "Application Status",
        href: "/pending/status",
        permission: "application_status",
        section: "overview",
        icon: "status",
        description: "Check your application status",
        order: 2,
      },
      {
        name: "Help & Support",
        href: "/pending/help",
        permission: "application_help",
        section: "support",
        icon: "help",
        description: "Get help with your application",
        order: 3,
      },
    ],
  };

  return [...baseItems, ...(roleSpecificItems[role] || [])];
};

export interface Application {
  payments: any;
  id: string;
  member: string;
  application_status: string;
  application_date: string;
  membership_type: string;
  membership_number: string | null;
  employement: string | null;
  forensic_field_of_practice?: string | null;
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
    full_name: any;
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
  fieldsOfPractices: FieldOfPractice[];
  countriesOfPractice: Array<{
    id: number;
    country: string;
    region: string;
    is_primary?: boolean;
  }>;
  documents?: any[];
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