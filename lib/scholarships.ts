import rawData from "@/data/scholarships.json";
import { ScholarshipSchema, type Scholarship } from "@/types/scholarship";

function validateAll(data: unknown): Scholarship[] {
  if (!Array.isArray(data)) {
    throw new Error("scholarships.json must be a JSON array.");
  }
  const result: Scholarship[] = [];
  data.forEach((record, index) => {
    const parsed = ScholarshipSchema.safeParse(record);
    if (!parsed.success) {
      const id =
        record && typeof record === "object" && "id" in record
          ? String((record as { id: unknown }).id)
          : `#${index}`;
      const issues = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new Error(
        `Invalid scholarship "${id}" (index ${index}):\n${issues}`,
      );
    }
    result.push(parsed.data);
  });
  return result;
}

const scholarships = validateAll(rawData);

export function getAllScholarships(): Scholarship[] {
  return scholarships;
}

export function getScholarshipBySlug(slug: string): Scholarship | undefined {
  return scholarships.find((s) => s.id === slug);
}

export function getAllCountries(): string[] {
  return Array.from(new Set(scholarships.map((s) => s.country))).sort();
}
