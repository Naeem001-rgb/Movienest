import type { ServerId } from "./embed";
import type { WatchMedia } from "./watch-history";

// Explicit provider origins, including their documented redirect domains.
const PLAYER_ORIGINS: Partial<Record<ServerId, string[]>> = {
  videasy: ["https://player.videasy.net", "https://player.videasy.to"],
  vidfast: ["pro", "in", "io", "me", "net", "pm", "xyz", "vc", "bz"].map(
    (tld) => `https://vidfast.${tld}`,
  ),
};

export function supportsProgress(server: ServerId): boolean {
  return server === "videasy" || server === "vidfast";
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function decode(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export interface PlayerProgress {
  position: number;
  duration: number;
  ended: boolean;
}

/** The caller must also verify message.source is the active iframe's contentWindow. */
export function parsePlayerProgress(
  server: ServerId,
  origin: string,
  payload: unknown,
  media: WatchMedia,
): PlayerProgress | null {
  if (!PLAYER_ORIGINS[server]?.includes(origin)) return null;
  const message = object(decode(payload));
  if (!message) return null;

  let data: Record<string, unknown> | null = null;
  let position: unknown;
  let duration: unknown;
  let ended = false;

  if (message.type === "PLAYER_EVENT") {
    data = object(message.data);
    if (!data || !["play", "pause", "seeked", "timeupdate", "ended"].includes(String(data.event)))
      return null;
    position = server === "videasy" ? (data.timestamp ?? data.currentTime) : data.currentTime;
    duration = data.duration;
    ended = data.event === "ended";
  } else if (server === "videasy" && message.type === "MEDIA_DATA") {
    const collection = object(decode(message.data));
    if (!collection) return null;
    // MEDIA_DATA carries the provider's library; read only the active title.
    data =
      Object.values(collection)
        .map(object)
        .find((item) => item && matches(item, media)) ?? null;
    const progress = object(data?.progress);
    position = progress?.watched;
    duration = progress?.duration;
  } else if (server === "videasy" && "timestamp" in message) {
    data = message;
    position = data.timestamp;
    duration = data.duration;
  }

  if (
    !data ||
    !matches(data, media) ||
    typeof position !== "number" ||
    !Number.isFinite(position) ||
    position < 0 ||
    typeof duration !== "number" ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    position > duration + 1
  )
    return null;

  return { position: Math.min(position, duration), duration, ended };
}

function matches(data: Record<string, unknown>, media: WatchMedia): boolean {
  const id = data.tmdbId ?? data.id;
  const type = data.mediaType ?? data.type;
  return (
    String(id) === String(media.id) &&
    type === media.type &&
    (media.type === "movie" ||
      (String(data.season) === String(media.season) &&
        String(data.episode) === String(media.episode)))
  );
}
