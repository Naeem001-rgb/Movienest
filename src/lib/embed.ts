import type { MediaType } from "./types";

export type ServerId = "vidfast" | "vidsrc" | "multiembed";

export const SERVERS: { id: ServerId; name: string }[] = [
  { id: "vidfast", name: "VidFast" },
  { id: "vidsrc", name: "VidSrc" },
  { id: "multiembed", name: "MultiEmbed" },
];

export function buildEmbedUrl(
  server: ServerId,
  opts: { id: number; type: MediaType; season?: number; episode?: number; startAt?: number },
): string {
  const { id, type, season, episode } = opts;
  const tvSuffix =
    type === "tv" && season != null && episode != null ? `/${season}/${episode}` : "";
  const startAt =
    Number.isFinite(opts.startAt) && opts.startAt! > 0 ? Math.floor(opts.startAt!) : 0;
  switch (server) {
    case "vidfast":
      return `https://vidfast.pro/${type}/${id}${tvSuffix}?autoPlay=true${startAt ? `&startAt=${startAt}` : ""}`;
    case "vidsrc":
      return `https://vidsrc.to/embed/${type}/${id}${tvSuffix}`;
    case "multiembed":
      // MultiEmbed takes query params instead of a path: video_id + tmdb=1, with s/e for TV.
      return `https://multiembed.mov/?video_id=${id}&tmdb=1${
        type === "tv" && season != null && episode != null ? `&s=${season}&e=${episode}` : ""
      }`;
  }
}
