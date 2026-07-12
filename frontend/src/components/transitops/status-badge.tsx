import * as React from "react";
import { cn } from "@/lib/utils";

export type Tone =
  | "success"
  | "warning"
  | "danger"
  | "brand"
  | "neutral"
  | "info";

const toneStyles: Record<Tone, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  brand: "bg-brand/10 text-brand border-brand/20",
  neutral: "bg-foreground/5 text-foreground/70 border-foreground/10",
  info: "bg-foreground/[0.04] text-foreground/60 border-foreground/10",
};

const dotStyles: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  brand: "bg-brand",
  neutral: "bg-foreground/40",
  info: "bg-foreground/30",
};

interface StatusBadgeProps extends React.ComponentProps<"span"> {
  tone?: Tone;
  dot?: boolean;
  uppercase?: boolean;
  children: React.ReactNode;
}

export function StatusBadge({
  tone = "neutral",
  dot = false,
  uppercase = false,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneStyles[tone],
        uppercase && "uppercase tracking-wide",
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("size-1.5 rounded-full", dotStyles[tone])} aria-hidden />
      )}
      {children}
    </span>
  );
}

// Convenience map for domain statuses → tone + label
const statusMap: Record<string, { tone: Tone; label: string }> = {
  // Vehicles
  active: { tone: "success", label: "Active" },
  available: { tone: "brand", label: "Available" },
  maintenance: { tone: "warning", label: "Maintenance" },
  idle: { tone: "neutral", label: "Idle" },
  offline: { tone: "danger", label: "Offline" },
  // Drivers
  on_duty: { tone: "success", label: "On Duty" },
  off_duty: { tone: "neutral", label: "Off Duty" },
  on_leave: { tone: "info", label: "On Leave" },
  // Trips
  in_transit: { tone: "brand", label: "In Transit" },
  loading: { tone: "warning", label: "Loading" },
  scheduled: { tone: "info", label: "Scheduled" },
  completed: { tone: "success", label: "Completed" },
  delayed: { tone: "danger", label: "Delayed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  // Maintenance
  in_progress: { tone: "warning", label: "In Progress" },
  overdue: { tone: "danger", label: "Overdue" },
  // Expenses
  approved: { tone: "success", label: "Approved" },
  pending: { tone: "warning", label: "Pending" },
  rejected: { tone: "danger", label: "Rejected" },
  reimbursed: { tone: "brand", label: "Reimbursed" },
};

export function DomainStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const entry = statusMap[status] ?? { tone: "neutral" as Tone, label: status };
  return (
    <StatusBadge tone={entry.tone} dot className={className}>
      {entry.label}
    </StatusBadge>
  );
}

export { toneStyles };
