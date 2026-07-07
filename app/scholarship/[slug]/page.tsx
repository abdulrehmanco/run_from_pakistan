import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllScholarships,
  getScholarshipBySlug,
} from "@/lib/scholarships";
import type { Scholarship } from "@/types/scholarship";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import { flagEmoji, formatISODate } from "@/lib/format";
import { StatusIsland } from "@/components/status-island";
import { SiteHeader } from "@/components/site-header";
import { Callout } from "@/components/callout";
import {
  FundingBadge,
  DegreeChips,
  BlockerBadges,
  VerifiedChip,
} from "@/components/scholarship-badges";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return getAllScholarships().map((s) => ({ slug: s.id }));
}

type Params = { params: Promise<{ slug: string }> };

function ieltsPhrase(ielts: Scholarship["blockers"]["ielts"]): string {
  switch (ielts) {
    case "not_required":
      return "No IELTS needed";
    case "moi_accepted":
      return "MOI accepted instead of IELTS";
    case "required":
      return "IELTS required";
    default:
      return "IELTS depends on the program";
  }
}

/** Build a plain-English, <160 char description from real fields only. */
function buildDescription(s: Scholarship): string {
  const funding =
    s.funding_type === "full" ? "Fully funded" : "Partial funding";
  const levels = s.degree_levels.join("/");
  const parts = [
    `${funding} ${levels} scholarship in ${s.country}.`,
    `${ieltsPhrase(s.blockers.ielts)}.`,
  ];
  if (s.dates.typical_cycle) {
    parts.push(`Usually opens in ${s.dates.typical_cycle.opens}.`);
  }
  const desc = parts.join(" ");
  return desc.length > 158 ? `${desc.slice(0, 157).trimEnd()}…` : desc;
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = getScholarshipBySlug(slug);
  if (!s) return { title: "Scholarship not found" };

  const title = `${s.name} — ${s.country} scholarship: documents, deadlines, how to apply`;
  const description = buildDescription(s);
  const url = `${SITE_URL}/scholarship/${s.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "article",
      url,
    },
  };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-b border-border pb-2 font-display text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ScholarshipDetailPage({ params }: Params) {
  const { slug } = await params;
  const s = getScholarshipBySlug(slug);
  if (!s) notFound();

  const fd = s.funding_details;
  const covered = [
    fd.tuition_covered ? "Tuition fees — covered" : "Tuition fees — not covered",
    fd.monthly_stipend
      ? `Living stipend — ${fd.monthly_stipend}`
      : "Living stipend — not mentioned",
    fd.airfare_covered ? "Airfare — covered" : "Airfare — not covered",
    fd.health_insurance
      ? "Health insurance — included"
      : "Health insurance — not included",
    ...fd.other_benefits,
  ];

  const eligibility: { label: string; value: string }[] = [
    {
      label: "Pakistani students",
      value: s.eligibility.open_to_pakistanis
        ? "Open to Pakistani students"
        : "Not open to Pakistani students",
    },
  ];
  if (s.eligibility.age_limit)
    eligibility.push({ label: "Age", value: s.eligibility.age_limit });
  if (s.eligibility.min_academic)
    eligibility.push({ label: "Grades", value: s.eligibility.min_academic });
  if (s.eligibility.work_experience)
    eligibility.push({
      label: "Work experience",
      value: s.eligibility.work_experience,
    });

  const hasDifferentApplyUrl =
    s.apply_url !== null && s.apply_url !== s.official_url;

  const mailSubject = encodeURIComponent(`Outdated info: ${s.name} (${s.id})`);
  const mailBody = encodeURIComponent(
    `Hi,\n\nI think some information on the ${s.name} page may be out of date.\n\nWhat I noticed:\n- \n\nWhere I saw the correct info (link):\n- \n\nThanks!`,
  );
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-10">
        <Link
          href="/"
          className="rounded-sm font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Back to all scholarships
        </Link>

        {/* a) Header */}
        <header className="mt-5 flex flex-col gap-3">
          <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            <span aria-hidden>{flagEmoji(s.country_code)}</span> {s.country} ·{" "}
            {s.provider}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {s.name}
          </h1>
          <div className="flex flex-wrap gap-1.5">
            <FundingBadge fundingType={s.funding_type} />
            <DegreeChips levels={s.degree_levels} />
          </div>
          <StatusIsland scholarship={s} />
          {s.verified && <VerifiedChip isoDate={s.last_verified} />}
        </header>

        <div className="mt-8 flex max-w-prose flex-col gap-8">
          {/* b) Unverified callout */}
          {!s.verified && (
            <Callout tone="note">
              This entry hasn&apos;t been human-verified yet. Always confirm
              details on the official page.
            </Callout>
          )}

          {/* c) Heads up (warnings) */}
          {s.warnings.length > 0 && (
            <Callout tone="warn" title="Heads up">
              <ul className="list-disc pl-5">
                {s.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Callout>
          )}

          {/* d) Blockers at a glance */}
          <Section title="Blockers at a glance">
            <div className="flex flex-wrap gap-1.5">
              <BlockerBadges blockers={s.blockers} />
            </div>
            {s.blockers.ielts_note && (
              <p className="text-sm text-muted-foreground">
                IELTS: {s.blockers.ielts_note}
              </p>
            )}
            {s.blockers.admission_note && (
              <p className="text-sm text-muted-foreground">
                Admission: {s.blockers.admission_note}
              </p>
            )}
            {s.blockers.unusual_documents.length > 0 && (
              <div>
                <p className="text-sm font-medium">
                  Unusual documents to prepare:
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                  {s.blockers.unusual_documents.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          {/* e) What's covered */}
          <Section title="What's covered">
            <ul className="list-disc pl-5 text-sm">
              {covered.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Section>

          {/* f) Documents */}
          {s.documents_required.length > 0 && (
            <Section title="Documents you'll need">
              <ul className="flex flex-col gap-1.5 text-sm">
                {s.documents_required.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span aria-hidden className="text-muted-foreground">
                      ☐
                    </span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* g) How to apply */}
          {s.application_steps.length > 0 && (
            <Section title="How to apply">
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
                {s.application_steps.map((step) => (
                  <li key={step}>{step.replace(/^\s*\d+\.\s*/, "")}</li>
                ))}
              </ol>
            </Section>
          )}

          {/* h) Who can apply */}
          <Section title="Who can apply">
            <ul className="flex flex-col gap-1.5 text-sm">
              {eligibility.map((e) => (
                <li key={e.label}>
                  <span className="font-medium">{e.label}:</span> {e.value}
                </li>
              ))}
              {s.eligibility.other.map((o) => (
                <li key={o} className="text-muted-foreground">
                  {o}
                </li>
              ))}
            </ul>
          </Section>

          {/* i) Dates */}
          <Section title="Dates">
            {s.dates.dates_confirmed ? (
              <ul className="flex flex-col gap-1.5 text-sm">
                {s.dates.application_open && (
                  <li>
                    <span className="font-medium">Opens:</span>{" "}
                    <span className="font-mono tabular-nums">
                      {formatISODate(s.dates.application_open)}
                    </span>
                  </li>
                )}
                {s.dates.application_deadline && (
                  <li>
                    <span className="font-medium">Deadline:</span>{" "}
                    <span className="font-mono tabular-nums">
                      {formatISODate(s.dates.application_deadline)}
                    </span>
                  </li>
                )}
              </ul>
            ) : (
              <div className="text-sm">
                <p className="font-medium">
                  Typical pattern (not confirmed):
                </p>
                {s.dates.cycle_note ? (
                  <p className="mt-1 text-muted-foreground">
                    {s.dates.cycle_note}
                  </p>
                ) : s.dates.typical_cycle ? (
                  <p className="mt-1 text-muted-foreground">
                    Usually opens in {s.dates.typical_cycle.opens} and closes in{" "}
                    {s.dates.typical_cycle.closes}.
                  </p>
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    No dates available. Check the official page.
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* j) Official / apply buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={s.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              Go to official page ↗
            </a>
            {hasDifferentApplyUrl && (
              <a
                href={s.apply_url!}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "w-full border-primary text-primary hover:bg-primary/5 sm:w-auto",
                )}
              >
                Application portal ↗
              </a>
            )}
          </div>

          <Separator />

          {/* k) Last checked + report link */}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>
              Last checked:{" "}
              <span className="font-mono tabular-nums">
                {formatISODate(s.last_verified)}
              </span>
            </p>
            <p>
              Spotted outdated info?{" "}
              <a
                href={mailto}
                className="text-primary underline-offset-4 hover:underline"
              >
                Email us
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
