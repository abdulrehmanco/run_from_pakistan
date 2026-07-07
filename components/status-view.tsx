import type { Status } from "@/lib/status";
import { cn } from "@/lib/utils";

/**
 * The single source of truth for status colors — imported by both cards and
 * detail pages. These per-status tints are the ONE allowed place for status
 * color literals (see CLAUDE.md "Design language").
 */
export const STATUS_STYLES: Record<Status["state"], string> = {
  open: "border-[#6EE7B7] bg-[#D1FAE5] text-[#065F46]",
  opening_soon: "border-[#FCD34D] bg-[#FEF3C7] text-[#92400E]",
  closed: "border-[#F3B4A8] bg-[#FBE7E3] text-[#B23A26]",
  unknown: "border-[#E0DCD1] bg-[#F0EEE8] text-[#57534B]",
};

/** 3px top accent strip color per status — the vibrant status signal. */
export const STATUS_STRIP: Record<Status["state"], string> = {
  open: "bg-[#10B981]",
  opening_soon: "bg-[#F59E0B]",
  closed: "bg-[#E05B45]",
  unknown: "bg-[#DAD5C8]",
};

/** Urgent countdown (<= 14 days). */
const URGENT_TAG = "border-[#A63B1F] bg-transparent text-[#A63B1F] font-semibold";

/** The status pill — a mono, uppercase gate-tag. Appends "(est.)" when estimated. */
export function StatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const label = status.headline + (status.estimated ? " (est.)" : "");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.1em] uppercase",
        STATUS_STYLES[status.state],
        className,
      )}
    >
      {label}
    </span>
  );
}

/**
 * One line under the badge: a boarding-gate countdown tag when a confirmed
 * deadline exists (urgent color when <= 14 days), else the sub text in mono.
 */
export function StatusLine({ status }: { status: Status }) {
  if (status.daysLeft !== null) {
    const urgent = status.daysLeft <= 14;
    return (
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-md border px-2 py-0.5 font-mono text-xs tabular-nums",
          urgent ? URGENT_TAG : STATUS_STYLES[status.state],
        )}
      >
        {status.daysLeft} {status.daysLeft === 1 ? "day" : "days"} left
      </span>
    );
  }
  return (
    <p className="font-mono text-xs text-muted-foreground">
      {status.sub ?? "Check the official site for dates."}
    </p>
  );
}
