import { describe, expect, it } from "vitest";
import { computeAvailability } from "./availability";

describe("computeAvailability", () => {
  it("returns null when there are no events at all", () => {
    expect(computeAvailability([], new Date("2026-07-19T09:00:00"))).toBeNull();
    expect(computeAvailability(null, new Date("2026-07-19T09:00:00"))).toBeNull();
  });

  it("finds the free window before the next busy block today", () => {
    const now = new Date("2026-07-19T09:00:00");
    const events = [
      { event_date: "2026-07-19", event_time: "13:00", event_end_time: "15:00" },
    ];
    const result = computeAvailability(events, now);
    expect(result.day).toBe("today");
    expect(result.label).toBe("Free today from 9:00 AM to 1:00 PM");
  });

  it("reports free until end of day when nothing else is scheduled", () => {
    const now = new Date("2026-07-19T18:00:00");
    const events = [
      { event_date: "2026-07-19", event_time: "09:00", event_end_time: "10:00" },
    ];
    const result = computeAvailability(events, now);
    expect(result.label).toBe("Free today from 6:00 PM to 10:00 PM");
  });

  it("falls through to tomorrow when today is fully booked", () => {
    const now = new Date("2026-07-19T08:00:00");
    const events = [
      { event_date: "2026-07-19", event_time: "08:00", event_end_time: "22:00" },
      { event_date: "2026-07-20", event_time: "10:00", event_end_time: "13:00" },
    ];
    const result = computeAvailability(events, now);
    expect(result.day).toBe("tomorrow");
    expect(result.label).toBe("Free tomorrow from 8:00 AM to 10:00 AM");
  });

  it("returns { none: true } when both days are fully booked", () => {
    const now = new Date("2026-07-19T08:00:00");
    const events = [
      { event_date: "2026-07-19", event_time: "08:00", event_end_time: "22:00" },
      { event_date: "2026-07-20", event_time: "08:00", event_end_time: "22:00" },
    ];
    expect(computeAvailability(events, now)).toEqual({ none: true });
  });
});
