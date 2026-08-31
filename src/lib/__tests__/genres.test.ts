import { describe, expect, it } from "vitest";
import { genreBySlug } from "@/lib/genres";

describe("genreBySlug", () => {
  it("maps action", () => expect(genreBySlug("action")?.id).toBe(28));
  it("maps sci-fi", () => expect(genreBySlug("sci-fi")?.id).toBe(878));
  it("returns undefined for unknown", () => expect(genreBySlug("nope")).toBeUndefined());
});
