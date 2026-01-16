import { store, type Transaction } from "@/lib/store";
import jsPDF from "jspdf";
import { Wallet } from "./db";

/** ✅ Proper CSV line parser (handles quotes + commas) */
function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // Escaped quote
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out.map((s) => s.trim());
}

export function transactionsToCSV(txs: Transaction[]) {
  const headers = [
    "Date",
    "Type",
    "Amount",
    "Wallet",
    "From Wallet",
    "To Wallet",
    "Category",
    "Source",
    "Note",
  ];

  const rows = txs.map((t) => [
    t.createdAt,
    t.type,
    t.amount,
    t.walletId ?? "",
    t.fromWalletId ?? "",
    t.toWalletId ?? "",
    t.category ?? "",
    t.source ?? "",
    t.note ?? "",
  ]);

  return [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export function downloadFile(content: string, filename: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}



export function exportPDF(
  txs: Transaction[],
  wallets: Wallet[]
) {
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(14);
  doc.text("Finance Report", 10, y);
  y += 8;

  doc.setFontSize(10);
  txs.forEach((t, i) => {
    if (y > 280) {
      doc.addPage();
      y = 10;
    }

    const line = `${i + 1}. ${t.type.toUpperCase()}  ৳${t.amount}  ${new Date(
      t.createdAt
    ).toLocaleDateString()}`;

    doc.text(line, 10, y);
    y += 6;
  });

  doc.save("transactions.pdf");
}


export function importTransactionsCSV(file: File) {
  return new Promise<void>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const lines = text.split(/\r?\n/).filter(Boolean);

        if (lines.length < 2) throw new Error("CSV has no data rows");

        // header
        const header = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, ""));
        const getIndex = (name: string) => header.findIndex((h) => h === name);

        const idxDate = getIndex("Date");
        const idxType = getIndex("Type");
        const idxAmount = getIndex("Amount");
        const idxWallet = getIndex("Wallet");
        const idxFrom = getIndex("From Wallet");
        const idxTo = getIndex("To Wallet");
        const idxCategory = getIndex("Category");
        const idxSource = getIndex("Source");
        const idxNote = getIndex("Note");

        if (idxDate < 0 || idxType < 0 || idxAmount < 0) {
          throw new Error("CSV headers mismatch");
        }

        // Map oldWalletId -> newWalletId
        const map: Record<string, string> = {};
        const existing = store.getWallets();
        const exists = (id: string) => existing.some((w) => w.id === id);

        function ensureWallet(oldId: string | undefined, fallbackName: string) {
          if (!oldId) return "";
          if (map[oldId]) return map[oldId];
          if (exists(oldId)) {
            map[oldId] = oldId;
            return oldId;
          }

          // ✅ create a new wallet and map old->new
          const newId = store.addWallet({
            name: `Imported ${fallbackName}`,
            type: "bank",
            balance: 0,
          });

          map[oldId] = newId;
          return newId;
        }

        // import rows
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]).map((v) => v.replace(/^"|"$/g, ""));

          const createdAt = cols[idxDate] || new Date().toISOString();
          const type = cols[idxType] as "income" | "expense" | "transfer";
          const amount = Number(cols[idxAmount] || 0);

          const walletOld = idxWallet >= 0 ? cols[idxWallet] : "";
          const fromOld = idxFrom >= 0 ? cols[idxFrom] : "";
          const toOld = idxTo >= 0 ? cols[idxTo] : "";

          const category = idxCategory >= 0 ? cols[idxCategory] : "";
          const source = idxSource >= 0 ? cols[idxSource] : "";
          const note = idxNote >= 0 ? cols[idxNote] : "";

          if (!type || !Number.isFinite(amount) || amount <= 0) continue;

          if (type === "income") {
            const walletId = ensureWallet(walletOld, "Wallet");
            store.addIncome({
              amount,
              walletId,
              source: source || undefined,
              note: note || undefined,
              createdAt,
            });
          }

          if (type === "expense") {
            const walletId = ensureWallet(walletOld, "Wallet");
            store.addExpense({
              amount,
              walletId,
              category: category || undefined,
              note: note || undefined,
              createdAt,
            });
          }

          if (type === "transfer") {
            const fromWalletId = ensureWallet(fromOld, "From");
            const toWalletId = ensureWallet(toOld, "To");
            if (!fromWalletId || !toWalletId || fromWalletId === toWalletId) continue;

            store.addTransfer({
              amount,
              fromWalletId,
              toWalletId,
              note: note || undefined,
              createdAt,
            });
          }
        }

        resolve();
      } catch (e) {
        console.error("[importTransactionsCSV] error:", e);
        reject(e);
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}