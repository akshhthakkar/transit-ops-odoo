"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { LoginView } from "@/components/transitops/views/login-view";

export default function LoginPage() {
  const { token, hydrate } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  React.useEffect(() => {
    if (hydrated && token) {
      router.push("/dashboard");
    }
  }, [hydrated, token, router]);

  if (!hydrated) return null;

  return <LoginView />;
}
