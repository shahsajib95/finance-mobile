"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { calcTotalBalance } from "@/lib/finance";

export function useWallets() {
  return useLiveQuery(() => db.wallets.toArray(), [], []);
}

export function useTransactions(limit = 30) {
  return useLiveQuery(
    () => db.transactions.orderBy("createdAt").reverse().limit(limit).toArray(),
    [limit],
    []
  );
}

export function useTotalBalance() {
  const wallets = useWallets();
  return wallets ? calcTotalBalance(wallets) : 0;
}

export function useCashWallet() {
  const wallets = useWallets();
  return wallets?.find((w) => w.type === "cash");
}

export function useBankWallet() {
  const wallets = useWallets();
  return wallets?.find((w) => w.type === "bank");
}
