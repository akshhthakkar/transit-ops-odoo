import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface SectionCardProps extends Omit<React.ComponentProps<"div">, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  bodyClassName?: string;
  headerClassName?: string;
  /** removes default card padding so inner content (tables) can bleed edge-to-edge */
  flush?: boolean;
  children?: React.ReactNode;
}

export function SectionCard({
  title,
  description,
  action,
  icon,
  bodyClassName,
  headerClassName,
  flush = false,
  className,
  children,
  ...props
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden py-0 shadow-none",
        className
      )}
      {...props}
    >
      {(title || description || action) && (
        <div
          className={cn(
            "flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4",
            headerClassName
          )}
        >
          <div className="flex items-start gap-3 min-w-0">
            {icon && (
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground/60">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-foreground leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(flush ? "" : "p-5", bodyClassName)}>{children}</div>
    </Card>
  );
}
