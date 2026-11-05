import { SERVERS, type ServerId } from "./embed";
import type { MediaType } from "./types";

export const WATCH_HISTORY_KEY = "movienest:continue-watching:v1";
export const MAX_WATCH_HISTORY = 40;

export interface WatchMedia {
  id: number;
  type: MediaType;
  title: string;
  posterPath: string | null;
  season?: number;
  episode?: number;
  episodeTitle?: string;
}

export interface WatchEntry extends WatchMedia {
  server: ServerId;
  position: number;
  duration: number;
  updatedAt: number;
}

export function watchKey(media: Pick<WatchMedia, "id" | "type">): string {
  return `${media.type}:${media.id}`;
}

export function sameEpisode(a: WatchMedia, b: WatchMedia): boolean {
  return (
    watchKey(a) === watchKey(b) &&
    (a.type === "movie" || (a.season === b.season && a.episode === b.episode))
  );
}

export function watchHistoryHref(entry: WatchMedia): string {
  const path = `/watch/${entry.type}/${entry.id}`;
  return entry.type === "tv" && entry.season != null && entry.episode != null
    ? `${path}?season=${entry.season}&episode=${entry.episode}`
    : path;
}

export function isFinished(position: number, duration: number): boolean {
  return duration > 0 && position / duration >= 0.98;
}

function isEntry(value: unknown): value is WatchEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(e.id) &&
    (e.id as number) > 0 &&
    (e.type === "movie" || e.type === "tv") &&
    typeof e.title === "string" &&
    e.title.length > 0 &&
    e.title.length <= 500 &&
    (e.posterPath === null ||
      (typeof e.posterPath === "string" && /^\/[\w.-]+$/.test(e.posterPath))) &&
    (e.episodeTitle === undefined ||
      (typeof e.episodeTitle === "string" && e.episodeTitle.length <= 500)) &&
    SERVERS.some((server) => server.id === e.server) &&
    typeof e.position === "number" &&
    Number.isFinite(e.position) &&
    e.position >= 0 &&
    typeof e.duration === "number" &&
    Number.isFinite(e.duration) &&
    e.duration >= e.position &&
    typeof e.updatedAt === "number" &&
    Number.isFinite(e.updatedAt) &&
    e.updatedAt > 0 &&
    (e.type === "movie" ||
      (Number.isSafeInteger(e.season) &&
        (e.season as number) >= 0 &&
        Number.isSafeInteger(e.episode) &&
        (e.episode as number) >= 1))
  );
}

/** Treat browser storage as untrusted and keep one, most recent entry per title. */
export function parseWatchHistory(raw: string | null): WatchEntry[] {
  try {
    const values: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(values) ? normalizeEntries(values) : [];
  } catch {
    return [];
  }
}

function normalizeEntries(values: unknown[]): WatchEntry[] {
  const seen = new Set<string>();
  return values
    .filter(isEntry)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((entry) => {
      const key = watchKey(entry);
      if (seen.has(key)) return false;
      seen.add(key);
      return !isFinished(entry.position, entry.duration);
    })
    .slice(0, MAX_WATCH_HISTORY);
}

export function upsertWatchEntry(entries: WatchEntry[], entry: WatchEntry): WatchEntry[] {
  return normalizeEntries([entry, ...entries.filter((e) => watchKey(e) !== watchKey(entry))]);
}

export function removeWatchEntry(
  entries: WatchEntry[],
  media: Pick<WatchMedia, "id" | "type">,
): WatchEntry[] {
  return entries.filter((entry) => watchKey(entry) !== watchKey(media));
}

export function formatWatchTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
