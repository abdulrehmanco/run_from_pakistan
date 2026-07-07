import type { Program } from "@/types/program";
import { computeProgramStatus, type Status } from "@/lib/status";

export type FieldTag = Program["field_tags"][number];
export type ProgramStatusFilter = "open" | "opening_soon" | "closed";
export type ProgramSortKey = "recommended" | "university";
export type UniversityType = Program["university_type"];

export interface ProgramCriteria {
  university: string | null;
  fields: FieldTag[];
  status: ProgramStatusFilter | null;
  universityType: UniversityType | null;
  noIelts: boolean;
  greNotRequired: boolean;
  noTuition: boolean;
  q: string;
  sort: ProgramSortKey;
}

export const FIELD_TAGS: FieldTag[] = [
  "CS",
  "AI",
  "Data Science",
  "SE",
  "Cybersecurity",
  "Robotics",
  "Embedded",
  "HCI",
  "Networks",
  "IT Management",
];

const STATUS_VALUES: ProgramStatusFilter[] = ["open", "opening_soon", "closed"];
const SORT_VALUES: ProgramSortKey[] = ["recommended", "university"];
const TYPE_VALUES: UniversityType[] = [
  "public_university",
  "public_applied_sciences",
];

export const DEFAULT_PROGRAM_CRITERIA: ProgramCriteria = {
  university: null,
  fields: [],
  status: null,
  universityType: null,
  noIelts: false,
  greNotRequired: false,
  noTuition: false,
  q: "",
  sort: "recommended",
};

export function isProgramFilterActive(c: ProgramCriteria): boolean {
  return (
    c.university !== null ||
    c.fields.length > 0 ||
    c.status !== null ||
    c.universityType !== null ||
    c.noIelts ||
    c.greNotRequired ||
    c.noTuition ||
    c.q.trim() !== ""
  );
}

export function activeProgramFilterCount(c: ProgramCriteria): number {
  let n = 0;
  if (c.university !== null) n += 1;
  if (c.fields.length > 0) n += 1;
  if (c.status !== null) n += 1;
  if (c.universityType !== null) n += 1;
  if (c.noIelts) n += 1;
  if (c.greNotRequired) n += 1;
  if (c.noTuition) n += 1;
  if (c.q.trim() !== "") n += 1;
  return n;
}

type ParamSource = { get: (key: string) => string | null };

export function parseProgramCriteria(params: ParamSource): ProgramCriteria {
  const university = params.get("uni");
  const fields = (params.get("fields") ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter((f): f is FieldTag => (FIELD_TAGS as string[]).includes(f));
  const statusRaw = params.get("status");
  const status =
    statusRaw && (STATUS_VALUES as string[]).includes(statusRaw)
      ? (statusRaw as ProgramStatusFilter)
      : null;
  const typeRaw = params.get("type");
  const universityType =
    typeRaw && (TYPE_VALUES as string[]).includes(typeRaw)
      ? (typeRaw as UniversityType)
      : null;
  const sortRaw = params.get("sort");
  const sort =
    sortRaw && (SORT_VALUES as string[]).includes(sortRaw)
      ? (sortRaw as ProgramSortKey)
      : "recommended";

  return {
    university: university && university.trim() !== "" ? university : null,
    fields,
    status,
    universityType,
    noIelts: params.get("noielts") === "1",
    greNotRequired: params.get("nogre") === "1",
    noTuition: params.get("notuition") === "1",
    q: params.get("q") ?? "",
    sort,
  };
}

export function serializeProgramCriteria(c: ProgramCriteria): URLSearchParams {
  const p = new URLSearchParams();
  if (c.university !== null) p.set("uni", c.university);
  if (c.fields.length > 0) p.set("fields", c.fields.join(","));
  if (c.status !== null) p.set("status", c.status);
  if (c.universityType !== null) p.set("type", c.universityType);
  if (c.noIelts) p.set("noielts", "1");
  if (c.greNotRequired) p.set("nogre", "1");
  if (c.noTuition) p.set("notuition", "1");
  if (c.q.trim() !== "") p.set("q", c.q.trim());
  if (c.sort !== "recommended") p.set("sort", c.sort);
  return p;
}

function matchesQuery(p: Program, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (needle === "") return true;
  const haystack = [p.program_name, p.university, p.city]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function filterPrograms(
  list: Program[],
  c: ProgramCriteria,
  today: Date,
): Program[] {
  return list.filter((p) => {
    if (c.university !== null && p.university !== c.university) return false;

    if (c.fields.length > 0 && !c.fields.some((f) => p.field_tags.includes(f))) {
      return false;
    }

    if (c.universityType !== null && p.university_type !== c.universityType) {
      return false;
    }

    if (c.status !== null) {
      if (computeProgramStatus(p, today).status.state !== c.status) return false;
    }

    if (
      c.noIelts &&
      !(
        p.requirements.ielts === "not_required" ||
        p.requirements.ielts === "moi_accepted"
      )
    ) {
      return false;
    }

    if (c.greNotRequired && p.requirements.gre !== "not_required") return false;

    if (c.noTuition && p.costs.tuition_per_semester_eur !== 0) return false;

    if (!matchesQuery(p, c.q)) return false;

    return true;
  });
}

/** Same "recommended" rank as scholarships: open → opening_soon → unknown → closed. */
function rank(status: Status): number {
  if (status.state === "open") return status.estimated ? 1 : 0;
  if (status.state === "opening_soon") return 2;
  if (status.state === "unknown") return 3;
  return 4; // closed
}

export function sortPrograms(
  list: Program[],
  sort: ProgramSortKey,
  today: Date,
): Program[] {
  if (sort === "university") {
    return [...list].sort(
      (a, b) =>
        a.university.localeCompare(b.university) ||
        a.program_name.localeCompare(b.program_name),
    );
  }
  // recommended
  return list
    .map((p) => ({ p, status: computeProgramStatus(p, today).status }))
    .sort((a, b) => {
      const ra = rank(a.status);
      const rb = rank(b.status);
      if (ra !== rb) return ra - rb;
      if (ra === 0) {
        const da = a.status.daysLeft ?? Number.POSITIVE_INFINITY;
        const db = b.status.daysLeft ?? Number.POSITIVE_INFINITY;
        if (da !== db) return da - db;
      }
      return (
        a.p.university.localeCompare(b.p.university) ||
        a.p.program_name.localeCompare(b.p.program_name)
      );
    })
    .map((x) => x.p);
}
