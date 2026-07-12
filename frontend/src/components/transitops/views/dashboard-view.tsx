"use client";

import * as React from "react";
import {
  Truck,
  IdCard,
  Route,
  Wrench,
  Gauge,
  Fuel,
  DollarSign,
  Wallet,
  ArrowRight,
  CalendarClock,
  TriangleAlert,
  Download,
  Plus,
  CircleAlert,
  CircleCheck,
  Info,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../page-header";
import { StatCard } from "../stat-card";
import { SectionCard } from "../section-card";
import { StatusBadge, DomainStatusBadge, type Tone } from "../status-badge";
import { Sparkline } from "../charts/sparkline";
import {
  MinimalAreaChart,
  MinimalBarChart,
  MinimalDonutChart,
} from "../charts";
import {
  alerts,
  fleetUtilizationSeries,
  costTrendSeries,
  vehicleById,
  driverById,
  formatCurrency,
  formatNumber,
  daysUntil,
  type AlertSeverity,
} from "@/lib/transit-data";
import { useMaintenance, useDashboardSummary, useVehicles, useTrips, useDrivers } from "@/hooks/queries";

const severityMeta: Record<AlertSeverity, { tone: Tone; icon: typeof CircleAlert }> = {
  critical: { tone: "danger", icon: CircleAlert },
  warning: { tone: "warning", icon: TriangleAlert },
  info: { tone: "info", icon: Info },
};

const vehicleStatusTone: Record<string, Tone> = {
  active: "success",
  available: "brand",
  maintenance: "warning",
  idle: "neutral",
  offline: "danger",
};

export function DashboardView() {
  const { data: summary, isLoading: isLoadingSummary } = useDashboardSummary();
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useVehicles();
  const { data: trips = [], isLoading: isLoadingTrips } = useTrips();
  const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers();
  const { data: maintenance = [], isLoading: isLoadingMaintenance } = useMaintenance();

  const costBreakdown = React.useMemo(() => {
    const fuel = summary?.fuelCostMonth ?? 0;
    const maint = summary?.maintenanceCostMonth ?? 0;
    const op = summary?.operationalCostMonth ?? 0;
    const other = Math.max(0, op - fuel - maint);
    return [
      { name: "Fuel", value: fuel, color: "#111827" },
      { name: "Maintenance", value: maint, color: "#d97706" },
      { name: "Other", value: other, color: "#9ca3af" },
    ];
  }, [summary]);

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((v) => {
      counts[v.status] = (counts[v.status] ?? 0) + 1;
    });
    return [
      { name: "Active", value: counts.active ?? 0, color: "#16a34a" },
      { name: "Available", value: counts.available ?? 0, color: "#0d9488" },
      { name: "Maintenance", value: counts.maintenance ?? 0, color: "#d97706" },
      { name: "Idle", value: counts.idle ?? 0, color: "#9ca3af" },
      { name: "Offline", value: counts.offline ?? 0, color: "#dc2626" },
    ];
  }, [vehicles]);

  const recentTrips = React.useMemo(() => {
    return [...trips]
      .sort((a, b) => new Date(b.departure).getTime() - new Date(a.departure).getTime())
      .slice(0, 8);
  }, [trips]);

  const upcomingMaintenance = React.useMemo(() => {
    return [...maintenance]
      .filter((m) => m.status !== "completed")
      .sort((a, b) => a.scheduled.localeCompare(b.scheduled))
      .slice(0, 6);
  }, [maintenance]);

  const licenseExpiryAlerts = React.useMemo(() => {
    return [...drivers]
      .map((d) => ({ driver: d, days: daysUntil(d.licenseExpiry) }))
      .filter((x) => x.days <= 90)
      .sort((a, b) => a.days - b.days);
  }, [drivers]);

  if (isLoadingSummary || isLoadingVehicles || isLoadingTrips || isLoadingDrivers || isLoadingMaintenance) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading operations overview...
      </div>
    );
  }

  const kpis = {
    activeVehicles: summary?.activeVehicles ?? 0,
    availableVehicles: summary?.availableVehicles ?? 0,
    maintenanceVehicles: summary?.maintenanceVehicles ?? 0,
    driversOnDuty: summary?.driversOnDuty ?? 0,
    activeTrips: summary?.activeTrips ?? 0,
    pendingTrips: summary?.pendingTrips ?? 0,
    fleetUtilization: summary?.fleetUtilization ?? 0,
    fuelCostMonth: summary?.fuelCostMonth ?? 0,
    maintenanceCostMonth: summary?.maintenanceCostMonth ?? 0,
    operationalCostMonth: summary?.operationalCostMonth ?? 0,
  };


  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Operations" }, { label: "Dashboard" }]}
        title="Operations Overview"
        description="Real-time fleet performance for Thursday, September 4, 2025"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="h-8">
              <Plus className="size-4" /> New Trip
            </Button>
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard
          label="Active Vehicles"
          value={kpis.activeVehicles}
          icon={<Truck className="size-4" />}
          delta={2}
          deltaLabel="vs last week"
          sparkData={[7, 8, 8, 9, 9, 8, 9]}
        />
        <StatCard
          label="Available"
          value={kpis.availableVehicles}
          icon={<Truck className="size-4" />}
          delta={0}
          deltaLabel="vs last week"
          sparkData={[5, 4, 4, 3, 4, 4, 4]}
        />
        <StatCard
          label="In Maintenance"
          value={kpis.maintenanceVehicles}
          icon={<Wrench className="size-4" />}
          delta={1}
          invertDelta
          deltaLabel="vs last week"
          sparkData={[1, 1, 2, 1, 2, 2, 2]}
        />
        <StatCard
          label="Drivers On Duty"
          value={kpis.driversOnDuty}
          icon={<IdCard className="size-4" />}
          delta={-1}
          deltaLabel="vs last week"
          sparkData={[10, 9, 9, 10, 9, 9, 9]}
        />
        <StatCard
          label="Active Trips"
          value={kpis.activeTrips}
          icon={<Route className="size-4" />}
          delta={3}
          deltaLabel="vs yesterday"
          sparkData={[6, 7, 8, 7, 9, 8, 9]}
        />
        <StatCard
          label="Pending Trips"
          value={kpis.pendingTrips}
          icon={<Route className="size-4" />}
          delta={-2}
          deltaLabel="vs yesterday"
          sparkData={[5, 4, 4, 3, 4, 3, 3]}
        />
        <StatCard
          label="Fleet Utilization"
          value={`${kpis.fleetUtilization}%`}
          icon={<Gauge className="size-4" />}
          delta={4}
          deltaLabel="vs last week"
          sparkData={fleetUtilizationSeries.map((d) => d.value)}
        />

      </div>
    </div>
  );
}
