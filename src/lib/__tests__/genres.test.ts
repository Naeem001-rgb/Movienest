import { describe, expect, it } from "vitest";
import { genreBySlug } from "@/lib/genres";

describe("genreBySlug", () => {
  it("maps action", () => expect(genreBySlug("action")?.id).toBe(28));
  it("maps sci-fi", () => expect(genreBySlug("sci-fi")?.id).toBe(878));
  it("uses the correct catalog for TV-only genres", () => {
    expect(genreBySlug("kids")?.type).toBe("tv");
    expect(genreBySlug("news")?.type).toBe("tv");
    expect(genreBySlug("action")?.type).toBe("movie");
  });
  it("returns undefined for unknown", () => expect(genreBySlug("nope")).toBeUndefined());
});
