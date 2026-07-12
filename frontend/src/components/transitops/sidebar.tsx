"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useNav, type NavKey } from "@/store/nav";
import { navGroups, isKeyAllowedForRole } from "./nav-config";
import { useAuthStore } from "@/store/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { kpis } from "@/lib/transit-data";

import { useVehicles, useDrivers, useTrips, useMaintenance } from "@/hooks/queries";

function BrandMark() {
  return (
    <div className="flex items-center px-1 py-1.5">
      <img src="/assets/shift-logo.png" alt="Shift" style={{ height: "44px", objectFit: "contain" }} />
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { active, set } = useNav();
  const { user } = useAuthStore();
  const role = user?.role ?? "";

  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();
  const { data: trips = [] } = useTrips();
  const { data: maintenance = [] } = useMaintenance();

  const counts: Record<string, number> = {
    vehicles: vehicles.length,
    drivers: drivers.length,
    trips: trips.length,
    maintenance: maintenance.filter((m) => m.status !== "completed").length,
  };

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isKeyAllowedForRole(item.key, role)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {filteredGroups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-2.5 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {group.label}
          </p>
          {group.items.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            const badge = counts[item.key] !== undefined ? counts[item.key] : item.badge;

            return (
              <button
                key={item.key}
                onClick={() => {
                  set(item.key as NavKey);
                  onNavigate?.();
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-foreground/[0.05] font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-brand"
                    aria-hidden
                  />
                )}
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                  strokeWidth={2}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {badge !== undefined && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium tnum",
                      isActive
                        ? "bg-foreground/10 text-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function FleetStatus() {
  const { data: vehicles = [] } = useVehicles();
  
  const activeVehicles = vehicles.filter((v) => v.status === "active").length;
  
  const utilizationSum = vehicles.reduce((s, v) => {
    const util = (v as any).utilization ?? (v.status === "active" ? 85 : v.status === "available" ? 65 : 0);
    return s + util;
  }, 0);
  
  const fleetUtilization = Math.round(utilizationSum / (vehicles.length || 1));

  return (
    <div className="mx-3 mb-3 rounded-lg border border-border bg-muted/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">Fleet Status</p>
        <span className="size-1.5 rounded-full bg-success" />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        All systems operational
      </p>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.06]">
        <div
          className="h-full rounded-full bg-foreground/80"
          style={{ width: `${fleetUtilization}%` }}
        />
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        {fleetUtilization}% utilization · {activeVehicles} active
      </p>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-14 items-center border-b border-border px-4">
        <BrandMark />
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        <NavList />
      </div>
      <FleetStatus />
    </aside>
  );
}

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen } = useNav();
  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-[260px] border-border p-0">
        <SheetHeader className="h-14 border-b border-border px-4">
          <SheetTitle asChild>
            <div>
              <BrandMark />
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="scrollbar-thin h-[calc(100vh-3.5rem)] overflow-y-auto">
          <NavList onNavigate={() => setMobileNavOpen(false)} />
          <FleetStatus />
        </div>
      </SheetContent>
    </Sheet>
  );
}
