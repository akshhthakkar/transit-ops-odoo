"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/transitops/app-shell";
import { useNav } from "@/store/nav";
import { useAuthStore } from "@/store/auth";
import { DashboardView } from "@/components/transitops/views/dashboard-view";
import { VehiclesView } from "@/components/transitops/views/vehicles-view";
import { DriversView } from "@/components/transitops/views/drivers-view";
import { TripsView } from "@/components/transitops/views/trips-view";
import { MaintenanceView } from "@/components/transitops/views/maintenance-view";
import { ExpensesView } from "@/components/transitops/views/expenses-view";
import { AnalyticsView } from "@/components/transitops/views/analytics-view";
import { AlertsView } from "@/components/transitops/views/alerts-view";

export default function DashboardPage() {
  const { active } = useNav();
  const { token, hydrate } = useAuthStore();
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
      {active === "alerts" && <AlertsView />}
    </AppShell>
  );
}
