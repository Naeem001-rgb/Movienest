import {
  parseWatchHistory,
  removeWatchEntry,
  upsertWatchEntry,
  WATCH_HISTORY_KEY,
  type WatchEntry,
  type WatchMedia,
} from "./watch-history";

const CHANGE_EVENT = "movienest:watch-history-change";
let memorySnapshot = "[]";
let storageUnavailable = false;

// String snapshots are stable for useSyncExternalStore, including during hydration.
export function getHistorySnapshot(): string {
  if (typeof window === "undefined") return "[]";
  if (storageUnavailable) return memorySnapshot;
  try {
    memorySnapshot = window.localStorage.getItem(WATCH_HISTORY_KEY) ?? "[]";
  } catch {
    storageUnavailable = true;
    // Private browsing / denied storage: keep the feature usable for this session.
  }
  return memorySnapshot;
}

export function getServerHistorySnapshot(): string {
  return "[]";
}

export function readWatchHistory(): WatchEntry[] {
  return parseWatchHistory(getHistorySnapshot());
}

function writeWatchHistory(entries: WatchEntry[]): void {
  memorySnapshot = JSON.stringify(entries);
  try {
    if (!storageUnavailable) window.localStorage.setItem(WATCH_HISTORY_KEY, memorySnapshot);
  } catch {
    storageUnavailable = true;
    // Storage limits must never interrupt playback or removal.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function saveWatchEntry(entry: WatchEntry): void {
  writeWatchHistory(upsertWatchEntry(readWatchHistory(), entry));
}

export function deleteWatchEntry(media: Pick<WatchMedia, "id" | "type">): void {
  writeWatchHistory(removeWatchEntry(readWatchHistory(), media));
}

export function subscribeToWatchHistory(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === WATCH_HISTORY_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
