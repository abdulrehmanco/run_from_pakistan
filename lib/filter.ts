import type { Scholarship } from "@/types/scholarship";
import { computeStatus, type Status } from "@/lib/status";

export type DegreeLevel = Scholarship["degree_levels"][number]; // "BS" | "MS" | "PhD"
export type StatusFilter = "open" | "opening_soon" | "closed";
export type SortKey = "recommended" | "name" | "country";

export interface FilterCriteria {
  country: string | null;
  degrees: DegreeLevel[];
  status: StatusFilter | null;
  fundedOnly: boolean;
  noIelts: boolean;
  noFee: boolean;
  noAdmissionFirst: boolean;
  q: string;
  sort: SortKey;
}

export const DEGREE_LEVELS: DegreeLevel[] = ["BS", "MS", "PhD"];
const STATUS_VALUES: StatusFilter[] = ["open", "opening_soon", "closed"];
const SORT_VALUES: SortKey[] = ["recommended", "name", "country"];

export const DEFAULT_CRITERIA: FilterCriteria = {
  country: null,
  degrees: [],
  status: null,
  fundedOnly: false,
  noIelts: false,
  noFee: false,
  noAdmissionFirst: false,
  q: "",
  sort: "recommended",
};

/** True when the criteria differ from the defaults (i.e. any filter is active). */
export function isFilterActive(c: FilterCriteria): boolean {
  return (
    c.country !== null ||
    c.degrees.length > 0 ||
    c.status !== null ||
    c.fundedOnly ||
    c.noIelts ||
    c.noFee ||
    c.noAdmissionFirst ||
    c.q.trim() !== ""
  );
}

/** Count of active filters, used for the mobile "Filters (n active)" button. */
export function activeFilterCount(c: FilterCriteria): number {
  let n = 0;
  if (c.country !== null) n += 1;
  if (c.degrees.length > 0) n += 1;
  if (c.status !== null) n += 1;
  if (c.fundedOnly) n += 1;
  if (c.noIelts) n += 1;
  if (c.noFee) n += 1;
  if (c.noAdmissionFirst) n += 1;
  if (c.q.trim() !== "") n += 1;
  return n;
}

type ParamSource = { get: (key: string) => string | null };

export function parseCriteria(params: ParamSource): FilterCriteria {
  const country = params.get("country");
  const degrees = (params.get("degrees") ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter((d): d is DegreeLevel =>
      (DEGREE_LEVELS as string[]).includes(d),
    );
  const statusRaw = params.get("status");
  const status =
    statusRaw && (STATUS_VALUES as string[]).includes(statusRaw)
      ? (statusRaw as StatusFilter)
      : null;
  const sortRaw = params.get("sort");
  const sort =
    sortRaw && (SORT_VALUES as string[]).includes(sortRaw)
      ? (sortRaw as SortKey)
      : "recommended";

  return {
    country: country && country.trim() !== "" ? country : null,
    degrees,
    status,
    fundedOnly: params.get("funded") === "1",
    noIelts: params.get("noielts") === "1",
    noFee: params.get("nofee") === "1",
    noAdmissionFirst: params.get("noadmission") === "1",
    q: params.get("q") ?? "",
    sort,
  };
}

/** Serialize criteria to URLSearchParams, omitting anything at its default. */
export function serializeCriteria(c: FilterCriteria): URLSearchParams {
  const p = new URLSearchParams();
  if (c.country !== null) p.set("country", c.country);
  if (c.degrees.length > 0) p.set("degrees", c.degrees.join(","));
  if (c.status !== null) p.set("status", c.status);
  if (c.fundedOnly) p.set("funded", "1");
  if (c.noIelts) p.set("noielts", "1");
  if (c.noFee) p.set("nofee", "1");
  if (c.noAdmissionFirst) p.set("noadmission", "1");
  if (c.q.trim() !== "") p.set("q", c.q.trim());
  if (c.sort !== "recommended") p.set("sort", c.sort);
  return p;
}

function matchesQuery(s: Scholarship, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (needle === "") return true;
  const haystack = [
    s.name,
    s.provider,
    s.country,
    ...s.universities,
    ...s.fields_of_study,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function filterScholarships(
  list: Scholarship[],
  c: FilterCriteria,
  today: Date,
): Scholarship[] {
  return list.filter((s) => {
    if (c.country !== null && s.country !== c.country) return false;

    if (
      c.degrees.length > 0 &&
      !c.degrees.some((d) => s.degree_levels.includes(d))
    ) {
      return false;
    }

    if (c.status !== null) {
      if (computeStatus(s, today).state !== c.status) return false;
    }

    if (c.fundedOnly && s.funding_type !== "full") return false;

    if (
      c.noIelts &&
      !(
        s.blockers.ielts === "not_required" ||
        s.blockers.ielts === "moi_accepted"
      )
    ) {
      return false;
    }

    if (c.noFee && s.blockers.application_fee !== null) return false;

    if (c.noAdmissionFirst && s.blockers.admission_required_first) return false;

    if (!matchesQuery(s, c.q)) return false;

    return true;
  });
}

/**
 * "Recommended" ordering rank (lower shows first) — the single source of truth,
 * reused by the dashboard grid:
 * 0 open+confirmed → 1 open+estimated → 2 opening_soon → 3 unknown → 4 closed.
 */
function rank(status: Status): number {
  if (status.state === "open") return status.estimated ? 1 : 0;
  if (status.state === "opening_soon") return 2;
  if (status.state === "unknown") return 3;
  return 4; // closed
}

function recommendedCompare(
  a: { s: Scholarship; status: Status },
  b: { s: Scholarship; status: Status },
): number {
  const ra = rank(a.status);
  const rb = rank(b.status);
  if (ra !== rb) return ra - rb;

  // open+confirmed: soonest deadline first
  if (ra === 0) {
    const da = a.status.daysLeft ?? Number.POSITIVE_INFINITY;
    const db = b.status.daysLeft ?? Number.POSITIVE_INFINITY;
    if (da !== db) return da - db;
  }

  // opening_soon: confirmed before estimated
  if (ra === 2) {
    const ea = a.status.estimated ? 1 : 0;
    const eb = b.status.estimated ? 1 : 0;
    if (ea !== eb) return ea - eb;
  }

  // everything else (and ties): alphabetical
  return a.s.name.localeCompare(b.s.name);
}

export function sortScholarships(
  list: Scholarship[],
  sort: SortKey,
  today: Date,
): Scholarship[] {
  if (sort === "name") {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === "country") {
    return [...list].sort(
      (a, b) =>
        a.country.localeCompare(b.country) || a.name.localeCompare(b.name),
    );
  }
  // recommended
  return list
    .map((s) => ({ s, status: computeStatus(s, today) }))
    .sort(recommendedCompare)
    .map((x) => x.s);
}
