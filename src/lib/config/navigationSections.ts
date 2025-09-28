import { NavigationSection } from "@/types/navigation";


export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: "main",
    label: "Main",
    order: 1,
  },
  {
    id: "professional",
    label: "Professional",
    order: 2,
    condition: (userRole) => userRole !== "Member",
  },
  {
    id: "management",
    label: "Management",
    order: 3,
    labelByRole: {
      Administrator: "Administration",
      President: "Management",
      Board: "Management",
    },
  },
  {
    id: "data",
    label: "Data & Reports",
    order: 4,
  },
  {
    id: "tools",
    label: "Tools",
    order: 5,
    labelByRole: {
      Pending: "Support",
      Member: "Resources",
      Board: "Tools",
      President: "Tools",
      Administrator: "Tools",
    },
  },
];
