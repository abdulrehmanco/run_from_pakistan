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
      "rounded-sm border-b-2 pb-1 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
      active
        ? "border-gold text-primary-foreground"
        : "border-transparent text-primary-foreground/70 hover:text-primary-foreground",
    );

  return (
    <nav className="mt-5 flex gap-6" aria-label="Sections">
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
