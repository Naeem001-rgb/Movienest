import { describe, expect, it } from "vitest";
import { buildEmbedUrl } from "@/lib/embed";

describe("buildEmbedUrl", () => {
  it("videasy movie", () =>
    expect(buildEmbedUrl("videasy", { id: 550, type: "movie" })).toBe(
      "https://player.videasy.net/movie/550"
    ));
  it("videasy tv with season/episode", () =>
    expect(buildEmbedUrl("videasy", { id: 1399, type: "tv", season: 2, episode: 4 })).toBe(
      "https://player.videasy.net/tv/1399/2/4"
    ));
  it("vidfast adds autoplay", () =>
    expect(buildEmbedUrl("vidfast", { id: 550, type: "movie" })).toBe(
      "https://vidfast.pro/movie/550?autoPlay=true"
    ));
  it("vidfast tv autoplay", () =>
    expect(buildEmbedUrl("vidfast", { id: 1399, type: "tv", season: 1, episode: 1 })).toBe(
      "https://vidfast.pro/tv/1399/1/1?autoPlay=true"
    ));
  it("vidsrc uses embed path", () =>
    expect(buildEmbedUrl("vidsrc", { id: 550, type: "movie" })).toBe(
      "https://vidsrc.to/embed/movie/550"
    ));
  it("vidsrc tv", () =>
    expect(buildEmbedUrl("vidsrc", { id: 1399, type: "tv", season: 3, episode: 5 })).toBe(
      "https://vidsrc.to/embed/tv/1399/3/5"
    ));
  it("multiembed movie uses query params", () =>
    expect(buildEmbedUrl("multiembed", { id: 550, type: "movie" })).toBe(
      "https://multiembed.mov/?video_id=550&tmdb=1"
    ));
  it("multiembed tv adds s/e params", () =>
    expect(buildEmbedUrl("multiembed", { id: 1399, type: "tv", season: 3, episode: 5 })).toBe(
      "https://multiembed.mov/?video_id=1399&tmdb=1&s=3&e=5"
    ));
});
