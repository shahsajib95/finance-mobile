import { db, Transaction, Wallet } from "./db";

function nowISO() {
  return new Date().toISOString();
}

export async function getWallets() {
  return db.wallets.toArray();
}

export async function getTransactions(limit = 30) {
  return db.transactions.orderBy("createdAt").reverse().limit(limit).toArray();
}

export async function addIncome(args: {
  amount: number;
  source?: string;
  note?: string;
  walletId: number;
  createdAt?: string;
}) {
  const createdAt = args.createdAt ?? nowISO();

  await db.transaction("rw", db.transactions, db.wallets, async () => {
    await db.transactions.add({
      type: "income",
      amount: args.amount,
      source: args.source,
      note: args.note,
      walletId: args.walletId,
      createdAt,
    });

    const w = await db.wallets.get(args.walletId);
    if (!w) return;
    await db.wallets.update(args.walletId, { balance: w.balance + args.amount });
  });
}

export async function addExpense(args: {
  amount: number;
  category?: string;
  note?: string;
  walletId: number;
  createdAt?: string;
}) {
  const createdAt = args.createdAt ?? nowISO();

  await db.transaction("rw", db.transactions, db.wallets, async () => {
    await db.transactions.add({
      type: "expense",
      amount: args.amount,
      category: args.category,
      note: args.note,
      walletId: args.walletId,
      createdAt,
    });

    const w = await db.wallets.get(args.walletId);
    if (!w) return;
    await db.wallets.update(args.walletId, { balance: w.balance - args.amount });
  });
}

export async function addTransfer(args: {
  amount: number;
  fromWalletId: number;
  toWalletId: number;
  note?: string;
  createdAt?: string;
}) {
  const createdAt = args.createdAt ?? nowISO();

  await db.transaction("rw", db.transactions, db.wallets, async () => {
    await db.transactions.add({
      type: "transfer",
      amount: args.amount,
      note: args.note,
      fromWalletId: args.fromWalletId,
      toWalletId: args.toWalletId,
      createdAt,
    });

    const from = await db.wallets.get(args.fromWalletId);
    const to = await db.wallets.get(args.toWalletId);
    if (!from || !to) return;

    await db.wallets.update(args.fromWalletId, { balance: from.balance - args.amount });
    await db.wallets.update(args.toWalletId, { balance: to.balance + args.amount });
  });
}

export function calcTotalBalance(wallets: Wallet[]) {
  return wallets.reduce((sum, w) => sum + w.balance, 0);
}
