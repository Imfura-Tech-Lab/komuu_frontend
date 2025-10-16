// types/dashboard.ts
export type BoardDashboardData = {
  total_registration: number;
  current_members: number;
  inactive_members: number;
  countries_of_our_members: number;
  stats_applications: Array<{ status: string; count: number }>;
  membership_types: Array<{ category: string; count: number }>;
  fields_of_pratice: Array<{ field_of_practice: string; count: number }>;
  weekly_applications: unknown[];
  expiring_certificates: unknown[];
  countries_of_operations: Array<{ country: string; count: number }>;
  application_per_region: Array<{ region: string; count: number }>;
};

export type MemberDashboardData = {
  pending_application: Array<{
    id: string | number;
    name_of_organization?: string;
    Abbreviation?: string;
    company_email?: string;
    status: string;
    created_at: string;
  }>;
  to_renew_this_month: unknown;
  next_renewal_date: string | null;
  latest_messages: unknown[];
  upcoming_events: unknown[];
};

export type DashboardResponse =
  | {
      status: "success";
      message: string;
      data: BoardDashboardData;
      role: "board";
    }
  | {
      status: "success";
      message: string;
      data: MemberDashboardData;
      role: "member";
    };
