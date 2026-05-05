import jsPDF from 'jspdf';
import QRCode from 'qrcode';

interface PaymentInfo {
  id: number;
  member: string;
  amount_paid: string;
  payment_method: string;
  transaction_number: string;
  gateway: string;
  status: string;
  is_certificate_generated: boolean;
  payment_date: string;
}

interface CertificateInfo {
  id: number;
  name: string;
  member_number: string;
  certificate?: string;
  signed_date: string;
  valid_from: string;
  valid_until: string;
  next_payment_date?: string;
  status: string;
  token: string;
  membership_term: string;
  created_at: string;
  payment?: PaymentInfo;
}

interface InstitutionInfo {
  name: string;
  president_name: string;
  abbreviation: string;
  logo: string;
  signature: string;
  stamp: string;
}

interface CertificateData {
  certificate: CertificateInfo;
  institution: InstitutionInfo;
}

// Resolve the verification base URL per environment. Build-time override
// (NEXT_PUBLIC_VERIFICATION_BASE_URL) wins so we can pin the QR target
// explicitly per deploy; otherwise we fall back to the host the cert is
// being generated from (so staging certs point at staging, prod at prod).
function getVerificationBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_VERIFICATION_BASE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'https://membership.afsa.africa';
}

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = base64;
  });
}

async function generateCertificateHash(cert: CertificateInfo, institutionAbbr: string): Promise<string> {
  const data = `${institutionAbbr}${cert.member_number}${cert.valid_from}${cert.valid_until}${cert.token}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSerialNumber(memberNumber: string, issueDate: string): string {
  const dateHash = new Date(issueDate).getTime().toString(36).toUpperCase();
  const checksum = memberNumber.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97;
  return `${memberNumber}-${dateHash}-${checksum.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Single subtle watermark behind the certificate body — institution abbreviation,
// outline-only, very low opacity. Replaces the old repeating diagonal pattern.
function addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number, institutionAbbr: string) {
  pdf.saveGraphicsState();
  // @ts-expect-error jsPDF types miss GState
  pdf.setGState(new pdf.GState({ opacity: 0.04 }));
  pdf.setTextColor(0, 181, 165);
  pdf.setFontSize(140);
  pdf.setFont('helvetica', 'bold');
  pdf.text(institutionAbbr, pageWidth / 2, pageHeight / 2 + 14, {
    align: 'center',
    renderingMode: 'fill',
  });
  pdf.restoreGraphicsState();
}

// Microprint on the bottom edge only — security feature, near-invisible at normal viewing.
function addMicroprintFooter(pdf: jsPDF, pageWidth: number, pageHeight: number, institutionName: string) {
  pdf.setFontSize(2);
  pdf.setTextColor(190, 190, 190);
  const microprintText = `${institutionName.toUpperCase()} · CERTIFIED AUTHENTIC · `.repeat(14);
  pdf.text(microprintText.substring(0, 540), 12, pageHeight - 6, { maxWidth: pageWidth - 24 });
}

// QR code with verification mark in the center.
async function generateQRCodeWithText(data: string): Promise<string> {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, data, {
    width: 320,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: '#0F172A', light: '#FFFFFF' },
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#00B5A5';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VERIFY', centerX, centerY);

  return canvas.toDataURL('image/png');
}

export async function generateCertificatePDF(data: CertificateData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();   // 297mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm
  const { certificate, institution } = data;

  const certificateHash = await generateCertificateHash(certificate, institution.abbreviation);
  const serialNumber = generateSerialNumber(certificate.member_number, certificate.created_at);

  const logoBase64 = await loadImageAsBase64(institution.logo);
  const signatureBase64 = institution.signature ? await loadImageAsBase64(institution.signature) : null;
  const stampBase64 = institution.stamp ? await loadImageAsBase64(institution.stamp) : null;

  const verificationUrl = `${getVerificationBaseUrl()}/verify/${certificate.token}`;
  const qrPayload = JSON.stringify({
    url: verificationUrl,
    token: certificate.token,
    memberNumber: certificate.member_number,
    institution: institution.abbreviation,
    hash: certificateHash,
  });
  const qrCodeBase64 = await generateQRCodeWithText(qrPayload);

  // ===== Background watermark (subtle, single) =====
  addWatermark(pdf, pageWidth, pageHeight, institution.abbreviation);

  // ===== Top accent bar =====
  pdf.setFillColor(0, 181, 165);
  pdf.rect(0, 0, pageWidth, 4, 'F');

  // ===== Bottom accent bar =====
  pdf.rect(0, pageHeight - 4, pageWidth, 4, 'F');

  // ===== Left accent stripe (modern minimal touch) =====
  pdf.setFillColor(0, 181, 165);
  pdf.rect(0, 4, 1.5, pageHeight - 8, 'F');

  // ===== Logo =====
  if (logoBase64) {
    try {
      const dim = await getImageDimensions(logoBase64);
      const logoW = 22;
      const logoH = (dim.height / dim.width) * logoW;
      pdf.addImage(logoBase64, 'PNG', (pageWidth - logoW) / 2, 14, logoW, logoH);
    } catch {
      // continue without logo
    }
  }

  // ===== Institution name (subtle, letterspaced) =====
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(120, 120, 120);
  pdf.setCharSpace(2);
  pdf.text(institution.name.toUpperCase(), pageWidth / 2, 44, { align: 'center' });
  pdf.setCharSpace(0);

  // ===== Title — large, elegant serif =====
  pdf.setFontSize(34);
  pdf.setFont('times', 'normal');
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text('Certificate of Membership', pageWidth / 2, 64, { align: 'center' });

  // Thin teal accent line under title
  pdf.setDrawColor(0, 181, 165);
  pdf.setLineWidth(0.6);
  pdf.line(pageWidth / 2 - 22, 70, pageWidth / 2 + 22, 70);

  // ===== Lead-in =====
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.text('This certifies that', pageWidth / 2, 84, { align: 'center' });

  // ===== Recipient name (hero) =====
  pdf.setFontSize(30);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(certificate.name, pageWidth / 2, 102, { align: 'center' });

  // Member number — pill-style line under name
  pdf.setFontSize(9);
  pdf.setFont('courier', 'normal');
  pdf.setTextColor(0, 181, 165);
  pdf.text(`MEMBER NO. ${certificate.member_number}`, pageWidth / 2, 110, { align: 'center' });

  // ===== Statement =====
  const termText = certificate.membership_term || 'a registered member';
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(71, 85, 105); // slate-600
  pdf.text(`is recognized as ${termText} of the ${institution.name},`, pageWidth / 2, 124, { align: 'center' });
  pdf.text('with all rights, privileges, and obligations herein conferred.', pageWidth / 2, 131, { align: 'center' });

  // ===== Validity (centered, two-column) =====
  const fromDate = formatDate(certificate.valid_from);
  const toDate = formatDate(certificate.valid_until);
  const validY = 150;
  const labelGap = 36;

  // Vertical separator
  pdf.setDrawColor(0, 181, 165);
  pdf.setLineWidth(0.3);
  pdf.line(pageWidth / 2, validY - 4, pageWidth / 2, validY + 8);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(120, 120, 120);
  pdf.setCharSpace(1.2);
  pdf.text('VALID FROM', pageWidth / 2 - labelGap, validY - 1, { align: 'center' });
  pdf.text('VALID UNTIL', pageWidth / 2 + labelGap, validY - 1, { align: 'center' });
  pdf.setCharSpace(0);

  pdf.setFontSize(11);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(fromDate, pageWidth / 2 - labelGap, validY + 6, { align: 'center' });
  pdf.text(toDate, pageWidth / 2 + labelGap, validY + 6, { align: 'center' });

  // ===== Bottom row: signature | QR | stamp =====
  const bottomRowY = pageHeight - 36;

  // Left — signature
  const sigX = 32;
  if (signatureBase64) {
    try {
      const dim = await getImageDimensions(signatureBase64);
      const w = 32;
      const h = (dim.height / dim.width) * w;
      pdf.addImage(signatureBase64, 'PNG', sigX, bottomRowY - h - 1, w, h);
    } catch {
      // continue without signature
    }
  }
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.25);
  pdf.line(sigX, bottomRowY, sigX + 50, bottomRowY);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(institution.president_name, sigX + 25, bottomRowY + 4, { align: 'center' });

  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text('Authorized Signatory', sigX + 25, bottomRowY + 8, { align: 'center' });
  pdf.text(`Signed ${formatDate(certificate.signed_date)}`, sigX + 25, bottomRowY + 12, { align: 'center' });

  // Right — official stamp
  const stampLineX = pageWidth - 82;
  if (stampBase64) {
    try {
      const dim = await getImageDimensions(stampBase64);
      const size = 26;
      const stampH = (dim.height / dim.width) * size;
      pdf.addImage(stampBase64, 'PNG', stampLineX + 12, bottomRowY - stampH - 1, size, stampH);
    } catch {
      // continue without stamp
    }
  }
  pdf.setDrawColor(15, 23, 42);
  pdf.setLineWidth(0.25);
  pdf.line(stampLineX, bottomRowY, stampLineX + 50, bottomRowY);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text('Official Stamp', stampLineX + 25, bottomRowY + 4, { align: 'center' });

  // Center-right — QR (tucked next to stamp area, above bottom row)
  const qrSize = 24;
  const qrX = pageWidth - qrSize - 15;
  const qrY = 16;
  pdf.addImage(qrCodeBase64, 'PNG', qrX, qrY, qrSize, qrSize);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text('Scan to verify', qrX + qrSize / 2, qrY + qrSize + 3, { align: 'center' });

  // Top-left — issued date / serial
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(120, 120, 120);
  pdf.setCharSpace(0.8);
  pdf.text('SERIAL', 18, 22);
  pdf.setFont('courier', 'normal');
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(7);
  pdf.text(serialNumber, 18, 27);
  pdf.setCharSpace(0);

  // ===== Footer security row (above bottom accent bar, above microprint) =====
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(140, 140, 140);
  pdf.text(
    `Verify at ${verificationUrl.replace(/^https?:\/\//, '')}`,
    pageWidth / 2,
    pageHeight - 11,
    { align: 'center' }
  );
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(5);
  pdf.text(`Integrity ${certificateHash.substring(0, 40)}`, pageWidth - 14, pageHeight - 11, { align: 'right' });

  // ===== Microprint security =====
  addMicroprintFooter(pdf, pageWidth, pageHeight, institution.name);

  // ===== PDF metadata (tamper-evidence) =====
  pdf.setProperties({
    title: `${institution.abbreviation} Certificate - ${certificate.member_number}`,
    subject: 'Membership Certificate',
    author: institution.name,
    keywords: `certificate,${certificate.token},${certificate.member_number},${institution.abbreviation}`,
    creator: `${institution.abbreviation} Certificate System`,
    // @ts-expect-error jsPDF types are incomplete here
    producer: `${institution.abbreviation} Secure PDF Generator`,
  });

  return pdf.output('blob');
}
