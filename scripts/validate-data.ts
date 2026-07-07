import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z, type ZodType } from "zod";
import { ScholarshipSchema } from "../types/scholarship";
import { ProgramSchema } from "../types/program";

const AdmissionCountrySchema = z.object({
  country: z.string(),
  country_code: z.string(),
  country_slug: z.string(),
  status: z.enum(["active", "coming_soon"]),
  note: z.string().nullable().optional(),
  catalog: z
    .object({ label: z.string(), url: z.string().url() })
    .nullable()
    .optional(),
});

/** Validate one JSON array file. Returns valid count, or null on failure (after logging). */
function validateFile(
  fileName: string,
  schema: ZodType,
  label: string,
): number | null {
  const path = join(process.cwd(), "data", fileName);
  const raw: unknown = JSON.parse(readFileSync(path, "utf8"));

  if (!Array.isArray(raw)) {
    console.error(`FAIL — ${fileName} must be a JSON array.`);
    return null;
  }

  let ok = true;
  raw.forEach((record, index) => {
    const parsed = schema.safeParse(record);
    if (!parsed.success) {
      ok = false;
      const id =
        record && typeof record === "object" && "id" in record
          ? String((record as { id: unknown }).id)
          : `#${index}`;
      console.error(`FAIL — ${label} "${id}" (index ${index}):`);
      for (const issue of parsed.error.issues) {
        console.error(
          `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
        );
      }
    }
  });

  return ok ? raw.length : null;
}

function main() {
  const scholarships = validateFile(
    "scholarships.json",
    ScholarshipSchema,
    "scholarship",
  );
  const programs = validateFile("programs.json", ProgramSchema, "program");
  const admissionCountries = validateFile(
    "admission_countries.json",
    AdmissionCountrySchema,
    "admission country",
  );

  if (scholarships === null || programs === null || admissionCountries === null) {
    process.exit(1);
    return;
  }

  console.log(`OK — ${scholarships} scholarships valid`);
  console.log(`OK — ${programs} programs valid`);
  console.log(`OK — ${admissionCountries} admission countries valid`);
}

main();
