"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";

export function DeleteConfirm({
  onConfirm,
  children,
  title = "Delete transaction?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
}) {
  const [open, setOpen] = React.useState(false);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        className="inline-flex"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
      >
        {children}
      </span>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-end sm:place-items-center"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />

          {/* Sheet/Card */}
          <div className="relative w-full sm:w-[380px] rounded-t-[28px] sm:rounded-[28px] bg-background border border-border shadow-2xl overflow-hidden">
            {/* Danger header */}
            <div className="relative p-5 text-primary-foreground">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive via-destructive to-red-500 opacity-95" />
              <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-white/10 grid place-items-center">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-base font-semibold">{title}</div>
                    <div className="mt-1 text-xs text-primary-foreground/75">
                      {description}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 rounded-2xl bg-white/10 hover:bg-white/15 grid place-items-center transition"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={cn(
                    "h-11 rounded-2xl bg-muted text-sm font-medium",
                    "hover:bg-muted/70 transition"
                  )}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={cn(
                    "h-11 rounded-2xl bg-destructive text-destructive-foreground text-sm font-medium shadow-sm",
                    "hover:opacity-95 active:scale-[0.99] transition"
                  )}
                  onClick={() => {
                    onConfirm();
                    setOpen(false);
                  }}
                >
                  {confirmText}
                </button>
              </div>

              <div className="mt-3 text-center text-[11px] text-muted-foreground">
                Tip: Export a backup from Settings before deleting important data.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
