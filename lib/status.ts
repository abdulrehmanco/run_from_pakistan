import type { Scholarship } from "@/types/scholarship";

export type StatusState = "open" | "opening_soon" | "closed" | "unknown";

export interface Status {
  state: StatusState;
  estimated: boolean;
  headline: string;
  sub: string | null;
  daysLeft: number | null;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const MS_PER_DAY = 86_400_000;

function parseMonth(name: string): number | null {
  const idx = MONTH_NAMES.indexOf(name.trim().toLowerCase());
  return idx === -1 ? null : idx + 1; // 1-12
}

function monthFull(n: number): string {
  const name = MONTH_NAMES[n - 1];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Parse "yyyy-mm-dd" into a UTC-midnight Date, or null if malformed. */
function parseISODate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

/** Format "yyyy-mm-dd" as "3 Nov 2026". */
function formatDate(iso: string): string {
  const d = parseISODate(iso);
  if (!d) return iso;
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Whole-day difference between two UTC-midnight dates (b - a). */
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/**
 * Compute a scholarship's display status from its dates.
 * Status is NEVER stored — it is derived here at render time.
 */
export function computeStatus(s: Scholarship, today: Date): Status {
  // The calendar day the visitor is on, as a UTC-midnight instant so it can be
  // compared cleanly with ISO dates regardless of timezone.
  const T = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  // a) CONFIRMED dates take priority.
  if (s.dates.dates_confirmed) {
    const openIso = s.dates.application_open;
    const deadlineIso = s.dates.application_deadline;
    const open = openIso ? parseISODate(openIso) : null;
    const deadline = deadlineIso ? parseISODate(deadlineIso) : null;

    if (open && deadline) {
      if (T < open) {
        const untilOpen = daysBetween(T, open);
        if (untilOpen <= 60) {
          return {
            state: "opening_soon",
            estimated: false,
            headline: "Opens soon",
            sub: `Opens ${formatDate(openIso!)}`,
            daysLeft: null,
          };
        }
        return {
          state: "closed",
          estimated: false,
          headline: "Closed",
          sub: `Opens ${formatDate(openIso!)}`,
          daysLeft: null,
        };
      }
      if (T <= deadline) {
        return {
          state: "open",
          estimated: false,
          headline: "Open now",
          sub: `Deadline: ${formatDate(deadlineIso!)}`,
          daysLeft: daysBetween(T, deadline),
        };
      }
      return {
        state: "closed",
        estimated: false,
        headline: "Closed",
        sub: null,
        daysLeft: null,
      };
    }

    if (deadline) {
      if (T <= deadline) {
        return {
          state: "open",
          estimated: false,
          headline: "Open now",
          sub: `Deadline: ${formatDate(deadlineIso!)}`,
          daysLeft: daysBetween(T, deadline),
        };
      }
      return {
        state: "closed",
        estimated: false,
        headline: "Closed",
        sub: null,
        daysLeft: null,
      };
    }
    // dates_confirmed true but no usable dates → fall through to estimate.
  }

  // b) ESTIMATED from the typical cycle.
  const cycle = s.dates.typical_cycle;
  if (cycle) {
    const opensM = parseMonth(cycle.opens);
    const closesM = parseMonth(cycle.closes);
    if (opensM && closesM) {
      const cur = today.getMonth() + 1; // 1-12, visitor's current month
      const inWindow =
        opensM <= closesM
          ? cur >= opensM && cur <= closesM
          : cur >= opensM || cur <= closesM; // wraps the year end

      if (inWindow) {
        return {
          state: "open",
          estimated: true,
          headline: "Open now",
          sub:
            s.dates.cycle_note ??
            "Usually open around this time — confirm on official site",
          daysLeft: null,
        };
      }

      const gap = (opensM - cur + 12) % 12; // months until it usually opens
      const opensName = monthFull(opensM);
      if (gap === 1 || gap === 2) {
        return {
          state: "opening_soon",
          estimated: true,
          headline: "Opens soon",
          sub: `Usually opens in ${opensName}`,
          daysLeft: null,
        };
      }
      return {
        state: "closed",
        estimated: true,
        headline: "Closed",
        sub: `Usually reopens in ${opensName}`,
        daysLeft: null,
      };
    }
  }

  // c) Nothing to go on.
  return {
    state: "unknown",
    estimated: false,
    headline: "Check official site",
    sub: null,
    daysLeft: null,
  };
}
