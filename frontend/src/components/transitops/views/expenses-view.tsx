"use client";

import * as React from "react";
import {
  Receipt,
  Plus,
  Download,
  MoreHorizontal,
  Truck,
  IdCard,
  Check,
  X,
  Eye,
  Pencil,
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
import { DomainStatusBadge, type Tone } from "../status-badge";
import { FilterChips } from "../filter-chips";
import { StatCard } from "../stat-card";
import { MinimalDonutChart } from "../charts";
import { DataTable, type Column } from "../tables/data-table";
import { formatCurrency, vehicleById, driverById, type Expense } from "@/lib/transit-data";
import { useExpenses } from "@/hooks/queries";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "reimbursed", label: "Reimbursed" },
];

const categoryColors: Record<string, string> = {
  Fuel: "#111827",
  Maintenance: "#d97706",
  Tolls: "#0d9488",
  "Driver Pay": "#6b7280",
  Insurance: "#9ca3af",
  Parts: "#d97706",
  Permits: "#0d9488",
  Other: "#9ca3af",
};

export function ExpensesView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<Expense | null>(null);
  const { data: expenses = [], isLoading } = useExpenses();

  const filtered = React.useMemo(
    () => (filter === "all" ? expenses : expenses.filter((e) => e.status === filter)),
    [filter, expenses]
  );

  const options = statusOptions.map((o) => ({
    ...o,
    count:
      o.value === "all"
        ? expenses.length
        : expenses.filter((e) => e.status === o.value).length,
  }));

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter((e) => e.status === "pending");
  const pendingTotal = pending.reduce((s, e) => s + e.amount, 0);
  const fuelTotal = expenses.filter((e) => e.category === "Fuel").reduce((s, e) => s + e.amount, 0);
  const maintTotal = expenses
    .filter((e) => e.category === "Maintenance")
    .reduce((s, e) => s + e.amount, 0);

  const categoryBreakdown = React.useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, color: categoryColors[name] ?? "#9ca3af" }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading expenses...</div>;

  const columns: Column<Expense>[] = [
    {
      key: "id",
      header: "ID",
      cell: (e) => <span className="font-medium text-foreground">{e.id}</span>,
      sortValue: (e) => e.id,
    },
    {
      key: "category",
      header: "Category",
      cell: (e) => (
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2 rounded-sm"
            style={{ backgroundColor: categoryColors[e.category] ?? "#9ca3af" }}
          />
          <span className="text-foreground">{e.category}</span>
        </span>
      ),
      sortValue: (e) => e.category,
    },
    {
      key: "vendor",
      header: "Vendor",
      cell: (e) => <span className="text-foreground">{e.vendor}</span>,
      sortValue: (e) => e.vendor,
      hideOnMobile: true,
    },
    {
      key: "ref",
      header: "Associated",
      cell: (e) => {
        const v = vehicleById(e.vehicleId);
        const d = driverById(e.driverId);
        if (v)
          return (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Truck className="size-3" /> {v.plate}
            </span>
          );
        if (d)
          return (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <IdCard className="size-3" /> {d.name}
            </span>
          );
        return <span className="text-muted-foreground/60">—</span>;
      },
      sortValue: (e) => vehicleById(e.vehicleId)?.plate ?? driverById(e.driverId)?.name ?? "",
      hideOnMobile: true,
    },
    {
      key: "date",
      header: "Date",
      cell: (e) => <span className="text-muted-foreground tnum">{e.date}</span>,
      sortValue: (e) => e.date,
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      cell: (e) => <DomainStatusBadge status={e.status} />,
      sortValue: (e) => e.status,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (e) => (
        <span className="font-medium text-foreground tnum">{formatCurrency(e.amount)}</span>
      ),
      sortValue: (e) => e.amount,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Insights" }, { label: "Expenses" }]}
        title="Expenses"
        description={`${expenses.length} transactions · ${pending.length} pending approval`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="h-8">
              <Plus className="size-4" /> Record Expense
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Expenses"
          value={formatCurrency(total, true)}
          icon={<Receipt className="size-4" />}
          delta={2.1}
          invertDelta
          deltaLabel="vs last month"
        />
        <StatCard
          label="Pending Approval"
          value={formatCurrency(pendingTotal, true)}
          icon={<Receipt className="size-4" />}
          delta={pending.length}
          deltaLabel="transactions"
        />
        <StatCard
          label="Fuel"
          value={formatCurrency(fuelTotal, true)}
          icon={<Receipt className="size-4" />}
          delta={3.6}
          invertDelta
          deltaLabel="vs last month"
        />
        <StatCard
          label="Maintenance"
          value={formatCurrency(maintTotal, true)}
          icon={<Receipt className="size-4" />}
          delta={-8.2}
          invertDelta
          deltaLabel="vs last month"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          flush
        >
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(e) => e.id}
            onRowClick={(e) => setSelected(e)}
            searchable
            searchFn={(e, q) =>
              e.id.toLowerCase().includes(q) ||
              e.vendor.toLowerCase().includes(q) ||
              e.category.toLowerCase().includes(q) ||
              e.reference.toLowerCase().includes(q)
            }
            searchPlaceholder="Search by ID, vendor, category…"
            pageSize={10}
            toolbar={<FilterChips options={options} value={filter} onChange={setFilter} />}
            actions={(e) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelected(e)}>
                    <Eye className="size-4" /> View details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Check className="size-4" /> Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <X className="size-4" /> Reject
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          />
        </SectionCard>

        <SectionCard
          title="By Category"
          description="Spending breakdown"
          icon={<Receipt className="size-4" />}
        >
          <MinimalDonutChart
            data={categoryBreakdown}
            height={200}
            centerValue={formatCurrency(total, true)}
            centerLabel="Total"
            valueFormatter={(v) => formatCurrency(v, true)}
          />
          <div className="mt-4 space-y-2">
            {categoryBreakdown.slice(0, 6).map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-sm" style={{ backgroundColor: c.color }} />
                <span className="text-muted-foreground">{c.name}</span>
                <span className="ml-auto font-medium text-foreground tnum">
                  {formatCurrency(c.value, true)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <ExpenseDetailSheet item={selected} onClose={() => setSelected(null)} />
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

function ExpenseDetailSheet({
  item,
  onClose,
}: {
  item: Expense | null;
  onClose: () => void;
}) {
  const vehicle = item ? vehicleById(item.vehicleId) : null;
  const driver = item ? driverById(item.driverId) : null;
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {item && (
          <>
            <SheetHeader className="space-y-3">
              <div className="flex size-11 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground/70">
                <Receipt className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-lg">{item.id}</SheetTitle>
                <SheetDescription>{item.category} · {item.reference}</SheetDescription>
              </div>
              <div className="flex items-center gap-3">
                <DomainStatusBadge status={item.status} />
                <span className="text-xl font-semibold text-foreground tnum">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            </SheetHeader>

            <div className="mt-6 divide-y divide-border/60">
              <h4 className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Transaction
              </h4>
              <DetailRow label="Vendor" icon={<Receipt className="size-3.5" />}>
                {item.vendor}
              </DetailRow>
              <DetailRow label="Date" icon={<Receipt className="size-3.5" />}>
                {item.date}
              </DetailRow>
              <DetailRow label="Category" icon={<Receipt className="size-3.5" />}>
                {item.category}
              </DetailRow>
              <DetailRow label="Reference" icon={<Receipt className="size-3.5" />}>
                {item.reference}
              </DetailRow>
              {vehicle && (
                <DetailRow label="Vehicle" icon={<Truck className="size-3.5" />}>
                  {vehicle.plate} · {vehicle.model}
                </DetailRow>
              )}
              {driver && (
                <DetailRow label="Driver" icon={<IdCard className="size-3.5" />}>
                  {driver.name}
                </DetailRow>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <X className="size-4" /> Reject
              </Button>
              <Button size="sm" className="flex-1">
                <Check className="size-4" /> Approve
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
