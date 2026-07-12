import { create } from "zustand";

export type NavKey =
  | "dashboard"
  | "vehicles"
  | "drivers"
  | "trips"
  | "maintenance"
  | "expenses"
  | "analytics"
  | "alerts";

interface NavState {
  active: NavKey;
  set: (key: NavKey) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

export const useNav = create<NavState>((set) => ({
  active: "dashboard",
  set: (key) => set({ active: key, mobileNavOpen: false }),
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}));
