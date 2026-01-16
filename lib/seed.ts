import { db } from "./db";

export async function seedIfEmpty() {
  const now = new Date().toISOString();

  // Ensure DB is open
  await db.open();

  const count = await db.wallets.count();
  console.log("[seedIfEmpty] existing wallet count:", count);

  if (count > 0) return;

  await db.wallets.bulkAdd([
    { name: "Hand Cash", type: "cash", balance: 0, createdAt: now },
    { name: "Main Bank", type: "bank", balance: 0, createdAt: now },
  ]);

  console.log("[seedIfEmpty] seeded default wallets ✅");
}
