"use client";

import type {
  ProgramCriteria,
  FieldTag,
  ProgramStatusFilter,
  UniversityType,
} from "@/lib/programFilter";
import { FIELD_TAGS, isProgramFilterActive } from "@/lib/programFilter";
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

const OVERLINE =
  "font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase";

const STATUS_LABELS: Record<ProgramStatusFilter | "all", string> = {
  all: "All statuses",
  open: "Open",
  opening_soon: "Opening soon",
  closed: "Closed",
};

const TYPE_LABELS: Record<UniversityType | "all", string> = {
  all: "All types",
  public_university: "Public university",
  public_applied_sciences: "Applied Sciences",
};

const CHECKBOXES: {
  key: "noIelts" | "greNotRequired" | "noTuition";
  label: string;
}[] = [
  { key: "noIelts", label: "No IELTS needed" },
  { key: "greNotRequired", label: "GRE not required" },
  { key: "noTuition", label: "No tuition (semester fee only)" },
];

export function ProgramFilterPanel({
  criteria,
  universities,
  onChange,
  onClear,
}: {
  criteria: ProgramCriteria;
  universities: string[];
  onChange: (patch: Partial<ProgramCriteria>) => void;
  onClear: () => void;
}) {
  function toggleField(f: FieldTag) {
    const next = criteria.fields.includes(f)
      ? criteria.fields.filter((x) => x !== f)
      : [...criteria.fields, f];
    onChange({ fields: next });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* University */}
      <div className="flex flex-col gap-2">
        <span className={OVERLINE}>University</span>
        <Select
          value={criteria.university ?? "all"}
          onValueChange={(v) =>
            onChange({ university: v === "all" ? null : (v as string) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string) => (v === "all" ? "All universities" : v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All universities</SelectItem>
            {universities.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Field tags */}
      <div className="flex flex-col gap-2">
        <span className={OVERLINE}>Field</span>
        <div className="flex flex-wrap gap-1.5">
          {FIELD_TAGS.map((f) => {
            const active = criteria.fields.includes(f);
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active ? "true" : "false"}
                onClick={() => toggleField(f)}
                className={cn(
                  buttonVariants({
                    variant: active ? "default" : "outline",
                    size: "sm",
                  }),
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-2">
        <span className={OVERLINE}>Status</span>
        <Select
          value={criteria.status ?? "all"}
          onValueChange={(v) =>
            onChange({ status: v === "all" ? null : (v as ProgramStatusFilter) })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string) =>
                STATUS_LABELS[(v as ProgramStatusFilter | "all") ?? "all"]
              }
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

      {/* University type */}
      <div className="flex flex-col gap-2">
        <span className={OVERLINE}>University type</span>
        <Select
          value={criteria.universityType ?? "all"}
          onValueChange={(v) =>
            onChange({
              universityType: v === "all" ? null : (v as UniversityType),
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string) =>
                TYPE_LABELS[(v as UniversityType | "all") ?? "all"]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="public_university">Public university</SelectItem>
            <SelectItem value="public_applied_sciences">
              Applied Sciences
            </SelectItem>
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
                onChange({ [key]: checked === true } as Partial<ProgramCriteria>)
              }
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {isProgramFilterActive(criteria) && (
        <button
          type="button"
          onClick={onClear}
          className="w-fit rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 transition-colors duration-150 ease-out hover:text-foreground hover:underline hover:decoration-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
