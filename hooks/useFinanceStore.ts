"use client";

import * as React from "react";
import { store, Wallet, Transaction } from "@/lib/store";
import type { RangeKey } from "@/lib/stats";
import { calcTotals, calcChartSeries } from "@/lib/stats";
import { calcCategoryExpense } from "@/lib/category-stats";

function useDbEvent() {
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const on = () => setTick((x) => x + 1);
    window.addEventListener("finance_db_changed", on);
    return () => window.removeEventListener("finance_db_changed", on);
  }, []);
}

export function useWallets(): Wallet[] {
  useDbEvent();
  return store.getWallets();
}

export function useTransactions(limit = 30): Transaction[] {
  useDbEvent();
  return store.getTransactions(limit);
}

export function useTotalBalance(): number {
  useDbEvent();
  return store.calcTotal();
}

function inRange(tx: Transaction, from: Date, to: Date) {
  const t = new Date(tx.createdAt).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function useMonthlyTotals() {
  useDbEvent(); // same listener you already have

  const all = store.getAllTransactions();
  const now = new Date();
  const from = startOfMonth(now);
  const to = endOfMonth(now);

  let income = 0;
  let expense = 0;

  for (const tx of all) {
    if (!inRange(tx, from, to)) continue;
    if (tx.type === "income") income += tx.amount;
    if (tx.type === "expense") expense += tx.amount;
  }

  return { income, expense, from, to };
}

// ✅ NEW: totals by range
export function useTotalsByRange(range: RangeKey) {
  useDbEvent();
  const all = store.getAllTransactions();
  return calcTotals(all, range);
}

// ✅ NEW: chart series by range
export function useChartByRange(range: RangeKey) {
  useDbEvent();
  const all = store.getAllTransactions();
  return calcChartSeries(all, range);
}

export function useExpenseCategories(range: RangeKey) {
  useDbEvent();
  const all = store.getAllTransactions();
  return calcCategoryExpense(all, range);
}

export function useBudgets() {
  useDbEvent();
  return store.getBudgets();
}


export function useBudgetUsage() {
  useDbEvent();

  const budgets = store.getBudgets();
  const txs = store.getAllTransactions();

  const from = startOfMonth(new Date());
  const to = endOfMonth(new Date());

  return budgets?.map((b) => {
    const spent = txs.reduce((s, t) => {
      if (
        t.type === "expense" &&
        t.category === b.category &&
        new Date(t.createdAt) >= from &&
        new Date(t.createdAt) <= to
      ) {
        return s + t.amount;
      }
      return s;
    }, 0);

    const percent = Math.min(100, Math.round((spent / b.limit) * 100));

    return {
      ...b,
      spent,
      remaining: Math.max(0, b.limit - spent),
      percent,
      status:
        percent >= 100 ? "over" : percent >= 80 ? "warning" : "ok",
    };
  });
}