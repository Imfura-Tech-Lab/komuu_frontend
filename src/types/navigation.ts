import { NavigationItemType, UserRole } from ".";

export interface NavigationSection {
  id: string;
  label: string;
  order: number;
  condition?: (userRole: UserRole) => boolean;
  labelByRole?: Partial<Record<UserRole, string>>;
}

export interface NavigationRule {
  itemName: string | RegExp;
  section: string;
  order?: number;
  condition?: (item: NavigationItemType, userRole: UserRole) => boolean;
}
