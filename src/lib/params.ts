export type QueryValue = string | string[] | undefined;

export function firstQueryValue(value: QueryValue): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseInteger(value: QueryValue): number | undefined {
  const input = firstQueryValue(value);
  if (!/^\d{1,16}$/.test(input)) return undefined;
  const number = Number(input);
  return Number.isSafeInteger(number) ? number : undefined;
}

export function isMediaId(id: string | null): id is string {
  return id !== null && (parseInteger(id) ?? 0) > 0;
}

export function parsePage(value: QueryValue): number {
  return Math.min(Math.max(parseInteger(value) ?? 1, 1), 500);
}

export const MAX_SEARCH_LENGTH = 200;

export function searchQuery(value: QueryValue): string {
  return firstQueryValue(value).trim().slice(0, MAX_SEARCH_LENGTH);
}

export function selectEpisode(
  episodes: { episode_number: number }[],
  requested: QueryValue,
): number {
  const number = parseInteger(requested);
  return (
    episodes.find((episode) => episode.episode_number === number)?.episode_number ??
    episodes.find((episode) => episode.episode_number === 1)?.episode_number ??
    episodes[0]?.episode_number ??
    1
  );
}
