"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus, Home, Wallet, List, PieChart, Settings } from "lucide-react";
import { QuickAddSheet } from "./quick-add-sheet";
import { store } from "@/lib/store";

const nav = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/wallets", label: "Wallets", icon: Wallet },
  { href: "/transactions", label: "List", icon: List },
  { href: "/reports", label: "Reports", icon: PieChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = pathname !== "/" && pathname !== "/splash";

  const router = useRouter()
  React.useEffect(() => {
    if (store.hasPin()) router.replace("/lock");
  }, []);

  return (
    <div className="min-h-screen flex justify-center p-3 bg-background">
      <div className="w-full max-w-[420px] rounded-[32px] bg-card text-card-foreground shadow-xl border border-border overflow-hidden relative">
        <div className={cn("min-h-screen", showNav && "pb-24")}>{children}</div>

        {showNav && (
          <>
            {/* FAB */}
            <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50">
              <QuickAddSheet>
                <button
                  className="h-14 w-14 rounded-full shadow-lg grid place-items-center bg-accent text-accent-foreground active:scale-[0.98] transition"
                  aria-label="Add transaction"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </QuickAddSheet>
            </div>

            {/* Bottom Nav */}
            <nav className="fixed left-1/2 -translate-x-1/2 bottom-3 w-full max-w-[420px] px-4 z-40">
              <div className="rounded-[24px] bg-card shadow-lg border border-border px-4 py-3">
                <div className="flex items-center justify-between">
                  {nav.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex flex-col items-center gap-1 text-[11px] px-2 py-1 rounded-xl transition",
                          active
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 transition",
                            active && "scale-110"
                          )}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
