import type { MediaItem, MediaType } from "./types";

export function titleOf(m: MediaItem): string {
  return m.title || m.name || "Untitled";
}

export function yearOf(m: MediaItem): string {
  const d = m.release_date || m.first_air_date;
  return d ? new Date(d).getFullYear().toString() : "N/A";
}

export function isMovie(item: { media_type?: string; first_air_date?: string }): boolean {
  if (item.media_type === "movie") return true;
  if (item.media_type === "tv") return false;
  return !item.first_air_date;
}

export function hrefFor(m: MediaItem): string {
  const type: MediaType = m.media_type === "tv" ? "tv" : isMovie(m) ? "movie" : "tv";
  return `/${type}/${m.id}`;
}

export function watchHrefFor(m: MediaItem): string {
  const type: MediaType = m.media_type === "tv" ? "tv" : isMovie(m) ? "movie" : "tv";
  return `/watch/${type}/${m.id}`;
}
