import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ScholarshipSchema } from "../types/scholarship";

const file = join(process.cwd(), "data", "scholarships.json");

function main() {
  const raw: unknown = JSON.parse(readFileSync(file, "utf8"));

  if (!Array.isArray(raw)) {
    console.error("FAIL — scholarships.json must be a JSON array.");
    process.exit(1);
    return;
  }

  let ok = true;
  raw.forEach((record, index) => {
    const parsed = ScholarshipSchema.safeParse(record);
    if (!parsed.success) {
      ok = false;
      const id =
        record && typeof record === "object" && "id" in record
          ? String((record as { id: unknown }).id)
          : `#${index}`;
      console.error(`FAIL — scholarship "${id}" (index ${index}):`);
      for (const issue of parsed.error.issues) {
        console.error(
          `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
        );
      }
    }
  });

  if (!ok) {
    process.exit(1);
    return;
  }

  console.log(`OK — ${raw.length} scholarships valid`);
}

main();
