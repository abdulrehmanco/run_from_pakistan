import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import {
  getAllAdmissionCountries,
  getProgramsByCountrySlug,
} from "@/lib/programs";
import { flagEmoji } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "University admissions by country",
  description:
    "Find English-taught Master's programs abroad for Pakistani students, with tuition, intakes, and how to apply. Germany is live; more countries coming.",
  alternates: { canonical: `${SITE_URL}/admissions` },
};

export default function AdmissionsHome() {
  const countries = getAllAdmissionCountries();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          University admissions
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          English-taught Master&apos;s programs abroad, with tuition, intake
          windows, and how to apply. Pick a country to start.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c) => {
            const count = getProgramsByCountrySlug(c.country_slug).length;

            if (c.status === "active") {
              return (
                <Link
                  key={c.country_slug}
                  href={`/admissions/${c.country_slug}`}
                  className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Browse ${c.country} programs`}
                >
                  <Card className="h-full items-center gap-3 rounded-lg border border-border py-8 text-center ring-0 transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-sm">
                    <span aria-hidden className="text-5xl">
                      {flagEmoji(c.country_code)}
                    </span>
                    <span className="font-display text-xl font-semibold">
                      {c.country}
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                      {count} {count === 1 ? "program" : "programs"}
                    </span>
                  </Card>
                </Link>
              );
            }

            return (
              <Card
                key={c.country_slug}
                aria-disabled="true"
                className={cn(
                  "h-full items-center gap-3 rounded-lg border border-border py-8 text-center opacity-60 ring-0",
                )}
              >
                <span aria-hidden className="text-5xl grayscale">
                  {flagEmoji(c.country_code)}
                </span>
                <span className="font-display text-xl font-semibold">
                  {c.country}
                </span>
                <span className="rounded-md border border-border bg-transparent px-2 py-0.5 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                  Coming soon
                </span>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
