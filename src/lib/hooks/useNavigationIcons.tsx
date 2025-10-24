import { useCallback, JSX } from "react";
import {
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  UsersIcon,
  CreditCardIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  VideoCameraIcon,
  LightBulbIcon,
  PencilSquareIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export function useNavigationIcons() {
  return useCallback((iconName?: string): JSX.Element | null => {
    const icons: { [key: string]: JSX.Element } = {
      // Base icons
      dashboard: <HomeIcon className="h-5 w-5 mr-3" />,
      profile: <UserIcon className="h-5 w-5 mr-3" />,
      
      // Admin/Management icons
      fields_of_practice: <BriefcaseIcon className="h-5 w-5 mr-3" />,
      applications: <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />,
      members: <UsersIcon className="h-5 w-5 mr-3" />,
      board_manage: <UserGroupIcon className="h-5 w-5 mr-3" />,
      payments: <CreditCardIcon className="h-5 w-5 mr-3" />,
      certificates: <AcademicCapIcon className="h-5 w-5 mr-3" />,
      certificate_sign: <PencilSquareIcon className="h-5 w-5 mr-3" />,
      analytics: <ChartBarIcon className="h-5 w-5 mr-3" />,
      notifications: <BellIcon className="h-5 w-5 mr-3" />,
      settings: <CogIcon className="h-5 w-5 mr-3" />,
      
      // Executive/Leadership icons
      executive: <BuildingOfficeIcon className="h-5 w-5 mr-3" />,
      strategy: <LightBulbIcon className="h-5 w-5 mr-3" />,
      board: <BuildingOfficeIcon className="h-5 w-5 mr-3" />,
      meetings: <CalendarIcon className="h-5 w-5 mr-3" />,
      policies: <DocumentTextIcon className="h-5 w-5 mr-3" />,
      
      // Community/Team icons (Parent)
      community: <UserGroupIcon className="h-5 w-5 mr-3" />,
      team: <UserGroupIcon className="h-5 w-5 mr-3" />,
      
      // Community/Team children icons (smaller)
      teams: <UserCircleIcon className="h-4 w-4 mr-3" />,
      groups: <UserGroupIcon className="h-4 w-4 mr-3" />,
      conversations: <ChatBubbleLeftRightIcon className="h-4 w-4 mr-3" />,
      conference: <VideoCameraIcon className="h-4 w-4 mr-3" />,
      events: <CalendarIcon className="h-4 w-4 mr-3" />,
      resources: <FolderIcon className="h-4 w-4 mr-3" />,
      shared_resources: <FolderIcon className="h-4 w-4 mr-3" />,
      
      // Pending user icons
      status: <ChartBarIcon className="h-5 w-5 mr-3" />,
      help: <QuestionMarkCircleIcon className="h-5 w-5 mr-3" />,
    };

    return icons[iconName || ""] || null;
  }, []);
}