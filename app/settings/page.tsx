"use client";

import * as React from "react";
import { store } from "@/lib/store";
import {
  transactionsToCSV,
  downloadFile,
  exportPDF,
  importTransactionsCSV,
} from "@/lib/export";
import { useTransactions, useWallets } from "@/hooks/useFinanceStore";
import { encrypt } from "@/lib/crypto";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shield,
  FileJson,
  FileSpreadsheet,
  FileText,
  Upload,
  Cloud,
  Receipt,
  ChevronRight,
  Settings as SettingsIcon,
  Currency,
} from "lucide-react";

function Row({
  icon,
  title,
  desc,
  danger,
  onClick,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  danger?: boolean;
  onClick?: () => void;
  last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "w-full text-left px-5 py-4 transition",
        "hover:bg-muted/60 active:scale-[0.999]",
        !last && "border-b border-border"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-2xl grid place-items-center shrink-0",
            danger ? "bg-destructive/10 text-destructive" : "bg-muted text-primary"
          )}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-sm font-semibold truncate",
              danger && "text-destructive"
            )}
          >
            {title}
          </div>
          {desc && (
            <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
              {desc}
            </div>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}

export default function SettingsPage() {
  const txs = useTransactions(10000);
  const wallets = useWallets() as any;

  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md p-5 pb-10">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-semibold tracking-tight">Settings</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Backup, export & tools
            </div>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-muted grid place-items-center">
            <SettingsIcon className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Hero */}
        <div className="mt-5 relative overflow-hidden rounded-[28px] p-5 text-primary-foreground shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
          <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="text-xs text-primary-foreground/70">Your data</div>
            <div className="mt-1 text-2xl font-bold tracking-tight">
              Keep backups safe
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-1.5 text-xs">
              <Shield className="h-4 w-4" />
              <span className="font-medium">
                Encrypted backup requires the same password to restore
              </span>
            </div>
          </div>
        </div>

        {/* DATA / EXPORT */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-muted-foreground px-1">
            DATA & EXPORT
          </div>

          <div className="mt-2 rounded-[28px] bg-card text-card-foreground shadow-sm border border-border overflow-hidden">
            <Row
              icon={<FileJson className="h-5 w-5" />}
              title="Backup & Export (JSON)"
              desc="Full app backup for restore"
              onClick={() => {
                const json = store.exportBackup();
                downloadFile(json, "finance-backup.json", "application/json");
              }}
            />

            <Row
              icon={<FileSpreadsheet className="h-5 w-5" />}
              title="Export CSV"
              desc="Transactions only (spreadsheet friendly)"
              onClick={() => {
                const csv = transactionsToCSV(txs ?? []);
                downloadFile(csv, "transactions.csv", "text/csv");
              }}
            />

            <Row
              icon={<FileText className="h-5 w-5" />}
              title="Export PDF"
              desc="Printable report"
              onClick={() => {
                exportPDF(txs ?? [], wallets ?? []);
              }}
            />

            <Row
              icon={<Upload className="h-5 w-5" />}
              title="Import CSV"
              desc="Bring transactions from a CSV file"
              last
              onClick={() => fileRef.current?.click()}
            />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              try {
                await importTransactionsCSV(file);
                alert("CSV imported successfully");
              } catch (err) {
                console.error(err);
                alert("Invalid CSV file");
              } finally {
                e.currentTarget.value = "";
              }
            }}
          />
        </div>

        {/* SECURITY */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-muted-foreground px-1">
            SECURITY
          </div>

          <div className="mt-2 rounded-[28px] bg-card text-card-foreground shadow-sm border border-border overflow-hidden">
            <Row
              icon={<Shield className="h-5 w-5" />}
              title="Encrypted Backup"
              desc="Export backup protected with a password"
              last
              onClick={async () => {
                const password = prompt("Set a password");
                if (!password) return;

                const json = store.exportBackup();
                const encrypted = await encrypt(json, password);
                downloadFile(encrypted, "finance-backup.enc", "text/plain");
              }}
            />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Tip: Store backups safely. Encrypted backups cannot be recovered
            without the original password.
          </p>
        </div>

        {/* TOOLS */}
        <div className="mt-5">
          <div className="text-xs font-semibold text-muted-foreground px-1">
            TOOLS
          </div>

          <div className="mt-2 rounded-[28px] bg-card text-card-foreground shadow-sm border border-border overflow-hidden">
            <Row
              icon={<Cloud className="h-5 w-5" />}
              title="Cloud Sync"
              desc="Coming soon (local placeholder)"
              onClick={async () => {
                await store.syncToCloud();
                alert("Data synced (local placeholder)");
              }}
            />

            <Row
              icon={<Receipt className="h-5 w-5" />}
              title="Liabilities"
              desc="Track money you owe and money owed to you"
              last
              onClick={() => router.push("/liabilities")}
            />
            <Row
              icon={<Currency className="h-5 w-5" />}
              title="Budgets"
              desc="Budget money"
              last
              onClick={() => router.push("/budgets")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
