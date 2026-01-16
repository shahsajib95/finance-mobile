"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { store } from "@/lib/store";
import { useWallets } from "@/hooks/useFinanceStore";
import { ArrowDownLeft, ArrowUpRight, Repeat2 } from "lucide-react";

export function QuickAddSheet({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const wallets = useWallets();

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

  function Form({ type }: { type: "income" | "expense" | "transfer" }) {
    const [amount, setAmount] = React.useState("");
    const [sourceOrCategory, setSourceOrCategory] = React.useState("");
    const [note, setNote] = React.useState("");
    const [date, setDate] = React.useState(() =>
      new Date().toISOString().slice(0, 10)
    );

    const cashWallet = wallets.find((w) => w.type === "cash");
    const bankWallet = wallets.find((w) => w.type === "bank");

    const [walletId, setWalletId] = React.useState<string>(cashWallet?.id ?? "");
    const [fromWalletId, setFromWalletId] = React.useState<string>(
      cashWallet?.id ?? ""
    );
    const [toWalletId, setToWalletId] = React.useState<string>(
      bankWallet?.id ?? ""
    );

    React.useEffect(() => {
      const cash = wallets.find((w) => w.type === "cash");
      const bank = wallets.find((w) => w.type === "bank");

      if (cash?.id) {
        setWalletId(cash.id);
        setFromWalletId(cash.id);
      }
      if (bank?.id) setToWalletId(bank.id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallets.length]);

    async function onSubmit(e: React.FormEvent) {
      e.preventDefault();
      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0) return;

      const createdAt = new Date(date + "T12:00:00.000Z").toISOString();

      try {
        if (type === "income") {
          if (!walletId) return;
          store.addIncome({
            amount: n,
            walletId,
            source: sourceOrCategory || undefined,
            note: note || undefined,
            createdAt,
          });
        }

        if (type === "expense") {
          if (!walletId) return;
          store.addExpense({
            amount: n,
            walletId,
            category: sourceOrCategory || undefined,
            note: note || undefined,
            createdAt,
          });
        }

        if (type === "transfer") {
          if (!fromWalletId || !toWalletId) return;
          if (fromWalletId === toWalletId) return;

          store.addTransfer({
            amount: n,
            fromWalletId,
            toWalletId,
            note: note || undefined,
            createdAt,
          });
        }

        setAmount("");
        setSourceOrCategory("");
        setNote("");
        setOpen(false);
      } catch (err) {
        console.error("Save error:", err);
      }
    }

    const isTransfer = type === "transfer";

    return (
      <form className="space-y-4" onSubmit={onSubmit}>
        {/* Amount */}
        <div className="rounded-[24px] border bg-card p-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Amount</Label>
            <div className="text-[11px] text-muted-foreground">BDT</div>
          </div>

          <Input
            placeholder="৳ 0.00"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 h-12 rounded-2xl text-base font-semibold"
          />

          <div className="mt-3">
            <AmountChips
              onPick={(v) => setAmount(String(v))}
            />
          </div>
        </div>

        {/* Source/Category */}
        {!isTransfer && (
          <div className="rounded-[24px] border bg-card p-4">
            <Label className="text-xs text-muted-foreground">
              {type === "income" ? "Source" : "Category"}
            </Label>
            <Input
              className="mt-2 h-11 rounded-2xl"
              placeholder={type === "income" ? "Salary / Freelance" : "Food / Rent"}
              value={sourceOrCategory}
              onChange={(e) => setSourceOrCategory(e.target.value)}
            />
          </div>
        )}

        {/* Note */}
        <div className="rounded-[24px] border bg-card p-4">
          <Label className="text-xs text-muted-foreground">Note</Label>
          <Input
            className="mt-2 h-11 rounded-2xl"
            placeholder="Short note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Wallets + Date */}
        <div className="grid grid-cols-2 gap-3">
          {!isTransfer ? (
            <div className="rounded-[24px] border bg-card p-4">
              <Label className="text-xs text-muted-foreground">Wallet</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger className="mt-2 rounded-2xl h-11">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="rounded-[24px] border bg-card p-4">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Select value={fromWalletId} onValueChange={setFromWalletId}>
                <SelectTrigger className="mt-2 rounded-2xl h-11">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {!isTransfer ? (
            <div className="rounded-[24px] border bg-card p-4">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input
                className="mt-2 h-11 rounded-2xl"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          ) : (
            <div className="rounded-[24px] border bg-card p-4">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Select value={toWalletId} onValueChange={setToWalletId}>
                <SelectTrigger className="mt-2 rounded-2xl h-11">
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {isTransfer && (
          <div className="rounded-[24px] border bg-card p-4">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input
              className="mt-2 h-11 rounded-2xl"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          Save
        </Button>
      </form>
    );
  }

  const TabIcon = ({ v }: { v: "expense" | "income" | "transfer" }) => {
    if (v === "expense") return <ArrowUpRight className="h-4 w-4" />;
    if (v === "income") return <ArrowDownLeft className="h-4 w-4" />;
    return <Repeat2 className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className={cn(
          "p-0 gap-0 w-[min(420px,calc(100vw-16px))] rounded-[28px] border-border overflow-hidden",
          "sm:rounded-[28px]"
        )}
        style={{ marginTop: "auto" }}
      >
        {/* Gradient header */}
        <div className="relative overflow-hidden p-5 text-primary-foreground">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-semibold">
                Quick Add
              </DialogTitle>
              <div className="text-xs text-primary-foreground/70">
                Add income, expense, or transfer
              </div>
            </DialogHeader>
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          <Tabs defaultValue="expense" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-2xl bg-muted p-1">
              {(["expense", "income", "transfer"] as const).map((v) => (
                <TabsTrigger
                  key={v}
                  value={v}
                  className="rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="inline-flex items-center gap-2">
                    <TabIcon v={v} />
                    {v === "expense" ? "Expense" : v === "income" ? "Income" : "Transfer"}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="pt-4">
              <TabsContent value="expense">
                <Form type="expense" />
              </TabsContent>
              <TabsContent value="income">
                <Form type="income" />
              </TabsContent>
              <TabsContent value="transfer">
                <Form type="transfer" />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
