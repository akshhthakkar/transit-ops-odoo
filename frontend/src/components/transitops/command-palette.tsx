"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useNav, type NavKey } from "@/store/nav";
import { navGroups } from "./nav-config";
import { vehicles, drivers } from "@/lib/transit-data";
import { Truck, IdCard, Plus, FileText, Wrench, Download } from "lucide-react";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { set } = useNav();

  const go = (key: NavKey) => {
    set(key);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-xl"
    >
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {navGroups
            .flatMap((g) => g.items)
            .map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.key}
                  value={`${item.label} navigate ${item.key}`}
                  onSelect={() => go(item.key as NavKey)}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => go("trips")}>
            <Plus className="size-4" /> Create new trip
          </CommandItem>
          <CommandItem onSelect={() => go("vehicles")}>
            <Truck className="size-4" /> Register vehicle
          </CommandItem>
          <CommandItem onSelect={() => go("drivers")}>
            <IdCard className="size-4" /> Add driver
          </CommandItem>
          <CommandItem onSelect={() => go("maintenance")}>
            <Wrench className="size-4" /> Schedule maintenance
          </CommandItem>
          <CommandItem onSelect={() => go("expenses")}>
            <FileText className="size-4" /> Record expense
          </CommandItem>
          <CommandItem onSelect={() => go("analytics")}>
            <Download className="size-4" /> Export fleet report
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Vehicles">
          {vehicles.slice(0, 5).map((v) => (
            <CommandItem
              key={v.id}
              value={`${v.plate} ${v.model} ${v.type} vehicle`}
              onSelect={() => go("vehicles")}
            >
              <Truck className="size-4" />
              <span className="font-medium">{v.plate}</span>
              <span className="text-muted-foreground">{v.model}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Drivers">
          {drivers.slice(0, 5).map((d) => (
            <CommandItem
              key={d.id}
              value={`${d.name} driver ${d.license}`}
              onSelect={() => go("drivers")}
            >
              <IdCard className="size-4" />
              <span className="font-medium">{d.name}</span>
              <span className="text-muted-foreground">{d.homeBase}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
