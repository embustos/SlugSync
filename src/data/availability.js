import { toBusySet } from "./busyGrid";

// ponytail: same hour-granularity tradeoff as busyGrid.js — good enough for a
// "free from X to Y" summary, not a scheduling engine.
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 22;

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function formatHour(hour) {
  const normalized = ((hour % 24) + 24) % 24;
  const period = normalized >= 12 ? "PM" : "AM";
  const h12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${h12}:00 ${period}`;
}

function buildWindow(dayOffset, startHour, endHour) {
  const dayLabel = dayOffset === 0 ? "today" : "tomorrow";
  return {
    day: dayLabel,
    startHour,
    endHour,
    label: `Free ${dayLabel} from ${formatHour(startHour)} to ${formatHour(endHour)}`,
  };
}

// Returns the next open window (>= 1hr, within an 8am-10pm day) across today
// and tomorrow, derived from the user's real events. Returns null when there
// isn't enough event data to say anything meaningful, or { none: true } when
// today/tomorrow are already fully booked.
export function computeAvailability(events, now = new Date()) {
  if (!events || events.length === 0) return null;

  const busy = toBusySet(events);

  for (let dayOffset = 0; dayOffset <= 1; dayOffset += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    const key = dateKey(day);

    const dayStartHour =
      dayOffset === 0
        ? Math.max(WORK_START_HOUR, Math.ceil(now.getHours() + now.getMinutes() / 60))
        : WORK_START_HOUR;

    let windowStart = null;

    for (let hour = dayStartHour; hour <= WORK_END_HOUR; hour += 1) {
      const isBusy = hour < WORK_END_HOUR && busy.has(`${key}|${hour}`);

      if (isBusy) {
        if (windowStart !== null && hour - windowStart >= 1) {
          return buildWindow(dayOffset, windowStart, hour);
        }
        windowStart = null;
        continue;
      }

      if (windowStart === null) windowStart = hour;

      if (hour === WORK_END_HOUR && hour - windowStart >= 1) {
        return buildWindow(dayOffset, windowStart, hour);
      }
    }
  }

  return { none: true };
}
