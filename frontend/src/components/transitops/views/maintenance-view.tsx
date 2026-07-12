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
import { StatCard } from "../stat-card";
import { DataTable, type Column } from "../tables/data-table";
import { formatCurrency, vehicleById, type MaintenanceRecord } from "@/lib/transit-data";
import { useMaintenance } from "@/hooks/queries";

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

export function MaintenanceView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<MaintenanceRecord | null>(null);
  const { data: maintenance = [], isLoading } = useMaintenance();

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
      cell: (m) => <span className="font-medium text-foreground">{m.id}</span>,
      sortValue: (m) => m.id,
    },
    {
      key: "vehicle",
      header: "Vehicle",
      cell: (m) => {
        const v = vehicleById(m.vehicleId);
        return (
          <div>
            <p className="font-medium text-foreground">{v?.plate}</p>
            <p className="text-xs text-muted-foreground">{v?.model}</p>
          </div>
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
      header: "Scheduled",
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
            <Button size="sm" className="h-8">
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
                <DropdownMenuItem>Mark complete</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger focus:text-danger">
                  Cancel service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      </SectionCard>

      <MaintenanceDetailSheet item={selected} onClose={() => setSelected(null)} />
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
}: {
  item: MaintenanceRecord | null;
  onClose: () => void;
}) {
  const vehicle = item ? vehicleById(item.vehicleId) : null;
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
                <SheetTitle className="text-lg">{item.id}</SheetTitle>
                <SheetDescription>{item.type} · {vehicle?.plate}</SheetDescription>
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
                {vehicle?.plate} · {vehicle?.model}
              </DetailRow>
              <DetailRow label="Service type" icon={<Wrench className="size-3.5" />}>
                {item.type}
              </DetailRow>
              <DetailRow label="Scheduled date" icon={<CalendarClock className="size-3.5" />}>
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
              <Button size="sm" className="flex-1">
                <CircleCheck className="size-4" /> Mark Complete
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
