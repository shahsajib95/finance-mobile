"use client";

import * as React from "react";
import { store } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, ArrowDownLeft, ArrowUpRight, Repeat2 } from "lucide-react";

function TypeBadge({ type }: { type: "income" | "expense" | "transfer" }) {
  const base =
    "inline-flex items-center gap-2 rounded-2xl px-3 py-1 text-xs font-medium border";
  if (type === "income")
    return (
      <span className={cn(base, "bg-primary/10 text-primary border-primary/20")}>
        <ArrowDownLeft className="h-4 w-4" /> Income
      </span>
    );
  if (type === "expense")
    return (
      <span
        className={cn(
          base,
          "bg-destructive/10 text-destructive border-destructive/20"
        )}
      >
        <ArrowUpRight className="h-4 w-4" /> Expense
      </span>
    );
  return (
    <span className={cn(base, "bg-muted text-muted-foreground border-border")}>
      <Repeat2 className="h-4 w-4" /> Transfer
    </span>
  );
}

function AmountChips({
  onPick,
}: {
  onPick: (v: number) => void;
}) {
  const chips = [100, 200, 500, 1000, 2000, 5000];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className="h-8 px-3 rounded-2xl border bg-card hover:bg-muted transition text-xs font-medium"
        >
          ৳ {v.toLocaleString()}
        </button>
      ))}
    </div>
  );
}

export function EditTransactionSheet({
  tx,
  onClose,
}: {
  tx: any;
  onClose: () => void;
}) {
  const [amount, setAmount] = React.useState<number>(Number(tx.amount) || 0);
  const [note, setNote] = React.useState<string>(tx.note ?? "");
  const [category, setCategory] = React.useState<string>(tx.category ?? "");
  const [source, setSource] = React.useState<string>(tx.source ?? "");

  const canSave = Number.isFinite(amount) && amount > 0;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="p-0 gap-0 w-[min(420px,calc(100vw-16px))] rounded-[28px] border-border overflow-hidden"
        style={{ marginTop: "auto" }}
      >
        {/* Gradient header */}
        <div className="relative overflow-hidden p-5 text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-start justify-between">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-semibold">
                Edit Transaction
              </DialogTitle>
              <div className="text-xs text-primary-foreground/70">
                Update amount and details
              </div>
            </DialogHeader>

            <div className="h-11 w-11 rounded-2xl bg-white/10 grid place-items-center">
              <Pencil className="h-5 w-5" />
            </div>
          </div>

          <div className="relative mt-4">
            <TypeBadge type={tx.type} />
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Amount */}
          <div className="rounded-[24px] border bg-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-medium">
                Amount
              </div>
              <div className="text-[11px] text-muted-foreground">BDT</div>
            </div>

            <Input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-2 h-12 rounded-2xl text-base font-semibold"
            />

            <div className="mt-3">
              <AmountChips onPick={(v) => setAmount(v)} />
            </div>
          </div>

          {/* Category / Source */}
          {tx.type === "expense" && (
            <div className="rounded-[24px] border bg-card p-4">
              <div className="text-xs text-muted-foreground font-medium">
                Category
              </div>
              <Input
                placeholder="Food / Rent..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 h-11 rounded-2xl"
              />
            </div>
          )}

          {tx.type === "income" && (
            <div className="rounded-[24px] border bg-card p-4">
              <div className="text-xs text-muted-foreground font-medium">
                Source
              </div>
              <Input
                placeholder="Salary / Freelance..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-2 h-11 rounded-2xl"
              />
            </div>
          )}

          {/* Note */}
          <div className="rounded-[24px] border bg-card p-4">
            <div className="text-xs text-muted-foreground font-medium">Note</div>
            <Input
              placeholder="Short note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 h-11 rounded-2xl"
            />
          </div>

          {/* Save */}
          <Button
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            disabled={!canSave}
            onClick={() => {
              store.updateTransaction(tx.id, {
                amount,
                note,
                category,
                source,
              });
              onClose();
            }}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
