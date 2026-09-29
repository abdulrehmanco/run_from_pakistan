"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Two section tabs in the masthead. Admissions is active for any /admissions path. */
export function HeaderNav() {
  const pathname = usePathname();
  const isAdmissions = pathname.startsWith("/admissions");

  const tab = (active: boolean) =>
    cn(
      "rounded-md border px-3.5 py-1.5 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
      active
        ? "border-gold bg-gold/15 text-primary-foreground"
        : "border-primary-foreground/30 text-primary-foreground/75 hover:border-primary-foreground/60 hover:text-primary-foreground",
    );

  return (
    <nav className="mt-5 flex gap-3" aria-label="Sections">
      <Link
        href="/"
        className={tab(!isAdmissions)}
        aria-current={!isAdmissions ? "page" : undefined}
      >
        Scholarships
      </Link>
      <Link
        href="/admissions"
        className={tab(isAdmissions)}
        aria-current={isAdmissions ? "page" : undefined}
      >
        Admissions
      </Link>
    </nav>
  );
}
