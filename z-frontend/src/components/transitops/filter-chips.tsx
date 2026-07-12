"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterChips({
  options,
  value,
  onChange,
  className,
}: FilterChipsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/30 p-0.5",
        className
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={cn(
                  "rounded px-1 text-[10px] tnum",
                  active
                    ? "bg-foreground/[0.06] text-foreground/70"
                    : "bg-foreground/[0.04] text-muted-foreground"
                )}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
