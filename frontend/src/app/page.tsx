"use client";

import React, { Suspense } from "react";
import HomePage from "@/components/transitops/landing/HomePage";

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>}>
      <HomePage />
    </Suspense>
  );
}
