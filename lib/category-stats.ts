import type { Transaction } from "@/lib/store";
import type { RangeKey } from "@/lib/stats";
import { getRangeBounds } from "@/lib/stats";

export function calcCategoryExpense(
  txs: Transaction[],
  range: RangeKey,
  ref = new Date()
) {
  const { from, to } = getRangeBounds(range, ref);

  const map = new Map<string, number>();

  for (const tx of txs) {
    if (tx.type !== "expense") continue;

    const t = new Date(tx.createdAt).getTime();
    if (t < from.getTime() || t > to.getTime()) continue;

    const key = tx.category || "Other";
    map.set(key, (map.get(key) || 0) + tx.amount);
  }

  const total = Array.from(map.values()).reduce((s, v) => s + v, 0);

  return Array.from(map.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percent: total ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}
