import { useState, useMemo } from "react";
import { Application } from "@/types";

export const useApplicationFilters = (applications: Application[]) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
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
  }, [applications, filterStatus, searchTerm]);

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

  return {
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    filteredApplications,
    getStatusStats
  };
};
