import Link from "next/link";
import { SITE_NAME, TAGLINE } from "@/lib/site";

/**
 * Slim deep-green masthead. The site name is the page <h1> only on the
 * dashboard (asH1); elsewhere it is brand nav, so detail pages keep a single
 * <h1> (the scholarship name).
 */
export function SiteHeader({ asH1 = false }: { asH1?: boolean }) {
  const Name = asH1 ? "h1" : "span";
  return (
    <header className="border-b border-black/15 bg-primary text-primary-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-5">
        <Link
          href="/"
          className="inline-flex items-baseline gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <Name className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {SITE_NAME}
          </Name>
          <span aria-hidden className="font-display text-2xl leading-none text-gold">
            *
          </span>
        </Link>
        <p className="mt-1 text-sm text-primary-foreground/70">{TAGLINE}</p>
      </div>
    </header>
  );
}
