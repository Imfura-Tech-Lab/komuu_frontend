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
      name: "My Profile",
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
        href: "/admin/applications",
        permission: "approve_applications",
        icon: "applications",
        description: "Review and approve membership applications",
        badge: "pending_count",
      },
      {
        name: "Member Management",
        href: "/admin/members",
        permission: "manage_users",
        icon: "members",
        description: "Manage all members and their details",
      },
      {
        name: "Board Management",
        href: "/admin/board",
        permission: "manage_board_members",
        icon: "board_manage",
        description: "Add, remove and update board member details",
      },
      {
        name: "Payment Overview",
        href: "/admin/payments",
        permission: "view_all_payments",
        icon: "payments",
        description: "View all member payments and transactions",
      },
      {
        name: "Certificates",
        href: "/admin/certificates",
        permission: "view_all_certificates",
        icon: "certificates",
        description: "View all member certificates",
      },
      {
        name: "Analytics & Reports",
        href: "/admin/analytics",
        permission: "view_all_analytics",
        icon: "analytics",
        description: "Comprehensive system analytics",
      },
      {
        name: "Notifications",
        href: "/admin/notifications",
        permission: "send_notifications",
        icon: "notifications",
        description: "Send notifications to members",
      },
      {
        name: "System Settings",
        href: "/admin/settings",
        permission: "system_settings",
        icon: "settings",
        description: "Configure system settings",
      },
    ],
    President: [
      {
        name: "Executive Dashboard",
        href: "/president/dashboard",
        permission: "executive_dashboard",
        icon: "executive",
        description: "Presidential overview and insights",
      },
      {
        name: "Certificate Authority",
        href: "/president/certificates",
        permission: "sign_certificates",
        icon: "certificate_sign",
        description: "Sign and authorize member certificates",
        badge: "unsigned_count",
      },
      {
        name: "Strategic Planning",
        href: "/president/strategy",
        permission: "strategic_planning",
        icon: "strategy",
        description: "Long-term planning and strategy",
      },
      {
        name: "Applications Review",
        href: "/president/applications",
        permission: "view_all_applications",
        icon: "applications",
        description: "Review membership applications",
      },
      {
        name: "Members Overview",
        href: "/president/members",
        permission: "view_all_members",
        icon: "members",
        description: "All members overview",
      },
      {
        name: "Financial Overview",
        href: "/president/payments",
        permission: "view_all_payments",
        icon: "payments",
        description: "Financial transactions overview",
      },
      {
        name: "Analytics",
        href: "/president/analytics",
        permission: "view_all_analytics",
        icon: "analytics",
        description: "Executive analytics and insights",
      },
    ],
    Board: [
      {
        name: "Board Dashboard",
        href: "/board/dashboard",
        permission: "board_dashboard",
        icon: "board",
        description: "Board member overview",
      },
      {
        name: "Applications List",
        href: "/board/applications",
        permission: "view_all_applications",
        icon: "applications",
        description: "View membership applications",
      },
      {
        name: "Member Directory",
        href: "/board/members",
        permission: "view_all_members",
        icon: "members",
        description: "View all members",
      },
      {
        name: "Payment Records",
        href: "/board/payments",
        permission: "view_all_payments",
        icon: "payments",
        description: "View payment records",
      },
      {
        name: "Certificates Registry",
        href: "/board/certificates",
        permission: "view_all_certificates",
        icon: "certificates",
        description: "View issued certificates",
      },
      {
        name: "Board Meetings",
        href: "/board/meetings",
        permission: "board_meetings",
        icon: "meetings",
        description: "Board meetings and schedules",
      },
      {
        name: "Analytics",
        href: "/board/analytics",
        permission: "view_all_analytics",
        icon: "analytics",
        description: "Membership analytics and reports",
      },
      {
        name: "Policy Management",
        href: "/board/policies",
        permission: "policy_decisions",
        icon: "policies",
        description: "Organizational policies",
      },
    ],
    Member: [
      {
        name: "Applications",
        href: "/member/applications",
        permission: "view_own_payments",
        icon: "applications",
        description: "View your payment history",
      },
      {
        name: "My Payments",
        href: "/member/payments",
        permission: "view_own_payments",
        icon: "payments",
        description: "View your payment history",
      },
      {
        name: "My Certificates",
        href: "/member/certificates",
        permission: "view_own_certificates",
        icon: "certificates",
        description: "View your certificates",
      },
      {
        name: "Resources",
        href: "/member/resources",
        permission: "member_resources",
        icon: "resources",
        description: "Member resources and downloads",
      },
      {
        name: "Events",
        href: "/member/events",
        permission: "member_events",
        icon: "events",
        description: "Upcoming events and activities",
      },
      {
        name: "Community",
        href: "/member/community",
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
