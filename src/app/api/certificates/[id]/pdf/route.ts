import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { env } from "@/lib/env";
import type { Certificate } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Streams the branded certificate PDF. Only the certificate owner (or an admin)
 * can download it — enforced by RLS on the certificates table.
 */
export async function GET(
  _request: NextRequest,
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

  const { data: certRow } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const cert = certRow as Certificate | null;
  if (!cert) {
    return new NextResponse("Certificate not found", { status: 404 });
  }

  const pdfBytes = await generateCertificatePdf({
    id: cert.id,
    recipientName: cert.recipient_name,
    fellowshipTitle: cert.fellowship_title,
    issuedAt: cert.issued_at,
    status: cert.status,
    verifyUrl: `${env.siteUrl()}/verify/${cert.id}`,
  });

  const safeName = cert.recipient_name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="heal-certificate-${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
