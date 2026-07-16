import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and the embed route.
     * The embed route (/embed/*) handles its own auth and framing headers,
     * and must not receive the app-shell CSP frame-ancestors 'none'.
     */
    "/((?!_next/static|_next/image|favicon.ico|embed|fonts|vendor|simulations|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ico|css|js)$).*)",
  ],
};
