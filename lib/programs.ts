import rawPrograms from "@/data/programs.json";
import rawCountries from "@/data/admission_countries.json";
import { ProgramSchema, type Program } from "@/types/program";

export interface AdmissionCountry {
  country: string;
  country_code: string;
  country_slug: string;
  status: "active" | "coming_soon";
}

function validatePrograms(data: unknown): Program[] {
  if (!Array.isArray(data)) {
    throw new Error("programs.json must be a JSON array.");
  }
  const result: Program[] = [];
  data.forEach((record, index) => {
    const parsed = ProgramSchema.safeParse(record);
    if (!parsed.success) {
      const id =
        record && typeof record === "object" && "id" in record
          ? String((record as { id: unknown }).id)
          : `#${index}`;
      const issues = parsed.error.issues
        .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid program "${id}" (index ${index}):\n${issues}`);
    }
    result.push(parsed.data);
  });
  return result;
}

const programs = validatePrograms(rawPrograms);
const countries = rawCountries as AdmissionCountry[];

export function getAllPrograms(): Program[] {
  return programs;
}

export function getProgramBySlug(slug: string): Program | undefined {
  return programs.find((p) => p.id === slug);
}

export function getProgramsByCountrySlug(countrySlug: string): Program[] {
  return programs.filter((p) => p.country_slug === countrySlug);
}

export function getUniversities(countrySlug: string): string[] {
  return Array.from(
    new Set(
      programs
        .filter((p) => p.country_slug === countrySlug)
        .map((p) => p.university),
    ),
  ).sort();
}

export function getAllAdmissionCountries(): AdmissionCountry[] {
  return countries;
}

export function getActiveAdmissionCountries(): AdmissionCountry[] {
  return countries.filter((c) => c.status === "active");
}
