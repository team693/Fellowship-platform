import "server-only";

import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import QRCode from "qrcode";

const BRAND = {
  teal: rgb(15 / 255, 139 / 255, 128 / 255),
  mint: rgb(69 / 255, 200 / 255, 135 / 255),
  coral: rgb(251 / 255, 95 / 255, 61 / 255),
  blue: rgb(49 / 255, 99 / 255, 251 / 255),
  gold: rgb(230 / 255, 169 / 255, 47 / 255),
  ink: rgb(11 / 255, 31 / 255, 29 / 255),
  inkSoft: rgb(51 / 255, 65 / 255, 63 / 255),
  muted: rgb(92 / 255, 107 / 255, 105 / 255),
  line: rgb(0.87, 0.91, 0.9),
};

export interface CertificateData {
  id: string;
  recipientName: string;
  fellowshipTitle: string;
  issuedAt: string; // ISO
  status: "valid" | "revoked";
  verifyUrl: string;
}

/** Renders a Heal-branded A4-landscape certificate PDF with a QR code. */
export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Heal Fellowship Certificate — ${data.recipientName}`);
  pdf.setAuthor("Heal Social Foundation");
  pdf.setSubject(data.fellowshipTitle);

  const page = pdf.addPage([842, 595]); // A4 landscape (pt)
  const { width, height } = page.getSize();

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);

  const center = width / 2;
  const drawCentered = (
    text: string,
    y: number,
    size: number,
    font = reg,
    color = BRAND.ink,
  ) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: center - w / 2, y, size, font, color });
  };

  // Outer + inner decorative frame.
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: BRAND.teal,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: BRAND.line,
    borderWidth: 1,
  });

  // Brand colour chips (top center).
  const chips = [BRAND.teal, BRAND.mint, BRAND.blue, BRAND.gold, BRAND.coral];
  const chipW = 26;
  const chipGap = 8;
  const chipsWidth = chips.length * chipW + (chips.length - 1) * chipGap;
  let cx = center - chipsWidth / 2;
  for (const c of chips) {
    page.drawRectangle({
      x: cx,
      y: height - 92,
      width: chipW,
      height: 8,
      color: c,
    });
    cx += chipW + chipGap;
  }

  // Header.
  drawCentered("HEAL SOCIAL FOUNDATION", height - 118, 11, bold, BRAND.muted);
  drawCentered("Certificate of Completion", height - 160, 34, bold, BRAND.teal);

  // Body.
  drawCentered("This is to certify that", height - 210, 13, reg, BRAND.inkSoft);
  drawCentered(data.recipientName, height - 258, 40, bold, BRAND.ink);

  // Underline accent under the name.
  const nameW = bold.widthOfTextAtSize(data.recipientName, 40);
  page.drawRectangle({
    x: center - Math.min(nameW, width - 200) / 2,
    y: height - 272,
    width: Math.min(nameW, width - 200),
    height: 2,
    color: BRAND.gold,
  });

  drawCentered(
    "has successfully completed the fellowship",
    height - 306,
    13,
    reg,
    BRAND.inkSoft,
  );
  drawCentered(data.fellowshipTitle, height - 344, 24, bold, BRAND.teal);

  const issued = new Date(data.issuedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  drawCentered(`Issued ${issued}`, height - 384, 12, reg, BRAND.muted);

  // Revoked overlay.
  if (data.status === "revoked") {
    const label = "REVOKED";
    const size = 90;
    const w = bold.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: center - w / 2,
      y: height / 2 - 30,
      size,
      font: bold,
      color: BRAND.coral,
      opacity: 0.22,
      rotate: degrees(12),
    });
  }

  // QR + verification footer (bottom-left block).
  const qrPng = await QRCode.toBuffer(data.verifyUrl, {
    margin: 1,
    width: 220,
    errorCorrectionLevel: "M",
  });
  const qrImage = await pdf.embedPng(qrPng);
  const qrSize = 96;
  const qrX = 70;
  const qrY = 70;
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  const infoX = qrX + qrSize + 16;
  page.drawText("Independently verify this certificate:", {
    x: infoX,
    y: qrY + qrSize - 14,
    size: 10,
    font: bold,
    color: BRAND.inkSoft,
  });
  page.drawText(data.verifyUrl, {
    x: infoX,
    y: qrY + qrSize - 32,
    size: 9,
    font: reg,
    color: BRAND.teal,
  });
  page.drawText("Certificate ID", {
    x: infoX,
    y: qrY + 20,
    size: 8,
    font: bold,
    color: BRAND.muted,
  });
  page.drawText(data.id, {
    x: infoX,
    y: qrY + 6,
    size: 9,
    font: reg,
    color: BRAND.inkSoft,
  });

  // Signature line (bottom-right).
  const sigRight = width - 70;
  const sigW = 180;
  page.drawRectangle({
    x: sigRight - sigW,
    y: qrY + 40,
    width: sigW,
    height: 1,
    color: BRAND.line,
  });
  page.drawText("Heal Social Foundation", {
    x: sigRight - sigW,
    y: qrY + 24,
    size: 10,
    font: bold,
    color: BRAND.ink,
  });
  page.drawText("Fellowships Programme", {
    x: sigRight - sigW,
    y: qrY + 10,
    size: 9,
    font: reg,
    color: BRAND.muted,
  });

  return pdf.save();
}
