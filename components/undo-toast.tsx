"use client";
import { store } from "@/lib/store";
import { useEffect, useState } from "react";

export function UndoToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const h = () => setShow(true);
    window.addEventListener("finance_db_deleted", h);
    return () => window.removeEventListener("finance_db_deleted", h);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-background shadow-lg rounded-2xl px-4 py-2 flex gap-3">
      <span className="text-sm">Transaction deleted</span>
      <button
        className="text-primary text-sm font-semibold"
        onClick={() => {
          store.undoDelete();
          setShow(false);
        }}
      >
        Undo
      </button>
    </div>
  );
}
