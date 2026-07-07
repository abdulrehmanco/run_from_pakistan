import type { Scholarship } from "@/types/scholarship";
import { Badge } from "@/components/ui/badge";

export const GREEN_BADGE = "border-green-600 text-green-700";
export const AMBER_BADGE = "border-amber-500 text-amber-700";

export function FundingBadge({
  fundingType,
}: {
  fundingType: Scholarship["funding_type"];
}) {
  return (
    <Badge
      variant="outline"
      className={fundingType === "full" ? GREEN_BADGE : AMBER_BADGE}
    >
      {fundingType === "full" ? "Fully funded" : "Partial funding"}
    </Badge>
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
        <Badge key={level} variant="secondary">
          {level}
        </Badge>
      ))}
    </>
  );
}

/** IELTS / fee / admission badges — same visual language on cards and detail. */
export function BlockerBadges({
  blockers,
}: {
  blockers: Scholarship["blockers"];
}) {
  const fee = blockers.application_fee;
  return (
    <>
      {blockers.ielts === "not_required" && (
        <Badge variant="outline" className={GREEN_BADGE}>
          No IELTS
        </Badge>
      )}
      {blockers.ielts === "moi_accepted" && (
        <Badge variant="outline" className={GREEN_BADGE}>
          MOI accepted
        </Badge>
      )}
      {blockers.ielts === "required" && (
        <Badge variant="outline" className={AMBER_BADGE}>
          IELTS required
        </Badge>
      )}
      {blockers.ielts === "varies" && (
        <Badge variant="secondary">IELTS varies</Badge>
      )}
      {fee === null ? (
        <Badge variant="outline" className={GREEN_BADGE}>
          Free to apply
        </Badge>
      ) : (
        <Badge variant="outline" className={AMBER_BADGE}>
          Fee: {fee.amount} {fee.currency}
        </Badge>
      )}
      {blockers.admission_required_first && (
        <Badge variant="outline" className={AMBER_BADGE}>
          Admission first
        </Badge>
      )}
    </>
  );
}
