import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPrograms, getProgramBySlug } from "@/lib/programs";
import type { Program } from "@/types/program";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import { flagEmoji, formatISODate } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { Callout } from "@/components/callout";
import {
  ProgramStatusIsland,
  ProgramIntakeList,
} from "@/components/program-status";
import { tuitionChip } from "@/components/program-badges";
import { Chip, VerifiedChip } from "@/components/scholarship-badges";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return getAllPrograms().map((p) => ({
    country_slug: p.country_slug,
    slug: p.id,
  }));
}

type Params = { params: Promise<{ country_slug: string; slug: string }> };

function ieltsPhrase(ielts: Program["requirements"]["ielts"]): string {
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

function tuitionPhrase(costs: Program["costs"]): string {
  if (costs.tuition_per_semester_eur === 0) return "No tuition, semester fee only";
  if (costs.tuition_per_semester_eur === null) return "Tuition may apply";
  return `€${costs.tuition_per_semester_eur.toLocaleString("en-US")} per semester`;
}

function buildDescription(p: Program): string {
  const parts = [
    `${p.degree} at ${p.university}, ${p.city}.`,
    `${tuitionPhrase(p.costs)}.`,
    `${ieltsPhrase(p.requirements.ielts)}.`,
  ];
  const desc = parts.join(" ");
  return desc.length > 158 ? `${desc.slice(0, 157).trimEnd()}…` : desc;
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getProgramBySlug(slug);
  if (!p) return { title: "Program not found" };

  const title = `${p.program_name} — ${p.university}: tuition, intakes, how to apply`;
  const description = buildDescription(p);
  const url = `${SITE_URL}/admissions/${p.country_slug}/${p.id}`;

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

const PLATFORM_LABELS: Record<Program["application"]["platform"], string> = {
  "uni-assist": "Apply through uni-assist",
  direct: "Apply directly to the university",
  "uni-assist+portal": "Apply on the university portal + uni-assist VPD",
};

export default async function ProgramDetailPage({ params }: Params) {
  const { country_slug, slug } = await params;
  const p = getProgramBySlug(slug);
  if (!p || p.country_slug !== country_slug) notFound();

  const typeLabel =
    p.university_type === "public_applied_sciences"
      ? "Applied Sciences (public)"
      : "Public university";

  const hasApplyUrl = p.application.apply_url !== null;

  const mailSubject = encodeURIComponent(
    `Outdated info: ${p.program_name} (${p.id})`,
  );
  const mailBody = encodeURIComponent(
    `Hi,\n\nI think some information on the ${p.program_name} (${p.university}) page may be out of date.\n\nWhat I noticed:\n- \n\nWhere I saw the correct info (link):\n- \n\nThanks!`,
  );
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

  const tuition = tuitionChip(p.costs);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-10">
        <Link
          href={`/admissions/${p.country_slug}`}
          className="rounded-sm font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Back to {p.country} programs
        </Link>

        {/* Header */}
        <header className="mt-5 flex flex-col gap-3">
          <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            <span aria-hidden>{flagEmoji(p.country_code)}</span> {p.state} ·{" "}
            {p.university}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {p.program_name}
          </h1>
          <p className="text-muted-foreground">
            {p.degree} · {p.city} · {typeLabel}
          </p>
          <ProgramStatusIsland program={p} />
          {p.verified && <VerifiedChip isoDate={p.last_verified} />}
        </header>

        <div className="mt-8 flex max-w-prose flex-col gap-8">
          {!p.verified && (
            <Callout tone="note">
              This entry hasn&apos;t been human-verified yet. Always confirm
              details on the official page.
            </Callout>
          )}

          {p.warnings.length > 0 && (
            <Callout tone="warn" title="Heads up">
              <ul className="list-disc pl-5">
                {p.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </Callout>
          )}

          {/* Blockers at a glance */}
          <Section title="Blockers at a glance">
            <div className="flex flex-wrap gap-1.5">
              <Chip
                tone={p.requirements.ielts === "required" ? "friction" : "good"}
              >
                {ieltsPhrase(p.requirements.ielts)}
              </Chip>
              <Chip
                tone={p.requirements.gre === "required" ? "friction" : "good"}
              >
                {p.requirements.gre === "required"
                  ? "GRE required"
                  : p.requirements.gre === "recommended"
                    ? "GRE recommended"
                    : "No GRE"}
              </Chip>
              {p.requirements.aps_required && (
                <Chip tone="friction">APS certificate needed</Chip>
              )}
            </div>
            {p.requirements.ielts_note && (
              <p className="text-sm text-muted-foreground">
                IELTS: {p.requirements.ielts_note}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {PLATFORM_LABELS[p.application.platform]}.
              {p.application.vpd_required === true
                ? " A uni-assist VPD (preliminary review) is required."
                : ""}
            </p>
            {p.application.fee_note && (
              <p className="text-sm text-muted-foreground">
                {p.application.fee_note}
              </p>
            )}
          </Section>

          {/* What it costs */}
          <Section title="What it costs">
            <div className="flex flex-wrap gap-1.5">
              <Chip tone={tuition.tone}>{tuition.label}</Chip>
            </div>
            {p.costs.note && (
              <p className="text-sm text-muted-foreground">{p.costs.note}</p>
            )}
          </Section>

          {/* Intakes & deadlines */}
          <Section title="Intakes & deadlines">
            <ProgramIntakeList program={p} />
          </Section>

          {/* Who fits */}
          <Section title="Who fits">
            <ul className="flex flex-col gap-1.5 text-sm">
              {p.requirements.background_note && (
                <li>{p.requirements.background_note}</li>
              )}
              <li>
                <span className="font-medium">German:</span>{" "}
                {p.requirements.german_required ??
                  "Not required for admission (English-taught)."}
              </li>
              <li>
                <span className="font-medium">Language of study:</span>{" "}
                {p.language === "English" ? "English" : "English and German"}
              </li>
            </ul>
          </Section>

          {/* How to apply */}
          {p.application_steps.length > 0 && (
            <Section title="How to apply">
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
                {p.application_steps.map((step) => (
                  <li key={step}>{step.replace(/^\s*\d+\.\s*/, "")}</li>
                ))}
              </ol>
            </Section>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={p.program_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full sm:w-auto",
              )}
            >
              Program page ↗
            </a>
            {hasApplyUrl && (
              <a
                href={p.application.apply_url!}
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

          {/* Last checked + report */}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>
              Last checked:{" "}
              <span className="font-mono tabular-nums">
                {formatISODate(p.last_verified)}
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
