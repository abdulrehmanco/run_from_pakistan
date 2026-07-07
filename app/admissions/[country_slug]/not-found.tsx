import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find that country or program. It may not be live yet.
        </p>
        <Link
          href="/admissions"
          className={buttonVariants({ variant: "default" })}
        >
          Back to all countries
        </Link>
      </main>
    </div>
  );
}
