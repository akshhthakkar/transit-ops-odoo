import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Sparkline } from "./charts/sparkline";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  /** signed number; positive → success, negative → danger */
  delta?: number;
  deltaLabel?: string;
  sparkData?: number[];
  /** invert tone semantics (e.g. for costs where up is bad) */
  invertDelta?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  delta,
  deltaLabel,
  sparkData,
  invertDelta = false,
  className,
}: StatCardProps) {
  const hasDelta = typeof delta === "number";
  const positive = hasDelta && (delta as number) >= 0;
  const good = invertDelta ? !positive : positive;

  return (
    <Card
      className={cn(
        "gap-0 p-0 shadow-none transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground tnum">
            {value}
          </p>
        </div>
        {icon && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-3 px-5 pb-4 pt-3">
        <div className="flex items-center gap-1.5 text-xs">
          {hasDelta && (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium tnum",
                  positive ? "text-success" : "text-danger",
                  !good && positive && "text-danger",
                  good && !positive && "text-success"
                )}
              >
                {positive ? (
                  <ArrowUpRight className="size-3" />
                ) : delta === 0 ? (
                  <Minus className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {Math.abs(delta as number)}%
              </span>
              {deltaLabel && (
                <span className="text-muted-foreground">{deltaLabel}</span>
              )}
            </>
          )}
        </div>
        {sparkData && sparkData.length > 1 && (
          <Sparkline
            data={sparkData}
            width={84}
            height={26}
            stroke={good ? "#16a34a" : positive ? "#dc2626" : "#6b7280"}
            fill={good ? "#16a34a" : positive ? "#dc2626" : "#6b7280"}
            className="text-muted-foreground"
          />
        )}
      </div>
    </Card>
  );
}
