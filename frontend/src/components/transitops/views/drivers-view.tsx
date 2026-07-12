"use client";

import * as React from "react";
import {
  IdCard,
  Plus,
  Download,
  MoreHorizontal,
  Phone,
  MapPin,
  Star,
  Clock,
  Truck,
  CalendarClock,
  Pencil,
  Eye,
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
import { StatusBadge, DomainStatusBadge, type Tone } from "../status-badge";
import { FilterChips } from "../filter-chips";
import { DataTable, type Column } from "../tables/data-table";
import { daysUntil, vehicleById, driverById, type Driver } from "@/lib/transit-data";
import { useDrivers } from "@/hooks/queries";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "on_duty", label: "On Duty" },
  { value: "off_duty", label: "Off Duty" },
  { value: "available", label: "Available" },
  { value: "on_leave", label: "On Leave" },
];

export function DriversView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<Driver | null>(null);
  const { data: drivers = [], isLoading } = useDrivers();

  const filtered = React.useMemo(
    () => (filter === "all" ? drivers : drivers.filter((d) => d.status === filter)),
    [filter, drivers]
  );

  const options = statusOptions.map((o) => ({
    ...o,
    count: o.value === "all" ? drivers.length : drivers.filter((d) => d.status === o.value).length,
  }));

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading drivers...</div>;

  const columns: Column<Driver>[] = [
    {
      key: "name",
      header: "Driver",
      cell: (d) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground/70">
            {d.initials}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">{d.name}</p>
            <p className="truncate text-xs text-muted-foreground">{d.license}</p>
          </div>
        </div>
      ),
      sortValue: (d) => d.name,
    },
    {
      key: "status",
      header: "Status",
      cell: (d) => <DomainStatusBadge status={d.status} />,
      sortValue: (d) => d.status,
    },
    {
      key: "homeBase",
      header: "Home Base",
      cell: (d) => (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-3" /> {d.homeBase}
        </span>
      ),
      sortValue: (d) => d.homeBase,
      hideOnMobile: true,
    },
    {
      key: "hours",
      header: "Hrs / Week",
      align: "right",
      cell: (d) => {
        const over = d.hoursThisWeek > 50;
        const near = d.hoursThisWeek > 45;
        return (
          <span
            className={cn(
              "tnum font-medium",
              over ? "text-danger" : near ? "text-warning" : "text-foreground"
            )}
          >
            {d.hoursThisWeek}h
          </span>
        );
      },
      sortValue: (d) => d.hoursThisWeek,
    },
    {
      key: "trips",
      header: "Trips",
      align: "right",
      cell: (d) => <span className="text-muted-foreground tnum">{d.tripsCompleted}</span>,
      sortValue: (d) => d.tripsCompleted,
      hideOnMobile: true,
    },
    {
      key: "rating",
      header: "Rating",
      cell: (d) => (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Star className="size-3 fill-warning text-warning" />
          <span className="tnum">{d.rating.toFixed(1)}</span>
        </span>
      ),
      sortValue: (d) => d.rating,
      hideOnMobile: true,
    },
    {
      key: "license",
      header: "License Expiry",
      cell: (d) => {
        const days = daysUntil(d.licenseExpiry);
        const tone: Tone = days <= 14 ? "danger" : days <= 45 ? "warning" : "neutral";
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground tnum">{d.licenseExpiry}</span>
            <StatusBadge tone={tone}>{days <= 0 ? "Expired" : `${days}d left`}</StatusBadge>
          </div>
        );
      },
      sortValue: (d) => daysUntil(d.licenseExpiry),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Operations" }, { label: "Drivers" }]}
        title="Drivers"
        description={`${drivers.length} drivers · ${drivers.filter((d) => d.status === "on_duty").length} currently on duty`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="h-8">
              <Plus className="size-4" /> Add Driver
            </Button>
          </>
        }
      />

      <SectionCard flush>
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(d) => d.id}
          onRowClick={(d) => setSelected(d)}
          searchable
          searchFn={(d, q) =>
            d.name.toLowerCase().includes(q) ||
            d.license.toLowerCase().includes(q) ||
            d.homeBase.toLowerCase().includes(q)
          }
          searchPlaceholder="Search by name, license, base…"
          pageSize={10}
          toolbar={<FilterChips options={options} value={filter} onChange={setFilter} />}
          actions={(d) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelected(d)}>
                  <Eye className="size-4" /> View profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="size-4" /> Edit driver
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Truck className="size-4" /> Assign vehicle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger focus:text-danger">
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </SectionCard>

      <DriverDetailSheet driver={selected} onClose={() => setSelected(null)} />
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

function DriverDetailSheet({
  driver,
  onClose,
}: {
  driver: Driver | null;
  onClose: () => void;
}) {
  const vehicle = driver ? vehicleById(driver.assignedVehicleId) : null;
  return (
    <Sheet open={!!driver} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {driver && (
          <>
            <SheetHeader className="space-y-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">
                {driver.initials}
              </div>
              <div>
                <SheetTitle className="text-lg">{driver.name}</SheetTitle>
                <SheetDescription>{driver.license}</SheetDescription>
              </div>
              <div>
                <DomainStatusBadge status={driver.status} />
              </div>
            </SheetHeader>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Hours</p>
                <p className="mt-1 text-lg font-semibold text-foreground tnum">{driver.hoursThisWeek}h</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Trips</p>
                <p className="mt-1 text-lg font-semibold text-foreground tnum">{driver.tripsCompleted}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Rating</p>
                <p className="mt-1 flex items-center gap-1 text-lg font-semibold text-foreground tnum">
                  {driver.rating.toFixed(1)}
                  <Star className="size-3.5 fill-warning text-warning" />
                </p>
              </div>
            </div>

            {vehicle && (
              <div className="mt-4 rounded-lg border border-border p-3">
                <p className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Assigned Vehicle
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted/40 text-muted-foreground">
                    <Truck className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{vehicle.plate}</p>
                    <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 divide-y divide-border/60">
              <h4 className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Contact & Records
              </h4>
              <DetailRow label="Phone" icon={<Phone className="size-3.5" />}>
                {driver.phone}
              </DetailRow>
              <DetailRow label="Home base" icon={<MapPin className="size-3.5" />}>
                {driver.homeBase}
              </DetailRow>
              <DetailRow label="License expiry" icon={<CalendarClock className="size-3.5" />}>
                {driver.licenseExpiry}
              </DetailRow>
              <DetailRow label="Weekly hours" icon={<Clock className="size-3.5" />}>
                {driver.hoursThisWeek}h / 60h
              </DetailRow>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Pencil className="size-4" /> Edit
              </Button>
              <Button size="sm" className="flex-1">
                <Truck className="size-4" /> Assign Vehicle
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
