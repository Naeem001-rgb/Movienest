import { describe, expect, it } from "vitest";
import { ratingPercent, ratingColor } from "@/lib/rating";

describe("ratingPercent", () => {
  it("multiplies by 10 and rounds", () => expect(ratingPercent(7.6)).toBe(76));
  it("returns 0 for undefined", () => expect(ratingPercent(undefined)).toBe(0));
  it("returns 0 for zero", () => expect(ratingPercent(0)).toBe(0));
});

describe("ratingColor", () => {
  it("green at 70+", () => expect(ratingColor(7.0)).toBe("#21d07a"));
  it("yellow at 40–69", () => {
    expect(ratingColor(4.0)).toBe("#d2d531");
    expect(ratingColor(6.9)).toBe("#d2d531");
  });
  it("red below 40", () => expect(ratingColor(3.9)).toBe("#db2360"));
});
