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
import { daysUntil, vehicleById, type Driver } from "@/lib/transit-data";
import { useDrivers, useCreateDriver } from "@/hooks/queries";

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
      <AddDriverDialog open={addOpen} onClose={() => setAddOpen(false)} />
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
      <SheetContent className="w-full overflow-y-auto sm:max-w-md p-0 border-l border-border bg-[#F9FAFB] font-sans">
        {driver && (
          <div className="flex flex-col min-h-full relative pb-10">
            {/* Retro Vertical Grid Lines */}
            <div className="absolute left-[30px] top-0 bottom-0 w-[1px] bg-slate-200 pointer-events-none" />
            <div className="absolute right-[30px] top-0 bottom-0 w-[1px] bg-slate-200 pointer-events-none" />

            {/* Row 1: Header */}
            <div className="relative px-[45px] py-7 flex items-center justify-between bg-white/50 backdrop-blur-sm">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200 pointer-events-none" />
              <div className="absolute left-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>
              <div className="absolute right-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>

              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white border-2 border-slate-200 font-mono shadow-sm">
                  {driver.initials}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">{driver.name}</h3>
                  <p className="text-xs text-slate-500 font-bold font-mono">{driver.license}</p>
                </div>
              </div>
              <div className="mr-6">
                <DomainStatusBadge status={driver.status} />
              </div>
            </div>

            {/* Row 2: KPI Grid Cards */}
            <div className="relative px-[45px] py-6">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200 pointer-events-none" />
              <div className="absolute left-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>
              <div className="absolute right-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 relative shadow-sm text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Hours</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800 font-mono tnum">{driver.hoursThisWeek}h</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 relative shadow-sm text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Trips</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800 font-mono tnum">{driver.tripsCompleted}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3.5 relative shadow-sm text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Rating</p>
                  <p className="mt-1 flex items-center justify-center gap-1 text-lg font-extrabold text-slate-800 font-mono tnum">
                    {driver.rating.toFixed(1)}
                    <Star className="size-3.5 fill-warning text-warning shrink-0" />
                  </p>
                </div>
              </div>
            </div>

            {/* Row 3: Assigned Vehicle (Optional Card) */}
            {vehicle && (
              <div className="relative px-[45px] py-6">
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200 pointer-events-none" />
                <div className="absolute left-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>
                <div className="absolute right-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 relative shadow-sm">
                  {/* Plus corner markers for Assigned Card */}
                  <div className="absolute left-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                  <div className="absolute right-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                  <div className="absolute left-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                  <div className="absolute right-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>

                  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Assigned Vehicle
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-500">
                      <Truck className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800 font-mono">{vehicle.plate}</p>
                      <p className="text-xs text-slate-400 font-medium">{vehicle.model}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Row 4: Contact & Records Grid */}
            <div className="relative px-[45px] py-6 flex-1 bg-white mt-1">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-4 font-mono">
                Contact & Records
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm p-1.5 relative">
                {/* Plus corner decoration for details grid */}
                <div className="absolute left-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute left-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>

                <DetailRow label="Phone" icon={<Phone className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-slate-800">{driver.phone}</span>
                </DetailRow>
                <DetailRow label="Home base" icon={<MapPin className="size-3.5 text-slate-400" />}>
                  <span className="text-slate-800">{driver.homeBase || "—"}</span>
                </DetailRow>
                <DetailRow label="License expiry" icon={<CalendarClock className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-slate-700">{driver.licenseExpiry}</span>
                </DetailRow>
                <DetailRow label="Weekly hours" icon={<Clock className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-slate-700">{driver.hoursThisWeek}h / 60h</span>
                </DetailRow>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3 mr-6">
                <Button variant="outline" size="sm" className="flex-1 font-mono font-bold">
                  <Pencil className="size-4 mr-1.5" /> Edit
                </Button>
                <Button size="sm" className="flex-1 font-mono font-bold bg-brand text-white hover:bg-brand/90">
                  <Truck className="size-4 mr-1.5" /> Assign Vehicle
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
