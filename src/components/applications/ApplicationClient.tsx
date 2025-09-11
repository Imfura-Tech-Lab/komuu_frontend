"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  showErrorToast,
  showSuccessToast,
} from "@/components/layouts/auth-layer-out";
import { Application } from "@/types";
import ApplicationCard from "../dashboard/application-card";
import jsPDF from "jspdf";

export default function ApplicationClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.role);
    }
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");

      if (!token) {
        showErrorToast("Please login to view applications");
        return;
      }

      const parsedUserData = userData ? JSON.parse(userData) : null;
      const isMember = parsedUserData?.role === "Member";
      const endpoint = isMember ? "my-application" : "applications";

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        if (isMember) {
          setApplications(data.data ? [data.data] : []);
        } else {
          const applicationsData = data.data?.data || [];
          setApplications(
            Array.isArray(applicationsData) ? applicationsData : []
          );
        }
      } else {
        throw new Error(data.message || "Failed to fetch applications");
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch applications"
      );
      showErrorToast("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for PDF styling
  const addStyledSection = (pdf: jsPDF, title: string, yPos: number, color = [0, 181, 165]) => {
    const pageWidth = pdf.internal.pageSize.width;
    
    // Section header with colored background
    pdf.setFillColor(color[0], color[1], color[2]);
    pdf.rect(20, yPos - 5, pageWidth - 40, 12, 'F');
    
    // Section title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 25, yPos + 2);
    
    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    return yPos + 15;
  };

  const addField = (pdf: jsPDF, label: string, value: string, yPos: number, pageHeight: number) => {
    if (yPos > pageHeight - 30) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Label in bold
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text(label, 25, yPos);
    
    // Value in normal font
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    const textLines = pdf.splitTextToSize(value, 120);
    pdf.text(textLines, 80, yPos);
    
    return yPos + (textLines.length * 5) + 3;
  };

  const generateApplicationPDF = async (application: Application) => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 30;

      // Header with company branding
      pdf.setFillColor(0, 181, 165);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("MEMBERSHIP APPLICATION", pageWidth / 2, 16, { align: "center" });
      
      yPosition = 35;
      
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
      let statusColor = [128, 128, 128]; // Default gray
      if (status === "Approved") statusColor = [34, 197, 94]; // Green
      else if (status === "Rejected") statusColor = [239, 68, 68]; // Red
      else if (status === "Pending") statusColor = [245, 158, 11]; // Yellow
      else if (status.includes("Review")) statusColor = [59, 130, 246]; // Blue
      
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(`Status: ${status}`, pageWidth - 80, yPosition + 8);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Application Date: ${formatDate(application.application_date)}`, 25, yPosition + 18);
      
      yPosition += 35;

      // Application Details Section
      yPosition = addStyledSection(pdf, "APPLICATION DETAILS", yPosition);
      
      yPosition = addField(pdf, "Applicant Name:", application.member || application.member_details?.name || "N/A", yPosition, pageHeight);
      yPosition = addField(pdf, "Membership Type:", application.membership_type || "N/A", yPosition, pageHeight);
      yPosition = addField(pdf, "Organization:", `${application.name_of_organization || "N/A"} ${application.Abbreviation ? `(${application.Abbreviation})` : ""}`, yPosition, pageHeight);
      yPosition = addField(pdf, "Country of Residency:", application.country_of_residency || "N/A", yPosition, pageHeight);
      yPosition = addField(pdf, "Forensic Field of Practice:", application.forensic_field_of_practice || "N/A", yPosition, pageHeight);
      yPosition = addField(pdf, "Company Email:", application.company_email || "N/A", yPosition, pageHeight);
      
      yPosition += 10;

      // Member Information Section
      if (application.member_details) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 30;
        }

        yPosition = addStyledSection(pdf, "MEMBER INFORMATION", yPosition, [59, 130, 246]);
        
        yPosition = addField(pdf, "Full Name:", application.member_details.name || "N/A", yPosition, pageHeight);
        yPosition = addField(pdf, "Email:", application.member_details.email || "N/A", yPosition, pageHeight);
        yPosition = addField(pdf, "Phone Number:", application.member_details.phone_number || "N/A", yPosition, pageHeight);
        yPosition = addField(pdf, "National ID:", application.member_details.national_ID || "N/A", yPosition, pageHeight);
        yPosition = addField(pdf, "Date of Birth:", application.member_details.date_of_birth ? new Date(application.member_details.date_of_birth).toLocaleDateString() : "N/A", yPosition, pageHeight);
        yPosition = addField(pdf, "Account Status:", application.member_details.verified ? "Verified" : "Pending Verification", yPosition, pageHeight);
        
        yPosition += 10;
      }

      // Declaration Section
      if (yPosition > pageHeight - 70) {
        pdf.addPage();
        yPosition = 30;
      }

      yPosition = addStyledSection(pdf, "DECLARATION STATUS", yPosition, [168, 85, 247]);
      
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
        pdf.text(label, 25, yPosition);
        
        // Status indicator with color
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

        yPosition = addStyledSection(pdf, "COUNTRIES OF PRACTICE", yPosition, [245, 158, 11]);
        
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

        yPosition = addStyledSection(pdf, "DOCUMENTS", yPosition, [34, 197, 94]);
        
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
      // @ts-ignore
      pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - 40, footerY + 2);

      // Save the PDF
      const applicantName = application.member || application.member_details?.name || "member";
      const fileName = `application_${application.id}_${applicantName.replace(/\s+/g, "_")}.pdf`;
      pdf.save(fileName);

      showSuccessToast("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showErrorToast("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateAllApplicationsPDF = async () => {
    if (filteredApplications.length === 0) {
      showErrorToast("No applications to export");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Cover Page
      pdf.setFillColor(0, 181, 165);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(28);
      pdf.setFont("helvetica", "bold");
      pdf.text("MEMBERSHIP APPLICATIONS", pageWidth / 2, 80, { align: "center" });
      pdf.text("COMPREHENSIVE REPORT", pageWidth / 2, 100, { align: "center" });
      
      // Report info
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Applications: ${filteredApplications.length}`, pageWidth / 2, 130, { align: "center" });
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 145, { align: "center" });
      pdf.text(`Report Time: ${new Date().toLocaleTimeString()}`, pageWidth / 2, 160, { align: "center" });

      // Summary Statistics
      const stats = getStatusStats();
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("STATUS SUMMARY", pageWidth / 2, 190, { align: "center" });
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(`Approved: ${stats.approved || 0}`, pageWidth / 2, 205, { align: "center" });
      pdf.text(`Pending: ${stats.pending || 0}`, pageWidth / 2, 220, { align: "center" });
      pdf.text(`Under Review: ${(stats["under_review"] || 0) + (stats["under review"] || 0)}`, pageWidth / 2, 235, { align: "center" });
      pdf.text(`Rejected: ${stats.rejected || 0}`, pageWidth / 2, 250, { align: "center" });

      // Table of Contents
      pdf.addPage();
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(0, 181, 165);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("TABLE OF CONTENTS", pageWidth / 2, 16, { align: "center" });
      
      let tocY = 40;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      
      filteredApplications.forEach((app, index) => {
        const applicantName = app.member || app.member_details?.name || `Application ${app.id}`;
        pdf.text(`${index + 1}. ${applicantName}`, 20, tocY);
        pdf.text(`Page ${index + 3}`, pageWidth - 40, tocY);
        tocY += 8;
        
        if (tocY > pageHeight - 30) {
          pdf.addPage();
          tocY = 30;
        }
      });

      // Individual Application Pages - Full details for each
      filteredApplications.forEach((application, appIndex) => {
        pdf.addPage();
        let yPosition = 30;

        // Header
        pdf.setFillColor(0, 181, 165);
        pdf.rect(0, 0, pageWidth, 25, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(`APPLICATION ${appIndex + 1} OF ${filteredApplications.length}`, pageWidth / 2, 16, { align: "center" });
        
        yPosition = 35;
        
        // Application Overview
        pdf.setDrawColor(0, 181, 165);
        pdf.setLineWidth(1);
        pdf.rect(20, yPosition, pageWidth - 40, 30);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        const applicantName = application.member || application.member_details?.name || "Unknown Applicant";
        pdf.text(applicantName, 25, yPosition + 10);
        
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`ID: ${application.id}`, 25, yPosition + 18);
        pdf.text(`Organization: ${application.name_of_organization || "N/A"}`, 25, yPosition + 26);
        
        // Status with color
        const status = application.application_status;
        let statusColor = [128, 128, 128];
        if (status === "Approved") statusColor = [34, 197, 94];
        else if (status === "Rejected") statusColor = [239, 68, 68];
        else if (status === "Pending") statusColor = [245, 158, 11];
        else if (status.includes("Review")) statusColor = [59, 130, 246];
        
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Status: ${status}`, pageWidth - 80, yPosition + 10);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Date: ${formatDate(application.application_date)}`, pageWidth - 80, yPosition + 18);
        
        yPosition += 40;

        // Full Application Details for each application
        yPosition = addStyledSection(pdf, "APPLICATION DETAILS", yPosition);
        
        yPosition = addField(pdf, "Membership Type:", application.membership_type || "N/A", yPosition, pageHeight);
        yPosition = addField(pdf, "Country:", application.country_of_residency || "N/A", yPosition, pageHeight);
        yPosition = addField(pdf, "Field of Practice:", application.forensic_field_of_practice || "N/A", yPosition, pageHeight);
        yPosition = addField(pdf, "Company Email:", application.company_email || "N/A", yPosition, pageHeight);
        
        yPosition += 5;

        // Member Information
        if (application.member_details) {
          if (yPosition > pageHeight - 80) {
            pdf.addPage();
            yPosition = 30;
          }

          yPosition = addStyledSection(pdf, "MEMBER INFORMATION", yPosition, [59, 130, 246]);
          
          yPosition = addField(pdf, "Email:", application.member_details.email || "N/A", yPosition, pageHeight);
          yPosition = addField(pdf, "Phone:", application.member_details.phone_number || "N/A", yPosition, pageHeight);
          yPosition = addField(pdf, "National ID:", application.member_details.national_ID || "N/A", yPosition, pageHeight);
          yPosition = addField(pdf, "Date of Birth:", application.member_details.date_of_birth ? new Date(application.member_details.date_of_birth).toLocaleDateString() : "N/A", yPosition, pageHeight);
          yPosition = addField(pdf, "Verified:", application.member_details.verified ? "Yes" : "Pending", yPosition, pageHeight);
          
          yPosition += 5;
        }

        // Declaration Status
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 30;
        }

        yPosition = addStyledSection(pdf, "DECLARATION STATUS", yPosition, [168, 85, 247]);
        
        const declarations = [
          ["Code of Conduct:", application.abide_with_code_of_conduct],
          ["Constitution:", application.comply_with_current_constitution],
          ["Declaration:", application.declaration],
          ["Compliance:", application.incompliance],
        ];

        declarations.forEach(([label, value]) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 30;
          }
          
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          pdf.setTextColor(60, 60, 60);
          pdf.text(label, 25, yPosition);
          
          const statusText = value ? "Yes" : "No";
          const color = value ? [34, 197, 94] : [239, 68, 68];
          pdf.setTextColor(color[0], color[1], color[2]);
          pdf.setFont("helvetica", "bold");
          pdf.text(statusText, 80, yPosition);
          
          yPosition += 8;
        });
        
        pdf.setTextColor(0, 0, 0);

        // Countries of Practice
        if (application.countriesOfPractice && application.countriesOfPractice.length > 0) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 30;
          }

          yPosition = addStyledSection(pdf, "COUNTRIES OF PRACTICE", yPosition, [245, 158, 11]);
          
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
        }

        // Documents
        if (application.qualification || application.cv_resume) {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 30;
          }

          yPosition = addStyledSection(pdf, "DOCUMENTS", yPosition, [34, 197, 94]);
          
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

        // Footer for each application page
        const footerY = pageHeight - 15;
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, footerY - 5, pageWidth, 20, 'F');
        
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Application ${appIndex + 1} of ${filteredApplications.length}`, 20, footerY + 2);
        // @ts-ignore
        pdf.text(`Page ${pdf.getNumberOfPages()}`, pageWidth - 40, footerY + 2);
      });

      // Save the PDF
      const fileName = `applications_comprehensive_report_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);

      showSuccessToast("Comprehensive applications report generated successfully!");
    } catch (error) {
      console.error("Error generating applications PDF:", error);
      showErrorToast("Failed to generate applications report");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "under_review":
      case "under review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "waiting for payment":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBoolean = (value: boolean) => {
    return value ? "Yes" : "No";
  };

  const getStatusStats = () => {
    const stats = applications.reduce(
      (acc, app) => {
        const status = app.application_status.toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        acc.total++;
        return acc;
      },
      { total: 0 } as Record<string, number>
    );
    return stats;
  };

  const normalizeStatus = (status: string): string => {
    if (!status) return "";
    const statusMap: Record<string, string> = {
      pending: "pending",
      under_review: "under review",
      "under review": "under review",
      approved: "approved",
      rejected: "rejected",
      "waiting for payment": "waiting for payment",
      waiting_for_payment: "waiting for payment",
    };
    return statusMap[status.toLowerCase()] || status.toLowerCase();
  };

  const filteredApplications = applications.filter((app) => {
    const normalizedAppStatus = normalizeStatus(app.application_status || "");
    const normalizedFilterStatus = filterStatus.toLowerCase();
    
    const matchesStatus =
      normalizedFilterStatus === "all" ||
      normalizedAppStatus === normalizedFilterStatus;

    const matchesSearch =
      searchTerm === "" ||
      (app.member || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.member_details?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.name_of_organization || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (app.country_of_residency || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B5A5] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading application details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <div className="text-red-600 dark:text-red-400 text-2xl mb-2">⚠️</div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
              Error Loading Applications
            </h3>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📋</div>
            <h3 className="text-gray-900 dark:text-white font-medium mb-2 text-xl">
              No Applications Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              {userRole === "Member"
                ? "You haven't submitted an application yet."
                : "No applications are available to review at this time."}
            </p>
            {userRole === "Member" && (
              <button
                onClick={() => router.push("/apply")}
                className="px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors inline-flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Submit Application
              </button>
            )}
          </div>
        </div>
    );
  }

  const stats = getStatusStats();
  const isSingleApplication = applications.length === 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isSingleApplication
                  ? "My Application"
                  : "Applications Management"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isSingleApplication
                  ? "View your membership application details and status"
                  : `Review and manage ${applications.length} membership applications`}
              </p>
            </div>

            <div className="flex gap-2">
              {/* PDF Export Buttons */}
              {!isSingleApplication && filteredApplications.length > 0 && (
                <button
                  onClick={generateAllApplicationsPDF}
                  disabled={isGeneratingPDF}
                  className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      isGeneratingPDF ? "animate-spin" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export All PDF
                </button>
              )}

              {isSingleApplication && applications.length > 0 && (
                <button
                  onClick={() => generateApplicationPDF(applications[0])}
                  disabled={isGeneratingPDF}
                  className="inline-flex items-center px-4 py-2 bg-[#00B5A5] hover:bg-[#009985] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      isGeneratingPDF ? "animate-spin" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export PDF
                </button>
              )}

              <button
                onClick={fetchApplications}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Overview - Only show for multiple applications */}
        {!isSingleApplication && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.total}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Applications
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.pending || 0}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pending
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.approved || 0}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Approved
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {(stats["under_review"] || 0) +
                        (stats["under review"] || 0)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Under Review
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="sr-only">
                    Search applications
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      id="search"
                      name="search"
                      type="text"
                      placeholder="Search by name, organization, or country..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] dark:text-white"
                    />
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <label htmlFor="status-filter" className="sr-only">
                    Filter by status
                  </label>
                  <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B5A5] focus:border-[#00B5A5] dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="under review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="waiting for payment">
                      Waiting for Payment
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">
                🔍
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium mb-2">
                No applications match your filters
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            filteredApplications.map((application, index) => (
              <ApplicationCard
                key={application.id || index}
                application={application}
                index={index}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                formatBoolean={formatBoolean}
                router={router}
                userRole={userRole}
              />
            ))
          )}
        </div>

        {/* Results count for filtered view */}
        {!isSingleApplication && filteredApplications.length > 0 && (
          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredApplications.length} of {applications.length}{" "}
            applications
          </div>
        )}

        {/* Loading overlay for PDF generation */}
        {isGeneratingPDF && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B5A5] mb-4"></div>
              <p className="text-gray-900 dark:text-white font-medium">
                Generating PDF...
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Please wait while we prepare your document
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}