// Normalizes clubs/classes/interests, which may be stored as text[] (new
// rows) or a legacy comma-separated text column, into a clean string array —
// and back again for the comma-separated edit inputs.

export function toTagArray(value) {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const seen = new Set();
  const result = [];

  for (const entry of raw) {
    const trimmed = String(entry ?? "").trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function tagsToInput(value) {
  return toTagArray(value).join(", ");
}
