"use client";

import * as React from "react";
import { store } from "@/lib/store";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Wallet, Landmark } from "lucide-react";

function AmountChips({ onPick }: { onPick: (v: number) => void }) {
  const chips = [0, 500, 1000, 2000, 5000, 10000];
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

export function AddWalletSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"cash" | "bank">("bank");
  const [balance, setBalance] = React.useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const initial = Number(balance || 0);
    if (!name.trim()) return;

    store.addWallet({
      name: name.trim(),
      type,
      balance: Number.isFinite(initial) ? initial : 0,
    });

    setName("");
    setBalance("");
    setType("bank");
    setOpen(false);
  }

  const icon =
    type === "cash" ? (
      <Wallet className="h-5 w-5" />
    ) : (
      <Landmark className="h-5 w-5" />
    );
  const subtitle = type === "cash" ? "Cash wallet" : "Bank wallet";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className={cn(
          "p-0 gap-0 w-[min(420px,calc(100vw-16px))] rounded-[28px] border-border overflow-hidden",
        )}
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
                Add Wallet
              </DialogTitle>
              <div className="text-xs text-primary-foreground/70">
                Create a wallet to track balances
              </div>
            </DialogHeader>

            <div className="h-11 w-11 rounded-2xl bg-white/10 grid place-items-center">
              {icon}
            </div>
          </div>

          <div className="relative mt-4 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-xs">
            <span className="font-medium">{subtitle}</span>
            <span className="text-primary-foreground/70">
              • set initial balance
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Name */}
            <div className="rounded-[24px] border bg-card p-4">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                className="mt-2 h-11 rounded-2xl"
                placeholder="DBBL / City Bank / Hand Cash"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Type + Balance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border bg-card p-4">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as any)}>
                  <SelectTrigger className="mt-2 rounded-2xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-[24px] border bg-card p-4">
                <Label className="text-xs text-muted-foreground">
                  Initial Balance
                </Label>
                <Input
                  className="mt-2 h-11 rounded-2xl"
                  placeholder="0"
                  inputMode="decimal"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                />
              </div>
            </div>

            {/* Quick presets */}
            <div className="rounded-[24px] border bg-card p-4">
              <div className="text-xs text-muted-foreground font-medium">
                Quick amounts
              </div>
              <div className="mt-3">
                <AmountChips onPick={(v) => setBalance(String(v))} />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              Create Wallet
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
