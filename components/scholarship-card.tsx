"use client";

import Link from "next/link";
import type { Scholarship } from "@/types/scholarship";
import type { Status } from "@/lib/status";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge, StatusLine, STATUS_STRIP } from "@/components/status-view";
import {
  FundingBadge,
  DegreeChips,
  BlockerBadges,
} from "@/components/scholarship-badges";
import { flagEmoji } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ScholarshipCard({
  scholarship: s,
  status,
}: {
  scholarship: Scholarship;
  status: Status;
}) {
  return (
    <Link
      href={`/scholarship/${s.id}`}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`View details for ${s.name}`}
    >
      <Card className="relative h-full rounded-lg border border-border pt-5 ring-0 transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-sm">
        {/* status accent strip */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-[3px]",
            STATUS_STRIP[status.state],
          )}
        />

        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              <span aria-hidden className="not-italic">
                {flagEmoji(s.country_code)}
              </span>{" "}
              {s.country} · {s.provider}
            </p>
            <StatusBadge status={status} />
          </div>
          <h2 className="font-display text-lg font-semibold leading-snug text-foreground">
            {s.name}
          </h2>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3">
          <StatusLine status={status} />

          {/* Funding + degree levels */}
          <div className="flex flex-wrap gap-1.5">
            <FundingBadge fundingType={s.funding_type} />
            <DegreeChips levels={s.degree_levels} />
          </div>

          {/* Blocker row */}
          <div className="flex flex-wrap gap-1.5">
            <BlockerBadges blockers={s.blockers} />
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Separator />
            {!s.verified && (
              <p className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                unverified — confirm officially
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                View details{" "}
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(s.official_url, "_blank", "noopener,noreferrer");
                }}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                aria-label={`Open the official site for ${s.name} in a new tab`}
              >
                Official site ↗
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
