import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { getMediaDetails, isNotFound, tmdbFetch } from "../tmdb";

describe("server catalog boundary", () => {
  beforeEach(() => vi.stubEnv("TMDB_API_KEY", "test-private-key"));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("does not fetch invalid IDs, even from metadata", () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect(() => getMediaDetails("movie", "550/credits")).toThrow();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("encodes search data and applies a bounded request lifetime", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"results":[]}'));
    vi.stubGlobal("fetch", fetch);
    await tmdbFetch("/search/multi", { query: "a&api_key=bad", api_key: "override" }, 0);
    const [input, init] = fetch.mock.calls[0];
    const url = new URL(input);
    expect(url.origin).toBe("https://api.themoviedb.org");
    expect(url.searchParams.get("query")).toBe("a&api_key=bad");
    expect(url.searchParams.get("api_key")).toBe("test-private-key");
    expect(init.next.revalidate).toBe(0);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("preserves not-found detection without exposing request credentials", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    const error = await tmdbFetch("/movie/550").catch((error: unknown) => error);
    expect(isNotFound(error)).toBe(true);
    expect(isNotFound({ tmdbNotFound: true })).toBe(true);
    expect(String(error)).not.toContain("test-private-key");
  });

  it("sanitizes upstream network errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("request URL contains test-private-key")),
    );
    await expect(tmdbFetch("/movie/550")).rejects.toThrow(
      "The movie catalog is temporarily unavailable.",
    );
  });
});
