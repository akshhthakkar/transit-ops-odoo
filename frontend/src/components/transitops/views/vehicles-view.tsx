"use client";

import * as React from "react";
import {
  Truck,
  Plus,
  Download,
  MoreHorizontal,
  MapPin,
  Fuel,
  Gauge,
  Wrench,
  Pencil,
  Eye,
  CalendarClock,
  Phone,
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
import { StatusBadge, DomainStatusBadge } from "../status-badge";
import { FilterChips } from "../filter-chips";
import { DataTable, type Column } from "../tables/data-table";
import { formatNumber, driverById, type Vehicle } from "@/lib/transit-data";
import { useVehicles, useCreateVehicle } from "@/hooks/queries";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "available", label: "Available" },
  { value: "maintenance", label: "Maintenance" },
  { value: "idle", label: "Idle" },
  { value: "offline", label: "Offline" },
];

const VEHICLE_TYPES = ["Tractor", "Box Truck", "Reefer", "Flatbed", "Sprinter Van", "Straight Truck"];

function MiniBar({ value, tone = "brand" }: { value: number; tone?: string }) {
  const color =
    value < 25 ? "#dc2626" : value < 50 ? "#d97706" : tone === "brand" ? "#FF540E" : "#111827";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-foreground/[0.07]">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-muted-foreground tnum">{value}%</span>
    </div>
  );
}

function AddVehicleDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createVehicle = useCreateVehicle();
  const [form, setForm] = React.useState({
    registrationNumber: "",
    name: "",
    type: "",
    maxLoadCapacity: "",
    acquisitionCost: "",
    region: "",
    odometer: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.registrationNumber || !form.name || !form.type || !form.maxLoadCapacity || !form.acquisitionCost) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await createVehicle.mutateAsync({
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type,
        maxLoadCapacity: Number(form.maxLoadCapacity),
        acquisitionCost: Number(form.acquisitionCost),
        region: form.region.trim() || undefined,
        odometer: form.odometer ? Number(form.odometer) : undefined,
      });
      setForm({ registrationNumber: "", name: "", type: "", maxLoadCapacity: "", acquisitionCost: "", region: "", odometer: "" });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to add vehicle.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Vehicle</DialogTitle>
          <DialogDescription>Register a new vehicle to the fleet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="reg">Registration Number *</Label>
              <Input id="reg" placeholder="TX-7841" value={form.registrationNumber} onChange={(e) => set("registrationNumber", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vtype">Type *</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger id="vtype"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vname">Vehicle Name / Model *</Label>
            <Input id="vname" placeholder="Volvo VNL 760" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Max Load (tons) *</Label>
              <Input id="capacity" type="number" min="0" step="0.1" placeholder="20" value={form.maxLoadCapacity} onChange={(e) => set("maxLoadCapacity", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost">Acquisition Cost ($) *</Label>
              <Input id="cost" type="number" min="0" placeholder="150000" value={form.acquisitionCost} onChange={(e) => set("acquisitionCost", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="region">Region</Label>
              <Input id="region" placeholder="Dallas, TX" value={form.region} onChange={(e) => set("region", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="odo">Odometer (mi)</Label>
              <Input id="odo" type="number" min="0" placeholder="0" value={form.odometer} onChange={(e) => set("odometer", e.target.value)} />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createVehicle.isPending}>
              {createVehicle.isPending ? "Adding…" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function VehiclesView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<Vehicle | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const { data: vehicles = [], isLoading } = useVehicles();

  const filtered = React.useMemo(
    () => (filter === "all" ? vehicles : vehicles.filter((v) => v.status === filter)),
    [filter, vehicles]
  );

  const options = statusOptions.map((o) => ({
    ...o,
    count: o.value === "all" ? vehicles.length : vehicles.filter((v) => v.status === o.value).length,
  }));

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading vehicles...</div>;

  const columns: Column<Vehicle>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      cell: (v) => (
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
            <Truck className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground">{v.plate}</p>
            <p className="truncate text-xs text-muted-foreground">{v.model}</p>
          </div>
        </div>
      ),
      sortValue: (v) => v.plate,
    },
    {
      key: "type",
      header: "Type",
      cell: (v) => <span className="text-muted-foreground">{v.type}</span>,
      sortValue: (v) => v.type,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (v) => <DomainStatusBadge status={v.status} />,
      sortValue: (v) => v.status,
    },
    {
      key: "driver",
      header: "Driver",
      cell: (v) => {
        const d = driverById(v.driverId);
        return d ? (
          <span className="text-foreground">{d.name}</span>
        ) : (
          <span className="text-muted-foreground/60">Unassigned</span>
        );
      },
      sortValue: (v) => driverById(v.driverId)?.name ?? "zzz",
      hideOnMobile: true,
    },
    {
      key: "location",
      header: "Location",
      cell: (v) => (
        <span className="flex max-w-[200px] items-center gap-1.5 truncate text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{v.location}</span>
        </span>
      ),
      sortValue: (v) => v.location,
      hideOnMobile: true,
    },
    {
      key: "fuel",
      header: "Fuel",
      align: "left",
      cell: (v) => <MiniBar value={v.fuelPct} />,
      sortValue: (v) => v.fuelPct,
      hideOnMobile: true,
    },
    {
      key: "odometer",
      header: "Odometer",
      align: "right",
      cell: (v) => (
        <span className="text-muted-foreground tnum">{formatNumber(v.odometer)} mi</span>
      ),
      sortValue: (v) => v.odometer,
      hideOnMobile: true,
    },
    {
      key: "utilization",
      header: "Utilization",
      cell: (v) => <MiniBar value={v.utilization} />,
      sortValue: (v) => v.utilization,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Operations" }, { label: "Vehicles" }]}
        title="Vehicles"
        description={`${vehicles.length} vehicles in fleet · ${vehicles.filter((v) => v.status === "active").length} active`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="h-8" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Add Vehicle
            </Button>
          </>
        }
      />

      <SectionCard flush>
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(v) => v.id}
          onRowClick={(v) => setSelected(v)}
          searchable
          searchFn={(v, q) =>
            v.plate.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            v.type.toLowerCase().includes(q) ||
            v.location.toLowerCase().includes(q)
          }
          searchPlaceholder="Search by plate, model, location…"
          pageSize={10}
          toolbar={<FilterChips options={options} value={filter} onChange={setFilter} />}
          actions={(v) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelected(v)}>
                  <Eye className="size-4" /> View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="size-4" /> Edit vehicle
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Wrench className="size-4" /> Schedule service
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger focus:text-danger">
                  Decommission
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </SectionCard>

      <VehicleDetailSheet vehicle={selected} onClose={() => setSelected(null)} />
      <AddVehicleDialog open={addOpen} onClose={() => setAddOpen(false)} />
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

function VehicleDetailSheet({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle | null;
  onClose: () => void;
}) {
  const driver = vehicle ? driverById(vehicle.driverId) : null;
  return (
    <Sheet open={!!vehicle} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md p-0 border-l border-border bg-[#F9FAFB] font-sans">
        {vehicle && (
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
                    <Truck className="size-4 text-brand" />
                  </div>
                  <h3 className="text-xl font-extrabold font-mono tracking-tight text-slate-900">
                    {vehicle.plate}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold font-mono">
                  {vehicle.model} · {vehicle.type}
                </p>
              </div>
              <div className="mr-6">
                <DomainStatusBadge status={vehicle.status} />
              </div>
            </div>

            {/* Row 2: Assignment Card */}
            <div className="relative px-[45px] py-6">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200 pointer-events-none" />
              <div className="absolute left-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>
              <div className="absolute right-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>

              <div className="space-y-2">
                <h4 className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Assignment
                </h4>
                {driver ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-4 relative shadow-sm">
                    {/* Plus corner markers for card */}
                    <div className="absolute left-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                    <div className="absolute right-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                    <div className="absolute left-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                    <div className="absolute right-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>

                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white border-2 border-slate-200 font-mono shadow-sm">
                        {driver.initials}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-slate-800 font-display">{driver.name}</p>
                        <p className="text-xs text-slate-400 font-medium font-mono">{driver.license}</p>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-2.5 flex items-center gap-2 text-xs font-bold text-slate-400 font-mono">
                      <Phone className="size-3.5 text-slate-400" /> {driver.phone}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-6 text-center text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    No driver assigned
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: Detail Attributes Grid */}
            <div className="relative px-[45px] py-6 flex-1 bg-white mt-1">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-4 font-mono">
                Vehicle Information
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm p-1.5 relative">
                {/* Plus corner decoration for details grid */}
                <div className="absolute left-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute left-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>

                <DetailRow label="VIN" icon={<Truck className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-slate-800 font-bold">{vehicle.vin}</span>
                </DetailRow>
                <DetailRow label="Location" icon={<MapPin className="size-3.5 text-slate-400" />}>
                  <span className="text-slate-800 font-bold font-display max-w-[200px] truncate block">{vehicle.location}</span>
                </DetailRow>
                <DetailRow label="Odometer" icon={<Gauge className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-slate-800">{formatNumber(vehicle.odometer)} mi</span>
                </DetailRow>
                <DetailRow label="Fuel level" icon={<Fuel className="size-3.5 text-slate-400" />}>
                  <span className="font-mono font-bold text-slate-800">{vehicle.fuelPct}%</span>
                </DetailRow>
                <DetailRow label="Utilization" icon={<Gauge className="size-3.5 text-slate-400" />}>
                  <span className="font-mono font-bold text-slate-800">{vehicle.utilization}%</span>
                </DetailRow>
                <DetailRow label="Last service" icon={<Wrench className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-xs text-slate-600">{vehicle.lastService}</span>
                </DetailRow>
                <DetailRow label="Next service" icon={<CalendarClock className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-xs text-slate-600">{vehicle.nextService}</span>
                </DetailRow>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3 mr-6">
                <Button variant="outline" size="sm" className="flex-1 font-mono font-bold">
                  <Pencil className="size-4 mr-1.5" /> Edit
                </Button>
                <Button size="sm" className="flex-1 font-mono font-bold bg-brand text-white hover:bg-brand/90">
                  <Wrench className="size-4 mr-1.5" /> Schedule Service
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
