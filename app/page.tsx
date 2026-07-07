import { getAllScholarships } from "@/lib/scholarships";
import { ScholarshipGrid } from "@/components/scholarship-grid";

export default function Home() {
  const scholarships = getAllScholarships();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            ScholarDash
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Find fully-funded scholarships. Real deadlines, real links, no noise.
          </p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <ScholarshipGrid scholarships={scholarships} />
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-sm text-muted-foreground">
          Dates can change. Always confirm on the official scholarship page.
        </div>
      </footer>
    </div>
  );
}
