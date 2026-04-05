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

// Production verification URL
const VERIFICATION_BASE_URL = 'https://komuu.com';

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

// Subtle watermark — less dense, lighter
function addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number, institutionAbbr: string) {
  pdf.setTextColor(240, 240, 240);
  pdf.setFontSize(50);
  pdf.setFont('helvetica', 'bold');

  const watermarkText = `${institutionAbbr}`;
  // Only a few watermarks, not a dense pattern
  for (let i = 30; i < pageHeight; i += 60) {
    pdf.text(watermarkText, pageWidth / 2, i, {
      align: 'center',
      angle: 45,
      renderingMode: 'stroke'
    });
  }

  pdf.setTextColor(0, 0, 0);
}

// Microprint border
function addMicroprintBorder(pdf: jsPDF, pageWidth: number, pageHeight: number, institutionName: string) {
  pdf.setFontSize(2);
  pdf.setTextColor(180, 180, 180);

  const microprintText = `${institutionName.toUpperCase()} · CERTIFIED AUTHENTIC · `.repeat(10);
  pdf.text(microprintText.substring(0, 400), 10, 11, { maxWidth: pageWidth - 20 });
  pdf.text(microprintText.substring(0, 400), 10, pageHeight - 11, { maxWidth: pageWidth - 20 });
}

// Subtle holographic dots — much lighter
function addHolographicPattern(pdf: jsPDF, pageWidth: number, pageHeight: number) {
  pdf.setDrawColor(0, 181, 165);
  pdf.setFillColor(0, 181, 165);
  pdf.saveGraphicsState();
  //@ts-ignore
  pdf.setGState(new pdf.GState({ opacity: 0.02 }));

  for (let x = 20; x < pageWidth - 20; x += 20) {
    for (let y = 20; y < pageHeight - 20; y += 20) {
      pdf.circle(x, y, 1, 'F');
    }
  }

  pdf.restoreGraphicsState();
}

// Thinner guilloche
function addGuillochePattern(pdf: jsPDF, x: number, y: number, width: number, height: number) {
  pdf.setDrawColor(0, 181, 165);
  pdf.setLineWidth(0.08);
  pdf.saveGraphicsState();
  //@ts-ignore
  pdf.setGState(new pdf.GState({ opacity: 0.15 }));

  const waves = 10;
  for (let i = 0; i < waves; i++) {
    const points: [number, number][] = [];
    for (let j = 0; j <= width; j += 4) {
      const yOffset = Math.sin((j + i * 12) * 0.12) * 3;
      points.push([j, height / 2 + yOffset]);
    }

    if (points.length > 1) {
      pdf.moveTo(x + points[0][0], y + points[0][1]);
      for (let k = 1; k < points.length; k++) {
        pdf.lineTo(x + points[k][0], y + points[k][1]);
      }
      pdf.stroke();
    }
  }

  pdf.restoreGraphicsState();
}

// QR code with text in center
async function generateQRCodeWithText(data: string, text: string): Promise<string> {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, data, {
    width: 300,
    margin: 1,
    errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#FFFFFF' }
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = '#00B5A5';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SCAN TO', centerX, centerY - 8);
  ctx.fillText('VERIFY', centerX, centerY + 8);

  return canvas.toDataURL('image/png');
}

export async function generateCertificatePDF(data: CertificateData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const { certificate, institution } = data;

  const certificateHash = await generateCertificateHash(certificate, institution.abbreviation);
  const serialNumber = generateSerialNumber(certificate.member_number, certificate.created_at);

  // Load images
  const logoBase64 = await loadImageAsBase64(institution.logo);
  const signatureBase64 = institution.signature ? await loadImageAsBase64(institution.signature) : null;
  const stampBase64 = institution.stamp ? await loadImageAsBase64(institution.stamp) : null;

  // QR code — always use production URL for verification
  const verificationUrl = `${VERIFICATION_BASE_URL}/verify/${certificate.token}`;
  const qrCodeData = JSON.stringify({
    url: verificationUrl,
    token: certificate.token,
    memberNumber: certificate.member_number,
    institution: institution.abbreviation,
    hash: certificateHash,
  });
  const qrCodeBase64 = await generateQRCodeWithText(qrCodeData, 'Scan to verify');

  // === SECURITY LAYERS (subtle) ===
  addHolographicPattern(pdf, pageWidth, pageHeight);
  addWatermark(pdf, pageWidth, pageHeight, institution.abbreviation);

  // Outer border — teal
  pdf.setDrawColor(0, 181, 165);
  pdf.setLineWidth(2.5);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Inner border — light gray
  pdf.setDrawColor(210, 210, 210);
  pdf.setLineWidth(0.3);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

  addMicroprintBorder(pdf, pageWidth, pageHeight, institution.name);

  // Subtle guilloche
  addGuillochePattern(pdf, 15, 68, pageWidth - 30, 6);
  addGuillochePattern(pdf, 15, pageHeight - 48, pageWidth - 30, 6);

  // === LOGO ===
  if (logoBase64) {
    try {
      const logoDimensions = await getImageDimensions(logoBase64);
      const logoWidth = 28;
      const logoHeight = (logoDimensions.height / logoDimensions.width) * logoWidth;
      pdf.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, 16, logoWidth, logoHeight);
    } catch {
      // Continue without logo
    }
  }

  // === INSTITUTION NAME ===
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 181, 165);
  pdf.text(institution.name.toUpperCase(), pageWidth / 2, 47, { align: 'center' });

  // === TITLE ===
  pdf.setFontSize(28);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(30, 30, 30);
  pdf.text('CERTIFICATE OF MEMBERSHIP', pageWidth / 2, 60, { align: 'center' });

  // Decorative line under title
  pdf.setDrawColor(0, 181, 165);
  pdf.setLineWidth(0.4);
  pdf.line(70, 64, pageWidth - 70, 64);

  // === BODY ===
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 60, 60);
  pdf.text('This is to certify that', pageWidth / 2, 78, { align: 'center' });

  // Member name — full name
  pdf.setFontSize(24);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(0, 181, 165);
  pdf.text(certificate.name, pageWidth / 2, 90, { align: 'center' });

  // Member number
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Member No: ${certificate.member_number}`, pageWidth / 2, 98, { align: 'center' });

  // Membership description with category
  const fromDate = formatDate(certificate.valid_from);
  const toDate = formatDate(certificate.valid_until);

  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(50, 50, 50);

  // Show membership term properly: "is a Full Member of AFSA"
  const termText = certificate.membership_term || 'a registered member';
  pdf.text(`is ${termText} of the`, pageWidth / 2, 108, { align: 'center' });

  pdf.setFont('helvetica', 'bold');
  pdf.text(institution.name, pageWidth / 2, 116, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.text(`Valid from ${fromDate} until ${toDate}`, pageWidth / 2, 126, { align: 'center' });

  // Rights text
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(100, 100, 100);
  pdf.text('This membership includes all the rights, privileges and obligations', pageWidth / 2, 136, { align: 'center' });
  pdf.text('associated with this category of membership.', pageWidth / 2, 141, { align: 'center' });

  // === SIGNATURE AREA ===
  const signatureY = pageHeight - 32;

  // Left — Authorized Signature
  const signatureX = 50;
  if (signatureBase64) {
    try {
      const sigDimensions = await getImageDimensions(signatureBase64);
      const sigWidth = 35;
      const sigHeight = (sigDimensions.height / sigDimensions.width) * sigWidth;
      pdf.addImage(signatureBase64, 'PNG', signatureX, signatureY - sigHeight - 3, sigWidth, sigHeight);
    } catch {
      // Continue without signature
    }
  }

  pdf.setLineWidth(0.3);
  pdf.setDrawColor(80, 80, 80);
  pdf.line(signatureX, signatureY, signatureX + 40, signatureY);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text('Authorized Signature', signatureX + 20, signatureY + 4, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text(institution.president_name, signatureX + 20, signatureY + 8, { align: 'center' });
  pdf.text(`Signed: ${formatDate(certificate.signed_date)}`, signatureX + 20, signatureY + 12, { align: 'center' });

  // Center — QR Code
  const qrSize = 28;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = signatureY - qrSize + 3;
  pdf.addImage(qrCodeBase64, 'PNG', qrX, qrY, qrSize, qrSize);

  // Small text under QR
  pdf.setFontSize(5);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Scan to verify authenticity', pageWidth / 2, signatureY + 6, { align: 'center' });

  // Right — Official Stamp
  const stampX = pageWidth - 90;
  if (stampBase64) {
    try {
      const stampDimensions = await getImageDimensions(stampBase64);
      const stampSize = 28;
      const stampHeight = (stampDimensions.height / stampDimensions.width) * stampSize;
      pdf.addImage(stampBase64, 'PNG', stampX, signatureY - stampHeight - 3, stampSize, stampHeight);
    } catch {
      // Continue without stamp
    }
  }

  pdf.setLineWidth(0.3);
  pdf.setDrawColor(80, 80, 80);
  pdf.line(stampX, signatureY, stampX + 40, signatureY);

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(50, 50, 50);
  pdf.text('Official Stamp', stampX + 20, signatureY + 4, { align: 'center' });

  // === FOOTER ===
  // Serial number (right)
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Serial: ${serialNumber}`, pageWidth - 15, pageHeight - 3, { align: 'right' });

  // Footer text (center)
  pdf.text('This is a digitally generated and verifiable certificate', pageWidth / 2, pageHeight - 7, { align: 'center' });

  // Hash (left)
  pdf.setFontSize(4.5);
  pdf.text(`Integrity: ${certificateHash.substring(0, 32)}`, 15, pageHeight - 3);

  // === PDF METADATA ===
  pdf.setProperties({
    title: `${institution.abbreviation} Certificate - ${certificate.member_number}`,
    subject: 'Membership Certificate',
    author: institution.name,
    keywords: `certificate,${certificate.token},${certificate.member_number},${institution.abbreviation}`,
    creator: `${institution.abbreviation} Certificate System`,
    //@ts-ignore
    producer: `${institution.abbreviation} Secure PDF Generator`
  });

  return pdf.output('blob');
}
