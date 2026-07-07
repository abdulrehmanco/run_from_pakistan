import assert from "node:assert";
import { computeStatus, computeProgramStatus } from "../lib/status";
import type { Scholarship } from "../types/scholarship";
import type { Program } from "../types/program";

type Dates = Scholarship["dates"];

/** Build a full Scholarship with only the `dates` block varied. */
function make(dates: Dates): Scholarship {
  return {
    id: "test",
    name: "Test Scholarship",
    provider: "Test Provider",
    country: "Testland",
    country_code: "TS",
    cities: [],
    universities: ["Multiple universities"],
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
    dates,
    blockers: {
      ielts: "not_required",
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
}

function confirmed(
  application_open: string | null,
  application_deadline: string | null,
): Dates {
  return {
    application_open,
    application_deadline,
    dates_confirmed: true,
    typical_cycle: null,
    cycle_note: null,
  };
}

function estimated(opens: string, closes: string): Dates {
  return {
    application_open: null,
    application_deadline: null,
    dates_confirmed: false,
    typical_cycle: { opens, closes },
    cycle_note: null,
  };
}

let passed = 0;
function check(label: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`PASS — ${label}`);
}

// 1) confirmed open with daysLeft correct
check("confirmed open, daysLeft correct", () => {
  const s = make(confirmed("2026-10-01", "2026-11-30"));
  const st = computeStatus(s, new Date(2026, 10, 1)); // 1 Nov 2026
  assert.strictEqual(st.state, "open");
  assert.strictEqual(st.estimated, false);
  assert.strictEqual(st.daysLeft, 29);
});

// 2) confirmed deadline passed → closed
check("confirmed deadline passed → closed", () => {
  const s = make(confirmed(null, "2026-01-31"));
  const st = computeStatus(s, new Date(2026, 5, 1)); // 1 Jun 2026
  assert.strictEqual(st.state, "closed");
  assert.strictEqual(st.estimated, false);
  assert.strictEqual(st.daysLeft, null);
});

// 3) confirmed opens in 30 days → opening_soon
check("confirmed opens in 30 days → opening_soon", () => {
  const s = make(confirmed("2026-07-31", "2026-09-30"));
  const st = computeStatus(s, new Date(2026, 6, 1)); // 1 Jul 2026
  assert.strictEqual(st.state, "opening_soon");
  assert.strictEqual(st.estimated, false);
});

// 4) estimated normal window Aug–Nov, today Sep → open + estimated
check("estimated normal window, inside → open", () => {
  const s = make(estimated("August", "November"));
  const st = computeStatus(s, new Date(2026, 8, 15)); // 15 Sep 2026
  assert.strictEqual(st.state, "open");
  assert.strictEqual(st.estimated, true);
});

// 5) estimated wrap-around Nov–Mar, today January → open
check("estimated wrap window, January → open", () => {
  const s = make(estimated("November", "March"));
  const st = computeStatus(s, new Date(2026, 0, 15)); // 15 Jan 2026
  assert.strictEqual(st.state, "open");
  assert.strictEqual(st.estimated, true);
});

// 6) estimated wrap-around Nov–Mar, today July → closed, sub mentions November
check("estimated wrap window, July → closed (mentions November)", () => {
  const s = make(estimated("November", "March"));
  const st = computeStatus(s, new Date(2026, 6, 15)); // 15 Jul 2026
  assert.strictEqual(st.state, "closed");
  assert.strictEqual(st.estimated, true);
  assert.ok(st.sub && st.sub.includes("November"), "sub should mention November");
});

// 7) estimated, today 1 month before opens → opening_soon
check("estimated 1 month before opens → opening_soon", () => {
  const s = make(estimated("August", "November"));
  const st = computeStatus(s, new Date(2026, 6, 15)); // 15 Jul 2026
  assert.strictEqual(st.state, "opening_soon");
  assert.strictEqual(st.estimated, true);
  assert.ok(st.sub && st.sub.includes("August"), "sub should mention August");
});

// 8) no dates, no cycle → unknown
check("no dates, no cycle → unknown", () => {
  const s = make({
    application_open: null,
    application_deadline: null,
    dates_confirmed: false,
    typical_cycle: null,
    cycle_note: null,
  });
  const st = computeStatus(s, new Date(2026, 6, 15));
  assert.strictEqual(st.state, "unknown");
});

// --- Program intake status ---

type Intake = Program["intakes"][number];

function makeProgram(intakes: Intake[]): Program {
  return {
    id: "test-prog",
    university: "Test University",
    university_type: "public_university",
    program_name: "M.Sc. Testing",
    degree: "MSc",
    city: "Testburg",
    state: "Test State",
    country: "Germany",
    country_code: "DE",
    country_slug: "germany",
    field_tags: ["CS"],
    language: "English",
    costs: { tuition_per_semester_eur: 0, semester_fee_eur: null, note: null },
    intakes,
    application: {
      platform: "uni-assist",
      vpd_required: false,
      fee_note: null,
      apply_url: null,
    },
    requirements: {
      ielts: "required",
      ielts_note: null,
      gre: "not_required",
      german_required: null,
      aps_required: true,
      background_note: null,
    },
    application_steps: [],
    warnings: [],
    program_url: "https://example.com",
    last_verified: "2026-07-07",
    verified: false,
  };
}

function intake(opens: string, closes: string, term: Intake["term"]): Intake {
  return {
    term,
    application_open: null,
    application_deadline: null,
    dates_confirmed: false,
    typical_window: { opens, closes },
    note: null,
  };
}

// 9) program: open winter intake (today inside the window) → open, term winter
check("program open winter intake → open (winter)", () => {
  const p = makeProgram([intake("April", "July", "winter")]);
  const ps = computeProgramStatus(p, new Date(2026, 5, 15)); // 15 Jun 2026
  assert.strictEqual(ps.status.state, "open");
  assert.strictEqual(ps.term, "winter");
});

// 10) program: wrap-around window Nov–Mar, today January → open
check("program wrap-around window, January → open", () => {
  const p = makeProgram([intake("November", "March", "winter")]);
  const ps = computeProgramStatus(p, new Date(2026, 0, 15)); // 15 Jan 2026
  assert.strictEqual(ps.status.state, "open");
});

// 11) program: both intakes closed → closed
check("program both intakes closed → closed", () => {
  const p = makeProgram([
    intake("January", "February", "summer"),
    intake("March", "April", "winter"),
  ]);
  const ps = computeProgramStatus(p, new Date(2026, 8, 15)); // 15 Sep 2026
  assert.strictEqual(ps.status.state, "closed");
});

// 12) program: one closed + one opening-soon → opening_soon wins
check("program picks opening_soon over closed", () => {
  const p = makeProgram([
    intake("January", "February", "summer"), // closed in July
    intake("August", "November", "winter"), // opening soon in July
  ]);
  const ps = computeProgramStatus(p, new Date(2026, 6, 15)); // 15 Jul 2026
  assert.strictEqual(ps.status.state, "opening_soon");
  assert.strictEqual(ps.term, "winter");
});

console.log(`\nAll ${passed} status tests passed.`);
