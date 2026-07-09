import type { ComponentType } from "react";
import MainIcon from "@/shared/ui/icons/MainIcon";
import EventIcon from "@/shared/ui/icons/EventIcon";
import ErrorIcon from "@/shared/ui/icons/ErrorIcon";
import SettingIcon from "@/shared/ui/icons/SettingIcon";

interface IconProps {
  className?: string;
  color?: string;
}

export interface NavItem {
  label: string;
  href: string;
  // exact: true이면 pathname === href 일 때만 활성화 (하위 경로 제외)
  exact?: boolean;
  icon?: ComponentType<IconProps>;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Main", href: "/dashboard", exact: true, icon: MainIcon },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: EventIcon,
    children: [
      { label: "Trends", href: "/dashboard/events/trends" },
      { label: "Lifecycle", href: "/dashboard/events/lifecycle" },
      { label: "Retention", href: "/dashboard/events/retention" },
      { label: "Funnels", href: "/dashboard/events/funnels" },
      { label: "Paths", href: "/dashboard/events/paths" },
    ],
  },
  {
    label: "Errors",
    href: "/dashboard/errors",
    icon: ErrorIcon,
    children: [
      { label: "Trends", href: "/dashboard/errors/list" },
      { label: "Analysis", href: "/dashboard/errors/analysis" },
    ],
  },
  { label: "Settings", href: "/dashboard/settings", icon: SettingIcon },
];
