import jsPDF from "jspdf";
import { Payment } from "@/types/payment";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";

export class PaymentPDFService {
  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private static formatAmount(amountString: string): string {
    const parts = amountString.split(' ');
    return parts.length > 1 ? `${parts[0]} ${parts[1]}` : amountString;
  }

  private static addHeader(pdf: jsPDF, title: string): void {
    const pageWidth = pdf.internal.pageSize.width;
    
    pdf.setFillColor(0, 181, 165);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, pageWidth / 2, 16, { align: "center" });
  }

  private static addPaymentDetails(
    pdf: jsPDF, 
    payment: Payment, 
    yPosition: number
  ): number {
    const pageWidth = pdf.internal.pageSize.width;
    
    // Payment overview box
    pdf.setDrawColor(0, 181, 165);
    pdf.setLineWidth(1);
    pdf.rect(20, yPosition, pageWidth - 40, 40);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Payment #${payment.id}`, 25, yPosition + 12);
    
    pdf.setFontSize(14);
    pdf.text(this.formatAmount(payment.amount_paid), 25, yPosition + 24);
    
    // Status with color
    const status = payment.status;
    let statusColor = [128, 128, 128];
    if (status === "Completed") statusColor = [34, 197, 94];
    else if (status === "Pending") statusColor = [245, 158, 11];
    else if (status === "Failed") statusColor = [239, 68, 68];
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Status: ${status}`, pageWidth - 80, yPosition + 12);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Date: ${this.formatDate(payment.payment_date)}`, pageWidth - 80, yPosition + 24);
    
    return yPosition + 50;
  }

  static async generateSinglePaymentPDF(payment: Payment): Promise<void> {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      
      this.addHeader(pdf, "PAYMENT RECEIPT");
      
      let yPosition = this.addPaymentDetails(pdf, payment, 35);
      yPosition += 10;
      
      // Payment Information Section
      pdf.setFillColor(240, 248, 255);
      pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Payment Information", 25, yPosition + 6);
      
      yPosition += 15;
      
      const details = [
        ["Member Number:", payment.member],
        ["Payment Method:", payment.payment_method],
        ["Transaction Number:", payment.transaction_number],
        ["Gateway:", payment.gateway],
        ["Amount Paid:", this.formatAmount(payment.amount_paid)],
        ["Payment Date:", this.formatDate(payment.payment_date)],
        ["Certificate Generated:", payment.is_certificate_generated ? "Yes" : "No"],
      ];
      
      details.forEach(([label, value]) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(label, 25, yPosition);
        
        pdf.setFont("helvetica", "normal");
        pdf.text(value, 80, yPosition);
        
        yPosition += 8;
      });
      
      // Footer
      const footerY = pdf.internal.pageSize.height - 20;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        20,
        footerY
      );
      
      const fileName = `payment_receipt_${payment.id}_${payment.member}.pdf`;
      pdf.save(fileName);
      
      showSuccessToast("Payment receipt generated successfully!");
    } catch (error) {
      console.error("Error generating payment PDF:", error);
      showErrorToast("Failed to generate payment receipt");
      throw error;
    }
  }

  static async generatePaymentReportPDF(
    payments: Payment[], 
    stats: any, 
    filters: any
  ): Promise<void> {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      this.addHeader(pdf, "PAYMENT REPORT");
      
      let yPosition = 40;
      
      // Report Summary
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Report Summary", 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      
      const summaryItems = [
        [`Total Payments: ${stats.total}`],
        [`Completed: ${stats.completed} (${stats.completedAmount.toFixed(2)} USD)`],
        [`Pending: ${stats.pending}`],
        [`Failed: ${stats.failed}`],
        [`Certificates Generated: ${stats.certificatesGenerated}`],
        [`Report Generated: ${new Date().toLocaleDateString()}`],
      ];
      
      summaryItems.forEach(([text]) => {
        pdf.text(text, 20, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Payments Table Header
      pdf.setFillColor(0, 181, 165);
      pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      
      pdf.text("ID", 25, yPosition + 5);
      pdf.text("Member", 40, yPosition + 5);
      pdf.text("Amount", 70, yPosition + 5);
      pdf.text("Method", 95, yPosition + 5);
      pdf.text("Status", 125, yPosition + 5);
      pdf.text("Date", 150, yPosition + 5);
      
      yPosition += 12;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      
      // Payments Data
      payments.forEach((payment) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.text(payment.id.toString(), 25, yPosition);
        pdf.text(payment.member, 40, yPosition);
        pdf.text(payment.amount_paid.split(' ')[0], 70, yPosition);
        pdf.text(payment.payment_method, 95, yPosition);
        pdf.text(payment.status, 125, yPosition);
        pdf.text(new Date(payment.payment_date).toLocaleDateString(), 150, yPosition);
        
        yPosition += 6;
      });
      
      const fileName = `payment_report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      showSuccessToast("Payment report generated successfully!");
    } catch (error) {
      console.error("Error generating payment report:", error);
      showErrorToast("Failed to generate payment report");
      throw error;
    }
  }
}