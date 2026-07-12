"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/transitops/app-shell";
import { useNav, type NavKey } from "@/store/nav";
import { useAuthStore } from "@/store/auth";
import { isKeyAllowedForRole } from "@/components/transitops/nav-config";
import { DashboardView } from "@/components/transitops/views/dashboard-view";
import { VehiclesView } from "@/components/transitops/views/vehicles-view";
import { DriversView } from "@/components/transitops/views/drivers-view";
import { TripsView } from "@/components/transitops/views/trips-view";
import { MaintenanceView } from "@/components/transitops/views/maintenance-view";
import { ExpensesView } from "@/components/transitops/views/expenses-view";
import { AnalyticsView } from "@/components/transitops/views/analytics-view";

export default function DashboardPage() {
  const { active, set } = useNav();
  const { token, user, hydrate } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  React.useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [hydrated, token, router]);

  React.useEffect(() => {
    if (hydrated && token && user) {
      if (!isKeyAllowedForRole(active, user.role)) {
        const firstAllowed = (["dashboard", "vehicles", "drivers", "trips", "maintenance", "expenses", "analytics"] as NavKey[]).find(
          (key) => isKeyAllowedForRole(key, user.role)
        );
        if (firstAllowed) {
          set(firstAllowed);
        }
      }
    }
  }, [hydrated, token, user, active, set]);

  if (!hydrated || !token) return null;

  return (
    <AppShell>
      {active === "dashboard" && <DashboardView />}
      {active === "vehicles" && <VehiclesView />}
      {active === "drivers" && <DriversView />}
      {active === "trips" && <TripsView />}
      {active === "maintenance" && <MaintenanceView />}
      {active === "expenses" && <ExpensesView />}
      {active === "analytics" && <AnalyticsView />}
    </AppShell>
  );
}
