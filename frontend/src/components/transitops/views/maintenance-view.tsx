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
import { formatCurrency, type MaintenanceRecord } from "@/lib/transit-data";
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
  const { data: vehicles = [] } = useVehicles();
  const closeMaintenance = useCloseMaintenance();

  const vehicleMap = React.useMemo(() => {
    const m = new Map<string, { plate: string; model: string }>();
    vehicles.forEach((v) => m.set(v.id, { plate: v.plate, model: v.model }));
    return m;
  }, [vehicles]);

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
        const v = vehicleMap.get(m.vehicleId);
        return v ? (
          <div>
            <p className="font-medium text-foreground">{v.plate}</p>
            <p className="text-xs text-muted-foreground">{v.model}</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground font-mono">{m.vehicleId?.slice(0, 8)}</span>
        );
      },
      sortValue: (m) => vehicleMap.get(m.vehicleId)?.plate ?? "",
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
            <Button variant="outline" size="sm" className="h-8" onClick={() => {
              const headers = ["ID", "Vehicle", "Service Type", "Status", "Priority", "Date", "Cost ($)", "Technician"];
              const rows = maintenance.map((m) => {
                const v = vehicleMap.get(m.vehicleId);
                return [m.id, v ? `${v.plate} - ${v.model}` : m.vehicleId, m.type, m.status, m.priority, m.scheduled, m.cost, m.technician];
              });
              const csv = [headers.join(","), ...rows.map((r) => r.map((val) => { const s = String(val ?? "").replace(/"/g, '""'); return s.includes(",") || s.includes("\n") ? `"${s}"` : s; }).join(","))].join("\r\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "maintenance-export.csv"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
            }}>
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
            const v = vehicleMap.get(m.vehicleId);
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
                <DropdownMenuItem
                  onClick={() => alert("Maintenance logs are immutable for compliance and fleet safety audit tracking. To make adjustments, please cancel this service and schedule a new entry.")}
                >
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
                {m.status === "in_progress" && (
                  <DropdownMenuItem
                    className="text-danger focus:text-danger"
                    onClick={() => {
                      if (confirm("Are you sure you want to cancel this maintenance service? The vehicle will be set back to Available status.")) {
                        closeMaintenance.mutate(m.id);
                      }
                    }}
                    disabled={closeMaintenance.isPending}
                  >
                    Cancel service
                  </DropdownMenuItem>
                )}
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
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">{children}</span>
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
  const { data: vehicles = [] } = useVehicles();
  const vehicle = item ? (vehicles.find((v) => v.id === item.vehicleId) ?? null) : null;
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {item && (
          <>
            <SheetHeader className="space-y-3">
              <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground/70">
                <Wrench className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-lg font-mono">{item.id.slice(0, 8).toUpperCase()}</SheetTitle>
                <SheetDescription>{item.type} · {vehicle?.plate ?? item.vehicleId?.slice(0, 8)}</SheetDescription>
              </div>
              <div className="flex gap-2">
                <DomainStatusBadge status={item.status} />
                <StatusBadge tone={priorityTone[item.priority]}>{item.priority} priority</StatusBadge>
              </div>
            </SheetHeader>

            <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <p className="mt-1 text-sm text-foreground">{item.description}</p>
            </div>

            <div className="mt-5 divide-y divide-border/60">
              <h4 className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Service Details
              </h4>
              <DetailRow label="Vehicle" icon={<Wrench className="size-3.5" />}>
                {vehicle?.plate ?? item.vehicleId?.slice(0, 8)} · {vehicle?.model}
              </DetailRow>
              <DetailRow label="Service type" icon={<Wrench className="size-3.5" />}>
                {item.type}
              </DetailRow>
              <DetailRow label="Logged date" icon={<CalendarClock className="size-3.5" />}>
                {item.scheduled}
              </DetailRow>
              <DetailRow label="Technician" icon={<User className="size-3.5" />}>
                {item.technician}
              </DetailRow>
              <DetailRow label="Estimated cost" icon={<CircleCheck className="size-3.5" />}>
                {formatCurrency(item.cost)}
              </DetailRow>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Pencil className="size-4" /> Edit
              </Button>
              {item.status === "in_progress" && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => { onMarkComplete(item.id); onClose(); }}
                  disabled={isClosing}
                >
                  <CircleCheck className="size-4" /> Mark Complete
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
