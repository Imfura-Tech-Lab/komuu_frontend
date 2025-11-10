import { useMemo } from "react";
import { NavigationItemType, UserRole } from "@/types";
import { NavigationSection } from "@/types/navigation";
import { NAVIGATION_SECTIONS } from "../config/navigationSections";
import { NAVIGATION_RULES } from "../config/navigationRules";

export interface GroupedNavigation {
  [sectionId: string]: {
    section: NavigationSection;
    items: NavigationItemType[];
  };
}

export function useNavigationGrouping(
  navigationItems: NavigationItemType[],
  userRole: UserRole
): GroupedNavigation {
  return useMemo(() => {
    // Initialize groups
    const groups: GroupedNavigation = {};

    // Create section containers
    NAVIGATION_SECTIONS.filter(
      (section) => !section.condition || section.condition(userRole)
    ).forEach((section) => {
      groups[section.id] = { section, items: [] };
    });

    // Categorize items
    navigationItems.forEach((item) => {
      const matchingRule = NAVIGATION_RULES.find((rule) => {
        // Check if item matches rule
        const nameMatches =
          rule.itemName instanceof RegExp
            ? rule.itemName.test(item.name)
            : rule.itemName === item.name;

        // Check condition if present
        const conditionPasses =
          !rule.condition || rule.condition(item, userRole);

        return nameMatches && conditionPasses;
      });

      if (matchingRule && groups[matchingRule.section]) {
        groups[matchingRule.section].items.push({
          ...item,
          order: matchingRule.order || 100,
        });
      }
    });

    // Sort items within each section
    Object.values(groups).forEach((group) => {
      group.items.sort((a, b) => (a.order || 100) - (b.order || 100));
    });

    return groups;
  }, [navigationItems, userRole]);
}