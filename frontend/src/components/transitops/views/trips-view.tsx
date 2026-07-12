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
  CircleCheck,
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

  const availableVehicles = vehicles.filter((v) => v.status === "available" || v.status === "idle");
  const availableDrivers = drivers.filter((d) => d.status === "available" || d.status === "off_duty");

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
  const [completeOpen, setCompleteOpen] = React.useState<Trip | null>(null);
  const { data: trips = [], isLoading } = useTrips();
  const cancelTrip = useCancelTrip();
  const dispatchTrip = useDispatchTrip();
  const completeTrip = useCompleteTrip();

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
                    onClick={() => setCompleteOpen(t)}
                  >
                    <CircleCheck className="size-4" /> Complete trip
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
      <CompleteTripDialog open={!!completeOpen} trip={completeOpen} onClose={() => setCompleteOpen(null)} />
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
    <div className="flex items-center justify-between gap-4 py-3.5 hover:bg-slate-50/45 transition-colors px-1.5 border-b border-border/40 last:border-b-0">
      <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-slate-800">{children}</span>
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
      <SheetContent className="w-full overflow-y-auto sm:max-w-md p-0 border-l border-border bg-[#F9FAFB] font-sans">
        {trip && (
          <div className="flex flex-col min-h-full relative pb-10">
            {/* Retro Vertical Grid Lines */}
            <div className="absolute left-[30px] top-0 bottom-0 w-[1px] bg-slate-200 pointer-events-none" />
            <div className="absolute right-[30px] top-0 bottom-0 w-[1px] bg-slate-200 pointer-events-none" />

            {/* Row 1: Header */}
            <div className="relative px-[45px] py-7 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200 pointer-events-none" />
              <div className="absolute left-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>
              <div className="absolute right-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded border border-border bg-white text-foreground/70">
                    <RouteIcon className="size-4 text-brand" />
                  </div>
                  <h3 className="text-xl font-extrabold font-mono tracking-tight text-slate-900">
                    {trip.id.slice(0, 8).toUpperCase()}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold font-mono">
                  {trip.cargo} · {trip.weightLb.toLocaleString()} kg
                </p>
              </div>
              <div className="mr-6">
                <DomainStatusBadge status={trip.status} />
              </div>
            </div>

            {/* Row 2: Route Progress Card */}
            <div className="relative px-[45px] py-6">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200 pointer-events-none" />
              <div className="absolute left-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>
              <div className="absolute right-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 relative shadow-sm">
                {/* Corner intersection plus symbols for Card */}
                <div className="absolute left-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute left-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>

                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Origin</p>
                    <p className="text-base font-extrabold text-slate-800 font-display">{trip.origin}</p>
                  </div>
                  <ArrowRight className="mx-3 size-5 shrink-0 text-brand" />
                  <div className="min-w-0 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Destination</p>
                    <p className="text-base font-extrabold text-slate-800 font-display">{trip.destination}</p>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-bold font-mono">
                    <span className="text-slate-400">PROGRESS</span>
                    <span className="text-brand tnum">{trip.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Detail Attributes Grid */}
            <div className="relative px-[45px] py-6 flex-1 bg-white mt-1">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-4 font-mono">
                Trip Details
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm p-1.5 relative">
                {/* Corner decoration plus indicators for details card */}
                <div className="absolute left-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute left-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>

                <DetailRow label="Vehicle" icon={<Package className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-slate-800 font-bold">{vehicle?.plate ?? trip.vehicleId?.slice(0, 8)}</span>
                  {vehicle && <span className="text-slate-400 text-xs ml-1 font-mono">({vehicle.model})</span>}
                </DetailRow>
                <DetailRow label="Driver" icon={<MapPin className="size-3.5 text-slate-400" />}>
                  <span className="text-slate-800 font-bold font-display">{driver?.name ?? trip.driverId?.slice(0, 8)}</span>
                </DetailRow>
                <DetailRow label="Departure" icon={<Clock className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-xs text-slate-600">
                    {trip.departure ? new Date(trip.departure).toLocaleString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST" : "—"}
                  </span>
                </DetailRow>
                <DetailRow label="ETA" icon={<Clock className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-xs text-slate-600">
                    {trip.eta ? new Date(trip.eta).toLocaleString("en-US", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST" : "—"}
                  </span>
                </DetailRow>
                <DetailRow label="Distance" icon={<MapPin className="size-3.5 text-slate-400" />}>
                  <span className="font-mono font-bold text-slate-800">{trip.distance} km</span>
                </DetailRow>
                <DetailRow label="Revenue" icon={<Package className="size-3.5 text-slate-400" />}>
                  <span className="font-bold text-brand">{formatCurrency(trip.revenue)}</span>
                </DetailRow>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CompleteTripDialog({
  open,
  trip,
  onClose,
}: {
  open: boolean;
  trip: Trip | null;
  onClose: () => void;
}) {
  const completeTrip = useCompleteTrip();
  const [form, setForm] = React.useState({
    actualDistance: "",
    fuelConsumed: "",
    revenue: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when trip changes
  React.useEffect(() => {
    if (trip) {
      setForm({
        actualDistance: String(trip.distance || ""),
        fuelConsumed: "",
        revenue: String(trip.revenue || ""),
      });
    }
  }, [trip]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!trip) return;

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
      setForm({ actualDistance: "", fuelConsumed: "", revenue: "" });
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
            Enter the final actual metrics for trip {trip?.id.slice(0, 8).toUpperCase()} to close it out.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="tactualdist">Actual Distance (km) *</Label>
            <Input
              id="tactualdist"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 120"
              value={form.actualDistance}
              onChange={(e) => set("actualDistance", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tfuel">Fuel Consumed (Liters) *</Label>
            <Input
              id="tfuel"
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 25.5"
              value={form.fuelConsumed}
              onChange={(e) => set("fuelConsumed", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="trev">Revenue ($) *</Label>
            <Input
              id="trev"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 850.00"
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
              {completeTrip.isPending ? "Completing…" : "Complete Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
