const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Turn an ISO alpha-2 code into a flag emoji. Falls back to a globe. */
export function flagEmoji(code: string): string {
  const cc = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc) || cc === "XX") return "🌍";
  return String.fromCodePoint(
    ...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

/** Format "yyyy-mm-dd" as "7 Jul 2026". Returns the input unchanged if malformed. */
export function formatISODate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12) return iso;
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

/** One-line summary of a program's most relevant intake, e.g.
 *  "Winter intake · usually Apr–Jul (est.)" or with a confirmed deadline. */
export function formatIntakeLine(ps: {
  term: "winter" | "summer" | null;
  status: { estimated: boolean };
  intake: {
    dates_confirmed: boolean;
    application_deadline: string | null;
    typical_window: { opens: string; closes: string } | null;
  } | null;
}): string {
  if (!ps.intake || !ps.term) {
    return "Check the program page for intake dates.";
  }
  const term = ps.term === "winter" ? "Winter" : "Summer";
  const i = ps.intake;
  if (i.dates_confirmed && i.application_deadline) {
    return `${term} intake · deadline ${formatISODate(i.application_deadline)}`;
  }
  if (i.typical_window) {
    return `${term} intake · usually ${i.typical_window.opens}–${i.typical_window.closes}${
      ps.status.estimated ? " (est.)" : ""
    }`;
  }
  return `${term} intake`;
}
