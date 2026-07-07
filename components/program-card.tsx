"use client";

import Link from "next/link";
import type { Program } from "@/types/program";
import type { ProgramStatus } from "@/lib/status";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge, StatusLine, STATUS_STRIP } from "@/components/status-view";
import { ProgramBadges } from "@/components/program-badges";
import { VerifiedChip } from "@/components/scholarship-badges";
import { flagEmoji, formatIntakeLine } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProgramCard({
  program: p,
  status,
}: {
  program: Program;
  status: ProgramStatus;
}) {
  return (
    <Link
      href={`/admissions/${p.country_slug}/${p.id}`}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`View details for ${p.program_name} at ${p.university}`}
    >
      <Card className="relative h-full rounded-lg border border-border pt-5 ring-0 transition-[transform,box-shadow,border-color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-sm">
        {/* status accent strip */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 top-0 h-[3px]",
            STATUS_STRIP[status.status.state],
          )}
        />

        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              <span aria-hidden className="not-italic">
                {flagEmoji(p.country_code)}
              </span>{" "}
              {p.state} · {p.university}
            </p>
            <StatusBadge status={status.status} />
          </div>
          <h2 className="font-display text-lg font-semibold leading-snug text-foreground">
            {p.program_name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {p.degree} · {p.city}
          </p>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3">
          {status.status.daysLeft !== null ? (
            <StatusLine status={status.status} />
          ) : (
            <p className="font-mono text-xs text-muted-foreground">
              {formatIntakeLine(status)}
            </p>
          )}

          {/* Chips (max 5) */}
          <div className="flex flex-wrap gap-1.5">
            <ProgramBadges program={p} />
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Separator />
            {p.verified ? (
              <VerifiedChip isoDate={p.last_verified} />
            ) : (
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
                  window.open(p.program_url, "_blank", "noopener,noreferrer");
                }}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                aria-label={`Open the program page for ${p.program_name} in a new tab`}
              >
                Program page ↗
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
