import "server-only";

import crypto from "node:crypto";

/**
 * Short-lived HMAC token handed to a sandboxed module so it can call the AI
 * proxy (/api/ai). Because the iframe runs in an opaque origin it cannot send
 * our auth cookies, so this token — minted only when an authenticated, enrolled
 * user loads the embed — is what gates the proxy and stops it being an open
 * relay. Bound to the module id and an expiry.
 */
function secret(): string {
  return (
    process.env.HEAL_AI_TOKEN_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "insecure-dev-secret"
  );
}

export function signAiToken(moduleId: string, ttlSeconds = 7200): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${moduleId}.${exp}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAiToken(token: string | null): { moduleId: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [moduleId, expStr, sig] = parts;
  const expected = crypto
    .createHmac("sha256", secret())
    .update(`${moduleId}.${expStr}`)
    .digest("base64url");
  // Constant-time compare.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(expStr) < Math.floor(Date.now() / 1000)) return null;
  return { moduleId };
}
