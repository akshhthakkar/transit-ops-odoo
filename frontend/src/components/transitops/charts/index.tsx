"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const axisTick = {
  fontSize: 11,
  fill: "#6b7280",
  fontFamily: "inherit",
};

const gridProps = {
  stroke: "#e5e7eb",
  strokeDasharray: "3 3",
  vertical: false,
};

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

function ChartTooltip({
  label,
  payload,
  formatter,
}: {
  label?: string | number;
  payload?: TooltipPayloadItem[];
  formatter?: (value: number, name: string) => string;
}) {
  if (!payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      {label !== undefined && (
        <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      )}
      <div className="space-y-0.5">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="size-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto font-medium text-foreground tnum">
              {formatter && typeof item.value === "number"
                ? formatter(item.value, String(item.name ?? ""))
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Area chart
// ---------------------------------------------------------------------------
interface AreaChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: Array<{ key: string; name: string; color: string }>;
  height?: number;
  valueFormatter?: (v: number, name: string) => string;
  className?: string;
}

export function MinimalAreaChart({
  data,
  xKey,
  series,
  height = 240,
  valueFormatter,
  className,
}: AreaChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={<ChartTooltip formatter={valueFormatter} />}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              fill={s.color}
              fillOpacity={0.06}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bar chart
// ---------------------------------------------------------------------------
interface BarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  bars: Array<{ key: string; name: string; color: string }>;
  height?: number;
  valueFormatter?: (v: number, name: string) => string;
  stacked?: boolean;
  className?: string;
}

export function MinimalBarChart({
  data,
  xKey,
  bars,
  height = 240,
  valueFormatter,
  stacked = false,
  className,
}: BarChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            content={<ChartTooltip formatter={valueFormatter} />}
          />
          {bars.length > 1 && (
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
          )}
          {bars.map((b) => (
            <Bar
              key={b.key}
              dataKey={b.key}
              name={b.name}
              fill={b.color}
              radius={stacked ? [0, 0, 0, 0] : [3, 3, 0, 0]}
              stackId={stacked ? "a" : undefined}
              maxBarSize={stacked ? 36 : 28}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Donut chart
// ---------------------------------------------------------------------------
interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  valueFormatter?: (v: number) => string;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export function MinimalDonutChart({
  data,
  height = 200,
  innerRadius = 56,
  outerRadius = 80,
  valueFormatter,
  centerLabel,
  centerValue,
  className,
}: DonutChartProps) {
  return (
    <div className={cn("relative w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0];
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="size-2 rounded-sm"
                      style={{ backgroundColor: p.payload.color }}
                    />
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="ml-auto font-medium text-foreground tnum">
                      {valueFormatter
                        ? valueFormatter(Number(p.value))
                        : p.value}
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <span className="text-xl font-semibold text-foreground tnum">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-xs text-muted-foreground">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
