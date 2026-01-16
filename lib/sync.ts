export type SyncProvider = "local" | "google" | "icloud";

export type SyncState = {
  provider: SyncProvider;
  lastSync?: string;
};

const KEY = "finance_sync_state";

export const syncState = {
  get(): SyncState {
    if (typeof window === "undefined") return { provider: "local" };
    return JSON.parse(localStorage.getItem(KEY) || '{"provider":"local"}');
  },

  set(next: SyncState) {
    localStorage.setItem(KEY, JSON.stringify(next));
  },
};
