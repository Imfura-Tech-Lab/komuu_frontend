import jsPDF from "jspdf";
import { Application } from "@/types";
import { showErrorToast, showSuccessToast } from "@/components/layouts/auth-layer-out";

export class PDFService {
  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private static addStyledSection(
    pdf: jsPDF, 
    title: string, 
    yPos: number, 
    color = [0, 181, 165]
  ): number {
    const pageWidth = pdf.internal.pageSize.width;
    
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(20, yPos - 5, pageWidth - 40, 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 25, yPos + 2);
    
    pdf.setTextColor(0, 0, 0);
    
    return yPos + 15;
  }

  private static addField(
    pdf: jsPDF, 
    label: string, 
    value: string, 
    yPos: number, 
    pageHeight: number
  ): number {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text(label, 25, yPos);
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    const textLines = pdf.splitTextToSize(value, 120);
    pdf.text(textLines, 80, yPos);
    
    return yPos + (textLines.length * 5) + 3;
  }

  private static addApplicationHeader(pdf: jsPDF, application: Application): number {
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 35;
    
    // Application Overview Box
    pdf.setDrawColor(0, 181, 165);
    pdf.setLineWidth(1);
    pdf.rect(20, yPosition, pageWidth - 40, 25);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Application ID: ${application.id}`, 25, yPosition + 8);
    
    // Status with color coding
    const status = application.application_status;
    let statusColor = [128, 128, 128];
    if (status === "Approved") statusColor = [34, 197, 94];
    else if (status === "Rejected") statusColor = [239, 68, 68];
    else if (status === "Pending") statusColor = [245, 158, 11];
    else if (status.includes("Review")) statusColor = [59, 130, 246];
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`Status: ${status}`, pageWidth - 80, yPosition + 8);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Application Date: ${this.formatDate(application.application_date)}`, 25, yPosition + 18);
    
    return yPosition + 35;
  }

  private static addApplicationDetails(
    pdf: jsPDF, 
    application: Application, 
    yPosition: number, 
    pageHeight: number
  ): number {
    yPosition = this.addStyledSection(pdf, "APPLICATION DETAILS", yPosition);
    
    yPosition = this.addField(pdf, "Applicant Name:", application.member || application.member_details?.name || "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "Membership Type:", application.membership_type || "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "Organization:", `${application.name_of_organization || "N/A"} ${application.Abbreviation ? `(${application.Abbreviation})` : ""}`, yPosition, pageHeight);
    yPosition = this.addField(pdf, "Country of Residency:", application.country_of_residency || "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "Forensic Field of Practice:", application.forensic_field_of_practice || "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "Company Email:", application.company_email || "N/A", yPosition, pageHeight);
    
    return yPosition + 10;
  }

  private static addMemberInformation(
    pdf: jsPDF, 
    application: Application, 
    yPosition: number, 
    pageHeight: number
  ): number {
    if (!application.member_details) return yPosition;
    
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 30;
    }

    yPosition = this.addStyledSection(pdf, "MEMBER INFORMATION", yPosition, [59, 130, 246]);
    
    yPosition = this.addField(pdf, "Full Name:", application.member_details.name || "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "Email:", application.member_details.email || "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "Phone Number:", application.member_details.phone_number || "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "National ID:", application.member_details.national_ID || "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "Date of Birth:", application.member_details.date_of_birth ? new Date(application.member_details.date_of_birth).toLocaleDateString() : "N/A", yPosition, pageHeight);
    yPosition = this.addField(pdf, "Account Status:", application.member_details.verified ? "Verified" : "Pending Verification", yPosition, pageHeight);
    
    return yPosition + 10;
  }

  static async generateSingleApplicationPDF(application: Application): Promise<void> {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;

      // Header with company branding
      pdf.setFillColor(0, 181, 165);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("MEMBERSHIP APPLICATION", pageWidth / 2, 16, { align: "center" });
      
      let yPosition = this.addApplicationHeader(pdf, application);
      yPosition = this.addApplicationDetails(pdf, application, yPosition, pageHeight);
      yPosition = this.addMemberInformation(pdf, application, yPosition, pageHeight);

      // Declaration Section
      if (yPosition > pageHeight - 70) {
        pdf.addPage();
        yPosition = 30;
      }

      yPosition = this.addStyledSection(pdf, "DECLARATION STATUS", yPosition, [168, 85, 247]);
      
      const declarations = [
        ["Abide with Code of Conduct:", application.abide_with_code_of_conduct],
        ["Comply with Constitution:", application.comply_with_current_constitution],
        ["Declaration Signed:", application.declaration],
        ["In Compliance:", application.incompliance],
      ];

      declarations.forEach(([label, value]) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(label as string, 25, yPosition);
        
        const statusText = value ? "Yes" : "No";
        const color = value ? [34, 197, 94] : [239, 68, 68];
        pdf.setTextColor(color[0], color[1], color[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text(statusText, 80, yPosition);
        
        yPosition += 8;
      });
      
      pdf.setTextColor(0, 0, 0);
      yPosition += 10;

      // Countries of Practice
      if (application.countriesOfPractice && application.countriesOfPractice.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 30;
        }

        yPosition = this.addStyledSection(pdf, "COUNTRIES OF PRACTICE", yPosition, [245, 158, 11]);
        
        application.countriesOfPractice.forEach((country, index) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }
          
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${country.country} (${country.region})`, 25, yPosition);
          yPosition += 6;
        });
        
        yPosition += 10;
      }

      // Documents Section
      if (application.qualification || application.cv_resume) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 30;
        }

        yPosition = this.addStyledSection(pdf, "DOCUMENTS", yPosition, [34, 197, 94]);
        
        if (application.qualification) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text("Qualification Document: Available", 25, yPosition);
          yPosition += 6;
        }

        if (application.cv_resume) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text("CV/Resume: Available", 25, yPosition);
          yPosition += 6;
        }
      }

      // Footer
      const footerY = pageHeight - 15;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, footerY - 5, pageWidth, 20, 'F');
      
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, footerY + 2);
      pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - 40, footerY + 2);

      // Save the PDF
      const applicantName = application.member || application.member_details?.name || "member";
      const fileName = `application_${application.id}_${applicantName.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);

      showSuccessToast("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showErrorToast("Failed to generate PDF");
      throw error;
    }
  }

  static async generateAllApplicationsPDF(applications: Application[]): Promise<void> {
    if (applications.length === 0) {
      showErrorToast("No applications to export");
      return;
    }

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Cover Page
      pdf.setFillColor(0, 181, 165);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("MEMBERSHIP APPLICATIONS", pageWidth / 2, 80, { align: "center" });
      pdf.text("COMPREHENSIVE REPORT", pageWidth / 2, 100, { align: "center" });
      
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Applications: ${applications.length}`, pageWidth / 2, 130, { align: "center" });
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 145, { align: "center" });

      // Generate individual application pages
      applications.forEach((application, appIndex) => {
        pdf.addPage();
        let yPosition = 30;

        pdf.setFillColor(0, 181, 165);
        pdf.rect(0, 0, pageWidth, 25, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(`APPLICATION ${appIndex + 1} OF ${applications.length}`, pageWidth / 2, 16, { align: "center" });
        
        yPosition = this.addApplicationHeader(pdf, application);
        yPosition = this.addApplicationDetails(pdf, application, yPosition, pageHeight);
        yPosition = this.addMemberInformation(pdf, application, yPosition, pageHeight);
      });

      const fileName = `applications_comprehensive_report_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      showSuccessToast("Comprehensive applications report generated successfully!");
    } catch (error) {
      console.error("Error generating applications PDF:", error);
      showErrorToast("Failed to generate applications report");
      throw error;
    }
  }
}