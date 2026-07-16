import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * SERVICE-ROLE Supabase client. This BYPASSES Row-Level Security.
 *
 * SECURITY: Only ever import this from server-only code (route handlers /
 * server actions) AFTER you have independently verified the caller is
 * authorised (e.g. the signed-in user owns the row, or is an admin).
 *
 * We use it for privileged, integrity-critical operations that must not be
 * expressible by a client under RLS:
 *   - atomic seat-code redemption
 *   - server-authored progress writes (completion validation)
 *   - issuing immutable certificate records
 *
 * The `server-only` import above makes the build fail if this file is ever
 * pulled into a client bundle.
 */
export function createAdminClient() {
  return createSupabaseClient(
    env.supabaseUrl(),
    env.supabaseServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
