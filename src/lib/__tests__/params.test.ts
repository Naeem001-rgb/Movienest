import { describe, expect, it } from "vitest";
import {
  firstQueryValue,
  isMediaId,
  MAX_SEARCH_LENGTH,
  parseInteger,
  parsePage,
  searchQuery,
  selectEpisode,
} from "../params";

describe("route input validation", () => {
  it("normalizes repeated query parameters without crashing", () => {
    expect(firstQueryValue(["first", "second"])).toBe("first");
    expect(firstQueryValue([])).toBe("");
    expect(searchQuery(["  test  ", "ignored"])).toBe("test");
    expect(searchQuery(undefined)).toBe("");
    expect(searchQuery("x".repeat(1000))).toHaveLength(MAX_SEARCH_LENGTH);
  });

  it("rejects malformed and unsafe media IDs before any catalog request", () => {
    for (const id of [
      null,
      "",
      "0",
      "-1",
      "2e3",
      "550/foo",
      "1.5",
      "9007199254740992",
      "1".repeat(1000),
    ]) {
      expect(isMediaId(id)).toBe(false);
    }
    expect(isMediaId("550")).toBe(true);
  });

  it("bounds page numbers and rejects partial numeric strings", () => {
    expect(parsePage("999")).toBe(500);
    expect(parsePage(["2", "9"])).toBe(2);
    for (const value of [undefined, "", "0", "-5", "2abc", "Infinity"])
      expect(parsePage(value)).toBe(1);
    expect(parseInteger("0")).toBe(0);
  });

  it("selects real episodes, including sparse or unsorted season data", () => {
    const episodes = [{ episode_number: 4 }, { episode_number: 1 }, { episode_number: 6 }];
    expect(selectEpisode(episodes, "4")).toBe(4);
    expect(selectEpisode(episodes, "3")).toBe(1);
    expect(selectEpisode(episodes, "4garbage")).toBe(1);
    expect(selectEpisode([{ episode_number: 3 }], undefined)).toBe(3);
    expect(selectEpisode([], undefined)).toBe(1);
  });
});
