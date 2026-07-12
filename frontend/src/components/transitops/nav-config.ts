import {
  LayoutDashboard,
  Truck,
  IdCard,
  Route,
  Wrench,
  Receipt,
  BarChart3,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { NavKey } from "@/store/nav";

export interface NavItem {
  key: NavKey;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "vehicles", label: "Vehicles", icon: Truck, badge: 18 },
      { key: "drivers", label: "Drivers", icon: IdCard, badge: 14 },
      { key: "trips", label: "Trips", icon: Route, badge: 9 },
      { key: "maintenance", label: "Maintenance", icon: Wrench, badge: 4 },
    ],
  },
  {
    label: "Insights",
    items: [
      { key: "expenses", label: "Expenses", icon: Receipt },
      { key: "analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

export function isKeyAllowedForRole(key: NavKey, role: string): boolean {
  switch (role) {
    case "FLEET_MANAGER":
      return true;
    case "DRIVER":
      return key === "trips" || key === "expenses";
    case "SAFETY_OFFICER":
      return key === "dashboard" || key === "vehicles" || key === "drivers" || key === "maintenance" || key === "analytics";
    case "FINANCIAL_ANALYST":
      return key === "dashboard" || key === "vehicles" || key === "expenses" || key === "analytics";
    default:
      return false;
  }
}
