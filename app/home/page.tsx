"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  SlidersHorizontal,
  Wallet,
  Landmark,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import {
  useTotalBalance,
  useWallets,
  useTotalsByRange,
  useChartByRange,
  useBudgetUsage,
} from "@/hooks/useFinanceStore";
import type { RangeKey } from "@/lib/stats";

function money(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}৳ ${abs.toLocaleString()}`;
}

export default function HomePage() {
  const [mode, setMode] = React.useState<"income" | "expense">("income");
  const [range, setRange] = React.useState<RangeKey>("month");

  const total = useTotalBalance();
  const wallets = useWallets();

  const cash = wallets.find((w) => w.type === "cash");
  const bank = wallets.find((w) => w.type === "bank");

  const totals = useTotalsByRange(range);
  const series = useChartByRange(range);

  const chartPoints = React.useMemo(() => {
    const N = range === "day" ? 12 : range === "week" ? 7 : 12;
    return series.slice(-N);
  }, [series, range]);

  const budgets = useBudgetUsage();
  const warnings = budgets?.filter((b) => b.status !== "ok") ?? [];

  const maxIncome = React.useMemo(
    () => Math.max(...chartPoints.map((x) => x.income), 1),
    [chartPoints]
  );
  const maxExpense = React.useMemo(
    () => Math.max(...chartPoints.map((x) => x.expense), 1),
    [chartPoints]
  );

  const net = totals.net;
  const netUp = net >= 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md p-5 pb-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <button className="h-10 w-10 rounded-2xl grid place-items-center bg-muted hover:bg-muted/70 transition">
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          <div className="text-sm font-semibold tracking-tight">Overview</div>
          <button className="h-10 w-10 rounded-2xl grid place-items-center bg-muted hover:bg-muted/70 transition">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* hero balance card */}
        <div className="mt-5 relative overflow-hidden rounded-[28px] p-5 text-primary-foreground shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-primary-foreground/70">
                  Total balance
                </div>
                <div className="mt-1 text-3xl font-bold tracking-tight">
                  {money(total)}
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-xs">
                  {netUp ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    Net {money(totals.net)}
                  </span>
                  <span className="text-primary-foreground/70">
                    • {range.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="h-12 w-12 rounded-2xl bg-white/10 grid place-items-center">
                <span className="text-sm font-bold">৳</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[11px] text-primary-foreground/70">
                  Income
                </div>
                <div className="mt-1 text-base font-semibold">
                  ৳ {totals.income.toLocaleString()}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[11px] text-primary-foreground/70">
                  Expense
                </div>
                <div className="mt-1 text-base font-semibold">
                  ৳ {totals.expense.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* wallets */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border bg-card p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Cash</div>
              <div className="h-9 w-9 rounded-2xl bg-primary/10 grid place-items-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold">
              {money(cash?.balance ?? 0)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {cash?.name ?? "—"}
            </div>
          </div>

          <div className="rounded-[24px] border bg-card p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Bank</div>
              <div className="h-9 w-9 rounded-2xl bg-primary/10 grid place-items-center">
                <Landmark className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-2 text-lg font-bold">
              {money(bank?.balance ?? 0)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {bank?.name ?? "—"}
            </div>
          </div>
        </div>

        {/* mode toggle (modern segmented control) */}
        <div className="mt-5 rounded-[22px] border bg-card p-1 shadow-sm">
          <div className="grid grid-cols-2 gap-1">
            {(["income", "expense"] as const).map((v) => (
              <Button
                key={v}
                type="button"
                variant="ghost"
                onClick={() => setMode(v)}
                className={cn(
                  "h-10 rounded-[18px] text-sm transition",
                  mode === v
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {v === "income" ? (
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Income
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Expenses
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* range chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(["day", "week", "month", "year"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setRange(v)}
              className={cn(
                "h-9 px-4 rounded-2xl text-xs font-medium border transition",
                range === v
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>

        {/* trend card */}
        <div className="mt-5 rounded-[28px] border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Trend</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Income vs Expense • {range}
              </div>
            </div>

            <div className="rounded-2xl bg-muted px-3 py-1.5 text-xs text-muted-foreground">
              Viewing:{" "}
              <span className="font-semibold text-foreground">
                {mode === "income" ? "Income" : "Expense"}
              </span>
            </div>
          </div>

          {/* legend */}
          <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Income
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              Expense
            </span>
          </div>

          {/* split bars chart */}
          <div className="mt-4 h-40 rounded-[24px] bg-muted p-3 flex items-end gap-1 overflow-hidden">
            {chartPoints.map((p, i) => {
              const incomeH = (p.income / maxIncome) * 100;
              const expenseH = (p.expense / maxExpense) * 100;

              // emphasize selected mode
              const incomeCls =
                mode === "income" ? "bg-primary" : "bg-primary/50";
              const expenseCls =
                mode === "expense"
                  ? "bg-destructive/80"
                  : "bg-destructive/40";

              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full flex-1 flex items-end gap-1"
                    title={`${p.label}: +${p.income} -${p.expense}`}
                  >
                    <div
                      className={cn("flex-1 rounded-md", incomeCls)}
                      style={{ height: `${Math.max(6, incomeH)}%` }}
                    />
                    <div
                      className={cn("flex-1 rounded-md", expenseCls)}
                      style={{ height: `${Math.max(6, expenseH)}%` }}
                    />
                  </div>

                  <div className="mt-2 text-[10px] text-muted-foreground leading-none">
                    {p.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* quick stats row */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-muted p-3">
              <div className="text-[11px] text-muted-foreground">Income</div>
              <div className="mt-1 text-sm font-semibold">
                ৳ {totals.income.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <div className="text-[11px] text-muted-foreground">Expense</div>
              <div className="mt-1 text-sm font-semibold">
                ৳ {totals.expense.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <div className="text-[11px] text-muted-foreground">Net</div>
              <div className="mt-1 text-sm font-semibold">{money(net)}</div>
            </div>
          </div>

          {/* warnings */}
          {warnings.length > 0 && (
            <div className="mt-4 rounded-[22px] border border-yellow-500/30 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                Budget warnings
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {warnings.map((b) => (
                  <span
                    key={b.category}
                    className="inline-flex items-center gap-2 rounded-2xl bg-background px-3 py-1.5 text-xs border"
                  >
                    <span className="font-medium">{b.category}</span>
                    <span className="text-muted-foreground">{b.percent}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* highlight panel */}
        <div className="mt-5 rounded-[28px] bg-primary p-5 text-primary-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-primary-foreground/70">
                Selected range
              </div>
              <div className="mt-1 font-semibold">
                Income ৳ {totals.income.toLocaleString()} • Expense ৳{" "}
                {totals.expense.toLocaleString()}
              </div>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-primary-foreground/10 grid place-items-center">
              <span className="text-sm font-bold">✓</span>
            </div>
          </div>

          {/* expense vs income ratio */}
          <div className="mt-4 h-2 rounded-full bg-primary-foreground/15 overflow-hidden">
            {(() => {
              const denom = Math.max(totals.income, 1);
              const pct = Math.min(100, (totals.expense / denom) * 100);
              return (
                <div
                  className="h-full rounded-full bg-primary-foreground"
                  style={{ width: `${pct}%` }}
                />
              );
            })()}
          </div>

          <div className="mt-3 text-xs text-primary-foreground/70">
            Expense / Income ratio (closer to 100% = spending all income)
          </div>
        </div>
      </div>
    </div>
  );
}
