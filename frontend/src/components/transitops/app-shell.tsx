"use client";

import * as React from "react";
import { Sidebar, MobileNav } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col">
            <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          <footer className="border-t border-border/60 px-4 py-4 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
              <p>© 2025 Swift — Smart Transport Operations Platform</p>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline">v4.2.1</span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-success" />
                  All systems operational
                </span>
              </div>
            </div>
          </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
