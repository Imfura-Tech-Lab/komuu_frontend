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
  application: {
    id: string;
    status: string;
    organization: string;
    membership_type: string;
    membership_number: string | null;
    has_paid: boolean;
    submitted_at: string;
  } | null;
  certificate: {
    valid_until: string | null;
    next_renewal: string | null;
    is_expiring_soon: boolean;
    is_expired: boolean;
  } | null;
  renewal_due: boolean;
  next_renewal_date: string | null;
  events: {
    total: number;
    upcoming: Array<{
      id: string | number;
      title: string;
      start_time: string;
      location?: string;
      is_paid?: boolean;
      price?: number;
    }>;
  };
  messages: Array<{
    id: string | number;
    body: string;
    conversation_title: string | null;
    sender_name: string;
    created_at: string;
  }>;
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
