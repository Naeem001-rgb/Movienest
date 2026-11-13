import { describe, expect, it } from "vitest";
import {
  createWatchEntry,
  formatWatchTime,
  isFinished,
  MAX_WATCH_HISTORY,
  parseWatchHistory,
  removeWatchEntry,
  resumeServerFor,
  sameEpisode,
  upsertWatchEntry,
  watchHistoryHref,
  type WatchEntry,
} from "../watch-history";

const movie: WatchEntry = {
  id: 550,
  type: "movie",
  title: "Fight Club",
  posterPath: "/poster.jpg",
  server: "vidfast",
  position: 1200,
  duration: 7200,
  updatedAt: 1000,
};
const show: WatchEntry = { ...movie, type: "tv", title: "A show", season: 2, episode: 3 };

describe("watch history", () => {
  it("preserves a measured checkpoint through MultiEmbed and VidSrc switches", () => {
    const multiembed = createWatchEntry(movie, "multiembed", movie, 2000);
    expect(multiembed).toMatchObject({
      server: "multiembed",
      position: 1200,
      duration: 7200,
      progressServer: "vidfast",
    });
    const vidsrc = createWatchEntry(movie, "vidsrc", multiembed, 3000);
    expect(vidsrc).toMatchObject({ position: 1200, duration: 7200, progressServer: "vidfast" });
    expect(resumeServerFor(vidsrc)).toBe("vidfast");
    expect(parseWatchHistory(JSON.stringify([vidsrc]))).toEqual([vidsrc]);
  });
  it("does not carry a checkpoint into a different title or episode", () => {
    expect(createWatchEntry({ ...show, episode: 4 }, "multiembed", show, 2000)).toMatchObject({
      position: 0,
      duration: 0,
      progressServer: undefined,
    });
    expect(createWatchEntry({ ...movie, id: 551 }, "multiembed", movie, 2000).position).toBe(0);
  });
  it("keeps new MultiEmbed bookmarks without inventing a timestamp", () => {
    expect(createWatchEntry(movie, "multiembed", undefined, 2000)).toMatchObject({
      server: "multiembed",
      position: 0,
      duration: 0,
      progressServer: undefined,
    });
  });
  it("recovers from missing, corrupt and incorrectly shaped storage", () => {
    for (const raw of [null, "{", "null", "{}", '[null,1,"bad"]'])
      expect(parseWatchHistory(raw)).toEqual([]);
  });
  it("retains valid entries while dropping invalid links and progress", () => {
    const invalid = [
      { ...movie, id: "javascript:alert(1)" },
      { ...movie, type: "other" },
      { ...movie, position: -1 },
      { ...movie, duration: 10 },
      { ...movie, posterPath: "//example.com/p.jpg" },
      { ...movie, server: "unknown" },
      { ...show, episode: 0 },
      { ...show, season: undefined },
    ];
    expect(parseWatchHistory(JSON.stringify([...invalid, movie]))).toEqual([movie]);
  });
  it("keeps movies and TV with the same TMDB ID separate", () => {
    const entries = upsertWatchEntry([movie], show);
    expect(entries).toHaveLength(2);
    expect(removeWatchEntry(entries, movie)).toEqual([show]);
  });
  it("replaces a show's previous episode with its latest episode", () => {
    const next = { ...show, episode: 4, position: 0, duration: 0, updatedAt: 2000 };
    expect(upsertWatchEntry([show, movie], next)).toEqual([next, movie]);
    expect(sameEpisode(show, next)).toBe(false);
    expect(sameEpisode(movie, { ...movie, season: 2 })).toBe(true);
  });
  it("sorts, deduplicates and caps the saved list", () => {
    const older = { ...movie, updatedAt: 500 };
    expect(parseWatchHistory(JSON.stringify([older, movie]))).toEqual([movie]);
    const entries = Array.from({ length: 60 }, (_, id) => ({
      ...movie,
      id: id + 1,
      updatedAt: id + 1,
    }));
    const parsed = parseWatchHistory(JSON.stringify(entries));
    expect(parsed).toHaveLength(MAX_WATCH_HISTORY);
    expect(parsed[0].id).toBe(60);
  });
  it("removes completed titles without resurrecting an older duplicate", () => {
    const finished = { ...movie, position: 7100, updatedAt: 2000 };
    expect(parseWatchHistory(JSON.stringify([movie, finished]))).toEqual([]);
    expect(upsertWatchEntry([movie, show], finished)).toEqual([show]);
    expect(isFinished(0, 0)).toBe(false);
    expect(isFinished(7055, 7200)).toBe(false);
  });
  it("builds shareable TV links including specials and formats checkpoints", () => {
    expect(watchHistoryHref(movie)).toBe("/watch/movie/550");
    expect(watchHistoryHref(show)).toBe("/watch/tv/550?season=2&episode=3");
    expect(watchHistoryHref({ ...show, season: 0 })).toContain("season=0");
    expect(formatWatchTime(3661.8)).toBe("61:01");
  });
});
