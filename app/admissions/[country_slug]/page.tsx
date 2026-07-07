import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { Callout } from "@/components/callout";
import { ProgramBrowser } from "@/components/program-browser";
import {
  getActiveAdmissionCountries,
  getAllAdmissionCountries,
  getProgramsByCountrySlug,
  getUniversities,
} from "@/lib/programs";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getActiveAdmissionCountries().map((c) => ({
    country_slug: c.country_slug,
  }));
}

type Params = { params: Promise<{ country_slug: string }> };

function activeCountry(slug: string) {
  return getAllAdmissionCountries().find(
    (c) => c.country_slug === slug && c.status === "active",
  );
}

export async function generateMetadata({
  params,
}: Params): Promise<Metadata> {
  const { country_slug } = await params;
  const country = activeCountry(country_slug);
  if (!country) return { title: "Country not found" };

  const count = getProgramsByCountrySlug(country_slug).length;
  return {
    title: `${country.country} Master's programs for Pakistani students`,
    description: `${count} English-taught Master's programs at public universities in ${country.country}. See tuition, intakes, IELTS, and how to apply.`,
    alternates: { canonical: `${SITE_URL}/admissions/${country_slug}` },
  };
}

export default async function CountryProgramsPage({ params }: Params) {
  const { country_slug } = await params;
  const country = activeCountry(country_slug);
  if (!country) notFound();

  const programs = getProgramsByCountrySlug(country_slug);
  const universities = getUniversities(country_slug);
  const isGermany = country_slug === "germany";

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14">
        <Link
          href="/admissions"
          className="rounded-sm font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← All countries
        </Link>

        <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {country.country} — university programs
        </h1>

        {isGermany && (
          <div className="mt-6">
            <Callout tone="warn" title="Pakistani applicants: start your APS now">
              <p>
                Any German student visa needs an APS certificate — it can take
                2-3 months. Start it now.
              </p>
              <p className="mt-2">
                Browse the full official catalog:{" "}
                <a
                  href="https://www.daad.de/en/studying-in-germany/universities/all-degree-programmes/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:decoration-gold"
                >
                  DAAD International Programmes ↗
                </a>
              </p>
            </Callout>
          </div>
        )}

        <div className="mt-8">
          <Suspense fallback={null}>
            <ProgramBrowser programs={programs} universities={universities} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
