/**
 * Shared application types. These mirror the SQL schema in
 * supabase/migrations. Kept hand-written (rather than generated) so the
 * repo is self-contained; regenerate with the Supabase CLI if you prefer.
 */

export type Locale = "en" | "ur";
export type UserRole = "student" | "admin";

export type ModuleType = "explore" | "assessed" | "case_study" | "quiz";

/**
 * completion_rule drives how a module is marked complete:
 *  - "engagement": parent tracks engagement (dwell time + explicit "mark
 *    complete" click). The embedded HTML reports nothing. Server enforces a
 *    minimum dwell time before it counts.
 *  - "reported": the embedded HTML decides completion and posts a result via
 *    the HEAL_MODULE_COMPLETE postMessage. Server validates + clamps score.
 */
export type CompletionRule = "engagement" | "reported";

export type ProgressStatus = "in_progress" | "completed";

export type CodeStatus = "unused" | "redeemed" | "revoked";

export type CertificateStatus = "valid" | "revoked";

export type ConsentStatus = "none" | "granted" | "withdrawn";

export interface Profile {
  id: string; // == auth.users.id
  email: string;
  full_name: string | null;
  locale: Locale;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  contact_email: string | null;
  contact_name: string | null;
  seats_purchased: number;
  seats_used: number;
  notes: string | null;
  created_at: string;
}

export interface Fellowship {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  locale: Locale;
  cover_color: string | null;
  is_published: boolean;
  created_at: string;
}

/**
 * Per-module completion configuration. Stored as JSONB on the module.
 * min_seconds: minimum server-enforced dwell time for engagement modules.
 * pass_score: for reported modules, the score threshold (0-100) required to
 *   count as passed. If null, any reported completion passes.
 */
export interface CompletionConfig {
  min_seconds?: number;
  pass_score?: number | null;
}

export interface Module {
  id: string;
  fellowship_id: string;
  title: string;
  description: string | null;
  type: ModuleType;
  order_index: number;
  /** Path to the self-contained HTML asset under public/simulations/. */
  asset_path: string;
  completion_rule: CompletionRule;
  completion_config: CompletionConfig;
  is_required: boolean;
  /** UN SDG numbers (1-17) this module covers. */
  sdgs: number[];
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  fellowship_id: string;
  enrollment_code_id: string | null;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  module_id: string;
  fellowship_id: string;
  status: ProgressStatus;
  score: number | null;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface EnrollmentCode {
  id: string;
  code: string;
  partner_id: string;
  fellowship_id: string;
  status: CodeStatus;
  redeemed_by: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export interface Certificate {
  id: string; // UUID — this is the public verification id
  user_id: string;
  fellowship_id: string;
  /** Snapshotted at issue time so the record is immutable/self-describing. */
  recipient_name: string;
  fellowship_title: string;
  issued_at: string;
  status: CertificateStatus;
}

export interface SpotlightProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  headline: string | null;
  short_bio: string | null;
  city: string | null;
  country: string | null;
  working_on: string | null;
  quote: string | null;
  photo_path: string | null;
  consent_status: ConsentStatus;
  consent_scope: string | null;
  consent_granted_at: string | null;
  consent_withdrawn_at: string | null;
  created_at: string;
  updated_at: string;
}

/** The exact scope string students consent to. Kept in one place so the UI
 * preview and the stored consent_scope always match. */
export const SPOTLIGHT_CONSENT_SCOPE =
  "My photo, name, and role/headline may be published by Heal on LinkedIn and Heal's own channels to feature me as a digital internship participant.";
