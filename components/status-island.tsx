"use client";

import { useMemo } from "react";
import type { Scholarship } from "@/types/scholarship";
import { computeStatus } from "@/lib/status";
import { StatusBadge, StatusLine } from "@/components/status-view";

/**
 * Small client island for detail pages: status depends on the visitor's current
 * date, so it must run in the browser rather than at build time.
 */
export function StatusIsland({ scholarship }: { scholarship: Scholarship }) {
  const status = useMemo(
    () => computeStatus(scholarship, new Date()),
    [scholarship],
  );

  return (
    <div className="flex flex-col gap-1">
      <StatusBadge status={status} />
      <StatusLine status={status} />
    </div>
  );
}
