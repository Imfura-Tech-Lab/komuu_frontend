import { z } from "zod";

// ============================================================================
// Base API Response Schemas
// ============================================================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.enum(["success", "error"]),
    message: z.string().optional(),
    data: dataSchema.optional(),
    errors: z.record(z.string(), z.array(z.string())).optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    status: z.enum(["success", "error"]),
    message: z.string().optional(),
    data: z.object({
      data: z.array(itemSchema),
      current_page: z.number(),
      last_page: z.number(),
      per_page: z.number(),
      total: z.number(),
    }),
  });

// ============================================================================
// User & Auth Schemas
// ============================================================================

export const UserRoleSchema = z.enum([
  "Administrator",
  "President",
  "Board",
  "Member",
  "Pending",
]);

export const UserDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phone_number: z.string(),
  secondary_email: z.string().email().nullable(),
  alternative_phone: z.string().nullable(),
  whatsapp_number: z.string().nullable(),
  role: UserRoleSchema,
  verified: z.boolean(),
  active: z.boolean(),
  has_changed_password: z.boolean(),
  date_of_birth: z.string(),
  national_ID: z.string(),
  passport: z.string().nullable(),
  public_profile: z.string(),
  application_status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const LoginResponseSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string().optional(),
  data: z.object({
    token: z.string(),
    user: UserDataSchema,
  }).optional(),
});

// ============================================================================
// Application Schemas
// ============================================================================

export const ApplicationStatusSchema = z.enum([
  "Pending",
  "Under Review",
  "Approved",
  "Rejected",
  "Certificate Generated",
]);

export const ApplicationSchema = z.object({
  id: z.string(),
  member: z.string(),
  application_status: ApplicationStatusSchema,
  application_date: z.string(),
  membership_type: z.string(),
  country_of_residency: z.string().optional(),
  national_id_number: z.string().optional(),
  passport: z.string().optional(),
  name_of_organization: z.string().optional(),
  position: z.string().optional(),
  highest_qualifications: z.string().optional(),
  fields_of_practice: z.array(z.string()).optional(),
  member_details: z.object({
    name: z.string(),
    email: z.string().email(),
    phone_number: z.string(),
  }).optional(),
});

// ============================================================================
// Member Schemas
// ============================================================================

export const MemberSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  surname: z.string(),
  first_name: z.string(),
  middle_name: z.string().optional(),
  incompliance: z.boolean(),
  membership_type: z.string().nullable(),
  membership_number: z.string(),
  certificate_status: z.string(),
  country_of_residency: z.string(),
  application_status: z.string(),
  signed_date: z.string().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  valid_next_payment: z.string().optional(),
  email: z.string().email().optional(),
  phone_number: z.string().optional(),
  role: z.string().optional(),
  verified: z.boolean().optional(),
  active: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// ============================================================================
// Payment Schemas
// ============================================================================

export const PaymentStatusSchema = z.enum([
  "Pending",
  "Completed",
  "Failed",
  "Refunded",
]);

export const PaymentSchema = z.object({
  id: z.number(),
  member: z.string(),
  amount_paid: z.string(),
  payment_method: z.string(),
  transaction_number: z.string(),
  gateway: z.string(),
  status: PaymentStatusSchema,
  is_certificate_generated: z.boolean(),
  payment_date: z.string(),
  application: z.object({
    membership_type: z.string(),
    application_status: z.string(),
    application_date: z.string(),
    country_of_residency: z.string().optional(),
    member_details: z.object({
      name: z.string(),
      email: z.string().email(),
      phone_number: z.string(),
    }).optional(),
  }).optional(),
});

// ============================================================================
// Certificate Schemas
// ============================================================================

export const CertificateStatusSchema = z.enum([
  "Pending",
  "Approved",
  "Rejected",
]);

export const CertificateSchema = z.object({
  id: z.number(),
  name: z.string(),
  member_number: z.string(),
  certificate: z.string().nullable(),
  status: z.string(),
  valid_from: z.string(),
  valid_until: z.string(),
  membership_term: z.string(),
  signed_date: z.string(),
  created_at: z.string(),
  token: z.string(),
  next_payment_date: z.string(),
});

// ============================================================================
// Event Schemas
// ============================================================================

export const EventModeSchema = z.enum(["In-Person", "Online", "Hybrid"]);

export const EventStatusSchema = z.enum([
  "Scheduled",
  "Ongoing",
  "Completed",
  "Cancelled",
  "Draft",
]);

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.string(),
  location: z.string(),
  event_mode: EventModeSchema,
  attendance_link: z.string().optional(),
  event_link: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  is_paid: z.union([z.boolean(), z.number()]),
  price: z.number().optional(),
  capacity: z.number(),
  registration_deadline: z.string(),
  attendees_count: z.number().optional(),
  status: EventStatusSchema.optional(),
  thumbnail: z.string().optional(),
  organizer: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

// ============================================================================
// Resource Schemas
// ============================================================================

export const ResourceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().optional(),
  type: z.string(),
  category: z.string().optional(),
  visibility: z.string(),
  file_url: z.string().optional(),
  link: z.string().optional(),
  file_size: z.string().optional(),
  downloads: z.number().optional(),
  likes_count: z.number().optional(),
  dislikes_count: z.number().optional(),
  comments_count: z.number().optional(),
  tags: z.array(z.string()).optional(),
  group: z.string().optional(),
  groupId: z.number().optional(),
  uploaded_by: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

// ============================================================================
// Field of Practice Schemas
// ============================================================================

export const SubFieldSchema = z.object({
  id: z.number(),
  field: z.string(),
  code: z.string(),
  description: z.string().optional(),
});

export const FieldOfPracticeSchema = z.object({
  id: z.number(),
  field: z.string(),
  code: z.string(),
  description: z.string().optional(),
  sub_fields: z.array(SubFieldSchema),
  total_applications: z.number().optional(),
});

// ============================================================================
// Dashboard Schemas
// ============================================================================

export const DashboardStatsSchema = z.object({
  total_applications: z.number(),
  pending_applications: z.number(),
  approved_members: z.number(),
  total_revenue: z.number().or(z.string()),
  total_events: z.number().optional(),
  total_resources: z.number().optional(),
});

// ============================================================================
// Validation Helper Functions
// ============================================================================

export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

export function parseApiResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Safe parse with fallback
export function safeParseWithFallback<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fallback: T
): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  // Validation failed, using fallback
  return fallback;
}

// Type exports
export type UserData = z.infer<typeof UserDataSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type Member = z.infer<typeof MemberSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Certificate = z.infer<typeof CertificateSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type FieldOfPractice = z.infer<typeof FieldOfPracticeSchema>;
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
