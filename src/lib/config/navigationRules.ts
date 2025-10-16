import { NavigationRule } from "@/types/navigation";

export const NAVIGATION_RULES: NavigationRule[] = [
  // Main section
  { itemName: "Dashboard", section: "main", order: 1 },
  { itemName: "My Profile", section: "main", order: 2 },

  {
    itemName: "Fields of Practice",
    section: "professional",
    order: 1,
    condition: (item, userRole) => userRole !== "Member",
  },

  // Management section
  { itemName: /.*Management.*/, section: "management" },
  { itemName: /.*Applications.*/, section: "management" },
  { itemName: "Board Management", section: "management" },
  { itemName: "Certificate Authority", section: "management" },

  // Data section
  { itemName: /.*Overview.*/, section: "data" },
  { itemName: /.*Analytics.*/, section: "data" },
  { itemName: /.*Payment.*/, section: "data" },
  { itemName: /.*Certificate.*/, section: "data" },
  { itemName: /.*Member.*/, section: "data" },
  { itemName: "Applications List", section: "data" },
  { itemName: "Member Directory", section: "data" },
  { itemName: "Payment Records", section: "data" },
  { itemName: "Certificates Registry", section: "data" },

  // Default fallback - everything else goes to tools
  { itemName: /.+/, section: "tools", order: 999 },
];
