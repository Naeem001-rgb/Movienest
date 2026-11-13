import { describe, expect, it } from "vitest";
import { parsePlayerProgress } from "../player-progress";
import type { WatchMedia } from "../watch-history";

const movie: WatchMedia = { id: 550, type: "movie", title: "Fight Club", posterPath: null };
const event = {
  type: "PLAYER_EVENT",
  data: { event: "timeupdate", tmdbId: 550, mediaType: "movie", currentTime: 123, duration: 7200 },
};

describe("player progress boundary", () => {
  it("accepts VidFast progress, including documented redirect origins", () => {
    expect(parsePlayerProgress("vidfast", "https://vidfast.pro", event, movie)).toEqual({
      position: 123,
      duration: 7200,
      ended: false,
    });
    expect(
      parsePlayerProgress("vidfast", "https://vidfast.vc", JSON.stringify(event), movie)?.position,
    ).toBe(123);
  });
  it("rejects unknown origins, lookalike hosts, and a different active provider", () => {
    for (const origin of [
      "https://example.com",
      "https://vidfast.pro.evil.test",
      "http://vidfast.pro",
      "null",
    ])
      expect(parsePlayerProgress("vidfast", origin, event, movie)).toBeNull();
    expect(parsePlayerProgress("vidsrc", "https://vidfast.pro", event, movie)).toBeNull();
    expect(parsePlayerProgress("vidsrc", "https://vidsrc.to", event, movie)).toBeNull();
  });
  it("rejects unrelated titles, episodes and non-playback status messages", () => {
    for (const change of [{ tmdbId: 1 }, { mediaType: "tv" }, { event: "playerstatus" }])
      expect(
        parsePlayerProgress(
          "vidfast",
          "https://vidfast.pro",
          { ...event, data: { ...event.data, ...change } },
          movie,
        ),
      ).toBeNull();
    const show = { ...movie, type: "tv" as const, season: 2, episode: 4 };
    const tv = { ...event, data: { ...event.data, mediaType: "tv", season: 2, episode: 4 } };
    expect(parsePlayerProgress("vidfast", "https://vidfast.pro", tv, show)?.position).toBe(123);
    expect(
      parsePlayerProgress("vidfast", "https://vidfast.pro", tv, { ...show, episode: 5 }),
    ).toBeNull();
  });
  it("rejects malformed payloads and invalid times", () => {
    for (const payload of [null, "broken", [], {}, { type: "PLAYER_EVENT", data: null }])
      expect(parsePlayerProgress("vidfast", "https://vidfast.pro", payload, movie)).toBeNull();
    for (const change of [
      { currentTime: NaN },
      { currentTime: -1 },
      { currentTime: "123" },
      { duration: Infinity },
      { duration: 0 },
      { currentTime: 8000 },
    ])
      expect(
        parsePlayerProgress(
          "vidfast",
          "https://vidfast.pro",
          { ...event, data: { ...event.data, ...change } },
          movie,
        ),
      ).toBeNull();
  });
  it("recognizes completion events", () => {
    const ended = { ...event, data: { ...event.data, event: "ended", currentTime: 7200 } };
    expect(parsePlayerProgress("vidfast", "https://vidfast.pro", ended, movie)?.ended).toBe(true);
  });
});
