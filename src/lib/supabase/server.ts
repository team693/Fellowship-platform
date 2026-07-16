import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Server-side Supabase client bound to the request's auth cookies.
 * Runs as the signed-in user, so RLS applies. Use this in server
 * components, route handlers, and server actions for user-scoped reads/writes.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` can be called from a Server Component where writing
          // cookies is not allowed. Middleware refreshes the session, so this
          // is safe to ignore here.
        }
      },
    },
  });
}
