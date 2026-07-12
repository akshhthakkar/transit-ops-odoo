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
  Send,
  CheckCircle2,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "../page-header";
import { SectionCard } from "../section-card";
import { DomainStatusBadge } from "../status-badge";
import { FilterChips } from "../filter-chips";
import { StatCard } from "../stat-card";
import { DataTable, type Column } from "../tables/data-table";
import { formatCurrency, vehicleById, driverById, type Trip } from "@/lib/transit-data";
import {
  useTrips,
  useVehicles,
  useDrivers,
  useCreateTrip,
  useCancelTrip,
  useDispatchTrip,
  useCompleteTrip,
} from "@/hooks/queries";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_transit", label: "In Transit" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function Progress({ value, status }: { value: number; status: string }) {
  const color =
    status === "delayed" ? "#dc2626" : status === "completed" ? "#16a34a" : "#FF540E";
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

export function NewTripDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createTrip = useCreateTrip();
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();
  const { data: trips = [] } = useTrips();

  const [form, setForm] = React.useState({
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeight: "",
    plannedDistance: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance } = form;
    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await createTrip.mutateAsync({
        source: source.trim(),
        destination: destination.trim(),
        vehicleId,
        driverId,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
      });
      setForm({ source: "", destination: "", vehicleId: "", driverId: "", cargoWeight: "", plannedDistance: "" });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to create trip.");
    }
  }

  const assignedVehicleIds = new Set(
    trips
      .filter((t) => t.status === "scheduled" || t.status === "in_transit")
      .map((t) => t.vehicleId)
  );
  const assignedDriverIds = new Set(
    trips
      .filter((t) => t.status === "scheduled" || t.status === "in_transit")
      .map((t) => t.driverId)
  );

  const availableVehicles = vehicles.filter(
    (v) => (v.status === "available" || v.status === "idle") && !assignedVehicleIds.has(v.id)
  );
  const availableDrivers = drivers.filter(
    (d) => (d.status === "available" || d.status === "off_duty") && !assignedDriverIds.has(d.id)
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Trip</DialogTitle>
          <DialogDescription>Create a new DRAFT trip. Assign a vehicle and driver then dispatch.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tsrc">Origin *</Label>
              <Input id="tsrc" placeholder="Dallas, TX" value={form.source} onChange={(e) => set("source", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tdst">Destination *</Label>
              <Input id="tdst" placeholder="Houston, TX" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tveh">Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={(v) => set("vehicleId", v)}>
              <SelectTrigger id="tveh">
                <SelectValue placeholder={availableVehicles.length === 0 ? "No available vehicles" : "Select vehicle"} />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.plate} — {v.model}
                  </SelectItem>
                ))}
                {availableVehicles.length === 0 && (
                  <SelectItem value="none" disabled>No available vehicles</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tdrv">Driver *</Label>
            <Select value={form.driverId} onValueChange={(v) => set("driverId", v)}>
              <SelectTrigger id="tdrv">
                <SelectValue placeholder={availableDrivers.length === 0 ? "No available drivers" : "Select driver"} />
              </SelectTrigger>
              <SelectContent>
                {availableDrivers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} — {d.license}
                  </SelectItem>
                ))}
                {availableDrivers.length === 0 && (
                  <SelectItem value="none" disabled>No available drivers</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tcargo">Cargo Weight (kg) *</Label>
              <Input id="tcargo" type="number" min="0" step="0.1" placeholder="20000" value={form.cargoWeight} onChange={(e) => set("cargoWeight", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tdist">Planned Distance (km) *</Label>
              <Input id="tdist" type="number" min="0" step="1" placeholder="380" value={form.plannedDistance} onChange={(e) => set("plannedDistance", e.target.value)} />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createTrip.isPending}>
              {createTrip.isPending ? "Creating…" : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TripsView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<Trip | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [completeTripTarget, setCompleteTripTarget] = React.useState<Trip | null>(null);
  const { data: trips = [], isLoading } = useTrips();
  const cancelTrip = useCancelTrip();
  const dispatchTrip = useDispatchTrip();

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
      cell: (t) => <span className="font-medium text-foreground">{t.id.slice(0, 8)}</span>,
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
      cell: (t) => vehicleById(t.vehicleId)?.plate ?? <span className="text-muted-foreground text-xs">{t.vehicleId?.slice(0, 8)}</span>,
      sortValue: (t) => vehicleById(t.vehicleId)?.plate ?? "",
      hideOnMobile: true,
    },
    {
      key: "driver",
      header: "Driver",
      cell: (t) => driverById(t.driverId)?.name ?? <span className="text-muted-foreground text-xs">{t.driverId?.slice(0, 8)}</span>,
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
      cell: (t) => <span className="text-muted-foreground tnum">{t.distance} km</span>,
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

  const handleExport = () => {
    const headers = ["Trip ID", "Origin", "Destination", "Vehicle ID", "Driver ID", "Status", "Distance (km)", "Revenue ($)", "Departure"];
    const rows = trips.map((t) => [
      t.id,
      t.origin,
      t.destination,
      t.vehicleId,
      t.driverId,
      t.status,
      t.distance,
      t.revenue,
      t.departure ? new Date(t.departure).toISOString() : "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val: any) => {
            const str = String(val ?? "").replace(/"/g, '""');
            return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
          })
          .join(",")
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "trips-export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Operations" }, { label: "Trips" }]}
        title="Trips"
        description={`${trips.length} trips · ${trips.filter((t) => t.status === "in_transit").length} in transit`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="h-8" onClick={() => setAddOpen(true)}>
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
                {t.status === "scheduled" && (
                  <DropdownMenuItem
                    onClick={() => dispatchTrip.mutate(t.id)}
                    disabled={dispatchTrip.isPending}
                  >
                    <Send className="size-4" /> Dispatch trip
                  </DropdownMenuItem>
                )}
                {t.status === "in_transit" && (
                  <DropdownMenuItem
                    onClick={() => setCompleteTripTarget(t)}
                  >
                    <CheckCircle2 className="size-4" /> Complete trip
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Pencil className="size-4" /> Edit trip
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {t.status !== "completed" && t.status !== "cancelled" && (
                  <DropdownMenuItem
                    className="text-danger focus:text-danger"
                    onClick={() => cancelTrip.mutate(t.id)}
                    disabled={cancelTrip.isPending}
                  >
                    <XCircle className="size-4" /> Cancel trip
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </SectionCard>

      <TripDetailSheet trip={selected} onClose={() => setSelected(null)} />
      <NewTripDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <CompleteTripDialog trip={completeTripTarget} open={!!completeTripTarget} onClose={() => setCompleteTripTarget(null)} />
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
                <SheetTitle className="text-lg font-mono">{trip.id.slice(0, 8).toUpperCase()}</SheetTitle>
                <SheetDescription>{trip.cargo} · {trip.weightLb.toLocaleString()} kg</SheetDescription>
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
                {vehicle?.plate ?? trip.vehicleId?.slice(0, 8)} · {vehicle?.model}
              </DetailRow>
              <DetailRow label="Driver" icon={<MapPin className="size-3.5" />}>
                {driver?.name ?? trip.driverId?.slice(0, 8)}
              </DetailRow>
              <DetailRow label="Departure" icon={<Clock className="size-3.5" />}>
                {trip.departure ? new Date(trip.departure).toLocaleString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST" : "—"}
              </DetailRow>
              <DetailRow label="ETA" icon={<Clock className="size-3.5" />}>
                {trip.eta ? new Date(trip.eta).toLocaleString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST" : "—"}
              </DetailRow>
              <DetailRow label="Distance" icon={<MapPin className="size-3.5" />}>
                {trip.distance} km
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

export function CompleteTripDialog({
  trip,
  open,
  onClose,
}: {
  trip: Trip | null;
  open: boolean;
  onClose: () => void;
}) {
  const completeTrip = useCompleteTrip();
  const [form, setForm] = React.useState({
    actualDistance: "",
    fuelConsumed: "",
    revenue: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (trip) {
      setForm({
        actualDistance: String(trip.distance),
        fuelConsumed: String(Math.round(trip.distance * 0.28)),
        revenue: String(Math.round(trip.distance * 3.5)),
      });
    }
  }, [trip]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    setError(null);
    const { actualDistance, fuelConsumed, revenue } = form;
    if (!actualDistance || !fuelConsumed || !revenue) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await completeTrip.mutateAsync({
        id: trip.id,
        actualDistance: Number(actualDistance),
        fuelConsumed: Number(fuelConsumed),
        revenue: Number(revenue),
      });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to complete trip.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Trip</DialogTitle>
          <DialogDescription>
            Enter final transit details to release the vehicle and driver back to Available status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="c_dist">Actual Distance (km) *</Label>
            <Input
              id="c_dist"
              type="number"
              min="0"
              step="1"
              value={form.actualDistance}
              onChange={(e) => set("actualDistance", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c_fuel">Fuel Consumed (Liters) *</Label>
            <Input
              id="c_fuel"
              type="number"
              min="0"
              step="0.1"
              value={form.fuelConsumed}
              onChange={(e) => set("fuelConsumed", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c_rev">Final Trip Revenue ($) *</Label>
            <Input
              id="c_rev"
              type="number"
              min="0"
              step="1"
              value={form.revenue}
              onChange={(e) => set("revenue", e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={completeTrip.isPending}>
              {completeTrip.isPending ? "Completing..." : "Complete Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
