import type { MediaType } from "./types";

export type ServerId = "videasy" | "vidfast" | "vidsrc";

export const SERVERS: { id: ServerId; name: string }[] = [
  { id: "videasy", name: "Videasy" },
  { id: "vidfast", name: "VidFast" },
  { id: "vidsrc", name: "VidSrc" },
];

export function buildEmbedUrl(
  server: ServerId,
  opts: { id: number; type: MediaType; season?: number; episode?: number }
): string {
  const { id, type, season, episode } = opts;
  const tvSuffix =
    type === "tv" && season != null && episode != null ? `/${season}/${episode}` : "";
  switch (server) {
    case "videasy":
      return `https://player.videasy.net/${type}/${id}${tvSuffix}`;
    case "vidfast":
      return `https://vidfast.pro/${type}/${id}${tvSuffix}?autoPlay=true`;
    case "vidsrc":
      return `https://vidsrc.to/embed/${type}/${id}${tvSuffix}`;
  }
}
