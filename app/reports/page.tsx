"use client";

import * as React from "react";
import type { RangeKey } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { useExpenseCategories, useTotalsByRange } from "@/hooks/useFinanceStore";
import { TrendingDown, TrendingUp, PieChart } from "lucide-react";

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}৳ ${abs.toLocaleString()}`;
}

export default function ReportsPage() {
  const [range, setRange] = React.useState<RangeKey>("month");

  const totals = useTotalsByRange(range);
  const categories = useExpenseCategories(range);

  const max = React.useMemo(
    () => Math.max(...categories.map((c) => c.amount), 1),
    [categories]
  );

  const top = React.useMemo(() => {
    if (!categories.length) return null;
    return [...categories].sort((a, b) => b.amount - a.amount)[0];
  }, [categories]);

  const netUp = totals.net >= 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md p-5 pb-10">
        {/* Title */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight">Reports</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Expense breakdown • {range.toUpperCase()}
            </div>
          </div>

          <div className="h-10 w-10 rounded-2xl bg-muted grid place-items-center">
            <PieChart className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Range chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(["day", "week", "month", "year"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "h-9 px-4 rounded-2xl text-xs font-medium border transition",
                range === r
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Hero summary */}
        <div className="mt-5 relative overflow-hidden rounded-[28px] p-5 text-primary-foreground shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-primary-foreground/70">
                  Summary ({range.toUpperCase()})
                </div>
                <div className="mt-1 text-2xl font-bold tracking-tight">
                  Net {money(totals.net)}
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-xs">
                  {netUp ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    Income {money(totals.income)} • Expense{" "}
                    {money(totals.expense)}
                  </span>
                </div>
              </div>

              <div className="h-12 w-12 rounded-2xl bg-white/10 grid place-items-center">
                <span className="text-sm font-bold">৳</span>
              </div>
            </div>

            {/* ratio bar */}
            <div className="mt-5">
              <div className="flex justify-between text-[11px] text-primary-foreground/70">
                <span>Expense / Income</span>
                <span>
                  {Math.min(
                    100,
                    Math.round((totals.expense / Math.max(totals.income, 1)) * 100)
                  )}
                  %
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/15 overflow-hidden">
                {(() => {
                  const pct = Math.min(
                    100,
                    (totals.expense / Math.max(totals.income, 1)) * 100
                  );
                  return (
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${pct}%` }}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Top category highlight */}
        {top && (
          <div className="mt-4 rounded-[24px] border bg-card p-4 shadow-sm">
            <div className="text-xs text-muted-foreground">Top expense</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{top.category}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {top.percent}% of total expenses
                </div>
              </div>
              <div className="text-sm font-bold">{money(top.amount)}</div>
            </div>
          </div>
        )}

        {/* Category breakdown */}
        <div className="mt-5 rounded-[28px] border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Expenses by category</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Sorted by amount (largest first)
              </div>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="mt-4 rounded-[20px] bg-muted p-4 text-sm text-muted-foreground">
              No expense data for this range.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {[...categories]
                .sort((a, b) => b.amount - a.amount)
                .map((c) => {
                  const width = (c.amount / max) * 100;
                  return (
                    <div key={c.category} className="rounded-[20px] bg-muted/40 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {c.category}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {c.percent}% of expenses
                          </div>
                        </div>
                        <div className="text-sm font-bold whitespace-nowrap">
                          {money(c.amount)}
                        </div>
                      </div>

                      <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.max(3, width)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
