import type { Scholarship } from "@/types/scholarship";
import { cn } from "@/lib/utils";

// Quiet outlined chips: transparent bg, 1px tinted border, tinted text.
// Centralized here — the one place chip colors live.
const CHIP_BASE =
  "inline-flex items-center rounded-md border bg-transparent px-2 py-0.5 text-xs font-medium";
const CHIP_GOOD = "border-[#BFDACB] text-[#145239]"; // good news (green family)
const CHIP_FRICTION = "border-[#E9D6A8] text-[#8A5E14]"; // friction (amber family)
const CHIP_NEUTRAL = "border-border text-muted-foreground";

function Chip({
  tone,
  children,
}: {
  tone: "good" | "friction" | "neutral";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "good"
      ? CHIP_GOOD
      : tone === "friction"
        ? CHIP_FRICTION
        : CHIP_NEUTRAL;
  return <span className={cn(CHIP_BASE, toneClass)}>{children}</span>;
}

export function FundingBadge({
  fundingType,
}: {
  fundingType: Scholarship["funding_type"];
}) {
  return fundingType === "full" ? (
    <Chip tone="good">Fully funded</Chip>
  ) : (
    <Chip tone="friction">Partial funding</Chip>
  );
}

export function DegreeChips({
  levels,
}: {
  levels: Scholarship["degree_levels"];
}) {
  return (
    <>
      {levels.map((level) => (
        <Chip key={level} tone="neutral">
          {level}
        </Chip>
      ))}
    </>
  );
}

/** IELTS / fee / admission chips — same visual language on cards and detail. */
export function BlockerBadges({
  blockers,
}: {
  blockers: Scholarship["blockers"];
}) {
  const fee = blockers.application_fee;
  return (
    <>
      {blockers.ielts === "not_required" && <Chip tone="good">No IELTS</Chip>}
      {blockers.ielts === "moi_accepted" && <Chip tone="good">MOI accepted</Chip>}
      {blockers.ielts === "required" && (
        <Chip tone="friction">IELTS required</Chip>
      )}
      {blockers.ielts === "varies" && <Chip tone="neutral">IELTS varies</Chip>}
      {fee === null ? (
        <Chip tone="good">Free to apply</Chip>
      ) : (
        <Chip tone="friction">
          Fee: {fee.amount} {fee.currency}
        </Chip>
      )}
      {blockers.admission_required_first && (
        <Chip tone="friction">Admission first</Chip>
      )}
    </>
  );
}
