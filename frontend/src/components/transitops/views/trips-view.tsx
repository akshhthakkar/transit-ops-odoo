"use client";

import * as React from "react";
import {
  Route as RouteIcon,
  Plus,
  Download,
  MoreHorizontal,
  MapPin,
  ArrowRight,
  Clock,
  Package,
  Pencil,
  Eye,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "../page-header";
import { SectionCard } from "../section-card";
import { DomainStatusBadge } from "../status-badge";
import { FilterChips } from "../filter-chips";
import { StatCard } from "../stat-card";
import { DataTable, type Column } from "../tables/data-table";
import { formatCurrency, vehicleById, driverById, type Trip } from "@/lib/transit-data";
import { useTrips } from "@/hooks/queries";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_transit", label: "In Transit" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function Progress({ value, status }: { value: number; status: string }) {
  const color =
    status === "delayed" ? "#dc2626" : status === "completed" ? "#16a34a" : "#0d9488";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-foreground/[0.07]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-muted-foreground tnum">{value}%</span>
    </div>
  );
}

export function TripsView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<Trip | null>(null);
  const { data: trips = [], isLoading } = useTrips();

  const filtered = React.useMemo(
    () => (filter === "all" ? trips : trips.filter((t) => t.status === filter)),
    [filter, trips]
  );

  const options = statusOptions.map((o) => ({
    ...o,
    count: o.value === "all" ? trips.length : trips.filter((t) => t.status === o.value).length,
  }));

  const todayRevenue = trips
    .filter((t) => t.status === "completed" || t.status === "in_transit")
    .reduce((s, t) => s + t.revenue, 0);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading trips...</div>;

  const columns: Column<Trip>[] = [
    {
      key: "id",
      header: "Trip",
      cell: (t) => <span className="font-medium text-foreground">{t.id}</span>,
      sortValue: (t) => t.id,
    },
    {
      key: "route",
      header: "Route",
      cell: (t) => (
        <div className="flex max-w-[260px] items-center gap-1.5">
          <MapPin className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate text-foreground">
            {t.origin}
            <ArrowRight className="mx-1 inline size-3 text-muted-foreground/50" />
            {t.destination}
          </span>
        </div>
      ),
      sortValue: (t) => t.route,
    },
    {
      key: "vehicle",
      header: "Vehicle",
      cell: (t) => vehicleById(t.vehicleId)?.plate ?? "—",
      sortValue: (t) => vehicleById(t.vehicleId)?.plate ?? "",
      hideOnMobile: true,
    },
    {
      key: "driver",
      header: "Driver",
      cell: (t) => driverById(t.driverId)?.name ?? "—",
      sortValue: (t) => driverById(t.driverId)?.name ?? "",
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => <DomainStatusBadge status={t.status} />,
      sortValue: (t) => t.status,
    },
    {
      key: "progress",
      header: "Progress",
      cell: (t) => <Progress value={t.progress} status={t.status} />,
      sortValue: (t) => t.progress,
      hideOnMobile: true,
    },
    {
      key: "distance",
      header: "Distance",
      align: "right",
      cell: (t) => <span className="text-muted-foreground tnum">{t.distance} mi</span>,
      sortValue: (t) => t.distance,
      hideOnMobile: true,
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      cell: (t) => (
        <span className="font-medium text-foreground tnum">{formatCurrency(t.revenue)}</span>
      ),
      sortValue: (t) => t.revenue,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Operations" }, { label: "Trips" }]}
        title="Trips"
        description={`${trips.length} trips · ${trips.filter((t) => t.status === "in_transit").length} in transit`}
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="In Transit"
          value={trips.filter((t) => t.status === "in_transit").length}
          icon={<RouteIcon className="size-4" />}
          delta={2}
          deltaLabel="vs yesterday"
        />
        <StatCard
          label="Scheduled"
          value={trips.filter((t) => t.status === "scheduled").length}
          icon={<Clock className="size-4" />}
          delta={1}
          deltaLabel="vs yesterday"
        />
        <StatCard
          label="Completed"
          value={trips.filter((t) => t.status === "completed").length}
          icon={<Clock className="size-4" />}
          delta={3}
          deltaLabel="completed total"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(todayRevenue, true)}
          icon={<Package className="size-4" />}
          delta={5.4}
          deltaLabel="vs yesterday"
        />
      </div>

      <SectionCard flush>
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(t) => t.id}
          onRowClick={(t) => setSelected(t)}
          searchable
          searchFn={(t, q) =>
            t.id.toLowerCase().includes(q) ||
            t.route.toLowerCase().includes(q) ||
            t.cargo.toLowerCase().includes(q) ||
            (vehicleById(t.vehicleId)?.plate ?? "").toLowerCase().includes(q) ||
            (driverById(t.driverId)?.name ?? "").toLowerCase().includes(q)
          }
          searchPlaceholder="Search by trip, route, vehicle…"
          pageSize={10}
          toolbar={<FilterChips options={options} value={filter} onChange={setFilter} />}
          actions={(t) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelected(t)}>
                  <Eye className="size-4" /> View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="size-4" /> Edit trip
                </DropdownMenuItem>
                <DropdownMenuItem>Track live</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger focus:text-danger">
                  <XCircle className="size-4" /> Cancel trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </SectionCard>

      <TripDetailSheet trip={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function DetailRow({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

function TripDetailSheet({
  trip,
  onClose,
}: {
  trip: Trip | null;
  onClose: () => void;
}) {
  const vehicle = trip ? vehicleById(trip.vehicleId) : null;
  const driver = trip ? driverById(trip.driverId) : null;
  return (
    <Sheet open={!!trip} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {trip && (
          <>
            <SheetHeader className="space-y-3">
              <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground/70">
                <RouteIcon className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-lg">{trip.id}</SheetTitle>
                <SheetDescription>{trip.cargo} · {trip.weightLb.toLocaleString()} lb</SheetDescription>
              </div>
              <div>
                <DomainStatusBadge status={trip.status} />
              </div>
            </SheetHeader>

            <div className="mt-5 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Origin</p>
                  <p className="text-sm font-medium text-foreground">{trip.origin}</p>
                </div>
                <ArrowRight className="mx-3 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 text-right">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Destination</p>
                  <p className="text-sm font-medium text-foreground">{trip.destination}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground tnum">{trip.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${trip.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 divide-y divide-border/60">
              <h4 className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Trip Details
              </h4>
              <DetailRow label="Vehicle" icon={<Package className="size-3.5" />}>
                {vehicle?.plate} · {vehicle?.model}
              </DetailRow>
              <DetailRow label="Driver" icon={<MapPin className="size-3.5" />}>
                {driver?.name}
              </DetailRow>
              <DetailRow label="Departure" icon={<Clock className="size-3.5" />}>
                {new Date(trip.departure).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </DetailRow>
              <DetailRow label="ETA" icon={<Clock className="size-3.5" />}>
                {new Date(trip.eta).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </DetailRow>
              <DetailRow label="Distance" icon={<MapPin className="size-3.5" />}>
                {trip.distance} miles
              </DetailRow>
              <DetailRow label="Cargo" icon={<Package className="size-3.5" />}>
                {trip.cargo}
              </DetailRow>
              <DetailRow label="Revenue" icon={<Package className="size-3.5" />}>
                {formatCurrency(trip.revenue)}
              </DetailRow>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
