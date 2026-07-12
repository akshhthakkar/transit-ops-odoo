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
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [depotOpen, setDepotOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [now, setNow] = React.useState<string>("");

  const [notifications, setNotifications] = React.useState(() =>
    alerts.map((a) => ({ ...a, read: false }))
  );

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const initials = React.useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const displayRole = React.useMemo(() => {
    if (!user?.role) return "User";
    return user.role
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.substring(1))
      .join(" ");
  }, [user]);

  function handleSignOut() {
    logout();
    router.push("/login");
  }

  React.useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
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
            <span className="text-xs text-muted-foreground">IST</span>
          </div>

          <Button variant="ghost" size="icon" className="size-8" aria-label="Help" onClick={() => setHelpOpen(true)}>
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
                {unreadCount > 0 && (
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
                  {unreadCount} new
                </span>
              </div>
              <div className="scrollbar-thin max-h-80 overflow-y-auto">
                {notifications.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    onClick={() => toggleRead(a.id)}
                    className={cn(
                      "flex gap-3 border-b border-border/60 px-3 py-2.5 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                      !a.read && "bg-brand/5 font-medium"
                    )}
                  >
                    <div className="mt-0.5">
                      <StatusBadge tone={severityTone(a.severity)} dot={!a.read}>
                        {a.type}
                      </StatusBadge>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {a.ref}
                      </p>
                      <p className={cn("line-clamp-2 text-xs text-muted-foreground", !a.read && "text-foreground/90")}>
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
                <Button variant="ghost" size="sm" className="w-full justify-center text-xs" onClick={markAllRead}>
                  Mark all as read
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-muted">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-foreground text-[11px] font-medium text-background">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left leading-tight md:block">
                  <p className="text-xs font-medium text-foreground">{user?.name ?? "Guest User"}</p>
                  <p className="text-[10px] text-muted-foreground">{displayRole}</p>
                </div>
                <ChevronDown className="hidden size-3 text-muted-foreground md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{user?.name ?? "Guest User"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email ?? "no-email@transitops.com"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setProfileOpen(true)} className="cursor-pointer">
                <User className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDepotOpen(true)} className="cursor-pointer">
                <Building2 className="size-4" /> Switch depot
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSettingsOpen(true)} className="cursor-pointer">
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Check className="size-4" /> Mark all read
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger focus:text-danger cursor-pointer" onSelect={handleSignOut}>
                <LogOut className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} user={user} displayRole={displayRole} />
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <SwitchDepotDialog open={depotOpen} onClose={() => setDepotOpen(false)} />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

function ProfileDialog({ open, onClose, user, displayRole }: { open: boolean; onClose: () => void; user: any; displayRole: string }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>Your Shift account details and active role scope.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-foreground text-sm font-semibold text-background">
                {user?.name ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{user?.name ?? "Guest User"}</h4>
              <p className="text-xs text-muted-foreground">{displayRole}</p>
            </div>
          </div>
          <div className="divide-y divide-border/60 text-xs">
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground">Email Address</span>
              <span className="font-medium text-foreground">{user?.email ?? "—"}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground">System Privilege</span>
              <span className="font-medium text-foreground">{user?.role ?? "—"}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground">Assigned Driver ID</span>
              <span className="font-medium text-foreground">{user?.driverId ?? "None (Central Staff)"}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-muted-foreground">Platform Tenant</span>
              <span className="font-medium text-foreground font-semibold text-brand">Shift Logistics (Global)</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [distanceUnit, setDistanceUnit] = React.useState("km");
  const [tempUnit, setTempUnit] = React.useState("c");
  const [theme, setTheme] = React.useState("dark");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>System Settings</DialogTitle>
          <DialogDescription>Configure display preferences and localization for Shift.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label>Distance Unit</Label>
            <Select value={distanceUnit} onValueChange={setDistanceUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="km">Kilometers (Metric)</SelectItem>
                <SelectItem value="miles">Miles (Imperial)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Temperature Unit</Label>
            <Select value={tempUnit} onValueChange={setTempUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="c">Celsius (°C)</SelectItem>
                <SelectItem value="f">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Appearance Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Theme</SelectItem>
                <SelectItem value="dark">Dark Theme (Glassmorphic)</SelectItem>
                <SelectItem value="system">Follow System Preferences</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SwitchDepotDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedDepot, setSelectedDepot] = React.useState("central");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch Depot</DialogTitle>
          <DialogDescription>Toggle your active workspace depot to scope regional data.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label>Active Operations Depot</Label>
            <Select value={selectedDepot} onValueChange={setSelectedDepot}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="central">Central Yard Terminal (Dallas, TX)</SelectItem>
                <SelectItem value="north">North Hub Depot (Chicago, IL)</SelectItem>
                <SelectItem value="south">Southwest Regional Yard (Phoenix, AZ)</SelectItem>
                <SelectItem value="west">Pacific Freight Depot (Los Angeles, CA)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-muted-foreground bg-muted/40 p-3 rounded border border-border/60">
            Note: Switching depots scopes your dashboard counts, fleet status alerts, and map assets to the selected regional terminal location.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Documentation & Help Center</DialogTitle>
          <DialogDescription>Get quick help and guides on using the Shift Platform.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3 text-xs leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-sm">💡 Quick Start Guide</h4>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li><strong>Vehicles:</strong> Manage your trucks, vans, and trailers. Update status from "Available" to "In Shop" for maintenance.</li>
              <li><strong>Drivers:</strong> Monitor driver license expiry, verify status, and assign them to trips.</li>
              <li><strong>Trips:</strong> Dispatch new trips. Source, destination, and payload capacities are automatically validated.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-sm">⌨️ Keyboard Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="flex justify-between border border-border/60 bg-muted/30 p-2 rounded">
                <span className="text-muted-foreground">Search Hub</span>
                <kbd className="bg-background px-1 rounded border border-border">⌘K</kbd>
              </div>
              <div className="flex justify-between border border-border/60 bg-muted/30 p-2 rounded">
                <span className="text-muted-foreground">Toggle Sidebar</span>
                <kbd className="bg-background px-1 rounded border border-border">⌘B</kbd>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground text-sm">📞 Support Contact</h4>
            <p className="text-muted-foreground">
              Need advanced assistance? Reach out directly to our enterprise support desk at <span className="text-brand font-medium underline">support@shiftops.io</span> or call toll-free at +1 (800) 555-SHFT.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
