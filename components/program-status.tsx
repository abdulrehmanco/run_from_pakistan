"use client";

import { useMemo } from "react";
import type { Program } from "@/types/program";
import { computeProgramStatus, computeIntakeStatus } from "@/lib/status";
import { StatusBadge, StatusLine } from "@/components/status-view";
import { formatIntakeLine, formatISODate } from "@/lib/format";

/** Detail-header status island: overall status badge + intake summary line. */
export function ProgramStatusIsland({ program }: { program: Program }) {
  const ps = useMemo(
    () => computeProgramStatus(program, new Date()),
    [program],
  );

  return (
    <div className="flex flex-col gap-1">
      <StatusBadge status={ps.status} />
      {ps.status.daysLeft !== null ? (
        <StatusLine status={ps.status} />
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          {formatIntakeLine(ps)}
        </p>
      )}
    </div>
  );
}

/** Per-intake status list for the detail page. */
export function ProgramIntakeList({ program }: { program: Program }) {
  const today = useMemo(() => new Date(), []);

  return (
    <ul className="flex flex-col gap-4">
      {program.intakes.map((i, idx) => {
        const st = computeIntakeStatus(i, today);
        const term = i.term === "winter" ? "Winter" : "Summer";
        return (
          <li key={`${i.term}-${idx}`} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{term} intake</span>
              <StatusBadge status={st} />
            </div>
            {i.dates_confirmed &&
            (i.application_open || i.application_deadline) ? (
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                {i.application_open
                  ? `Opens ${formatISODate(i.application_open)}. `
                  : ""}
                {i.application_deadline
                  ? `Deadline ${formatISODate(i.application_deadline)}.`
                  : ""}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Usual pattern (not confirmed)
                {i.typical_window
                  ? `: usually ${i.typical_window.opens}–${i.typical_window.closes}.`
                  : "."}{" "}
                {i.note ?? ""}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
