"use client";

import { useMemo } from "react";
import type { Scholarship } from "@/types/scholarship";
import { computeStatus, type Status } from "@/lib/status";
import { ScholarshipCard } from "@/components/scholarship-card";

/**
 * Ordering rank (lower shows first):
 * 0 open+confirmed → 1 open+estimated → 2 opening_soon → 3 unknown → 4 closed.
 */
function rank(status: Status): number {
  if (status.state === "open") return status.estimated ? 1 : 0;
  if (status.state === "opening_soon") return 2;
  if (status.state === "unknown") return 3;
  return 4; // closed
}

export function ScholarshipGrid({
  scholarships,
}: {
  scholarships: Scholarship[];
}) {
  // One shared "today" so every card computes a consistent status.
  const today = useMemo(() => new Date(), []);

  const ordered = useMemo(() => {
    const withStatus = scholarships.map((s) => ({
      s,
      status: computeStatus(s, today),
    }));

    withStatus.sort((a, b) => {
      const ra = rank(a.status);
      const rb = rank(b.status);
      if (ra !== rb) return ra - rb;

      // open+confirmed: soonest deadline first
      if (ra === 0) {
        const da = a.status.daysLeft ?? Number.POSITIVE_INFINITY;
        const db = b.status.daysLeft ?? Number.POSITIVE_INFINITY;
        if (da !== db) return da - db;
      }

      // opening_soon: confirmed before estimated
      if (ra === 2) {
        const ea = a.status.estimated ? 1 : 0;
        const eb = b.status.estimated ? 1 : 0;
        if (ea !== eb) return ea - eb;
      }

      // everything else (and ties): alphabetical
      return a.s.name.localeCompare(b.s.name);
    });

    return withStatus;
  }, [scholarships, today]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ordered.map(({ s, status }) => (
        <ScholarshipCard key={s.id} scholarship={s} status={status} />
      ))}
    </div>
  );
}
