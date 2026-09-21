import type { Program } from "@/types/program";
import { Chip } from "@/components/scholarship-badges";
import { isTuitionFree } from "@/lib/programFilter";

/**
 * Plain-English tuition summary chip text + tone. Shows the figure on the
 * basis the university actually bills — per semester (Germany, Austria) or
 * per year (Italy, France, the Nordics) — never a converted one.
 */
export function tuitionChip(costs: Program["costs"]): {
  tone: "good" | "friction";
  label: string;
} {
  if (isTuitionFree(costs)) {
    return { tone: "good", label: "No tuition" };
  }
  if (costs.tuition_per_semester_eur !== null) {
    return {
      tone: "friction",
      label: `€${costs.tuition_per_semester_eur.toLocaleString("en-US")} per semester`,
    };
  }
  if (costs.tuition_per_year_eur !== null) {
    return {
      tone: "friction",
      label: `€${costs.tuition_per_year_eur.toLocaleString("en-US")} per year`,
    };
  }
  return { tone: "friction", label: "Tuition applies — confirm" };
}

/**
 * Program chips (max 5): tuition, IELTS, GRE (only when required),
 * Applied Sciences tag. Same visual language as scholarship chips.
 */
export function ProgramBadges({ program: p }: { program: Program }) {
  const tuition = tuitionChip(p.costs);
  return (
    <>
      <Chip tone={tuition.tone}>{tuition.label}</Chip>

      {p.requirements.ielts === "not_required" && <Chip tone="good">No IELTS</Chip>}
      {p.requirements.ielts === "moi_accepted" && (
        <Chip tone="good">MOI accepted</Chip>
      )}
      {p.requirements.ielts === "required" && (
        <Chip tone="friction">IELTS required</Chip>
      )}
      {p.requirements.ielts === "varies" && <Chip tone="neutral">IELTS varies</Chip>}

      {p.requirements.gre === "required" && <Chip tone="friction">GRE required</Chip>}

      {p.university_type === "public_applied_sciences" && (
        <Chip tone="neutral">Applied Sciences</Chip>
      )}
    </>
  );
}
