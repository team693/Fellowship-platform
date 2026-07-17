import { NextResponse, type NextRequest } from "next/server";
import { verifyAiToken } from "@/lib/ai-token";

export const runtime = "nodejs";

const ANTHROPIC_VERSION = "2023-06-01";

/**
 * Server-side AI proxy for embedded modules. Keeps the Anthropic API key on the
 * server (never in the browser) and gates access with the short-lived token the
 * embed wrapper injects. Requests come from the sandboxed (opaque-origin)
 * iframe, so we allow CORS but require the token.
 */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-heal-ai-token",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-heal-ai-token");
  if (!verifyAiToken(token)) {
    return NextResponse.json(
      { error: "Unauthorized AI request." },
      { status: 401, headers: corsHeaders() },
    );
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "AI is not configured on this deployment." },
      { status: 503, headers: corsHeaders() },
    );
  }

  const body = await request.json().catch(() => ({}));

  // Clamp inputs; force a valid, configured model (the sim's requested model id
  // may be stale). Set AI_MODEL to a current Anthropic model id.
  const payload: Record<string, unknown> = {
    model:
      process.env.AI_MODEL ||
      (typeof body.model === "string" ? body.model : "claude-3-5-sonnet-latest"),
    max_tokens: Math.min(2000, Math.max(1, Number(body.max_tokens) || 1000)),
    messages: Array.isArray(body.messages) ? body.messages.slice(0, 30) : [],
  };
  if (typeof body.system === "string") payload.system = body.system;

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    return new NextResponse(text, {
      status: resp.status,
      headers: { ...corsHeaders(), "content-type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { error: "AI request failed." },
      { status: 502, headers: corsHeaders() },
    );
  }
}
