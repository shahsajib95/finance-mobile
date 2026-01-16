"use client";

import * as React from "react";
import { Plus, ChevronLeft, SlidersHorizontal, AlertTriangle } from "lucide-react";
import { useLiabilities } from "@/hooks/useLiabilities";
import { store } from "@/lib/store";
import { AddLiabilitySheet } from "@/components/add-liability-sheet";
import { cn } from "@/lib/utils";

function money(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return `৳ ${v.toLocaleString()}`;
}

function statusMeta(status: string) {
  if (status === "paid")
    return {
      chip: "bg-primary/10 text-primary border-primary/20",
      dot: "bg-primary",
      label: "Paid",
    };
  if (status === "partial")
    return {
      chip: "bg-yellow-500/10 text-yellow-700 border-yellow-500/25",
      dot: "bg-yellow-500",
      label: "Partial",
    };
  return {
    chip: "bg-destructive/10 text-destructive border-destructive/25",
    dot: "bg-destructive",
    label: "Unpaid",
  };
}

export default function LiabilitiesPage() {
  const [tab, setTab] = React.useState<"i_owe" | "owes_me">("i_owe");

  const all = useLiabilities() ?? [];
  const list = all.filter((x) => x.direction === tab);

  const totalIOwe = all
    .filter((x) => x.direction === "i_owe" && x.status !== "paid")
    .reduce((s, x) => s + (x.amount || 0), 0);

  const totalOwesMe = all
    .filter((x) => x.direction === "owes_me" && x.status !== "paid")
    .reduce((s, x) => s + (x.amount || 0), 0);

  const heroAmount = tab === "i_owe" ? totalIOwe : totalOwesMe;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md p-5 pb-10">
        {/* header */}
        <div className="flex items-center justify-between">
          <button className="h-10 w-10 rounded-2xl grid place-items-center bg-muted hover:bg-muted/70 transition">
            <ChevronLeft className="h-5 w-5 text-primary" />
          </button>

          <div className="text-sm font-semibold tracking-tight">Liabilities</div>

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
                  {tab === "i_owe" ? "Total I owe (unpaid)" : "Total owed to me (unpaid)"}
                </div>
                <div className="mt-1 text-3xl font-bold tracking-tight">
                  {money(heroAmount)}
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-xs">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">
                    {tab === "i_owe" ? "Keep track to avoid late fees" : "Follow up on due payments"}
                  </span>
                </div>
              </div>

              <AddLiabilitySheet>
                <button className="h-12 w-12 rounded-2xl bg-white/10 hover:bg-white/15 grid place-items-center transition active:scale-[0.98]">
                  <Plus className="h-5 w-5 text-primary-foreground" />
                </button>
              </AddLiabilitySheet>
            </div>

            {/* mini totals row */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[11px] text-primary-foreground/70">I owe</div>
                <div className="mt-1 text-sm font-semibold">{money(totalIOwe)}</div>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <div className="text-[11px] text-primary-foreground/70">Owes me</div>
                <div className="mt-1 text-sm font-semibold">{money(totalOwesMe)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* tabs + add */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex-1 rounded-[22px] border bg-card p-1 shadow-sm">
            <div className="grid grid-cols-2 gap-1">
              {(["i_owe", "owes_me"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setTab(v)}
                  className={cn(
                    "h-10 rounded-[18px] text-sm font-medium transition",
                    tab === v
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {v === "i_owe" ? "I owe" : "Owes me"}
                </button>
              ))}
            </div>
          </div>

          <AddLiabilitySheet>
            <button className="h-11 w-11 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-sm hover:opacity-95 transition active:scale-[0.99]">
              <Plus className="h-5 w-5" />
            </button>
          </AddLiabilitySheet>
        </div>

        {/* list */}
        <div className="mt-4 grid gap-3">
          {list.map((l) => {
            const meta = statusMeta(l.status);
            return (
              <div
                key={l.id}
                className="rounded-[24px] border bg-card p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* left */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
                      <div className="text-sm font-semibold truncate">
                        {l.person}
                      </div>
                      <span className={cn("ml-1 inline-flex items-center gap-2 rounded-2xl border px-2.5 py-1 text-[11px]", meta.chip)}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {l.dueDate ? `Due: ${l.dueDate}` : "No due date"}
                      {l.note ? ` • ${l.note}` : ""}
                    </div>

                    {/* status buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => store.updateLiability(l.id, { status: "unpaid" })}
                        className={cn(
                          "h-9 px-3 rounded-2xl text-xs font-medium border transition",
                          l.status === "unpaid"
                            ? "bg-destructive/10 text-destructive border-destructive/25"
                            : "bg-muted text-muted-foreground hover:bg-muted/70 border-border"
                        )}
                      >
                        Unpaid
                      </button>

                      <button
                        type="button"
                        onClick={() => store.updateLiability(l.id, { status: "partial" })}
                        className={cn(
                          "h-9 px-3 rounded-2xl text-xs font-medium border transition",
                          l.status === "partial"
                            ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/25"
                            : "bg-muted text-muted-foreground hover:bg-muted/70 border-border"
                        )}
                      >
                        Partial
                      </button>

                      <button
                        type="button"
                        onClick={() => store.updateLiability(l.id, { status: "paid" })}
                        className={cn(
                          "h-9 px-3 rounded-2xl text-xs font-medium border transition",
                          l.status === "paid"
                            ? "bg-primary/10 text-primary border-primary/25"
                            : "bg-muted text-muted-foreground hover:bg-muted/70 border-border"
                        )}
                      >
                        Paid
                      </button>
                    </div>
                  </div>

                  {/* right */}
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">{money(l.amount)}</div>
                    <button
                      type="button"
                      onClick={() => store.deleteLiability(l.id)}
                      className="mt-3 h-9 px-3 rounded-2xl bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/15 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!list.length && (
            <div className="rounded-[24px] border bg-card p-5 text-sm text-muted-foreground shadow-sm">
              No items here yet. Tap <span className="font-semibold">+</span> to add.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
