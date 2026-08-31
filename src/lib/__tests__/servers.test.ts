import { describe, expect, it } from "vitest";
import { titleOf, yearOf, isMovie, hrefFor } from "@/lib/servers";
import type { MediaItem } from "@/lib/types";

describe("titleOf / yearOf", () => {
  it("prefers title then name", () => {
    expect(titleOf({ id: 1, title: "Fight Club" } as MediaItem)).toBe("Fight Club");
    expect(titleOf({ id: 1, name: "Game of Thrones" } as MediaItem)).toBe("Game of Thrones");
    expect(titleOf({ id: 1 } as MediaItem)).toBe("Untitled");
  });
  it("reads release_date or first_air_date year", () => {
    expect(yearOf({ id: 1, release_date: "1999-10-15" } as MediaItem)).toBe("1999");
    expect(yearOf({ id: 1, first_air_date: "2011-04-17" } as MediaItem)).toBe("2011");
    expect(yearOf({ id: 1 } as MediaItem)).toBe("N/A");
  });
});

describe("isMovie", () => {
  it("true for media_type movie", () => expect(isMovie({ media_type: "movie" })).toBe(true));
  it("false for media_type tv", () => expect(isMovie({ media_type: "tv" })).toBe(false));
  it("true when first_air_date is absent", () =>
    expect(isMovie({ first_air_date: undefined })).toBe(true));
  it("false when first_air_date present without media_type", () =>
    expect(isMovie({ first_air_date: "2011-04-17" })).toBe(false));
});

describe("hrefFor", () => {
  it("links movies to /movie/:id", () =>
    expect(hrefFor({ id: 550, media_type: "movie", title: "Fight Club" } as MediaItem)).toBe(
      "/movie/550"
    ));
  it("links tv to /tv/:id", () =>
    expect(hrefFor({ id: 1399, media_type: "tv", name: "GoT" } as MediaItem)).toBe("/tv/1399"));
});
