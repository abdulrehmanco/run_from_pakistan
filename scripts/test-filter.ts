import assert from "node:assert";
import type { Scholarship } from "../types/scholarship";
import {
  filterScholarships,
  parseCriteria,
  serializeCriteria,
  DEFAULT_CRITERIA,
  type FilterCriteria,
} from "../lib/filter";

/** Minimal scholarship fixture; override anything via `patch`. */
function make(patch: Partial<Scholarship>): Scholarship {
  const base: Scholarship = {
    id: "x",
    name: "Test Scholarship",
    provider: "Test Provider",
    country: "Testland",
    country_code: "TS",
    cities: [],
    universities: [],
    degree_levels: ["MS"],
    fields_of_study: ["All fields"],
    funding_type: "full",
    funding_details: {
      tuition_covered: true,
      monthly_stipend: null,
      airfare_covered: false,
      health_insurance: false,
      other_benefits: [],
    },
    dates: {
      application_open: null,
      application_deadline: null,
      dates_confirmed: false,
      typical_cycle: null,
      cycle_note: null,
    },
    blockers: {
      ielts: "required",
      ielts_note: null,
      application_fee: null,
      admission_required_first: false,
      admission_note: null,
      unusual_documents: [],
    },
    documents_required: [],
    application_steps: [],
    eligibility: {
      open_to_pakistanis: true,
      age_limit: null,
      min_academic: null,
      work_experience: null,
      other: [],
    },
    official_url: "https://example.com",
    apply_url: null,
    last_verified: "2026-07-07",
    verified: false,
    warnings: [],
  };
  return { ...base, ...patch };
}

function crit(patch: Partial<FilterCriteria>): FilterCriteria {
  return { ...DEFAULT_CRITERIA, ...patch };
}

const TODAY = new Date(2026, 6, 7); // 7 Jul 2026

let passed = 0;
function check(label: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`PASS — ${label}`);
}

// noIelts includes moi_accepted, excludes required and varies
check("noIelts includes moi_accepted, excludes required and varies", () => {
  const list = [
    make({ id: "not", blockers: { ...make({}).blockers, ielts: "not_required" } }),
    make({ id: "moi", blockers: { ...make({}).blockers, ielts: "moi_accepted" } }),
    make({ id: "req", blockers: { ...make({}).blockers, ielts: "required" } }),
    make({ id: "var", blockers: { ...make({}).blockers, ielts: "varies" } }),
  ];
  const out = filterScholarships(list, crit({ noIelts: true }), TODAY);
  const ids = out.map((s) => s.id).sort();
  assert.deepStrictEqual(ids, ["moi", "not"]);
});

// noFee matches only application_fee === null
check("noFee matches only free-to-apply", () => {
  const list = [
    make({ id: "free", blockers: { ...make({}).blockers, application_fee: null } }),
    make({
      id: "paid",
      blockers: {
        ...make({}).blockers,
        application_fee: { amount: 90, currency: "GBP", note: null },
      },
    }),
  ];
  const out = filterScholarships(list, crit({ noFee: true }), TODAY);
  assert.deepStrictEqual(out.map((s) => s.id), ["free"]);
});

// degree filter ["MS"] matches a scholarship offering ["MS","PhD"]
check("degree MS matches a scholarship offering MS+PhD", () => {
  const list = [
    make({ id: "msphd", degree_levels: ["MS", "PhD"] }),
    make({ id: "bs", degree_levels: ["BS"] }),
  ];
  const out = filterScholarships(list, crit({ degrees: ["MS"] }), TODAY);
  assert.deepStrictEqual(out.map((s) => s.id), ["msphd"]);
});

// status "open" includes an estimated-open scholarship
check("status open includes an estimated-open scholarship", () => {
  const openEst = make({
    id: "openest",
    dates: {
      application_open: null,
      application_deadline: null,
      dates_confirmed: false,
      typical_cycle: { opens: "June", closes: "October" }, // July is inside
      cycle_note: null,
    },
  });
  const closedEst = make({
    id: "closedest",
    dates: {
      application_open: null,
      application_deadline: null,
      dates_confirmed: false,
      typical_cycle: { opens: "January", closes: "February" },
      cycle_note: null,
    },
  });
  const out = filterScholarships([openEst, closedEst], crit({ status: "open" }), TODAY);
  assert.deepStrictEqual(out.map((s) => s.id), ["openest"]);
});

// q "cambridge" matches via universities[] case-insensitively
check("q cambridge matches via universities case-insensitively", () => {
  const list = [
    make({ id: "cam", universities: ["University of Cambridge"] }),
    make({ id: "other", universities: ["Multiple universities"] }),
  ];
  const out = filterScholarships(list, crit({ q: "cambridge" }), TODAY);
  assert.deepStrictEqual(out.map((s) => s.id), ["cam"]);
});

// combined filters AND correctly
check("combined filters AND correctly", () => {
  const good = make({
    id: "good",
    country: "Germany",
    funding_type: "full",
    blockers: { ...make({}).blockers, ielts: "not_required", application_fee: null },
  });
  const wrongCountry = make({ id: "wc", country: "France", funding_type: "full" });
  const partial = make({
    id: "partial",
    country: "Germany",
    funding_type: "partial",
    blockers: { ...make({}).blockers, ielts: "not_required" },
  });
  const list = [good, wrongCountry, partial];
  const out = filterScholarships(
    list,
    crit({ country: "Germany", fundedOnly: true, noIelts: true }),
    TODAY,
  );
  assert.deepStrictEqual(out.map((s) => s.id), ["good"]);
});

// serialize/parse round-trip is stable
check("serialize + parse round-trips criteria", () => {
  const c = crit({
    country: "Japan",
    degrees: ["MS", "PhD"],
    status: "open",
    fundedOnly: true,
    noIelts: true,
    noFee: true,
    noAdmissionFirst: true,
    q: "engineering",
    sort: "name",
  });
  const round = parseCriteria(serializeCriteria(c));
  assert.deepStrictEqual(round, c);
});

// defaults serialize to an empty query string (clean URLs)
check("default criteria serialize to empty query", () => {
  assert.strictEqual(serializeCriteria(DEFAULT_CRITERIA).toString(), "");
});

console.log(`\nAll ${passed} filter tests passed.`);
