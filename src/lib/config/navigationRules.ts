import { NavigationRule } from "@/types/navigation";

export const NAVIGATION_RULES: NavigationRule[] = [
  // Overview section
  { itemName: "Dashboard", section: "overview", order: 1 },
  { itemName: "Profile", section: "overview", order: 2 },
  { itemName: "My Profile", section: "overview", order: 2 },
  { itemName: "Application Status", section: "overview", order: 3 },
  { itemName: "Application", section: "overview", order: 4 },
  { itemName: "Payments", section: "overview", order: 5 },
  { itemName: "Certificates", section: "overview", order: 6 },

  // Membership section
  {
    itemName: /.*Application Management.*/,
    section: "membership",
    order: 1,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
    itemName: /.*Applications.*/,
    section: "membership",
    order: 2,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
    itemName: /.*Member Management.*/,
    section: "membership",
    order: 3,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
    itemName: /.*Members.*/,
    section: "membership",
    order: 4,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
    itemName: /.*Certificate.*/,
    section: "membership",
    order: 5,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
    itemName: "Fields of Practice",
    section: "membership",
    order: 6,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
  itemName: "Membership Categories",
    section: "membership",
    order: 7,
    condition: (item, userRole) => userRole !== "Member" && userRole !== "Pending",
  },
  // Finance section
  {
    itemName: /.*Payment Overview.*/,
    section: "finance",
    order: 1,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
    itemName: "Financial",
    section: "finance",
    order: 2,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
    itemName: /.*Analytics.*/,
    section: "finance",
    order: 3,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },
  {
    itemName: /.*Reports.*/,
    section: "finance",
    order: 4,
    condition: (item, userRole) =>
      userRole !== "Member" && userRole !== "Pending",
  },

  // Governance section
  {
    itemName: /.*Policy.*/,
    section: "governance",
    order: 1,
    condition: (item, userRole) => userRole === "Board",
  },

  // Engagement section
  { itemName: /.*Events.*/, section: "engagement", order: 1 },
  { itemName: /.*Conference.*/, section: "engagement", order: 2 },
  { itemName: /.*Resources.*/, section: "engagement", order: 3 },
  { itemName: "Board Members", section: "engagement", order: 4 },
  { itemName: /.*Community.*/, section: "engagement", order: 5 },
  { itemName: /.*Teams.*/, section: "engagement", order: 6 },
  { itemName: /.*Groups.*/, section: "engagement", order: 7 },

  // Communication section
  {
    itemName: /.*Notification.*/,
    section: "communication",
    order: 1,
    condition: (item, userRole) => userRole === "Administrator",
  },

  // Support section
  {
    itemName: /.*Help.*/,
    section: "support",
    order: 1,
    condition: (item, userRole) => userRole === "Pending",
  },
  {
    itemName: /.*Support.*/,
    section: "support",
    order: 2,
    condition: (item, userRole) => userRole === "Pending",
  },

  // Settings section
  {
    itemName: /.*Settings.*/,
    section: "settings",
    order: 1,
    condition: (item, userRole) =>
      userRole === "Administrator" || userRole === "President",
  },

  // Default fallback - should rarely be used with explicit section assignments
  { itemName: /.+/, section: "engagement", order: 999 },
];