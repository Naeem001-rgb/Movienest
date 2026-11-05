import "server-only";
import { cache } from "react";
import { isMediaId } from "./params";
import type { MediaDetails, MediaType } from "./types";

const BASE = "https://api.themoviedb.org/3";

/** Thrown when TMDB answers 404 — pages translate this into notFound(). */
class TmdbNotFoundError extends Error {
  readonly tmdbNotFound = true;
  constructor(path: string) {
    super(`TMDB 404 for ${path}`);
    this.name = "TmdbNotFoundError";
  }
}

/**
 * Fetch from TMDB server-side. Never import this from a client component —
 * it reads the private API key from the environment.
 */
export function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
  revalidate = 3600,
): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, api_key: key });
  qs.sort();
  return fetchCatalog(path, qs.toString(), revalidate) as Promise<T>;
}

// A timeout opts fetch out of automatic request memoization. React cache keeps
// identical metadata/page requests deduplicated within this server render.
const fetchCatalog = cache(
  async (path: string, query: string, revalidate: number): Promise<unknown> => {
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}?${query}`, {
        next: { revalidate },
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      // Never include the private key or credential-bearing request URL in errors.
      throw new Error("The movie catalog is temporarily unavailable.");
    }
    if (res.status === 404) throw new TmdbNotFoundError(path);
    if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
    return res.json();
  },
);

export function getMediaDetails(type: MediaType, id: string): Promise<MediaDetails> {
  if (!isMediaId(id)) throw new TmdbNotFoundError(`/${type}/invalid-id`);
  return tmdbFetch<MediaDetails>(`/${type}/${id}`, { append_to_response: "credits" });
}

export function isNotFound(err: unknown): boolean {
  // Property check, not instanceof: the bundler duplicates this class into
  // per-route chunks, so cross-chunk instanceof checks fail.
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { tmdbNotFound?: boolean }).tmdbNotFound === true
  );
}
