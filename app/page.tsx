import { Suspense } from "react";
import { getAllScholarships, getAllCountries } from "@/lib/scholarships";
import { ScholarshipBrowser } from "@/components/scholarship-browser";
import { SITE_NAME, TAGLINE } from "@/lib/site";

export default function Home() {
  const scholarships = getAllScholarships();
  const countries = getAllCountries();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {SITE_NAME}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {TAGLINE}
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={null}>
          <ScholarshipBrowser
            scholarships={scholarships}
            countries={countries}
          />
        </Suspense>
      </main>
    </div>
  );
}
