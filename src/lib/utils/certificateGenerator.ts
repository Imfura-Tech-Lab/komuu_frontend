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

// Helper function to load image as base64
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
  } catch (error) {
    console.error('Failed to load image:', url, error);
    return null;
  }
}

// Helper function to get image dimensions
function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = base64;
  });
}

// Generate certificate hash for integrity
async function generateCertificateHash(cert: CertificateInfo, institutionAbbr: string): Promise<string> {
  const data = `${institutionAbbr}${cert.member_number}${cert.valid_from}${cert.valid_until}${cert.token}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate serial number with checksum
function generateSerialNumber(memberNumber: string, issueDate: string): string {
  const dateHash = new Date(issueDate).getTime().toString(36).toUpperCase();
  const checksum = memberNumber.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97;
  return `${memberNumber}-${dateHash}-${checksum.toString().padStart(2, '0')}`;
}

// Add watermark
function addWatermark(pdf: jsPDF, pageWidth: number, pageHeight: number, institutionAbbr: string) {
  pdf.setTextColor(245, 245, 245); // Very light gray
  pdf.setFontSize(60);
  pdf.setFont('helvetica', 'bold');
  
  // Diagonal watermark pattern with institution
  const watermarkText = `${institutionAbbr} VERIFIED`;
  for (let i = -pageHeight; i < pageHeight * 2; i += 40) {
    pdf.text(watermarkText, pageWidth / 2, i, {
      align: 'center',
      angle: 45,
      renderingMode: 'stroke'
    });
  }
  
  pdf.setTextColor(0, 0, 0); // Reset to black
}

// Add microprint border
function addMicroprintBorder(pdf: jsPDF, pageWidth: number, pageHeight: number, institutionName: string) {
  pdf.setFontSize(2); // Extremely small
  pdf.setTextColor(120, 120, 120);
  
  const microprintText = `${institutionName.toUpperCase()} ORIGINAL DOCUMENT · CERTIFIED AUTHENTIC · `.repeat(15);
  
  // Top border
  pdf.text(microprintText.substring(0, 500), 10, 11, { maxWidth: pageWidth - 20 });
  
  // Bottom border
  pdf.text(microprintText.substring(0, 500), 10, pageHeight - 11, { maxWidth: pageWidth - 20 });
}

// Add holographic pattern simulation
function addHolographicPattern(pdf: jsPDF, pageWidth: number, pageHeight: number) {
  pdf.setDrawColor(0, 181, 165);
  pdf.setFillColor(0, 181, 165);
  pdf.saveGraphicsState();
   //@ts-ignore
  pdf.setGState(new pdf.GState({ opacity: 0.03 })); 
  
  // Create repeating geometric pattern
  for (let x = 15; x < pageWidth - 15; x += 15) {
    for (let y = 15; y < pageHeight - 15; y += 15) {
      pdf.circle(x, y, 1.5, 'F');
      pdf.line(x, y, x + 7, y + 7);
    }
  }
  
  pdf.restoreGraphicsState();
}

// Add guilloche patterns
function addGuillochePattern(pdf: jsPDF, x: number, y: number, width: number, height: number) {
  pdf.setDrawColor(0, 181, 165);
  pdf.setLineWidth(0.1);
  pdf.saveGraphicsState();
  //@ts-ignore
  pdf.setGState(new pdf.GState({ opacity: 0.2 }));
  
  const waves = 15;
  for (let i = 0; i < waves; i++) {
    const points: [number, number][] = [];
    for (let j = 0; j <= width; j += 3) {
      const yOffset = Math.sin((j + i * 10) * 0.15) * 4;
      points.push([j, height / 2 + yOffset]);
    }
    
    // Draw the wave line
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

// Helper function to generate QR code as base64 with text in center
async function generateQRCodeWithText(data: string, text: string): Promise<string> {
  try {
    // Generate QR code on canvas
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, data, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'H', // High error correction to allow for text overlay
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Add white background circle in center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const circleRadius = 45;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Add text in center
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Split text into two lines
    const words = text.split(' ');
    const line1 = words.slice(0, 2).join(' ');
    const line2 = words.slice(2).join(' ');
    
    ctx.fillText(line1, centerX, centerY - 8);
    ctx.fillText(line2, centerX, centerY + 8);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw error;
  }
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

  // Generate security elements
  const certificateHash = await generateCertificateHash(certificate, institution.abbreviation);
  const serialNumber = generateSerialNumber(certificate.member_number, certificate.created_at);

  // Load images
  const logoBase64 = await loadImageAsBase64(institution.logo);
  const signatureBase64 = institution.signature ? await loadImageAsBase64(institution.signature) : null;
  const stampBase64 = institution.stamp ? await loadImageAsBase64(institution.stamp) : null;

  // Get current domain dynamically (works for localhost and production)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://komuu.com';
  
  // Generate enhanced QR code with structured data - Dynamic URL
  const verificationUrl = `${currentOrigin}/verify/${certificate.token}`;
  const qrCodeData = JSON.stringify({
    url: verificationUrl,
    token: certificate.token,
    memberNumber: certificate.member_number,
    issueDate: certificate.created_at,
    expiryDate: certificate.valid_until,
    institution: institution.abbreviation,
    hash: certificateHash,
    serial: serialNumber
  });
  const qrCodeBase64 = await generateQRCodeWithText(qrCodeData, 'Scan to verify');

  // === SECURITY LAYER 1: Holographic Pattern ===
  addHolographicPattern(pdf, pageWidth, pageHeight);

  // === SECURITY LAYER 2: Watermark (Dynamic Institution) ===
  addWatermark(pdf, pageWidth, pageHeight, institution.abbreviation);

  // Add decorative border
  pdf.setDrawColor(0, 181, 165); // #00B5A5
  pdf.setLineWidth(3);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // === SECURITY LAYER 3: Microprint Border (Dynamic Institution) ===
  addMicroprintBorder(pdf, pageWidth, pageHeight, institution.name);

  // === SECURITY LAYER 4: Guilloche Patterns (decorative areas) ===
  addGuillochePattern(pdf, 15, 70, pageWidth - 30, 8);
  addGuillochePattern(pdf, 15, pageHeight - 50, pageWidth - 30, 8);

  // Add logo at top center
  if (logoBase64) {
    try {
      const logoDimensions = await getImageDimensions(logoBase64);
      const logoWidth = 30;
      const logoHeight = (logoDimensions.height / logoDimensions.width) * logoWidth;
      pdf.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, 18, logoWidth, logoHeight);
    } catch (error) {
      console.error('Failed to add logo:', error);
    }
  }

  // Institution name (Dynamic)
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 181, 165); // #00B5A5
  pdf.text(institution.name.toUpperCase(), pageWidth / 2, 48, { align: 'center' });

  // Title
  pdf.setFontSize(32);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('CERTIFICATE OF MEMBERSHIP', pageWidth / 2, 62, { align: 'center' });

  // Decorative line
  pdf.setDrawColor(0, 181, 165);
  pdf.setLineWidth(0.5);
  pdf.line(60, 66, pageWidth - 60, 66);

  // Main content
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('This is to certify that', pageWidth / 2, 80, { align: 'center' });

  // Member name (highlighted) - Dynamic
  pdf.setFontSize(26);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(0, 181, 165);
  pdf.text(certificate.name, pageWidth / 2, 92, { align: 'center' });

  // Member number - Dynamic
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Member No: ${certificate.member_number}`, pageWidth / 2, 100, { align: 'center' });

  // Membership category and dates - Dynamic
  const fromDate = new Date(certificate.valid_from).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const toDate = new Date(certificate.valid_until).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Is ${certificate.membership_term} from ${fromDate}`, pageWidth / 2, 110, { align: 'center' });
  pdf.text(`until ${toDate}`, pageWidth / 2, 118, { align: 'center' });

  // Institution abbreviation - Dynamic
  pdf.setFontSize(14);
  pdf.text(`of ${institution.abbreviation}`, pageWidth / 2, 128, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(80, 80, 80);
  pdf.text('This membership includes all the rights, privileges and obligations associated', pageWidth / 2, 138, { align: 'center' });
  pdf.text('with this category of membership.', pageWidth / 2, 143, { align: 'center' });

  const signatureY = pageHeight - 35;

  // Left side - Signature (Dynamic)
  const signatureX = 50;
  if (signatureBase64) {
    try {
      const sigDimensions = await getImageDimensions(signatureBase64);
      const sigWidth = 35;
      const sigHeight = (sigDimensions.height / sigDimensions.width) * sigWidth;
      pdf.addImage(signatureBase64, 'PNG', signatureX, signatureY - sigHeight - 5, sigWidth, sigHeight);
    } catch (error) {
      console.error('Failed to add signature:', error);
    }
  }
  
  pdf.setLineWidth(0.3);
  pdf.setDrawColor(0, 0, 0);
  pdf.line(signatureX, signatureY, signatureX + 40, signatureY);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Authorized Signature', signatureX + 20, signatureY + 4, { align: 'center' });
  
  // President name - Dynamic
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(institution.president_name, signatureX + 20, signatureY + 8, { align: 'center' });
  pdf.text(`Date: ${new Date(certificate.signed_date).toLocaleDateString()}`, signatureX + 20, signatureY + 12, { align: 'center' });

  // Center - QR Code
  const qrSize = 30;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = signatureY - qrSize + 5; 
  
  pdf.addImage(qrCodeBase64, 'PNG', qrX, qrY, qrSize, qrSize);

  // Right side - Official Stamp (Dynamic)
  const stampX = pageWidth - 90;
  if (stampBase64) {
    try {
      const stampDimensions = await getImageDimensions(stampBase64);
      const stampSize = 30;
      const stampHeight = (stampDimensions.height / stampDimensions.width) * stampSize;
      pdf.addImage(stampBase64, 'PNG', stampX, signatureY - stampHeight - 5, stampSize, stampHeight);
    } catch (error) {
      console.error('Failed to add stamp:', error);
    }
  }

  pdf.setLineWidth(0.3);
  pdf.line(stampX, signatureY, stampX + 40, signatureY);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Official Stamp', stampX + 20, signatureY + 4, { align: 'center' });

  // === SECURITY LAYER 5: Serial Number ===
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Serial: ${serialNumber}`, pageWidth - 20, pageHeight - 3, { align: 'right' });

  // Footer
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  pdf.text('This is a digitally generated certificate', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // === SECURITY LAYER 6: Certificate Hash (for verification) ===
  pdf.setFontSize(5);
  pdf.text(`Hash: ${certificateHash.substring(0, 40)}...`, 20, pageHeight - 3);

  // === SECURITY LAYER 7: PDF Metadata (Dynamic) ===
  pdf.setProperties({
    title: `${institution.abbreviation} Certificate - ${certificate.member_number}`,
    subject: 'Membership Certificate',
    author: institution.name,
    keywords: `certificate,${certificate.token},${certificate.member_number},${certificateHash},${institution.abbreviation}`,
    creator: 'Komuu Certificate System',
    //@ts-ignore
    producer: 'Komuu Secure PDF Generator'
  });

  return pdf.output('blob');
}