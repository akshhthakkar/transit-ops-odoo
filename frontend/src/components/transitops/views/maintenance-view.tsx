"use client";

import * as React from "react";
import {
  Wrench,
  Plus,
  Download,
  MoreHorizontal,
  CalendarClock,
  User,
  CircleAlert,
  CircleCheck,
  Clock,
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
import { Textarea } from "@/components/ui/textarea";
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
import { StatCard } from "../stat-card";
import { DataTable, type Column } from "../tables/data-table";
import { formatCurrency, vehicleById, type MaintenanceRecord } from "@/lib/transit-data";
import {
  useMaintenance,
  useCreateMaintenance,
  useCloseMaintenance,
  useVehicles,
} from "@/hooks/queries";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const priorityTone: Record<string, Tone> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

const MAINTENANCE_TYPES = [
  "Preventive",
  "Oil Change",
  "Tire Rotation",
  "Brake Service",
  "Inspection",
  "Engine Repair",
  "Transmission",
  "Reefer Unit",
  "Other",
];

function ScheduleServiceDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createMaintenance = useCreateMaintenance();
  const { data: vehicles = [] } = useVehicles();

  const [form, setForm] = React.useState({
    vehicleId: "",
    maintenanceType: "",
    description: "",
    priority: "",
    cost: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { vehicleId, description, cost } = form;
    if (!vehicleId || !description || !cost) {
      setError("Vehicle, description, and cost are required.");
      return;
    }
    try {
      await createMaintenance.mutateAsync({
        vehicleId,
        maintenanceType: form.maintenanceType || undefined,
        description: description.trim(),
        priority: form.priority || undefined,
        cost: Number(cost),
      });
      setForm({ vehicleId: "", maintenanceType: "", description: "", priority: "", cost: "" });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to schedule service.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Service</DialogTitle>
          <DialogDescription>Log a new maintenance job. Vehicle status will be set to IN_SHOP.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="mveh">Vehicle *</Label>
            <Select value={form.vehicleId} onValueChange={(v) => set("vehicleId", v)}>
              <SelectTrigger id="mveh"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.plate} — {v.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mtype">Service Type</Label>
              <Select value={form.maintenanceType} onValueChange={(v) => set("maintenanceType", v)}>
                <SelectTrigger id="mtype"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mpriority">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger id="mpriority"><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mdesc">Description *</Label>
            <Textarea
              id="mdesc"
              placeholder="Describe the maintenance work required…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mcost">Estimated Cost ($) *</Label>
            <Input id="mcost" type="number" min="0" step="0.01" placeholder="500" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMaintenance.isPending}>
              {createMaintenance.isPending ? "Scheduling…" : "Schedule Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MaintenanceView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<MaintenanceRecord | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const { data: maintenance = [], isLoading } = useMaintenance();
  const closeMaintenance = useCloseMaintenance();

  const filtered = React.useMemo(
    () =>
      filter === "all"
        ? maintenance
        : maintenance.filter((m) => m.status === filter),
    [filter, maintenance]
  );

  const options = statusOptions.map((o) => ({
    ...o,
    count:
      o.value === "all"
        ? maintenance.length
        : maintenance.filter((m) => m.status === o.value).length,
  }));

  const totalCost = maintenance.reduce((s, m) => s + m.cost, 0);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading maintenance records...</div>;

  const columns: Column<MaintenanceRecord>[] = [
    {
      key: "id",
      header: "ID",
      cell: (m) => <span className="font-medium text-foreground font-mono text-xs">{m.id.slice(0, 8).toUpperCase()}</span>,
      sortValue: (m) => m.id,
    },
    {
      key: "vehicle",
      header: "Vehicle",
      cell: (m) => {
        const v = vehicleById(m.vehicleId);
        return v ? (
          <div>
            <p className="font-medium text-foreground">{v.plate}</p>
            <p className="text-xs text-muted-foreground">{v.model}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground font-mono">{m.vehicleId?.slice(0, 8)}</span>
        );
      },
      sortValue: (m) => vehicleById(m.vehicleId)?.plate ?? "",
    },
    {
      key: "type",
      header: "Service Type",
      cell: (m) => <span className="text-foreground">{m.type}</span>,
      sortValue: (m) => m.type,
    },
    {
      key: "priority",
      header: "Priority",
      cell: (m) => (
        <StatusBadge tone={priorityTone[m.priority]}>
          {m.priority}
        </StatusBadge>
      ),
      sortValue: (m) => m.priority,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (m) => <DomainStatusBadge status={m.status} />,
      sortValue: (m) => m.status,
    },
    {
      key: "scheduled",
      header: "Logged",
      cell: (m) => <span className="text-muted-foreground tnum">{m.scheduled}</span>,
      sortValue: (m) => m.scheduled,
      hideOnMobile: true,
    },
    {
      key: "technician",
      header: "Technician",
      cell: (m) => <span className="text-muted-foreground">{m.technician}</span>,
      sortValue: (m) => m.technician,
      hideOnMobile: true,
    },
    {
      key: "cost",
      header: "Cost",
      align: "right",
      cell: (m) => (
        <span className="font-medium text-foreground tnum">{formatCurrency(m.cost)}</span>
      ),
      sortValue: (m) => m.cost,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Operations" }, { label: "Maintenance" }]}
        title="Maintenance"
        description={`${maintenance.filter((m) => m.status === "in_progress").length} in progress · ${maintenance.filter((m) => m.status === "overdue").length} overdue`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="h-8" onClick={() => setAddOpen(true)}>
              <Plus className="size-4" /> Schedule Service
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="In Progress"
          value={maintenance.filter((m) => m.status === "in_progress").length}
          icon={<Wrench className="size-4" />}
          delta={1}
          invertDelta
          deltaLabel="active jobs"
        />
        <StatCard
          label="Closed Logs"
          value={maintenance.filter((m) => m.status === "completed").length}
          icon={<CircleCheck className="size-4" />}
          delta={3}
          deltaLabel="completed total"
        />
        <StatCard
          label="Total Cost"
          value={formatCurrency(totalCost, true)}
          icon={<CircleCheck className="size-4" />}
          delta={-3.2}
          invertDelta
          deltaLabel="vs last period"
        />
      </div>

      <SectionCard flush>
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(m) => m.id}
          onRowClick={(m) => setSelected(m)}
          searchable
          searchFn={(m, q) => {
            const v = vehicleById(m.vehicleId);
            return (
              m.id.toLowerCase().includes(q) ||
              m.type.toLowerCase().includes(q) ||
              m.technician.toLowerCase().includes(q) ||
              (v?.plate ?? "").toLowerCase().includes(q) ||
              (v?.model ?? "").toLowerCase().includes(q)
            );
          }}
          searchPlaceholder="Search by ID, vehicle, type…"
          pageSize={10}
          toolbar={<FilterChips options={options} value={filter} onChange={setFilter} />}
          actions={(m) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelected(m)}>
                  <Eye className="size-4" /> View details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pencil className="size-4" /> Edit record
                </DropdownMenuItem>
                {m.status === "in_progress" && (
                  <DropdownMenuItem
                    onClick={() => closeMaintenance.mutate(m.id)}
                    disabled={closeMaintenance.isPending}
                  >
                    <CircleCheck className="size-4" /> Mark complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger focus:text-danger">
                  Cancel service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </SectionCard>

      <MaintenanceDetailSheet
        item={selected}
        onClose={() => setSelected(null)}
        onMarkComplete={(id) => closeMaintenance.mutate(id)}
        isClosing={closeMaintenance.isPending}
      />
      <ScheduleServiceDialog open={addOpen} onClose={() => setAddOpen(false)} />
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

function MaintenanceDetailSheet({
  item,
  onClose,
  onMarkComplete,
  isClosing,
}: {
  item: MaintenanceRecord | null;
  onClose: () => void;
  onMarkComplete: (id: string) => void;
  isClosing: boolean;
}) {
  const vehicle = item ? vehicleById(item.vehicleId) : null;
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md p-0 border-l border-border bg-[#F9FAFB] font-sans">
        {item && (
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
                    <Wrench className="size-4 text-brand" />
                  </div>
                  <h3 className="text-xl font-extrabold font-mono tracking-tight text-slate-900">
                    {item.id.slice(0, 8).toUpperCase()}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-semibold font-mono">
                  {item.type} · {vehicle?.plate ?? item.vehicleId?.slice(0, 8)}
                </p>
              </div>
              <div className="flex flex-col gap-1.5 mr-6 items-end">
                <DomainStatusBadge status={item.status} />
                <StatusBadge tone={priorityTone[item.priority]}>{item.priority} priority</StatusBadge>
              </div>
            </div>

            {/* Row 2: Description Card */}
            <div className="relative px-[45px] py-6">
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-slate-200 pointer-events-none" />
              <div className="absolute left-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>
              <div className="absolute right-[25px] bottom-[-6px] font-mono text-[11px] text-slate-400 bg-[#F9FAFB] w-[11px] h-[11px] flex items-center justify-center z-10 pointer-events-none">+</div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 relative shadow-sm">
                {/* Plus corner markers for description card */}
                <div className="absolute left-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute left-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Description
                </p>
                <p className="mt-1 text-sm text-slate-700 font-medium">{item.description || "No description provided."}</p>
              </div>
            </div>

            {/* Row 3: Detail Attributes Grid */}
            <div className="relative px-[45px] py-6 flex-1 bg-white mt-1">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-4 font-mono">
                Service Details
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm p-1.5 relative">
                {/* Plus corner decoration for details grid */}
                <div className="absolute left-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] top-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute left-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>
                <div className="absolute right-[-6px] bottom-[-6px] font-mono text-[11px] text-slate-300 bg-white w-3 h-3 flex items-center justify-center pointer-events-none">+</div>

                <DetailRow label="Vehicle" icon={<Wrench className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-slate-800 font-bold">{vehicle?.plate ?? item.vehicleId?.slice(0, 8)}</span>
                  {vehicle && <span className="text-slate-400 text-xs ml-1 font-mono">({vehicle.model})</span>}
                </DetailRow>
                <DetailRow label="Service type" icon={<Wrench className="size-3.5 text-slate-400" />}>
                  <span className="text-slate-800 font-bold font-display">{item.type}</span>
                </DetailRow>
                <DetailRow label="Logged date" icon={<CalendarClock className="size-3.5 text-slate-400" />}>
                  <span className="font-mono text-xs text-slate-600">{item.scheduled}</span>
                </DetailRow>
                <DetailRow label="Technician" icon={<User className="size-3.5 text-slate-400" />}>
                  <span className="text-slate-800 font-semibold">{item.technician}</span>
                </DetailRow>
                <DetailRow label="Estimated cost" icon={<CircleCheck className="size-3.5 text-slate-400" />}>
                  <span className="font-bold text-brand">{formatCurrency(item.cost)}</span>
                </DetailRow>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3 mr-6">
                <Button variant="outline" size="sm" className="flex-1 font-mono font-bold">
                  <Pencil className="size-4 mr-1.5" /> Edit
                </Button>
                {item.status === "in_progress" && (
                  <Button
                    size="sm"
                    className="flex-1 font-mono font-bold bg-brand text-white hover:bg-brand/90"
                    onClick={() => { onMarkComplete(item.id); onClose(); }}
                    disabled={isClosing}
                  >
                    <CircleCheck className="size-4 mr-1.5" /> Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
