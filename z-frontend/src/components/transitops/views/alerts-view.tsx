"use client";

import * as React from "react";
import {
  TriangleAlert,
  CircleAlert,
  Info,
  Check,
  CheckCheck,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "../page-header";
import { SectionCard } from "../section-card";
import { StatCard } from "../stat-card";
import { StatusBadge, type Tone } from "../status-badge";
import { FilterChips } from "../filter-chips";
import { EmptyState } from "../empty-state";
import { alerts as initialAlerts, type Alert, type AlertSeverity } from "@/lib/transit-data";

const severityMeta: Record<AlertSeverity, { tone: Tone; icon: typeof CircleAlert; label: string }> = {
  critical: { tone: "danger", icon: CircleAlert, label: "Critical" },
  warning: { tone: "warning", icon: TriangleAlert, label: "Warning" },
  info: { tone: "info", icon: Info, label: "Info" },
};

const filterOptions = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
  { value: "unack", label: "Unacknowledged" },
];

export function AlertsView() {
  const [list, setList] = React.useState<Alert[]>(initialAlerts);
  const [filter, setFilter] = React.useState("all");
  const [ackAllOpen, setAckAllOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    if (filter === "all") return list;
    if (filter === "unack") return list.filter((a) => !a.acknowledged);
    return list.filter((a) => a.severity === filter);
  }, [list, filter]);

  const options = filterOptions.map((o) => ({
    ...o,
    count:
      o.value === "all"
        ? list.length
        : o.value === "unack"
          ? list.filter((a) => !a.acknowledged).length
          : list.filter((a) => a.severity === o.value).length,
  }));

  const critical = list.filter((a) => a.severity === "critical").length;
  const warning = list.filter((a) => a.severity === "warning").length;
  const unack = list.filter((a) => !a.acknowledged).length;

  function ack(id: string) {
    setList((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }

  function ackAll() {
    setList((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    setAckAllOpen(false);
  }

  // group by severity for display
  const grouped = React.useMemo(() => {
    const order: AlertSeverity[] = ["critical", "warning", "info"];
    return order
      .map((sev) => ({ sev, items: filtered.filter((a) => a.severity === sev) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumb={[{ label: "Insights" }, { label: "Alerts" }]}
        title="Alerts & Notifications"
        description={`${unack} unacknowledged · ${critical} critical`}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setAckAllOpen(true)}
            disabled={unack === 0}
          >
            <CheckCheck className="size-4" /> Acknowledge all
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Critical"
          value={critical}
          icon={<CircleAlert className="size-4" />}
          delta={critical}
          deltaLabel="active"
        />
        <StatCard
          label="Warnings"
          value={warning}
          icon={<TriangleAlert className="size-4" />}
          delta={warning}
          deltaLabel="active"
        />
        <StatCard
          label="Unacknowledged"
          value={unack}
          icon={<Info className="size-4" />}
          delta={-2}
          deltaLabel="vs yesterday"
        />
        <StatCard
          label="Acknowledged"
          value={list.length - unack}
          icon={<Check className="size-4" />}
          delta={2}
          deltaLabel="vs yesterday"
        />
      </div>

      <SectionCard
        title="Alert Feed"
        description="Real-time fleet alerts & exceptions"
        icon={<TriangleAlert className="size-4" />}
        headerClassName="flex-col items-stretch sm:flex-row sm:items-center"
        action={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <FilterChips options={options} value={filter} onChange={setFilter} />
          </div>
        }
        bodyClassName="p-0"
      >
        {grouped.length === 0 ? (
          <EmptyState
            icon={<Check className="size-5" />}
            title="No alerts match this filter"
            description="All clear. Try a different filter to see more alerts."
          />
        ) : (
          <div className="divide-y divide-border/50">
            {grouped.map((group) => (
              <div key={group.sev}>
                <div className="flex items-center gap-2 bg-muted/30 px-5 py-2">
                  <StatusBadge tone={severityMeta[group.sev].tone} dot>
                    {severityMeta[group.sev].label}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground tnum">
                    {group.items.length} {group.items.length === 1 ? "alert" : "alerts"}
                  </span>
                </div>
                {group.items.map((a) => {
                  const meta = severityMeta[a.severity];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={a.id}
                      className={cn(
                        "flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30",
                        a.acknowledged && "opacity-60"
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          a.severity === "critical" && "text-danger",
                          a.severity === "warning" && "text-warning",
                          a.severity === "info" && "text-muted-foreground"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{a.type}</p>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs font-medium text-foreground/80">{a.ref}</span>
                          {a.acknowledged && (
                            <StatusBadge tone="neutral">
                              <Check className="size-2.5" /> Acked
                            </StatusBadge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{a.message}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs text-muted-foreground">{a.time}</span>
                        {!a.acknowledged && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => ack(a.id)}
                          >
                            <Check className="size-3.5" /> Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <AlertDialog open={ackAllOpen} onOpenChange={setAckAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acknowledge all alerts?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all {unack} unacknowledged alerts as reviewed. You can still find them in the feed afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={ackAll}>
              <CheckCheck className="size-4" /> Acknowledge all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
