"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Scholarship } from "@/types/scholarship";
import { computeStatus } from "@/lib/status";
import {
  activeFilterCount,
  filterScholarships,
  parseCriteria,
  serializeCriteria,
  sortScholarships,
  type FilterCriteria,
  type SortKey,
} from "@/lib/filter";
import { ScholarshipCard } from "@/components/scholarship-card";
import { FilterPanel } from "@/components/filter-panel";
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

const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Recommended",
  name: "Name A–Z",
  country: "Country A–Z",
};

const SORT_OVERLINE =
  "font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase";

export function ScholarshipBrowser({
  scholarships,
  countries,
}: {
  scholarships: Scholarship[];
  countries: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  // One shared "today" so every card computes a consistent status.
  const today = useMemo(() => new Date(), []);

  const criteria = useMemo(
    () => parseCriteria(searchParams),
    [searchParams],
  );

  const setCriteria = useCallback(
    (next: FilterCriteria) => {
      const qs = serializeCriteria(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const update = useCallback(
    (patch: Partial<FilterCriteria>) => setCriteria({ ...criteria, ...patch }),
    [criteria, setCriteria],
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const results = useMemo(() => {
    const filtered = filterScholarships(scholarships, criteria, today);
    const ordered = sortScholarships(filtered, criteria.sort, today);
    return ordered.map((s) => ({ s, status: computeStatus(s, today) }));
  }, [scholarships, criteria, today]);

  const activeCount = activeFilterCount(criteria);

  const panel = (
    <FilterPanel
      criteria={criteria}
      countries={countries}
      onChange={update}
      onClear={clearAll}
    />
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Search */}
      <Input
        type="search"
        value={criteria.q}
        onChange={(e) => update({ q: e.target.value })}
        placeholder="Search scholarship, university, or field…"
        aria-label="Search scholarships"
      />

      <div className="lg:flex lg:gap-10">
        {/* Sidebar (desktop) */}
        <aside className="hidden shrink-0 lg:block lg:w-[240px]">{panel}</aside>

        {/* Main column */}
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
              Showing {results.length} of {scholarships.length} scholarships
            </p>
            <div className="flex items-center gap-2">
              <span className={SORT_OVERLINE}>Sort</span>
              <Select
                value={criteria.sort}
                onValueChange={(v) => update({ sort: v as SortKey })}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: SortKey) => SORT_LABELS[v] ?? "Recommended"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                  <SelectItem value="country">Country A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid or empty state */}
          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing matches these filters. Deadlines change through the year
                — try clearing a filter.
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
              {results.map(({ s, status }) => (
                <ScholarshipCard key={s.id} scholarship={s} status={status} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
