import Dexie, { Table } from "dexie";

export type TxType = "income" | "expense" | "transfer" | "liability";

export type WalletType = "cash" | "bank";

export type Wallet = {
  id?: number;
  name: string;          // Cash / DBBL / City Bank
  type: WalletType;      // cash or bank
  balance: number;       // computed+stored
  createdAt: string;
};

export type Transaction = {
  id?: number;
  type: TxType;

  amount: number;        // always positive, type decides +/-
  note?: string;
  category?: string;     // Food/Rent etc (for expense)
  source?: string;       // Salary/Freelance (for income)

  fromWalletId?: number; // for transfer
  toWalletId?: number;   // for transfer
  walletId?: number;     // for income/expense

  createdAt: string;     // ISO
};

export type Liability = {
  id?: number;
  direction: "i_owe" | "owes_me";
  person: string;
  amount: number;
  dueDate?: string;
  status: "unpaid" | "partial" | "paid";
  note?: string;
  createdAt: string;
};

class FinanceDB extends Dexie {
  wallets!: Table<Wallet, number>;
  transactions!: Table<Transaction, number>;
  liabilities!: Table<Liability, number>;

  constructor() {
    super("finance_mobile_db");

    // ✅ bump version to force schema refresh
    this.version(2).stores({
      wallets: "++id, type, name, createdAt",
      transactions: "++id, type, walletId, fromWalletId, toWalletId, createdAt",
      liabilities: "++id, direction, status, dueDate, createdAt",
    });
  }
}

export const db = new FinanceDB();