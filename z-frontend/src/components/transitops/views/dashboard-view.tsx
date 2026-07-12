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
  kpis,
  vehicles,
  trips,
  alerts,
  maintenance,
  fleetUtilizationSeries,
  costTrendSeries,
  recentTrips,
  upcomingMaintenance,
  licenseExpiryAlerts,
  vehicleById,
  driverById,
  formatCurrency,
  formatNumber,
  type AlertSeverity,
} from "@/lib/transit-data";

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
  const costBreakdown = [
    { name: "Fuel", value: kpis.fuelCostMonth, color: "#111827" },
    { name: "Maintenance", value: kpis.maintenanceCostMonth, color: "#d97706" },
    { name: "Other", value: 75600, color: "#9ca3af" },
  ];

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
  }, []);

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
        <StatCard
          label="Fuel Cost (MTD)"
          value={formatCurrency(kpis.fuelCostMonth, true)}
          icon={<Fuel className="size-4" />}
          delta={3.6}
          invertDelta
          deltaLabel="vs last month"
          sparkData={[169800, 176400, 182900]}
        />
        <StatCard
          label="Maintenance (MTD)"
          value={formatCurrency(kpis.maintenanceCostMonth, true)}
          icon={<Wrench className="size-4" />}
          delta={-8.2}
          invertDelta
          deltaLabel="vs last month"
          sparkData={[47600, 53400, 49100]}
        />
        <StatCard
          label="Operational Cost"
          value={formatCurrency(kpis.operationalCostMonth, true)}
          icon={<Wallet className="size-4" />}
          delta={2.1}
          invertDelta
          deltaLabel="vs last month"
          sparkData={[291400, 302800, 307600]}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Fleet Utilization"
          description="Daily utilization across 18 vehicles · last 7 days"
          icon={<Gauge className="size-4" />}
          action={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-brand" /> Utilization
              </span>
            </div>
          }
        >
          <MinimalAreaChart
            data={fleetUtilizationSeries}
            xKey="label"
            series={[{ key: "value", name: "Utilization", color: "#0d9488" }]}
            height={248}
            valueFormatter={(v) => `${v}%`}
          />
        </SectionCard>

        <SectionCard
          title="Cost Breakdown"
          description="September MTD · $307.6k total"
          icon={<DollarSign className="size-4" />}
        >
          <MinimalDonutChart
            data={costBreakdown}
            height={200}
            centerValue={formatCurrency(307600, true)}
            centerLabel="Total"
            valueFormatter={(v) => formatCurrency(v, true)}
          />
          <div className="mt-4 space-y-2">
            {costBreakdown.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 rounded-sm"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="ml-auto font-medium text-foreground tnum">
                  {formatCurrency(c.value, true)}
                </span>
                <span className="w-10 text-right text-xs text-muted-foreground tnum">
                  {Math.round((c.value / 307600) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Operational Cost Trend"
          description="Fuel, maintenance & other costs · last 7 months"
          icon={<Wallet className="size-4" />}
          action={
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              7 months <ArrowRight className="size-3.5" />
            </Button>
          }
        >
          <MinimalBarChart
            data={costTrendSeries}
            xKey="label"
            stacked
            bars={[
              { key: "fuel", name: "Fuel", color: "#111827" },
              { key: "maintenance", name: "Maintenance", color: "#d97706" },
              { key: "other", name: "Other", color: "#9ca3af" },
            ]}
            height={248}
            valueFormatter={(v) => formatCurrency(v, true)}
          />
        </SectionCard>

        <SectionCard
          title="Fleet Status"
          description={`${vehicles.length} vehicles in fleet`}
          icon={<Truck className="size-4" />}
        >
          <MinimalDonutChart
            data={statusCounts}
            height={200}
            centerValue={String(kpis.activeVehicles)}
            centerLabel="Active"
          />
          <div className="mt-4 grid grid-cols-1 gap-1.5">
            {statusCounts.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="ml-auto font-medium text-foreground tnum">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent trips + alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          flush
          title="Recent Trips"
          description="Latest trip activity across the fleet"
          icon={<Route className="size-4" />}
          action={
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              View all <ArrowRight className="size-3.5" />
            </Button>
          }
        >
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Trip</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Route</th>
                  <th className="hidden px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:table-cell">Vehicle</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="hidden px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((t) => {
                  const v = vehicleById(t.vehicleId);
                  return (
                    <tr key={t.id} className="border-b border-border/50 transition-colors hover:bg-muted/40">
                      <td className="px-5 py-2.5">
                        <span className="font-medium text-foreground">{t.id}</span>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <MapPin className="size-3 text-muted-foreground" />
                          <span className="max-w-[220px] truncate">{t.route}</span>
                        </div>
                      </td>
                      <td className="hidden px-5 py-2.5 text-muted-foreground md:table-cell">
                        {v?.plate}
                      </td>
                      <td className="px-5 py-2.5">
                        <DomainStatusBadge status={t.status} />
                      </td>
                      <td className="hidden px-5 py-2.5 text-right font-medium text-foreground tnum sm:table-cell">
                        {formatCurrency(t.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Alerts"
          description={`${alerts.filter((a) => !a.acknowledged).length} unacknowledged`}
          icon={<TriangleAlert className="size-4" />}
          action={
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              All <ArrowRight className="size-3.5" />
            </Button>
          }
          bodyClassName="p-0"
        >
          <div className="scrollbar-thin max-h-[420px] divide-y divide-border/50 overflow-y-auto">
            {alerts.slice(0, 7).map((a) => {
              const meta = severityMeta[a.severity];
              const Icon = meta.icon;
              return (
                <div key={a.id} className="flex gap-3 px-5 py-3 hover:bg-muted/40">
                  <Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      a.severity === "critical" && "text-danger",
                      a.severity === "warning" && "text-warning",
                      a.severity === "info" && "text-muted-foreground"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {a.type}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {a.time}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">{a.ref}</span> — {a.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Upcoming maintenance + license expiry */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          flush
          title="Upcoming Maintenance"
          description="Scheduled, overdue & in-progress service items"
          icon={<Wrench className="size-4" />}
          action={
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              View all <ArrowRight className="size-3.5" />
            </Button>
          }
        >
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Vehicle</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Service Type</th>
                  <th className="hidden px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Technician</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Scheduled</th>
                  <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cost</th>
                </tr>
              </thead>
              <tbody>
                {upcomingMaintenance.map((m) => {
                  const v = vehicleById(m.vehicleId);
                  return (
                    <tr key={m.id} className="border-b border-border/50 transition-colors hover:bg-muted/40">
                      <td className="px-5 py-2.5">
                        <span className="font-medium text-foreground">{v?.plate}</span>
                        <span className="ml-1.5 text-xs text-muted-foreground">{v?.model}</span>
                      </td>
                      <td className="px-5 py-2.5 text-foreground">{m.type}</td>
                      <td className="hidden px-5 py-2.5 text-muted-foreground sm:table-cell">
                        {m.technician}
                      </td>
                      <td className="px-5 py-2.5 text-muted-foreground tnum">{m.scheduled}</td>
                      <td className="px-5 py-2.5">
                        <DomainStatusBadge status={m.status} />
                      </td>
                      <td className="px-5 py-2.5 text-right font-medium text-foreground tnum">
                        {formatCurrency(m.cost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="License Expiry Alerts"
          description="Drivers with CDL expiring within 90 days"
          icon={<CalendarClock className="size-4" />}
          bodyClassName="p-0"
        >
          <div className="divide-y divide-border/50">
            {licenseExpiryAlerts.map(({ driver, days }) => {
              const tone: Tone = days <= 14 ? "danger" : days <= 45 ? "warning" : "info";
              return (
                <div key={driver.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40">
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground/70">
                    {driver.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {driver.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {driver.license} · {driver.homeBase}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge tone={tone} dot>
                      {days <= 0 ? "Expired" : `${days}d`}
                    </StatusBadge>
                    <p className="mt-1 text-[10px] text-muted-foreground tnum">
                      {driver.licenseExpiry}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
