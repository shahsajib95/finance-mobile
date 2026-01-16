"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function LockPage() {
  const [pin, setPin] = useState("");
  const [mode, setMode] = useState<"set" | "unlock">("unlock");
  const router = useRouter();

  useEffect(() => {
    // ✅ decide mode on load
    if (!store.hasPin()) setMode("set");
  }, []);

  function submit() {
    try {
      if (mode === "set") {
        store.setPin(pin);
        sessionStorage.setItem("finance_unlocked", "1");
        router.replace("/home");
      } else {
        if (!store.checkPin(pin)) {
          alert("Wrong PIN");
          return;
        }
        sessionStorage.setItem("finance_unlocked", "1");
        router.replace("/home");
      }
    } catch (e: any) {
      alert(e.message || "Invalid PIN");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-xs space-y-4">
        <div className="text-xl font-semibold text-center">
          {mode === "set" ? "Set a PIN" : "Enter PIN"}
        </div>

        <input
          type="password"
          inputMode="numeric"
          className="w-full h-12 rounded-2xl border px-4 text-center text-lg tracking-widest"
          value={pin}
          maxLength={6}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        />

        <button
          className="w-full h-11 rounded-2xl bg-primary text-primary-foreground"
          onClick={submit}
          disabled={pin.length < 4}
        >
          {mode === "set" ? "Set PIN & Unlock" : "Unlock"}
        </button>

        {mode === "set" && (
          <p className="text-xs text-muted-foreground text-center">
            Choose a 4–6 digit PIN. You’ll need it to open the app.
          </p>
        )}
      </div>
    </div>
  );
}
