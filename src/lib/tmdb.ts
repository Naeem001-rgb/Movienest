const BASE = "https://api.themoviedb.org/3";

export const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

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
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return res.json() as Promise<T>;
}
