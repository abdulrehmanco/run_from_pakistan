/**
 * Weekly data refresh — proposes date updates from official pages via Gemini.
 *
 * Deliberately simple and fail-soft: any fetch/AI/parse failure sends the record
 * to a "check manually" list and NEVER crashes the run. Changes are applied only
 * on high-confidence, valid, actually-different ISO dates. The human `verified`
 * flag is never touched. Always exits 0.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { computeStatus, computeProgramStatus } from "../lib/status";
import { ScholarshipSchema, type Scholarship } from "../types/scholarship";
import { ProgramSchema, type Program } from "../types/program";

const DATA = join(process.cwd(), "data");
const SCHOLARSHIPS_FILE = join(DATA, "scholarships.json");
const PROGRAMS_FILE = join(DATA, "programs.json");
const SUMMARY_FILE = join(process.cwd(), "refresh-summary.md");

const TODAY = new Date();
const TODAY_ISO = toISO(TODAY);
const MAX_PER_RUN = 40;
const STALE_DAYS = 45;
const PAGE_CHARS = 8000;
const FETCH_TIMEOUT_MS = 15_000;
const GEMINI_TIMEOUT_MS = 30_000;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

function toISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function isValidISO(v: unknown): v is string {
  if (typeof v !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return false;
  const [y, mo, da] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || da < 1 || da > 31) return false;
  const d = new Date(Date.UTC(y, mo - 1, da));
  return (
    d.getUTCFullYear() === y &&
    d.getUTCMonth() === mo - 1 &&
    d.getUTCDate() === da
  );
}

function daysSince(iso: string): number {
  if (!isValidISO(iso)) return Number.POSITIVE_INFINITY;
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  return Math.floor((TODAY.getTime() - then) / 86_400_000);
}

/** Very small HTML → readable text. No parser dependency. */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": "Mozilla/5.0 (ScholarDash refresh bot)" },
    });
    if (!res.ok) return null;
    return htmlToText(await res.text());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface GeminiResult {
  application_open: string | null;
  application_deadline: string | null;
  dates_confirmed: boolean;
  change_summary: string;
  evidence: string;
  confidence: "high" | "low";
}

async function askGemini(prompt: string): Promise<GeminiResult | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), GEMINI_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text) as GeminiResult;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function buildPrompt(
  label: string,
  current: { open: string | null; deadline: string | null; confirmed: boolean },
  pageText: string,
): string {
  return [
    "You verify application dates for a scholarship or university program from its official web page.",
    "Return ONLY a JSON object, no prose, no markdown. Fields:",
    "- application_open: string|null (ISO yyyy-mm-dd, only if the page clearly states an exact opening date for the current or upcoming cycle)",
    "- application_deadline: string|null (ISO yyyy-mm-dd, same rule)",
    '- dates_confirmed: boolean (true only if the page clearly states exact calendar dates)',
    '- change_summary: string (one short sentence; say "no change" if nothing new)',
    "- evidence: string (a short phrase copied from the page, under 12 words)",
    '- confidence: "high" | "low" (use "high" only if you are sure the dates are exact and current)',
    "",
    "Rules: Never guess. If exact dates are not clearly stated, use null, dates_confirmed=false, confidence=\"low\". Prefer \"low\" when unsure.",
    "",
    `Record: ${label}`,
    `Current stored dates: open=${current.open ?? "null"}, deadline=${current.deadline ?? "null"}, confirmed=${current.confirmed}`,
    "",
    "Page text:",
    pageText,
  ].join("\n");
}

// --- Candidate model -------------------------------------------------------

interface Candidate {
  key: string; // stable id for logging
  kind: "scholarship" | "program";
  label: string;
  link: string;
  urls: string[];
  lastVerified: string;
  reason: string;
  getDates: () => { open: string | null; deadline: string | null; confirmed: boolean };
  apply: (open: string | null, deadline: string | null) => void;
  touchVerified: () => void;
  revalidate: () => boolean;
  snapshot: string;
  restore: () => void;
}

function main(): void {
  const scholarships = JSON.parse(
    readFileSync(SCHOLARSHIPS_FILE, "utf8"),
  ) as Scholarship[];
  const programs = JSON.parse(readFileSync(PROGRAMS_FILE, "utf8")) as Program[];

  const candidates: Candidate[] = [];

  for (const s of scholarships) {
    const status = computeStatus(s, TODAY);
    const stale = daysSince(s.last_verified) > STALE_DAYS;
    if (!(status.state === "open" || status.state === "opening_soon" || stale)) {
      continue;
    }
    const snapshot = JSON.stringify(s);
    candidates.push({
      key: s.id,
      kind: "scholarship",
      label: `${s.name} (${s.country})`,
      link: s.official_url,
      urls: [s.official_url, s.apply_url].filter(
        (u): u is string => typeof u === "string" && u.length > 0,
      ),
      lastVerified: s.last_verified,
      reason: stale ? "stale (>45 days)" : `status ${status.state}`,
      getDates: () => ({
        open: s.dates.application_open,
        deadline: s.dates.application_deadline,
        confirmed: s.dates.dates_confirmed,
      }),
      apply: (open, deadline) => {
        s.dates.application_open = open;
        s.dates.application_deadline = deadline;
        s.dates.dates_confirmed = true;
      },
      touchVerified: () => {
        s.last_verified = TODAY_ISO;
      },
      revalidate: () => ScholarshipSchema.safeParse(s).success,
      snapshot,
      restore: () => Object.assign(s, JSON.parse(snapshot)),
    });
  }

  for (const p of programs) {
    const ps = computeProgramStatus(p, TODAY);
    const stale = daysSince(p.last_verified) > STALE_DAYS;
    const relevant =
      ps.status.state === "open" || ps.status.state === "opening_soon";
    if (!(relevant || stale)) continue;
    // Target the most-relevant intake (fallback to the first).
    const intake = ps.intake ?? p.intakes[0];
    if (!intake) continue;
    const snapshot = JSON.stringify(p);
    candidates.push({
      key: p.id,
      kind: "program",
      label: `${p.program_name} — ${p.university} (${p.country})`,
      link: p.program_url,
      urls: [p.program_url, p.application.apply_url].filter(
        (u): u is string => typeof u === "string" && u.length > 0,
      ),
      lastVerified: p.last_verified,
      reason: stale ? "stale (>45 days)" : `status ${ps.status.state}`,
      getDates: () => ({
        open: intake.application_open,
        deadline: intake.application_deadline,
        confirmed: intake.dates_confirmed,
      }),
      apply: (open, deadline) => {
        intake.application_open = open;
        intake.application_deadline = deadline;
        intake.dates_confirmed = true;
      },
      touchVerified: () => {
        p.last_verified = TODAY_ISO;
      },
      revalidate: () => ProgramSchema.safeParse(p).success,
      snapshot,
      restore: () => Object.assign(p, JSON.parse(snapshot)),
    });
  }

  // Oldest last_verified first, capped.
  candidates.sort((a, b) => a.lastVerified.localeCompare(b.lastVerified));
  const selected = candidates.slice(0, MAX_PER_RUN);
  const skippedForCap = candidates.length - selected.length;

  void run(selected, skippedForCap, scholarships, programs);
}

async function run(
  selected: Candidate[],
  skippedForCap: number,
  scholarships: Scholarship[],
  programs: Program[],
): Promise<void> {
  const changes: string[] = [];
  const reverted: string[] = [];
  const checkManually: string[] = [];
  let unchanged = 0;
  let dataChanged = false;

  const keyMissing = !process.env.GEMINI_API_KEY;

  for (const c of selected) {
    if (keyMissing) {
      checkManually.push(`- ${c.label} — no GEMINI_API_KEY, not checked ([link](${c.link}))`);
      continue;
    }

    // 1) Fetch page(s), fail-soft.
    const texts: string[] = [];
    for (const u of c.urls) {
      const t = await fetchText(u);
      if (t) texts.push(t);
    }
    if (texts.length === 0) {
      checkManually.push(`- ${c.label} — could not fetch page ([link](${c.link}))`);
      continue;
    }
    const pageText = texts.join("\n\n").slice(0, PAGE_CHARS);

    // 2) Ask Gemini, fail-soft.
    const current = c.getDates();
    const result = await askGemini(buildPrompt(c.label, current, pageText));
    if (!result) {
      checkManually.push(`- ${c.label} — AI check failed or returned nothing ([link](${c.link}))`);
      continue;
    }

    // 3) Decide. Apply only on high confidence + valid ISO + a real difference.
    const newOpen = isValidISO(result.application_open)
      ? result.application_open
      : null;
    const newDeadline = isValidISO(result.application_deadline)
      ? result.application_deadline
      : null;
    const hasConcrete = newOpen !== null || newDeadline !== null;
    const differs =
      newOpen !== current.open ||
      newDeadline !== current.deadline ||
      current.confirmed !== true;

    if (result.confidence !== "high" || !hasConcrete || !differs) {
      if (result.confidence === "high" && !differs) {
        unchanged += 1;
      } else {
        const why = result.change_summary || "low confidence / unclear";
        checkManually.push(`- ${c.label} — ${why} ([link](${c.link}))`);
      }
      continue;
    }

    // 4) Apply + re-validate this record; revert if it breaks the schema.
    c.apply(newOpen, newDeadline);
    c.touchVerified();
    if (!c.revalidate()) {
      c.restore();
      reverted.push(`- ${c.label} — update reverted: it failed data validation ([link](${c.link}))`);
      continue;
    }

    dataChanged = true;
    const evidence = (result.evidence || "").slice(0, 80);
    changes.push(
      `- **${c.label}**\n` +
        `  - open: \`${current.open ?? "null"}\` → \`${newOpen ?? "null"}\`\n` +
        `  - deadline: \`${current.deadline ?? "null"}\` → \`${newDeadline ?? "null"}\`\n` +
        `  - evidence: "${evidence}"\n` +
        `  - [official link](${c.link})`,
    );
  }

  // 5) Persist only if something was applied.
  if (dataChanged) {
    writeFileSync(SCHOLARSHIPS_FILE, JSON.stringify(scholarships, null, 2) + "\n");
    writeFileSync(PROGRAMS_FILE, JSON.stringify(programs, null, 2) + "\n");
  }

  // 6) Summary (also written to a file for the PR body).
  const lines: string[] = [];
  lines.push(`## Weekly data refresh — ${TODAY_ISO}`);
  lines.push("");
  lines.push(
    `Checked **${selected.length}** record(s)` +
      (skippedForCap > 0 ? ` (\`${skippedForCap}\` more queued for a later run)` : "") +
      (keyMissing ? " — ⚠️ no `GEMINI_API_KEY`, no automated checks ran" : "") +
      ".",
  );
  lines.push("");
  lines.push(`### Changed (${changes.length})`);
  lines.push(changes.length ? changes.join("\n") : "_None._");
  if (reverted.length) {
    lines.push("");
    lines.push(`### Reverted — failed validation (${reverted.length})`);
    lines.push(reverted.join("\n"));
  }
  lines.push("");
  lines.push(`### Unchanged: ${unchanged}`);
  lines.push("");
  lines.push(`### Check manually (${checkManually.length})`);
  lines.push(checkManually.length ? checkManually.join("\n") : "_None._");
  lines.push("");
  lines.push(
    "> Proposals only — open each official link and confirm before merging.",
  );

  const summary = lines.join("\n") + "\n";
  writeFileSync(SUMMARY_FILE, summary);
  console.log(summary);

  process.exit(0);
}

main();
