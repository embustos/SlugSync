import { describe, expect, it } from "vitest";
import { toTagArray, tagsToInput } from "./tags";

describe("toTagArray", () => {
  it("passes through an already-clean array", () => {
    expect(toTagArray(["Robotics Club", "Chess Club"])).toEqual([
      "Robotics Club",
      "Chess Club",
    ]);
  });

  it("splits a legacy comma-separated string", () => {
    expect(toTagArray("CSE 101, MATH 19A")).toEqual(["CSE 101", "MATH 19A"]);
  });

  it("trims whitespace and drops empty entries", () => {
    expect(toTagArray("  Hiking ,, Reading ,   ")).toEqual(["Hiking", "Reading"]);
  });

  it("removes case-insensitive duplicates", () => {
    expect(toTagArray("Chess Club, chess club, Chess Club")).toEqual(["Chess Club"]);
  });

  it("returns an empty array for null/undefined/empty input", () => {
    expect(toTagArray(null)).toEqual([]);
    expect(toTagArray(undefined)).toEqual([]);
    expect(toTagArray("")).toEqual([]);
    expect(toTagArray([])).toEqual([]);
  });
});

describe("tagsToInput", () => {
  it("joins an array into a comma-separated string", () => {
    expect(tagsToInput(["Robotics Club", "Chess Club"])).toBe("Robotics Club, Chess Club");
  });

  it("normalizes a legacy string through the same dedupe/trim rules", () => {
    expect(tagsToInput(" Hiking ,Hiking")).toBe("Hiking");
  });

  it("returns an empty string for null/empty input", () => {
    expect(tagsToInput(null)).toBe("");
    expect(tagsToInput("")).toBe("");
  });
});
