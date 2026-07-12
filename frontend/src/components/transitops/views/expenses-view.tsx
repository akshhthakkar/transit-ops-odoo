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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, vehicleById, driverById, type Expense } from "@/lib/transit-data";
import {
  useExpenses,
  useVehicles,
  useCreateExpense,
  useCreateFuelLog,
} from "@/hooks/queries";

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
  Tolls: "#FF540E",
  "Driver Pay": "#6b7280",
  Insurance: "#9ca3af",
  Parts: "#d97706",
  Permits: "#FF540E",
  Other: "#9ca3af",
};

export function ExpensesView() {
  const [filter, setFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<Expense | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
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

  const handleExport = () => {
    const headers = ["Transaction ID", "Category", "Amount ($)", "Date", "Vendor/Description", "Vehicle ID", "Reference"];
    const rows = expenses.map((e) => [
      e.id,
      e.category,
      e.amount,
      e.date,
      e.vendor,
      e.vehicleId || "",
      e.reference || "",
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
    link.setAttribute("download", "expenses-export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Insights" }, { label: "Expenses" }]}
        title="Expenses"
        description={`${expenses.length} transactions · ${pending.length} pending approval`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="h-8" onClick={() => setAddOpen(true)}>
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
      <RecordExpenseDialog open={addOpen} onClose={() => setAddOpen(false)} />
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

export function RecordExpenseDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: vehicles = [] } = useVehicles();
  const createExpense = useCreateExpense();
  const createFuelLog = useCreateFuelLog();

  const [type, setType] = React.useState<"GENERAL" | "FUEL">("GENERAL");
  const [vehicleId, setVehicleId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [expenseType, setExpenseType] = React.useState("OTHER");

  const [liters, setLiters] = React.useState("");
  const [cost, setCost] = React.useState("");
  const [odometer, setOdometer] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setType("GENERAL");
      setVehicleId("");
      setAmount("");
      setDescription("");
      setExpenseType("OTHER");
      setLiters("");
      setCost("");
      setOdometer("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError("Please select a vehicle.");
      return;
    }

    try {
      if (type === "GENERAL") {
        if (!amount || !description) {
          setError("Please enter amount and description.");
          return;
        }
        await createExpense.mutateAsync({
          vehicleId,
          type: expenseType,
          amount: Number(amount),
          description: description.trim(),
        });
      } else {
        if (!liters || !cost) {
          setError("Please enter liters and cost.");
          return;
        }
        await createFuelLog.mutateAsync({
          vehicleId,
          liters: Number(liters),
          cost: Number(cost),
          odometer: odometer ? Number(odometer) : undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to save record.");
    }
  }

  const isPending = createExpense.isPending || createFuelLog.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Expense / Fuel Log</DialogTitle>
          <DialogDescription>
            Log general fleet expenses or fuel transactions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Record Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as "GENERAL" | "FUEL")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General Expense</SelectItem>
                  <SelectItem value="FUEL">Fuel Log</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle *</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate} — {v.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "GENERAL" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Expense Category *</Label>
                  <Select value={expenseType} onValueChange={setExpenseType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TOLL">Toll Charge</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="OTHER">Other Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Amount ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="125.50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description / Vendor *</Label>
                <Input
                  placeholder="Pilot Travel Centers #452"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Fuel Volume (Liters) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="350"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Total Cost ($) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="480.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Odometer Reading (mi)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="145820"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                />
              </div>
            </>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
