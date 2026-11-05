import type { MediaItem } from "./types";

export function titleOf(m: MediaItem): string {
  return m.title || m.name || "Untitled";
}

export function yearOf(m: MediaItem): string {
  const d = m.release_date || m.first_air_date;
  return d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d.slice(0, 4) : "N/A";
}

export function isMovie(item: { media_type?: string; first_air_date?: string }): boolean {
  if (item.media_type === "movie") return true;
  if (item.media_type === "tv") return false;
  return !item.first_air_date;
}

export function hrefFor(m: MediaItem): string {
  return `/${isMovie(m) ? "movie" : "tv"}/${m.id}`;
}

export function watchHrefFor(m: MediaItem): string {
  return `/watch${hrefFor(m)}`;
}
