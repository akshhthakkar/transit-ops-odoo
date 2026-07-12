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
import { StatusBadge, DomainStatusBadge, type Tone } from "../status-badge";
import { FilterChips } from "../filter-chips";
import { DataTable, type Column } from "../tables/data-table";
import { type Driver } from "@/lib/transit-data";
import {
  useDrivers,
  useCreateDriver,
  useUpdateDriver,
  useDeleteDriver,
  useCreateTrip,
  useVehicles,
  useTrips,
} from "@/hooks/queries";

// Use real current date for license expiry calculations
function daysUntil(iso: string): number {
  if (!iso) return 9999;
  const now = Date.now();
  const target = new Date(iso).getTime();
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

const statusOptions = [
  { value: "all", label: "All" },
  { value: "on_duty", label: "On Duty" },
  { value: "off_duty", label: "Off Duty" },
  { value: "available", label: "Available" },
  { value: "on_leave", label: "On Leave" },
];

const LICENSE_CATEGORIES = ["CDL-A", "CDL-B", "CDL-C", "Class D", "Class C"];

function AddDriverDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createDriver = useCreateDriver();
  const [form, setForm] = React.useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "",
    licenseExpiryDate: "",
    contactNumber: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber } = form;
    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await createDriver.mutateAsync({
        name: name.trim(),
        licenseNumber: licenseNumber.trim().toUpperCase(),
        licenseCategory: licenseCategory.trim(),
        licenseExpiryDate,
        contactNumber: contactNumber.trim(),
      });
      setForm({ name: "", licenseNumber: "", licenseCategory: "", licenseExpiryDate: "", contactNumber: "" });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to add driver.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Driver</DialogTitle>
          <DialogDescription>Register a new driver to the fleet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="dname">Full Name *</Label>
            <Input id="dname" placeholder="Marcus Holloway" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dlic">License Number *</Label>
              <Input id="dlic" placeholder="CDL-A TX119872" value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dlcat">License Category *</Label>
              <Select value={form.licenseCategory} onValueChange={(v) => set("licenseCategory", v)}>
                <SelectTrigger id="dlcat"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {LICENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dexpiry">License Expiry *</Label>
              <Input id="dexpiry" type="date" value={form.licenseExpiryDate} onChange={(e) => set("licenseExpiryDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dphone">Contact Number *</Label>
              <Input id="dphone" placeholder="+1 (214) 555-0182" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createDriver.isPending}>
              {createDriver.isPending ? "Adding…" : "Add Driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DriversView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<Driver | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Driver | null>(null);
  const [assignTarget, setAssignTarget] = React.useState<Driver | null>(null);
  const deleteDriver = useDeleteDriver();
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

  const handleExport = () => {
    const headers = ["Driver ID", "Name", "License", "Status", "Home Base", "Phone", "Rating", "Trips Completed", "Hours This Week"];
    const rows = drivers.map((d) => [
      d.id,
      d.name,
      d.license,
      d.status,
      d.homeBase,
      d.phone,
      d.rating,
      d.tripsCompleted,
      d.hoursThisWeek,
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
    link.setAttribute("download", "drivers-export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Operations" }, { label: "Drivers" }]}
        title="Drivers"
        description={`${drivers.length} drivers · ${drivers.filter((d) => d.status === "on_duty").length} currently on duty`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="h-8" onClick={() => setAddOpen(true)}>
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
                <DropdownMenuItem onClick={() => setEditTarget(d)}>
                  <Pencil className="size-4" /> Edit driver
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAssignTarget(d)}>
                  <Truck className="size-4" /> Assign vehicle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-danger focus:text-danger"
                  onClick={() => {
                    if (confirm(`Are you sure you want to deactivate driver ${d.name}?`)) {
                      deleteDriver.mutate(d.id);
                    }
                  }}
                  disabled={deleteDriver.isPending}
                >
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </SectionCard>

      <DriverDetailSheet
        driver={selected}
        onClose={() => setSelected(null)}
        onEdit={(d) => setEditTarget(d)}
        onAssign={(d) => setAssignTarget(d)}
      />
      <AddDriverDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <EditDriverDialog driver={editTarget} open={!!editTarget} onClose={() => setEditTarget(null)} />
      <AssignVehicleDialog driver={assignTarget} open={!!assignTarget} onClose={() => setAssignTarget(null)} />
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
  onEdit,
  onAssign,
}: {
  driver: Driver | null;
  onClose: () => void;
  onEdit: (d: Driver) => void;
  onAssign: (d: Driver) => void;
}) {
  const { data: vehicles = [] } = useVehicles();
  const vehicle = driver ? (vehicles.find((v) => v.id === driver.assignedVehicleId) ?? null) : null;
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
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onEdit(driver);
                  onClose();
                }}
              >
                <Pencil className="size-4" /> Edit
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  onAssign(driver);
                  onClose();
                }}
              >
                <Truck className="size-4" /> Assign Vehicle
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function EditDriverDialog({
  driver,
  open,
  onClose,
}: {
  driver: Driver | null;
  open: boolean;
  onClose: () => void;
}) {
  const updateDriver = useUpdateDriver();
  const [form, setForm] = React.useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "",
    licenseExpiryDate: "",
    contactNumber: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (driver) {
      setForm({
        name: driver.name,
        licenseNumber: driver.license,
        licenseCategory: "Class A",
        licenseExpiryDate: driver.licenseExpiry ? driver.licenseExpiry.split("T")[0] : "",
        contactNumber: driver.phone,
      });
    }
  }, [driver]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!driver) return;
    setError(null);
    if (!form.name || !form.licenseNumber || !form.licenseCategory || !form.licenseExpiryDate || !form.contactNumber) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await updateDriver.mutateAsync({
        id: driver.id,
        name: form.name.trim(),
        licenseNumber: form.licenseNumber.trim().toUpperCase(),
        licenseCategory: form.licenseCategory,
        licenseExpiryDate: new Date(form.licenseExpiryDate).toISOString(),
        contactNumber: form.contactNumber.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to update driver.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription>Modify driver registry information and license credentials.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="e-dname">Full Name *</Label>
            <Input id="e-dname" placeholder="Marcus Holloway" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-dlic">License Number *</Label>
              <Input id="e-dlic" placeholder="CDL-A TX119872" value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-dlcat">License Category *</Label>
              <Select value={form.licenseCategory} onValueChange={(v) => set("licenseCategory", v)}>
                <SelectTrigger id="e-dlcat"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {LICENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-dexpiry">License Expiry *</Label>
              <Input id="e-dexpiry" type="date" value={form.licenseExpiryDate} onChange={(e) => set("licenseExpiryDate", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-dphone">Contact Number *</Label>
              <Input id="e-dphone" placeholder="+1 (214) 555-0182" value={form.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateDriver.isPending}>
              {updateDriver.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssignVehicleDialog({
  driver,
  open,
  onClose,
}: {
  driver: Driver | null;
  open: boolean;
  onClose: () => void;
}) {
  const createTrip = useCreateTrip();
  const { data: vehicles = [] } = useVehicles();
  const { data: trips = [] } = useTrips();

  const [form, setForm] = React.useState({
    source: "",
    destination: "",
    vehicleId: "",
    cargoWeight: "",
    plannedDistance: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setForm({ source: "", destination: "", vehicleId: "", cargoWeight: "", plannedDistance: "" });
      setError(null);
    }
  }, [open]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!driver) return;
    setError(null);
    const { source, destination, vehicleId, cargoWeight, plannedDistance } = form;
    if (!source || !destination || !vehicleId || !cargoWeight || !plannedDistance) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await createTrip.mutateAsync({
        source: source.trim(),
        destination: destination.trim(),
        vehicleId,
        driverId: driver.id,
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
      });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to assign vehicle.");
    }
  }

  const assignedVehicleIds = new Set(
    trips
      .filter((t) => t.status === "scheduled" || t.status === "in_transit")
      .map((t) => t.vehicleId)
  );

  const availableVehicles = vehicles.filter(
    (v) => (v.status === "available" || v.status === "idle") && !assignedVehicleIds.has(v.id)
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Vehicle to {driver?.name}</DialogTitle>
          <DialogDescription>Create a trip operation to assign a vehicle to this driver.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-src">Origin *</Label>
              <Input id="a-src" placeholder="Dallas, TX" value={form.source} onChange={(e) => set("source", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-dst">Destination *</Label>
              <Input id="a-dst" placeholder="Houston, TX" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="a-veh">Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={(v) => set("vehicleId", v)}>
              <SelectTrigger id="a-veh">
                <SelectValue placeholder={availableVehicles.length === 0 ? "No available vehicles" : "Select vehicle"} />
              </SelectTrigger>
              <SelectContent>
                {availableVehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.plate} — {v.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="a-cargo">Cargo Weight (kg) *</Label>
              <Input id="a-cargo" type="number" min="0" step="0.1" placeholder="20000" value={form.cargoWeight} onChange={(e) => set("cargoWeight", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="a-dist">Planned Distance (km) *</Label>
              <Input id="a-dist" type="number" min="0" step="1" placeholder="380" value={form.plannedDistance} onChange={(e) => set("plannedDistance", e.target.value)} />
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createTrip.isPending}>
              {createTrip.isPending ? "Assigning…" : "Assign Vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
