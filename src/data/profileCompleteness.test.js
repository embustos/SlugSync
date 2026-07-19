import { describe, expect, it } from "vitest";
import { computeCompleteness } from "./profileCompleteness";

describe("computeCompleteness", () => {
  it("is 0% and suggests a name for a blank profile", () => {
    const result = computeCompleteness(null);
    expect(result.percent).toBe(0);
    expect(result.suggestion).toBe("Add your name so other slugs can recognize you.");
  });

  it("is 100% and has a positive message when every field is filled", () => {
    const result = computeCompleteness({
      full_name: "Jane Slug",
      avatar_url: "https://example.com/a.png",
      username: "janeslug",
      bio: "Hi!",
      major: "CS",
      year: "Senior",
      interests: ["Hiking"],
      clubs: ["Robotics Club"],
      classes: ["CSE 101"],
    });
    expect(result.percent).toBe(100);
    expect(result.missingCount).toBe(0);
  });

  it("suggests the next missing field in priority order", () => {
    const result = computeCompleteness({
      full_name: "Jane Slug",
      avatar_url: "https://example.com/a.png",
      username: "janeslug",
    });
    expect(result.suggestion).toBe("Write a short bio to tell other slugs about yourself.");
  });

  it("treats empty arrays as not filled", () => {
    const result = computeCompleteness({
      full_name: "Jane Slug",
      avatar_url: "https://example.com/a.png",
      username: "janeslug",
      bio: "Hi!",
      major: "CS",
      year: "Senior",
      interests: [],
      clubs: [],
      classes: [],
    });
    expect(result.percent).toBeLessThan(100);
    expect(result.suggestion).toBe("Add your interests so SlugSync can improve recommendations.");
  });
});
