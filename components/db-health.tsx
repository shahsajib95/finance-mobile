"use client";

import * as React from "react";
import { db } from "@/lib/db";
import { seedIfEmpty } from "@/lib/seed";

export function DbHealth() {
  const [msg, setMsg] = React.useState("Idle");

  async function run() {
    try {
      setMsg("Checking...");
      await db.open();

      const before = await db.wallets.count();
      await seedIfEmpty();
      const after = await db.wallets.count();

      const wallets = await db.wallets.toArray();

      setMsg(
        `OK ✅ before=${before}, after=${after}, wallets=${wallets
          .map((w) => w.name)
          .join(", ")}`
      );
      console.log("[DbHealth] wallets:", wallets);
    } catch (e: any) {
      console.error("[DbHealth] error:", e);
      setMsg(`ERROR ❌ ${e?.message ?? String(e)}`);
    }
  }

  async function reset() {
    try {
      setMsg("Resetting...");
      await db.delete();
      await db.open();
      await seedIfEmpty();
      const wallets = await db.wallets.toArray();
      setMsg(`Reset OK ✅ wallets=${wallets.map((w) => w.name).join(", ")}`);
    } catch (e: any) {
      console.error("[DbHealth reset] error:", e);
      setMsg(`RESET ERROR ❌ ${e?.message ?? String(e)}`);
    }
  }

  return (
    <div className="finance-card p-4 space-y-3">
      <div className="text-sm font-semibold">DB Health</div>
      <div className="text-xs text-muted-foreground break-words">{msg}</div>

      <div className="flex gap-2">
        <button
          className="h-9 px-3 rounded-2xl bg-primary text-primary-foreground text-xs"
          onClick={run}
        >
          Check / Seed
        </button>
        <button
          className="h-9 px-3 rounded-2xl bg-muted text-foreground text-xs"
          onClick={reset}
        >
          Reset DB
        </button>
      </div>
    </div>
  );
}
