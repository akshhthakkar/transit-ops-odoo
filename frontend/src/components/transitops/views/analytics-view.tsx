"use client";

import * as React from "react";
import {
  BarChart3,
  Gauge,
  Fuel,
  TrendingUp,
  Route,
  Download,
  IdCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../page-header";
import { SectionCard } from "../section-card";
import { StatCard } from "../stat-card";
import { DomainStatusBadge } from "../status-badge";
import {
  MinimalAreaChart,
  MinimalBarChart,
  MinimalDonutChart,
} from "../charts";
import {
  vehicles,
  drivers,
  trips,
  fleetUtilizationSeries,
  costTrendSeries,
  tripsWeeklySeries,
  formatCurrency,
  formatNumber,
} from "@/lib/transit-data";

const typeColors: Record<string, string> = {
  Tractor: "#111827",
  "Box Truck": "#0d9488",
  Reefer: "#d97706",
  Flatbed: "#6b7280",
  "Sprinter Van": "#9ca3af",
  "Straight Truck": "#dc2626",
};

export function AnalyticsView() {
  const typeBreakdown = React.useMemo(() => {
    const map: Record<string, number> = {};
    vehicles.forEach((v) => {
      map[v.type] = (map[v.type] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: typeColors[name] ?? "#9ca3af",
    }));
  }, []);

  const topDrivers = React.useMemo(
    () => [...drivers].sort((a, b) => b.tripsCompleted - a.tripsCompleted).slice(0, 6),
    []
  );

  const totalMiles = trips.reduce((s, t) => s + t.distance, 0);
  const totalRevenue = trips.reduce((s, t) => s + t.revenue, 0);
  const revenuePerMile = totalMiles > 0 ? totalRevenue / totalMiles : 0;
  const avgUtilization = Math.round(
    vehicles.reduce((s, v) => s + v.utilization, 0) / vehicles.length
  );

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Insights" }, { label: "Analytics" }]}
        title="Fleet Analytics"
        description="Performance & efficiency metrics · last 7 months"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="size-4" /> Export Report
            </Button>
          </>
        }
      />

      {/* Efficiency KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Avg Utilization"
          value={`${avgUtilization}%`}
          icon={<Gauge className="size-4" />}
          delta={4}
          deltaLabel="vs last month"
          sparkData={fleetUtilizationSeries.map((d) => d.value)}
        />
        <StatCard
          label="Revenue / Mile"
          value={`$${revenuePerMile.toFixed(2)}`}
          icon={<TrendingUp className="size-4" />}
          delta={2.8}
          deltaLabel="vs last month"
          sparkData={[11.2, 11.6, 12.1, 11.9, 12.4, 12.8, 12.9]}
        />
        <StatCard
          label="Total Miles"
          value={formatNumber(totalMiles)}
          icon={<Route className="size-4" />}
          delta={6.2}
          deltaLabel="this period"
          sparkData={tripsWeeklySeries.map((d) => d.value * 200)}
        />
        <StatCard
          label="Fuel Cost / Mile"
          value="$0.58"
          icon={<Fuel className="size-4" />}
          delta={1.4}
          invertDelta
          deltaLabel="vs last month"
          sparkData={[0.61, 0.59, 0.6, 0.57, 0.58, 0.56, 0.58]}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Fleet Utilization"
          description="Daily utilization % · last 7 days"
          icon={<Gauge className="size-4" />}
        >
          <MinimalAreaChart
            data={fleetUtilizationSeries}
            xKey="label"
            series={[{ key: "value", name: "Utilization", color: "#0d9488" }]}
            height={260}
            valueFormatter={(v) => `${v}%`}
          />
        </SectionCard>

        <SectionCard
          title="Vehicle Types"
          description={`${vehicles.length} vehicles · 6 categories`}
          icon={<BarChart3 className="size-4" />}
        >
          <MinimalDonutChart
            data={typeBreakdown}
            height={200}
            centerValue={String(vehicles.length)}
            centerLabel="Vehicles"
          />
          <div className="mt-4 space-y-2">
            {typeBreakdown.map((t) => (
              <div key={t.name} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: t.color }} />
                <span className="text-muted-foreground">{t.name}</span>
                <span className="ml-auto font-medium text-foreground tnum">{t.value}</span>
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
          description="Fuel, maintenance & other · last 7 months"
          icon={<TrendingUp className="size-4" />}
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
            height={260}
            valueFormatter={(v) => formatCurrency(v, true)}
          />
        </SectionCard>

        <SectionCard
          title="Trips per Day"
          description="Weekly trip volume"
          icon={<Route className="size-4" />}
        >
          <MinimalBarChart
            data={tripsWeeklySeries}
            xKey="label"
            bars={[{ key: "value", name: "Trips", color: "#0d9488" }]}
            height={260}
            valueFormatter={(v) => `${v}`}
          />
        </SectionCard>
      </div>

      {/* Top drivers */}
      <SectionCard
        title="Top Performing Drivers"
        description="Ranked by completed trips"
        icon={<IdCard className="size-4" />}
        flush
      >
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70">
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">#</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Driver</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Base</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Trips</th>
                <th className="hidden px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">Hours</th>
                <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Rating</th>
                <th className="px-5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {topDrivers.map((d, i) => (
                <tr key={d.id} className="border-b border-border/50 transition-colors hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground tnum">
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground/70">
                        {d.initials}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.license}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{d.homeBase}</td>
                  <td className="px-5 py-3 text-right font-medium text-foreground tnum">{d.tripsCompleted}</td>
                  <td className="hidden px-5 py-3 text-right text-muted-foreground tnum sm:table-cell">{d.hoursThisWeek}h</td>
                  <td className="px-5 py-3 text-right text-foreground tnum">{d.rating.toFixed(1)}</td>
                  <td className="px-5 py-3">
                    <DomainStatusBadge status={d.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
