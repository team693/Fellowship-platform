import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signAiToken } from "@/lib/ai-token";
import type { Module } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Serves a self-contained HTML module for embedding in a sandboxed iframe.
 *
 * Security model:
 *  - The caller must be authenticated AND enrolled in the module's fellowship.
 *    We rely on the modules RLS SELECT policy: if the user-scoped query returns
 *    the row, they are enrolled. Otherwise we 403.
 *  - The response is meant to be framed ONLY by our own pages, enforced with
 *    `frame-ancestors 'self'` + `X-Frame-Options: SAMEORIGIN`.
 *  - The iframe element itself uses `sandbox="allow-scripts"` (NO
 *    allow-same-origin), so the embedded document runs in an opaque origin and
 *    cannot read our cookies, localStorage, or make credentialed requests to
 *    our API. It communicates only via postMessage.
 *  - Because the parent cannot write into an opaque-origin iframe, we inject
 *    `window.__HEAL_MODULE_ID__` (and the healComplete/healProgress helpers)
 *    into the HTML here, server-side. This is "the parent injecting the id" —
 *    just done in the wrapper the parent controls.
 *  - CDN references (D3, Google Fonts) are rewritten to self-hosted paths so
 *    modules render on locked-down partner networks with zero changes.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Sign in required", { status: 401 });
  }

  // RLS enforces enrollment: a non-enrolled user gets no row back.
  const { data: moduleRow } = await supabase
    .from("modules")
    .select("id, asset_path")
    .eq("id", id)
    .maybeSingle();

  const mod = moduleRow as Pick<Module, "id" | "asset_path"> | null;
  if (!mod) {
    return new NextResponse("Module not found or access denied", { status: 403 });
  }

  // Validate the asset filename to prevent any path shenanigans.
  if (!/^[a-zA-Z0-9._-]+\.html$/.test(mod.asset_path)) {
    return new NextResponse("Invalid module asset", { status: 400 });
  }

  // Fetch the static HTML asset from our own /simulations directory. Fetching
  // (rather than fs) works reliably on Vercel where public assets live on the
  // CDN, not in the serverless function's filesystem.
  const origin = new URL(request.url).origin;
  const assetRes = await fetch(`${origin}/simulations/${mod.asset_path}`, {
    cache: "no-store",
  });
  if (!assetRes.ok) {
    return new NextResponse("Module asset unavailable", { status: 502 });
  }
  let html = await assetRes.text();

  html = injectHealBridge(html, mod.id, signAiToken(mod.id));
  html = selfHostCdnAssets(html);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Only our own pages may frame this.
      "Content-Security-Policy": "frame-ancestors 'self'",
      "X-Frame-Options": "SAMEORIGIN",
      // Auth-gated content: never cache in shared caches.
      "Cache-Control": "private, no-store",
    },
  });
}

/**
 * Injects the module id and the Heal completion helpers into the document
 * <head> so they are defined before the module's own scripts run.
 */
function injectHealBridge(
  html: string,
  moduleId: string,
  aiToken: string,
): string {
  const bridge = `<script>(function(){
  window.__HEAL_MODULE_ID__ = ${JSON.stringify(moduleId)};
  window.__HEAL_AI_TOKEN__ = ${JSON.stringify(aiToken)};
  window.healComplete = function(score, meta){
    parent.postMessage({
      type: "HEAL_MODULE_COMPLETE",
      moduleId: window.__HEAL_MODULE_ID__,
      score: (typeof score === "number") ? score : undefined,
      meta: meta || undefined
    }, "*");
  };
  window.healProgress = function(percent){
    parent.postMessage({
      type: "HEAL_MODULE_PROGRESS",
      moduleId: window.__HEAL_MODULE_ID__,
      percent: percent
    }, "*");
  };
  // Attach the AI token to any request routed to our server-side AI proxy.
  var _fetch = window.fetch ? window.fetch.bind(window) : null;
  if (_fetch) {
    window.fetch = function(input, init){
      try {
        var u = (typeof input === "string") ? input : (input && input.url) || "";
        if (u.indexOf("/api/ai") !== -1) {
          init = init || {};
          init.headers = Object.assign({}, init.headers, { "x-heal-ai-token": window.__HEAL_AI_TOKEN__ });
        }
      } catch (e) {}
      return _fetch(input, init);
    };
  }
})();</script>`;

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (m) => `${m}\n${bridge}`);
  }
  if (/<html[^>]*>/i.test(html)) {
    return html.replace(/<html[^>]*>/i, (m) => `${m}\n${bridge}`);
  }
  return bridge + html;
}

/**
 * Rewrites common third-party CDN references to self-hosted equivalents so
 * modules work without any outbound requests at runtime.
 */
function selfHostCdnAssets(html: string): string {
  return (
    html
      // Google Fonts stylesheet -> self-hosted bundle.
      .replace(
        /https?:\/\/fonts\.googleapis\.com\/css2?\?[^"')]*/g,
        "/fonts/fonts.css",
      )
      // Neutralise remaining Google Fonts hosts (e.g. preconnect hints) so the
      // module makes zero outbound font requests at runtime.
      .replace(/https?:\/\/fonts\.googleapis\.com/g, "/fonts")
      .replace(/https?:\/\/fonts\.gstatic\.com/g, "/fonts")
      // D3 from the common CDNs -> self-hosted copy.
      .replace(
        /https?:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/d3\/[^"']*?d3(?:\.min)?\.js/g,
        "/vendor/d3.min.js",
      )
      .replace(
        /https?:\/\/d3js\.org\/d3(?:\.v\d+)?(?:\.min)?\.js/g,
        "/vendor/d3.min.js",
      )
      .replace(/https?:\/\/cdn\.jsdelivr\.net\/npm\/d3[^"']*/g, "/vendor/d3.min.js")
      .replace(/https?:\/\/unpkg\.com\/d3[^"']*/g, "/vendor/d3.min.js")
      // Three.js from the common CDNs -> self-hosted copy.
      .replace(
        /https?:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/[^"']*?three(?:\.min)?\.js/g,
        "/vendor/three.min.js",
      )
      .replace(
        /https?:\/\/cdn\.jsdelivr\.net\/npm\/three[^"']*?(?:three(?:\.min)?\.js|build\/three(?:\.module)?\.js)/g,
        "/vendor/three.min.js",
      )
      .replace(/https?:\/\/unpkg\.com\/three[^"']*?three(?:\.min)?\.js/g, "/vendor/three.min.js")
      // Route direct Anthropic API calls through our token-gated server proxy.
      .replace(/https?:\/\/api\.anthropic\.com\/v1\/messages/g, "/api/ai")
  );
}
