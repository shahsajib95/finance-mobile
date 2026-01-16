"use client";

import * as React from "react";
import {
  ChevronLeft,
  SlidersHorizontal,
  Pencil,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useTotalsByRange,
  useTransactions,
  useWallets,
} from "@/hooks/useFinanceStore";
import { DeleteConfirm } from "@/components/delete-confirm";
import { store } from "@/lib/store";
import { EditTransactionSheet } from "@/components/edit-transaction-sheet";

function niceDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function amountLabel(type: string, amount: number) {
  if (type === "income") return `+৳ ${amount.toLocaleString()}`;
  if (type === "expense") return `-৳ ${amount.toLocaleString()}`;
  return `৳ ${amount.toLocaleString()}`;
}

function TypeIcon({ type }: { type: string }) {
  if (type === "income")
    return (
      <div className="h-11 w-11 rounded-2xl bg-primary/10 grid place-items-center">
        <ArrowDownLeft className="h-5 w-5 text-primary" />
      </div>
    );
  if (type === "expense")
    return (
      <div className="h-11 w-11 rounded-2xl bg-destructive/10 grid place-items-center">
        <ArrowUpRight className="h-5 w-5 text-destructive" />
      </div>
    );
  return (
    <div className="h-11 w-11 rounded-2xl bg-muted grid place-items-center">
      <Repeat2 className="h-5 w-5 text-foreground/70" />
    </div>
  );
}

export default function TransactionsPage() {
  const [filter, setFilter] = React.useState<
    "all" | "income" | "expense" | "transfer"
  >("all");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editing, setEditing] = React.useState<any | null>(null);

  const txs = useTransactions(30);
  const wallets = useWallets();

  const walletName = (id?: string) =>
    wallets.find((w) => w.id === id)?.name ?? "—";

  const totals = useTotalsByRange("month");
  const net = totals.income - totals.expense;

  const filtered =
    filter === "all" ? txs : txs.filter((t) => t.type === filter);

  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  function clearSelection() {
    setSelected([]);
  }

  function bulkDelete() {
    selected.forEach((id) => store.deleteTransaction(id));
    setSelected([]);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md p-5 pb-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <button className="h-10 w-10 rounded-2xl grid place-items-center bg-muted hover:bg-muted/70 transition">
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>
          <div className="text-sm font-semibold tracking-tight">
            Transactions
          </div>
          <button className="h-10 w-10 rounded-2xl grid place-items-center bg-muted hover:bg-muted/70 transition">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* hero summary */}
        <div className="mt-5 relative overflow-hidden rounded-[28px] p-5 text-primary-foreground shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="text-xs text-primary-foreground/70">
              Quick summary (This month)
            </div>

            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[11px] text-primary-foreground/70">
                  Income
                </div>
                <div className="mt-1 text-sm font-semibold">
                  ৳ {totals.income.toLocaleString()}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[11px] text-primary-foreground/70">
                  Expense
                </div>
                <div className="mt-1 text-sm font-semibold">
                  ৳ {totals.expense.toLocaleString()}
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[11px] text-primary-foreground/70">
                  Net
                </div>
                <div className="mt-1 text-sm font-semibold">
                  ৳ {net.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-primary-foreground/70">
              Showing last 30 transactions
            </div>
          </div>
        </div>

        {/* filter pills */}
        <div className="mt-5 rounded-[22px] border bg-card p-1 shadow-sm">
          <div className="grid grid-cols-4 gap-1">
            {(["all", "income", "expense", "transfer"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  clearSelection();
                }}
                className={cn(
                  "h-9 rounded-[18px] text-xs font-medium transition",
                  filter === f
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* bulk bar */}
        {selected.length > 0 && (
          <div className="mt-4 rounded-[22px] border border-destructive/25 bg-destructive/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {selected.length} selected
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearSelection}
                  className="h-9 px-3 rounded-2xl bg-muted text-xs font-medium hover:bg-muted/70 transition"
                  type="button"
                >
                  Clear
                </button>
                <button
                  onClick={bulkDelete}
                  className="h-9 px-3 rounded-2xl bg-destructive text-destructive-foreground text-xs font-medium hover:opacity-90 transition"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* list */}
        <div className="mt-4 grid gap-3">
          {filtered.map((t) => {
            const title =
              t.type === "income"
                ? t.source || "Income"
                : t.type === "expense"
                ? t.category || "Expense"
                : "Transfer";

            const subtitle =
              t.type === "transfer"
                ? `${walletName(t.fromWalletId)} → ${walletName(t.toWalletId)}`
                : walletName(t.walletId);

            const amountCls =
              t.type === "income"
                ? "text-primary"
                : t.type === "expense"
                ? "text-destructive"
                : "text-foreground";

            return (
              <div
                key={t.id}
                onClick={() => toggle(t.id)}
                className={cn(
                  "rounded-[24px] border bg-card p-4 shadow-sm transition",
                  "hover:shadow-md active:scale-[0.999]",
                  selected.includes(t.id) &&
                    "ring-2 ring-primary/25 bg-primary/5"
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggle(t.id);
                }}
              >
                <div className="flex items-start gap-3">
                  {/* icon */}
                  <TypeIcon type={t.type} />

                  {/* text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {title}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
                          {subtitle} • {niceDate(t.createdAt)}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={cn(
                            "text-sm font-bold whitespace-nowrap",
                            amountCls
                          )}
                        >
                          {amountLabel(t.type, t.amount)}
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {t.type.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(t);
                        }}
                        className="h-9 w-9 rounded-2xl grid place-items-center bg-muted text-muted-foreground hover:bg-muted/70 transition"
                        title="Edit"
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <DeleteConfirm
                        onConfirm={() => store.deleteTransaction(t.id)}
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="h-9 w-9 rounded-2xl grid place-items-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition"
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </DeleteConfirm>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {editing && (
            <EditTransactionSheet
              tx={editing}
              onClose={() => setEditing(null)}
            />
          )}

          {!filtered.length && (
            <div className="rounded-[24px] border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
