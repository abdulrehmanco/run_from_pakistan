import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import {
  getAllAdmissionCountries,
  getProgramsByCountrySlug,
} from "@/lib/programs";
import { SITE_URL } from "@/lib/site";

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
        <p className="mt-2 text-muted-foreground">
          English-taught Master&apos;s programs abroad — tuition, intakes, and
          how to apply, country by country.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((c) => {
            const count = getProgramsByCountrySlug(c.country_slug).length;
            const flagSrc = `https://flagcdn.com/${c.country_code.toLowerCase()}.svg`;

            if (c.status === "active") {
              return (
                <Link
                  key={c.country_slug}
                  href={`/admissions/${c.country_slug}`}
                  className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Browse ${c.country} programs`}
                >
                  <Card className="h-full gap-0 overflow-hidden rounded-lg border border-border p-0 ring-0 transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={flagSrc}
                      alt=""
                      loading="lazy"
                      className="aspect-[3/2] w-full border-b border-border object-cover"
                    />
                    <div className="flex flex-col gap-1 p-4 text-center">
                      <span className="font-display text-xl font-semibold">
                        {c.country}
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                        {count} {count === 1 ? "program" : "programs"}
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            }

            return (
              <Card
                key={c.country_slug}
                aria-disabled="true"
                className="h-full gap-0 overflow-hidden rounded-lg border border-border p-0 opacity-60 ring-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flagSrc}
                  alt=""
                  loading="lazy"
                  className="aspect-[3/2] w-full border-b border-border object-cover grayscale"
                />
                <div className="flex flex-col items-center gap-1 p-4 text-center">
                  <span className="font-display text-xl font-semibold">
                    {c.country}
                  </span>
                  <span className="rounded-md border border-border bg-transparent px-2 py-0.5 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                    Coming soon
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
