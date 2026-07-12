"use client";

import * as React from "react";
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
import { LoginView } from "@/components/transitops/views/login-view";

export default function Home() {
  const { active } = useNav();
  const { token, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = React.useState(false);

  // Hydrate auth state from localStorage on first render
  React.useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  // Avoid flash of login screen while hydrating
  if (!hydrated) return null;

  // Show login screen if not authenticated
  if (!token) return <LoginView />;

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
