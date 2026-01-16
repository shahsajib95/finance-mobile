"use client";

import * as React from "react";
import { Plus, AlertTriangle, Wallet } from "lucide-react";
import { useBudgetUsage } from "@/hooks/useFinanceStore";
import { store } from "@/lib/store";
import { cn } from "@/lib/utils";

function money(n: number) {
  return `৳ ${n.toLocaleString()}`;
}

function statusMeta(status: string) {
  if (status === "over")
    return {
      bar: "bg-destructive",
      chip: "bg-destructive/10 text-destructive",
      label: "Over limit",
    };
  if (status === "warning")
    return {
      bar: "bg-yellow-500",
      chip: "bg-yellow-500/10 text-yellow-700",
      label: "Near limit",
    };
  return {
    bar: "bg-primary",
    chip: "bg-primary/10 text-primary",
    label: "On track",
  };
}

export default function BudgetsPage() {
  const budgets = useBudgetUsage() ?? [];
  const [category, setCategory] = React.useState("");
  const [limit, setLimit] = React.useState("");

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md p-5 pb-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight">Budgets</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Monthly category limits
            </div>
          </div>

          <div className="h-10 w-10 rounded-2xl bg-muted grid place-items-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Hero summary */}
        <div className="mt-5 relative overflow-hidden rounded-[28px] p-5 text-primary-foreground shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="text-xs text-primary-foreground/70">
              Budget overview (This month)
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight">
              {money(totalSpent)} / {money(totalLimit)}
            </div>

            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                Track spending before limits are crossed
              </span>
            </div>

            {/* overall bar */}
            <div className="mt-5">
              <div className="flex justify-between text-[11px] text-primary-foreground/70">
                <span>Total usage</span>
                <span>
                  {Math.min(
                    100,
                    Math.round(
                      (totalSpent / Math.max(totalLimit, 1)) * 100
                    )
                  )}
                  %
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${Math.min(
                      100,
                      (totalSpent / Math.max(totalLimit, 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add budget */}
        <div className="mt-5 rounded-[28px] border bg-card p-5 shadow-sm">
          <div className="text-sm font-semibold">Add / Update budget</div>

          <div className="mt-4 space-y-3">
            <input
              className="w-full h-11 rounded-2xl border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Category (Food, Rent...)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <input
              className="w-full h-11 rounded-2xl border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Monthly limit"
              inputMode="numeric"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />

            <button
              className="w-full h-11 rounded-2xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:opacity-95 transition inline-flex items-center justify-center gap-2"
              onClick={() => {
                if (!category || !limit) return;
                store.setBudget(category, Number(limit));
                setCategory("");
                setLimit("");
              }}
            >
              <Plus className="h-4 w-4" />
              Save Budget
            </button>
          </div>
        </div>

        {/* Budget list */}
        <div className="mt-5 grid gap-4">
          {budgets.length === 0 && (
            <div className="rounded-[24px] border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              No budgets set yet. Add one to start tracking.
            </div>
          )}

          {budgets.map((b) => {
            const meta = statusMeta(b.status);
            return (
              <div
                key={b.category}
                className="rounded-[24px] border bg-card p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold truncate">
                        {b.category}
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-2xl px-2.5 py-1 text-[11px]",
                          meta.chip
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {money(b.spent)} spent of {money(b.limit)}
                    </div>
                  </div>

                  <button
                    className="text-xs text-destructive hover:underline shrink-0"
                    onClick={() => store.removeBudget(b.category)}
                  >
                    Remove
                  </button>
                </div>

                {/* progress */}
                <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", meta.bar)}
                    style={{ width: `${Math.min(100, b.percent)}%` }}
                  />
                </div>

                <div className="mt-2 text-[11px] text-muted-foreground">
                  Remaining: {money(b.remaining)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
