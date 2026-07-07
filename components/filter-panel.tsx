"use client";

import type { FilterCriteria, DegreeLevel, StatusFilter } from "@/lib/filter";
import { DEGREE_LEVELS, isFilterActive } from "@/lib/filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<StatusFilter | "all", string> = {
  all: "All statuses",
  open: "Open",
  opening_soon: "Opening soon",
  closed: "Closed",
};

const CHECKBOXES: {
  key: "fundedOnly" | "noIelts" | "noFee" | "noAdmissionFirst";
  label: string;
}[] = [
  { key: "fundedOnly", label: "Fully funded only" },
  { key: "noIelts", label: "No IELTS needed" },
  { key: "noFee", label: "Free to apply" },
  { key: "noAdmissionFirst", label: "No admission offer needed first" },
];

export function FilterPanel({
  criteria,
  countries,
  onChange,
  onClear,
}: {
  criteria: FilterCriteria;
  countries: string[];
  onChange: (patch: Partial<FilterCriteria>) => void;
  onClear: () => void;
}) {
  function toggleDegree(d: DegreeLevel) {
    const next = criteria.degrees.includes(d)
      ? criteria.degrees.filter((x) => x !== d)
      : [...criteria.degrees, d];
    onChange({ degrees: next });
  }

  return (
    <div className="flex flex-col gap-5 rounded-lg border p-4">
      {/* Country */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Country</span>
        <Select
          value={criteria.country ?? "all"}
          onValueChange={(v) =>
            onChange({ country: v === "all" ? null : (v as string) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string) => (v === "all" ? "All countries" : v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Degree level */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Degree level</span>
        <div className="flex gap-1.5">
          {DEGREE_LEVELS.map((d) => {
            const active = criteria.degrees.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={active ? "true" : "false"}
                onClick={() => toggleDegree(d)}
                className={cn(
                  buttonVariants({
                    variant: active ? "default" : "outline",
                    size: "sm",
                  }),
                  "flex-1",
                )}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Status</span>
        <Select
          value={criteria.status ?? "all"}
          onValueChange={(v) =>
            onChange({ status: v === "all" ? null : (v as StatusFilter) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string) => STATUS_LABELS[(v as StatusFilter | "all") ?? "all"]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="opening_soon">Opening soon</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        {CHECKBOXES.map(({ key, label }) => (
          <label
            key={key}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <Checkbox
              checked={criteria[key]}
              onCheckedChange={(checked) =>
                onChange({ [key]: checked === true } as Partial<FilterCriteria>)
              }
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {isFilterActive(criteria) && (
        <>
          <Separator />
          <button
            type="button"
            onClick={onClear}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}
