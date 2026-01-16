"use client";

import * as React from "react";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, UserRound } from "lucide-react";

function AmountChips({ onPick }: { onPick: (v: number) => void }) {
  const chips = [100, 200, 500, 1000, 2000, 5000, 10000];
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

export function AddLiabilitySheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  const [direction, setDirection] = React.useState<"i_owe" | "owes_me">("i_owe");
  const [person, setPerson] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [note, setNote] = React.useState("");

  function reset() {
    setDirection("i_owe");
    setPerson("");
    setAmount("");
    setDueDate("");
    setNote("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!person.trim() || !Number.isFinite(n) || n <= 0) return;

    store.addLiability({
      direction,
      person: person.trim(),
      amount: n,
      dueDate: dueDate || undefined,
      note: note || undefined,
    });

    reset();
    setOpen(false);
  }

  const isIOwe = direction === "i_owe";
  const headerIcon = isIOwe ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />;
  const headerTitle = "Add Liability";
  const headerSubtitle = isIOwe ? "Money you need to pay" : "Money someone owes you";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="p-0 gap-0 w-[min(420px,calc(100vw-16px))] rounded-[28px] border-border overflow-hidden"
        style={{ marginTop: "auto" }}
      >
        {/* Gradient header */}
        <div className="relative overflow-hidden p-5 text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-semibold">
                {headerTitle}
              </DialogTitle>
              <div className="text-xs text-primary-foreground/70">
                {headerSubtitle}
              </div>
            </DialogHeader>

            <div className="h-11 w-11 rounded-2xl bg-white/10 grid place-items-center">
              {headerIcon}
            </div>
          </div>

          <div className="relative mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-xs">
            <span className="font-medium">
              {isIOwe ? "I owe" : "Owes me"}
            </span>
            <span className="text-primary-foreground/70">• set amount & due date</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Direction */}
            <div className="rounded-[24px] border bg-card p-4">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as any)}>
                <SelectTrigger className="mt-2 rounded-2xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="i_owe">I owe</SelectItem>
                  <SelectItem value="owes_me">Owes me</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection("i_owe")}
                  className={cn(
                    "h-10 rounded-2xl border text-xs font-medium transition",
                    direction === "i_owe"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70 border-border"
                  )}
                >
                  I owe
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("owes_me")}
                  className={cn(
                    "h-10 rounded-2xl border text-xs font-medium transition",
                    direction === "owes_me"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70 border-border"
                  )}
                >
                  Owes me
                </button>
              </div>
            </div>

            {/* Person */}
            <div className="rounded-[24px] border bg-card p-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Person</Label>
                <UserRound className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                className="mt-2 h-11 rounded-2xl"
                placeholder="Name (Rahim)"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
              />
            </div>

            {/* Amount + Due */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border bg-card p-4">
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <Input
                  className="mt-2 h-11 rounded-2xl"
                  placeholder="0"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="rounded-[24px] border bg-card p-4">
                <Label className="text-xs text-muted-foreground">Due date</Label>
                <Input
                  className="mt-2 h-11 rounded-2xl"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Quick amount chips */}
            <div className="rounded-[24px] border bg-card p-4">
              <div className="text-xs text-muted-foreground font-medium">
                Quick amounts
              </div>
              <div className="mt-3">
                <AmountChips onPick={(v) => setAmount(String(v))} />
              </div>
            </div>

            {/* Note */}
            <div className="rounded-[24px] border bg-card p-4">
              <Label className="text-xs text-muted-foreground">Note</Label>
              <Input
                className="mt-2 h-11 rounded-2xl"
                placeholder="Optional note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              Save
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
