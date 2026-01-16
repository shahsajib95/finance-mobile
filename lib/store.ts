export type TxType = "income" | "expense" | "transfer";
export type WalletType = "cash" | "bank";

export type Wallet = {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  createdAt: string;
};

export type Liability = {
  id: string;
  direction: "i_owe" | "owes_me";
  person: string;
  amount: number;
  dueDate?: string;
  status: "unpaid" | "partial" | "paid";
  note?: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;

  note?: string;
  category?: string; // expense
  source?: string; // income

  walletId?: string; // income/expense
  fromWalletId?: string; // transfer
  toWalletId?: string; // transfer

  createdAt: string;
};

type DBShape = {
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
  liabilities: Liability[]; // ✅ add this
};

export type Budget = {
  category: string;
  limit: number; // monthly limit
  createdAt: string;
};
let lastDeleted: Transaction | null = null;

const KEY = "finance_mobile_db_v1";

const PIN_KEY = "finance_pin_hash";

type Listener = () => void;

const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function hashPin(pin: string) {
  return btoa(pin); // simple obfuscation (can upgrade later)
}

function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

function read(): DBShape {
  if (typeof window === "undefined") {
    return {
      wallets: [],
      transactions: [],
      budgets: [],
      liabilities: [],
    };
  }

  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return {
      wallets: [],
      transactions: [],
      budgets: [],
      liabilities: [],
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DBShape>;

    // ✅ normalize missing fields (MIGRATION SAFE)
    return {
      wallets: parsed.wallets ?? [],
      transactions: parsed.transactions ?? [],
      budgets: parsed.budgets ?? [],
      liabilities: parsed.liabilities ?? [],
    };
  } catch {
    return {
      wallets: [],
      transactions: [],
      budgets: [],
      liabilities: [],
    };
  }
}

function write(next: DBShape) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("finance_db_changed"));
  emit(); // ✅ this makes subscribe() work
}

export const store = {
  seedIfEmpty() {
    const db = read();
    if (db.wallets.length) return;

    const now = new Date().toISOString();
    db.wallets = [
      {
        id: uid(),
        name: "Hand Cash",
        type: "cash",
        balance: 0,
        createdAt: now,
      },
      {
        id: uid(),
        name: "Main Bank",
        type: "bank",
        balance: 0,
        createdAt: now,
      },
    ];
    write(db);
  },

  reset() {
    write({ wallets: [], transactions: [], budgets: [], liabilities: [] });
  },
  getWallets(): Wallet[] {
    return read().wallets;
  },

  getAllTransactions(): Transaction[] {
    return read().transactions.sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
  },

  getTransactions(limit = 30): Transaction[] {
    const txs = read().transactions;
    return txs
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },

  addWallet(args: { name: string; type: WalletType; balance?: number }) {
    const db = read();
    const now = new Date().toISOString();

    const w: Wallet = {
      id: uid(),
      name: args.name.trim(),
      type: args.type,
      balance: Number(args.balance ?? 0),
      createdAt: now,
    };

    db.wallets.push(w);
    write(db);

    return w.id; // ✅ return id
  },

  addIncome(args: {
    amount: number;
    walletId: string;
    source?: string;
    note?: string;
    createdAt?: string;
  }) {
    const db = read();
    const createdAt = args.createdAt ?? new Date().toISOString();

    const w = db.wallets.find((x) => x.id === args.walletId);
    if (!w) throw new Error("Wallet not found");

    w.balance += args.amount;

    db.transactions.push({
      id: uid(),
      type: "income",
      amount: args.amount,
      walletId: args.walletId,
      source: args.source,
      note: args.note,
      createdAt,
    });

    write(db);
  },

  addExpense(args: {
    amount: number;
    walletId: string;
    category?: string;
    note?: string;
    createdAt?: string;
  }) {
    const db = read();
    const createdAt = args.createdAt ?? new Date().toISOString();

    const w = db.wallets.find((x) => x.id === args.walletId);
    if (!w) throw new Error("Wallet not found");

    w.balance -= args.amount;

    db.transactions.push({
      id: uid(),
      type: "expense",
      amount: args.amount,
      walletId: args.walletId,
      category: args.category,
      note: args.note,
      createdAt,
    });

    write(db);
  },

  addTransfer(args: {
    amount: number;
    fromWalletId: string;
    toWalletId: string;
    note?: string;
    createdAt?: string;
  }) {
    const db = read();
    const createdAt = args.createdAt ?? new Date().toISOString();

    if (args.fromWalletId === args.toWalletId) throw new Error("Same wallet");

    const from = db.wallets.find((x) => x.id === args.fromWalletId);
    const to = db.wallets.find((x) => x.id === args.toWalletId);
    if (!from || !to) throw new Error("Wallet not found");

    from.balance -= args.amount;
    to.balance += args.amount;

    db.transactions.push({
      id: uid(),
      type: "transfer",
      amount: args.amount,
      fromWalletId: args.fromWalletId,
      toWalletId: args.toWalletId,
      note: args.note,
      createdAt,
    });

    write(db);
  },
  getBudgets(): Budget[] {
    return read().budgets;
  },

  setBudget(category: string, limit: number) {
    const db = read();
    const now = new Date().toISOString();

    const i = db.budgets.findIndex((b) => b.category === category);
    if (i >= 0) {
      db.budgets[i].limit = limit;
    } else {
      db.budgets.push({ category, limit, createdAt: now });
    }

    write(db);
  },

  removeBudget(category: string) {
    const db = read();
    db.budgets = db.budgets.filter((b) => b.category !== category);
    write(db);
  },
  calcTotal(): number {
    return read().wallets.reduce((s, w) => s + (w.balance || 0), 0);
  },
  deleteTransaction(txId: string) {
    const db = read();

    const tx = db.transactions.find((t) => t.id === txId);
    if (!tx) return;

    // ✅ store snapshot for undo
    lastDeleted = { ...tx };

    // 🔄 rollback wallet balances
    if (tx.type === "income" && tx.walletId) {
      const w = db.wallets.find((x) => x.id === tx.walletId);
      if (w) w.balance -= tx.amount;
    }

    if (tx.type === "expense" && tx.walletId) {
      const w = db.wallets.find((x) => x.id === tx.walletId);
      if (w) w.balance += tx.amount;
    }

    if (tx.type === "transfer") {
      const from = db.wallets.find((x) => x.id === tx.fromWalletId);
      const to = db.wallets.find((x) => x.id === tx.toWalletId);
      if (from) from.balance += tx.amount;
      if (to) to.balance -= tx.amount;
    }

    // ❌ remove transaction
    db.transactions = db.transactions.filter((t) => t.id !== txId);

    write(db);

    // 🔔 notify UI for Undo toast
    window.dispatchEvent(new Event("finance_db_deleted"));
  },

  undoDelete() {
    if (!lastDeleted) return;

    const tx = lastDeleted;
    lastDeleted = null;

    const db = read();

    db.transactions.push(tx);

    // 🔄 re-apply balance
    if (tx.type === "income" && tx.walletId) {
      const w = db.wallets.find((x) => x.id === tx.walletId);
      if (w) w.balance += tx.amount;
    }

    if (tx.type === "expense" && tx.walletId) {
      const w = db.wallets.find((x) => x.id === tx.walletId);
      if (w) w.balance -= tx.amount;
    }

    if (tx.type === "transfer") {
      const from = db.wallets.find((x) => x.id === tx.fromWalletId);
      const to = db.wallets.find((x) => x.id === tx.toWalletId);
      if (from) from.balance -= tx.amount;
      if (to) to.balance += tx.amount;
    }

    write(db);
  },
  hasPin() {
    return !!localStorage.getItem(PIN_KEY);
  },
  setPin(pin: string) {
    localStorage.setItem(PIN_KEY, hashPin(pin));
  },
  checkPin(pin: string) {
    return localStorage.getItem(PIN_KEY) === hashPin(pin);
  },
  clearPin() {
    localStorage.removeItem(PIN_KEY);
  },
  exportBackup() {
    const db = read();
    return JSON.stringify(db, null, 2);
  },

  importBackup(json: string) {
    try {
      const data = JSON.parse(json);
      if (!data.wallets || !data.transactions) {
        throw new Error("Invalid backup file");
      }
      write(data);
    } catch (e) {
      throw new Error("Failed to import backup");
    }
  },
  updateTransaction(
    txId: string,
    updates: Partial<Omit<Transaction, "id" | "createdAt">>
  ) {
    const db = read();
    const tx = db.transactions.find((t) => t.id === txId);
    if (!tx) return;

    // 🔁 rollback old balances
    if (tx.type === "income" && tx.walletId) {
      const w = db.wallets.find((x) => x.id === tx.walletId);
      if (w) w.balance -= tx.amount;
    }

    if (tx.type === "expense" && tx.walletId) {
      const w = db.wallets.find((x) => x.id === tx.walletId);
      if (w) w.balance += tx.amount;
    }

    if (tx.type === "transfer") {
      const from = db.wallets.find((x) => x.id === tx.fromWalletId);
      const to = db.wallets.find((x) => x.id === tx.toWalletId);
      if (from) from.balance += tx.amount;
      if (to) to.balance -= tx.amount;
    }

    // ✏️ apply updates
    Object.assign(tx, updates);

    // 🔄 apply new balances
    if (tx.type === "income" && tx.walletId) {
      const w = db.wallets.find((x) => x.id === tx.walletId);
      if (w) w.balance += tx.amount;
    }

    if (tx.type === "expense" && tx.walletId) {
      const w = db.wallets.find((x) => x.id === tx.walletId);
      if (w) w.balance -= tx.amount;
    }

    if (tx.type === "transfer") {
      const from = db.wallets.find((x) => x.id === tx.fromWalletId);
      const to = db.wallets.find((x) => x.id === tx.toWalletId);
      if (from) from.balance -= tx.amount;
      if (to) to.balance += tx.amount;
    }

    write(db);
  },
  addLiability(args: {
    direction: "i_owe" | "owes_me";
    person: string;
    amount: number;
    note?: string;
    dueDate?: string;
  }) {
    const db = read();

    db.liabilities.push({
      id: uid(),
      direction: args.direction,
      person: args.person,
      amount: args.amount,
      note: args.note,
      dueDate: args.dueDate,
      status: "unpaid",
      createdAt: new Date().toISOString(),
    });

    write(db);
  },

  updateLiability(id: string, updates: Partial<Liability>) {
    const db = read();
    const l = db.liabilities.find((x) => x.id === id);
    if (!l) return;

    Object.assign(l, updates);
    write(db);
  },

  deleteLiability(id: string) {
    const db = read();
    db.liabilities = db.liabilities.filter((l) => l.id !== id);
    write(db);
  },

  getLiabilities() {
    return read().liabilities;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async syncToCloud() {
    // placeholder – no backend yet
    const backup = this.exportBackup();

    console.log("SYNC PAYLOAD", backup);

    localStorage.setItem("finance_cloud_shadow", backup);
    localStorage.setItem("finance_last_sync", new Date().toISOString());
  },
};
