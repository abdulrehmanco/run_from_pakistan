"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Program } from "@/types/program";
import { computeProgramStatus } from "@/lib/status";
import {
  activeProgramFilterCount,
  filterPrograms,
  parseProgramCriteria,
  serializeProgramCriteria,
  sortPrograms,
  type ProgramCriteria,
  type ProgramSortKey,
} from "@/lib/programFilter";
import { ProgramCard } from "@/components/program-card";
import { ProgramFilterPanel } from "@/components/program-filter-panel";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SORT_LABELS: Record<ProgramSortKey, string> = {
  recommended: "Recommended",
  university: "University A–Z",
};

const SORT_OVERLINE =
  "font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase";

export function ProgramBrowser({
  programs,
  universities,
}: {
  programs: Program[];
  universities: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const today = useMemo(() => new Date(), []);

  const criteria = useMemo(
    () => parseProgramCriteria(searchParams),
    [searchParams],
  );

  const setCriteria = useCallback(
    (next: ProgramCriteria) => {
      const qs = serializeProgramCriteria(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const update = useCallback(
    (patch: Partial<ProgramCriteria>) => setCriteria({ ...criteria, ...patch }),
    [criteria, setCriteria],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const results = useMemo(() => {
    const filtered = filterPrograms(programs, criteria, today);
    const ordered = sortPrograms(filtered, criteria.sort, today);
    return ordered.map((p) => ({ p, status: computeProgramStatus(p, today) }));
  }, [programs, criteria, today]);

  const activeCount = activeProgramFilterCount(criteria);

  const panel = (
    <ProgramFilterPanel
      criteria={criteria}
      universities={universities}
      onChange={update}
      onClear={clearAll}
    />
  );

  return (
    <div className="flex flex-col gap-8">
      <Input
        type="search"
        value={criteria.q}
        onChange={(e) => update({ q: e.target.value })}
        placeholder="Search program, university, or city…"
        aria-label="Search programs"
      />

      <div className="lg:flex lg:gap-10">
        <aside className="hidden shrink-0 lg:block lg:w-[240px]">{panel}</aside>

        <div className="min-w-0 flex-1">
          {/* Filters toggle (mobile) */}
          <div className="mb-6 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-expanded={mobileOpen ? "true" : "false"}
              className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            >
              {mobileOpen ? "Hide filters" : "Filters"}
              {activeCount > 0 ? (
                <span className="ml-1 font-medium text-primary">
                  ({activeCount})
                </span>
              ) : (
                ""
              )}
            </button>
            {mobileOpen && <div className="mt-4">{panel}</div>}
          </div>

          {/* Count + sort */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs tracking-[0.04em] text-muted-foreground uppercase">
              Showing {results.length} of {programs.length} programs
            </p>
            <div className="flex items-center gap-2">
              <span className={SORT_OVERLINE}>Sort</span>
              <Select
                value={criteria.sort}
                onValueChange={(v) => update({ sort: v as ProgramSortKey })}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: ProgramSortKey) => SORT_LABELS[v] ?? "Recommended"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="university">University A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing matches these filters. Intakes change through the year —
                try clearing a filter.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map(({ p, status }) => (
                <ProgramCard key={p.id} program={p} status={status} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
