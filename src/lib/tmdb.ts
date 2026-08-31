const BASE = "https://api.themoviedb.org/3";

export const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

/** Thrown when TMDB answers 404 — pages translate this into notFound(). */
export class TmdbNotFoundError extends Error {
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
export async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {},
  revalidate = 3600
): Promise<T> {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, api_key: key });
  const res = await fetch(`${BASE}${path}?${qs}`, { next: { revalidate } });
  if (res.status === 404) throw new TmdbNotFoundError(path);
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return res.json() as Promise<T>;
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
