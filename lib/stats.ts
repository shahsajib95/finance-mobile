import type { Transaction } from "@/lib/store";

export type RangeKey = "day" | "week" | "month" | "year";

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
export function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

export function startOfWeek(d: Date) {
  // Monday as start (change if you want Sunday)
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1) - day;
  const x = new Date(d);
  x.setDate(d.getDate() + diff);
  return startOfDay(x);
}
export function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return endOfDay(e);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}
export function endOfYear(d: Date) {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export function getRangeBounds(range: RangeKey, ref = new Date()) {
  if (range === "day") return { from: startOfDay(ref), to: endOfDay(ref) };
  if (range === "week") return { from: startOfWeek(ref), to: endOfWeek(ref) };
  if (range === "month") return { from: startOfMonth(ref), to: endOfMonth(ref) };
  return { from: startOfYear(ref), to: endOfYear(ref) };
}

function inRange(tx: Transaction, from: Date, to: Date) {
  const t = new Date(tx.createdAt).getTime();
  return t >= from.getTime() && t <= to.getTime();
}

export function calcTotals(all: Transaction[], range: RangeKey, ref = new Date()) {
  const { from, to } = getRangeBounds(range, ref);

  let income = 0;
  let expense = 0;

  for (const tx of all) {
    if (!inRange(tx, from, to)) continue;
    if (tx.type === "income") income += tx.amount;
    if (tx.type === "expense") expense += tx.amount;
  }

  return {
    from,
    to,
    income,
    expense,
    net: income - expense,
  };
}

/**
 * Chart points: returns an array of buckets for the range.
 * day: 24 points (hours)
 * week: 7 points (days)
 * month: points = days in month
 * year: 12 points (months)
 */
export function calcChartSeries(all: Transaction[], range: RangeKey, ref = new Date()) {
  const { from, to } = getRangeBounds(range, ref);

  const points: { label: string; income: number; expense: number }[] = [];

  const addPoint = (label: string) => points.push({ label, income: 0, expense: 0 });

  if (range === "day") {
    for (let h = 0; h < 24; h++) addPoint(String(h));
  } else if (range === "week") {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    labels.forEach(addPoint);
  } else if (range === "month") {
    const days = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= days; d++) addPoint(String(d));
  } else {
    const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    labels.forEach(addPoint);
  }

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  for (const tx of all) {
    const t = new Date(tx.createdAt);
    const ms = t.getTime();
    if (ms < from.getTime() || ms > to.getTime()) continue;

    let idx = 0;

    if (range === "day") idx = clamp(t.getHours(), 0, 23);

    if (range === "week") {
      // Mon=0..Sun=6
      const dow = t.getDay(); // 0 Sun
      idx = dow === 0 ? 6 : dow - 1;
    }

    if (range === "month") idx = clamp(t.getDate() - 1, 0, points.length - 1);

    if (range === "year") idx = clamp(t.getMonth(), 0, 11);

    if (tx.type === "income") points[idx].income += tx.amount;
    if (tx.type === "expense") points[idx].expense += tx.amount;
  }

  return points;
}
