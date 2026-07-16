import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on every request and keeps the auth
 * cookies in sync between the browser and server. Also applies a light-touch
 * gate: unauthenticated users hitting protected areas are redirected to login.
 *
 * Public routes (landing, login, auth callback, certificate verification,
 * the sandboxed embed endpoint's own auth is handled in its handler) are
 * always allowed through.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabaseUrl(),
    env.supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with Supabase Auth; do not
  // trust getSession() alone for auth decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/api/verify");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Clickjacking protection for app pages via CSP. The embed route overrides
  // this with frame-ancestors 'self' in its own handler.
  supabaseResponse.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'none'",
  );

  return supabaseResponse;
}
