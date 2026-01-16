"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { store } from "@/lib/store";

export function AppGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Allow lock page always
    if (pathname === "/lock") return;

    // If PIN exists → force lock
    if (store.hasPin()) {
      const unlocked = sessionStorage.getItem("finance_unlocked") === "1";
      if (!unlocked) {
        router.replace("/lock");
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
