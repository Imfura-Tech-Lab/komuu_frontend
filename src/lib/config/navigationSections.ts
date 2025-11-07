import { NavigationSection } from "@/types/navigation";

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: "overview",
    label: "Overview",
    order: 1,
  },
  {
    id: "membership",
    label: "Membership",
    order: 2,
    condition: (userRole) => userRole !== "Member" && userRole !== "Pending",
  },
  {
    id: "finance",
    label: "Finance & Reports",
    order: 3,
    condition: (userRole) => userRole !== "Member" && userRole !== "Pending",
  },
  {
    id: "governance",
    label: "Governance",
    order: 4,
    condition: (userRole) => userRole === "Board",
  },
  {
    id: "engagement",
    label: "Engagement",
    order: 5,
    labelByRole: {
      Member: "Community & Resources",
      Pending: "Resources",
    },
  },
  {
    id: "communication",
    label: "Communication",
    order: 6,
    condition: (userRole) => userRole === "Administrator",
  },
  {
    id: "support",
    label: "Support",
    order: 7,
    condition: (userRole) => userRole === "Pending",
  },
  {
    id: "settings",
    label: "Settings",
    order: 8,
    condition: (userRole) => userRole === "Administrator" || userRole === "President",
  },
];