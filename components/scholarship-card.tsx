"use client";

import Link from "next/link";
import type { Scholarship } from "@/types/scholarship";
import type { Status } from "@/lib/status";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge, StatusLine } from "@/components/status-view";
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
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`View details for ${s.name}`}
    >
      <Card className="flex h-full flex-col transition-colors group-hover:border-foreground/30">
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              <span aria-hidden className="mr-1 text-base">
                {flagEmoji(s.country_code)}
              </span>
              {s.country}
            </span>
            <StatusBadge status={status} />
          </div>
          <div>
            <h2 className="font-bold leading-snug">{s.name}</h2>
            <p className="text-sm text-muted-foreground">{s.provider}</p>
          </div>
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
              <p className="text-xs text-muted-foreground">
                unverified — confirm officially
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                View details →
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(
                    s.official_url,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
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
