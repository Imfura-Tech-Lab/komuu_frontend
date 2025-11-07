import jsPDF from 'jspdf';

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

export async function generateCertificatePDF(data: CertificateData): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const { certificate, institution } = data;

  // Load images
  const logoBase64 = await loadImageAsBase64(institution.logo);
  const signatureBase64 = institution.signature ? await loadImageAsBase64(institution.signature) : null;
  const stampBase64 = institution.stamp ? await loadImageAsBase64(institution.stamp) : null;

  // Add decorative border
  pdf.setDrawColor(0, 181, 165); // #00B5A5
  pdf.setLineWidth(3);
  pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(12, 12, pageWidth - 24, pageHeight - 24);

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

  // Institution name
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

  // Certificate Number (top right)
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Certificate No: ${certificate.member_number}`, pageWidth - 20, 20, { align: 'right' });
  pdf.text(`Issued: ${new Date(certificate.created_at).toLocaleDateString()}`, pageWidth - 20, 25, { align: 'right' });

  // Main content
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('This is to certify that', pageWidth / 2, 80, { align: 'center' });

  // Member name (highlighted)
  pdf.setFontSize(26);
  pdf.setFont('times', 'bold');
  pdf.setTextColor(0, 181, 165);
  pdf.text(certificate.name, pageWidth / 2, 92, { align: 'center' });

  // Member number
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Member No: ${certificate.member_number}`, pageWidth / 2, 100, { align: 'center' });

  // Membership text
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('is a registered member in good standing of', pageWidth / 2, 110, { align: 'center' });

  // Institution name (bold)
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 181, 165);
  pdf.text(institution.name.toUpperCase(), pageWidth / 2, 120, { align: 'center' });
  pdf.text(`(${institution.abbreviation})`, pageWidth / 2, 128, { align: 'center' });

  // Membership details box
  const boxY = 138;
  pdf.setDrawColor(0, 181, 165);
  pdf.setFillColor(245, 248, 250);
  pdf.roundedRect(50, boxY, pageWidth - 100, 25, 2, 2, 'FD');

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  
  const detailsY = boxY + 8;
  pdf.text('Membership Term:', 60, detailsY);
  pdf.setFont('helvetica', 'normal');
  pdf.text(certificate.membership_term, 105, detailsY);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Valid From:', 60, detailsY + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(certificate.valid_from).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), 105, detailsY + 6);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Valid Until:', 60, detailsY + 12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date(certificate.valid_until).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), 105, detailsY + 12);

  // Status badge
  const statusY = detailsY;
  const statusX = pageWidth - 70;
  pdf.setDrawColor(34, 197, 94); // green
  pdf.setFillColor(220, 252, 231); // light green
  pdf.roundedRect(statusX, statusY - 4, 30, 8, 1, 1, 'FD');
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(22, 163, 74);
  pdf.text(certificate.status, statusX + 15, statusY + 1, { align: 'center' });

  // Signature and stamp section
  const signatureY = pageHeight - 35;

  // Left side - Signature
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
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(institution.president_name, signatureX + 20, signatureY + 8, { align: 'center' });
  pdf.text(`Date: ${new Date(certificate.signed_date).toLocaleDateString()}`, signatureX + 20, signatureY + 12, { align: 'center' });

  // Right side - Official Stamp
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

  // Footer - Token/QR placeholder
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Certificate Token: ${certificate.token}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  pdf.text('This is a digitally generated certificate', pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Payment info (if available and completed)
  if (certificate.payment && certificate.payment.status === 'Completed') {
    pdf.setFontSize(6);
    pdf.text(`Payment: ${certificate.payment.amount_paid} via ${certificate.payment.payment_method} | Ref: ${certificate.payment.transaction_number}`, 
      pageWidth / 2, pageHeight - 3, { align: 'center' });
  }

  // Generate PDF blob
  return pdf.output('blob');
}