import { Suspense } from "react";
import { getAllScholarships, getAllCountries } from "@/lib/scholarships";
import { ScholarshipBrowser } from "@/components/scholarship-browser";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  const scholarships = getAllScholarships();
  const countries = getAllCountries();

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader asH1 />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-14">
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
