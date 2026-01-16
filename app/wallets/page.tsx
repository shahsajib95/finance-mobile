"use client";

import * as React from "react";
import {
  ChevronLeft,
  SlidersHorizontal,
  Plus,
  Wallet as WalletIcon,
  Landmark,
} from "lucide-react";
import { useWallets } from "@/hooks/useFinanceStore";
import { AddWalletSheet } from "@/components/add-wallet-sheet";
import { cn } from "@/lib/utils";

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}৳ ${abs.toLocaleString()}`;
}

function WalletBadge({ type }: { type: "cash" | "bank" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border px-2.5 py-1 text-[11px]",
        type === "cash"
          ? "bg-primary/5 text-primary border-primary/20"
          : "bg-muted text-muted-foreground"
      )}
    >
      {type === "cash" ? (
        <>
          <WalletIcon className="h-3.5 w-3.5" />
          Cash
        </>
      ) : (
        <>
          <Landmark className="h-3.5 w-3.5" />
          Bank
        </>
      )}
    </span>
  );
}

export default function WalletsPage() {
  const wallets = useWallets();
  const total = React.useMemo(
    () => wallets.reduce((s, w) => s + (w.balance || 0), 0),
    [wallets]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md p-5 pb-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <button className="h-10 w-10 rounded-2xl grid place-items-center bg-muted hover:bg-muted/70 transition">
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>

          <div className="text-sm font-semibold tracking-tight">Wallets</div>

          <button className="h-10 w-10 rounded-2xl grid place-items-center bg-muted hover:bg-muted/70 transition">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* hero */}
        <div className="mt-5 relative overflow-hidden rounded-[28px] p-5 text-primary-foreground shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-primary-foreground/70">
                  Total of all wallets
                </div>
                <div className="mt-1 text-3xl font-bold tracking-tight">
                  {money(total)}
                </div>

                <div className="mt-3 text-xs text-primary-foreground/70">
                  {wallets.length} wallet{wallets.length === 1 ? "" : "s"}
                </div>
              </div>

              <AddWalletSheet>
                <button className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/15 grid place-items-center transition active:scale-[0.98]">
                  <Plus className="h-5 w-5 text-primary-foreground" />
                </button>
              </AddWalletSheet>
            </div>
          </div>
        </div>

        {/* list header */}
        <div className="mt-5 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">My wallets</div>
            <div className="text-xs text-muted-foreground">
              Tap a wallet to see details (later)
            </div>
          </div>

          <AddWalletSheet>
            <button className="h-9 px-3 rounded-2xl bg-muted hover:bg-muted/70 text-xs font-medium transition">
              + Add
            </button>
          </AddWalletSheet>
        </div>

        {/* wallets list */}
        <div className="mt-3 grid gap-3">
          {wallets.map((w) => {
            const isCash = w.type === "cash";
            return (
              <button
                key={w.id}
                className="text-left rounded-[24px] border bg-card p-4 shadow-sm hover:shadow-md transition active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-11 w-11 rounded-2xl grid place-items-center",
                        isCash ? "bg-primary/10" : "bg-muted"
                      )}
                    >
                      {isCash ? (
                        <WalletIcon className="h-5 w-5 text-primary" />
                      ) : (
                        <Landmark className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-semibold">{w.name}</div>
                      <div className="mt-1">
                        <WalletBadge type={w.type} />
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold">{money(w.balance)}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Available
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {!wallets.length && (
            <div className="rounded-[24px] border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              <div className="font-medium text-foreground">No wallets yet</div>
              <div className="mt-1">
                Tap <span className="font-semibold">+</span> to add your first
                wallet.
              </div>

              <div className="mt-4">
                <AddWalletSheet>
                  <button className="h-10 px-4 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-sm active:scale-[0.99] transition">
                    Add wallet
                  </button>
                </AddWalletSheet>
              </div>
            </div>
          )}
        </div>

        {/* Popular operations */}
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Popular operations</div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition">
              See all
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-3">
            {[
              { label: "All", icon: "🏠" },
              { label: "Health", icon: "❤️" },
              { label: "Travel", icon: "✈️" },
              { label: "Food", icon: "🍔" },
            ].map((c) => (
              <button
                key={c.label}
                className="rounded-[22px] border bg-card p-3 shadow-sm hover:shadow-md transition active:scale-[0.99]"
              >
                <div className="h-10 w-10 mx-auto rounded-2xl bg-muted grid place-items-center text-lg">
                  {c.icon}
                </div>
                <div className="mt-2 text-center text-[11px] text-muted-foreground">
                  {c.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
