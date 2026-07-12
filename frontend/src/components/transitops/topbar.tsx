"use client";

import * as React from "react";
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Building2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNav } from "@/store/nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { alerts } from "@/lib/transit-data";
import { StatusBadge } from "./status-badge";
import { CommandPalette } from "./command-palette";

function severityTone(sev: string) {
  if (sev === "critical") return "danger" as const;
  if (sev === "warning") return "warning" as const;
  return "info" as const;
}

export function Topbar() {
  const { setMobileNavOpen } = useNav();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [now, setNow] = React.useState<string>("");
  const unread = alerts.filter((a) => !a.acknowledged).length;

  React.useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-4.5" />
        </Button>

        <button
          onClick={() => setPaletteOpen(true)}
          className="group flex h-9 w-full max-w-md items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search vehicles, drivers, trips…</span>
          <kbd className="hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="mr-1 hidden items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 md:flex">
            <span className="size-1.5 rounded-full bg-success" />
            <span className="text-xs font-medium text-foreground tnum">{now}</span>
            <span className="text-xs text-muted-foreground">CST</span>
          </div>

          <Button variant="ghost" size="icon" className="size-8" aria-label="Help">
            <HelpCircle className="size-4.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative size-8"
                aria-label="Notifications"
              >
                <Bell className="size-4.5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger opacity-60" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-danger" />
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <p className="text-sm font-semibold">Notifications</p>
                <span className="rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger tnum">
                  {unread} new
                </span>
              </div>
              <div className="scrollbar-thin max-h-80 overflow-y-auto">
                {alerts.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 border-b border-border/60 px-3 py-2.5 last:border-0 hover:bg-muted/50"
                  >
                    <div className="mt-0.5">
                      <StatusBadge tone={severityTone(a.severity)} dot>
                        {a.type}
                      </StatusBadge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {a.ref}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {a.message}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-2">
                <Button variant="ghost" size="sm" className="w-full justify-center text-xs">
                  View all alerts
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-muted">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-foreground text-[11px] font-medium text-background">
                    AK
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight md:block">
                  <p className="text-xs font-medium text-foreground">Alex Kowalski</p>
                  <p className="text-[10px] text-muted-foreground">Fleet Manager</p>
                </div>
                <ChevronDown className="hidden size-3 text-muted-foreground md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Alex Kowalski</span>
                <span className="text-xs font-normal text-muted-foreground">
                  alex@transitops.io
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Building2 className="size-4" /> Switch depot
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Check className="size-4" /> Mark all read
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger focus:text-danger">
                <LogOut className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
