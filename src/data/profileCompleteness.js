// Priority order doubles as the suggestion order — earlier entries surface
// first when several fields are still missing.
const FIELDS = [
  {
    key: "full_name",
    check: (p) => Boolean(p.full_name),
    suggestion: "Add your name so other slugs can recognize you.",
  },
  {
    key: "avatar_url",
    check: (p) => Boolean(p.avatar_url),
    suggestion: "Add a profile photo to complete your profile.",
  },
  {
    key: "username",
    check: (p) => Boolean(p.username),
    suggestion: "Pick a username so friends can find you.",
  },
  {
    key: "bio",
    check: (p) => Boolean(p.bio),
    suggestion: "Write a short bio to tell other slugs about yourself.",
  },
  {
    key: "major",
    check: (p) => Boolean(p.major),
    suggestion: "Add your major to help classmates find you.",
  },
  {
    key: "year",
    check: (p) => Boolean(p.year),
    suggestion: "Add your year to complete your profile.",
  },
  {
    key: "interests",
    check: (p) => (p.interests?.length ?? 0) > 0,
    suggestion: "Add your interests so SlugSync can improve recommendations.",
  },
  {
    key: "clubs",
    check: (p) => (p.clubs?.length ?? 0) > 0,
    suggestion: "Add your clubs to connect with fellow members.",
  },
  {
    key: "classes",
    check: (p) => (p.classes?.length ?? 0) > 0,
    suggestion: "Add your classes to find classmates nearby.",
  },
];

export function computeCompleteness(profile) {
  const safe = profile || {};
  const missing = FIELDS.filter((field) => !field.check(safe));
  const filledCount = FIELDS.length - missing.length;
  const percent = Math.round((filledCount / FIELDS.length) * 100);

  return {
    percent,
    missingCount: missing.length,
    suggestion:
      missing.length > 0
        ? missing[0].suggestion
        : "Your profile is fully complete — nice work!",
  };
}
