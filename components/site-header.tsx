import Link from "next/link";
import { SITE_NAME, TAGLINE } from "@/lib/site";
import { HeaderNav } from "@/components/header-nav";

/**
 * Slim deep-emerald masthead. The site name is the page <h1> only on the
 * dashboard (asH1); elsewhere it is brand nav, so detail pages keep a single
 * <h1> (the scholarship name).
 */
export function SiteHeader({
  asH1 = false,
  trust,
}: {
  asH1?: boolean;
  trust?: string;
}) {
  const Name = asH1 ? "h1" : "span";
  return (
    <header className="border-b border-black/20 bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
        {/* mono kicker */}
        <p className="font-mono text-[11px] tracking-[0.22em] text-primary-foreground/75 uppercase">
          International scholarships · Universities Admissions · for Pakistani students
        </p>

        <Link
          href="/"
          className="mt-2 inline-flex items-baseline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <Name className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {SITE_NAME}
          </Name>
        </Link>

        {/* thin gold rule accent */}
        <div aria-hidden className="mt-4 h-px w-16 bg-gold" />

        <p className="mt-4 max-w-xl text-sm text-primary-foreground/85 sm:text-base">
          {TAGLINE}
        </p>

        {trust && (
          <p className="mt-3 font-mono text-[11px] tracking-[0.12em] text-primary-foreground/70 uppercase tabular-nums">
            {trust}
          </p>
        )}

        <HeaderNav />
      </div>
    </header>
  );
}
