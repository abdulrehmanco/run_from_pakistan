import { z } from "zod";

export const ProgramSchema = z.object({
  id: z.string(),
  university: z.string(),
  university_type: z.enum(["public_university", "public_applied_sciences"]),
  program_name: z.string(),
  degree: z.enum(["MSc", "MEng", "MA"]),
  city: z.string(),
  state: z.string(), // state / region
  country: z.string(),
  country_code: z.string(),
  country_slug: z.string(),
  field_tags: z.array(
    z.enum([
      "CS",
      "AI",
      "Data Science",
      "SE",
      "Cybersecurity",
      "Robotics",
      "Embedded",
      "HCI",
      "Networks",
      "IT Management",
    ]),
  ),
  language: z.enum(["English", "English+German"]),
  costs: z.object({
    tuition_per_semester_eur: z.number().nullable(),
    /** For countries that bill per year (Italy, France, NL, Nordics, Turkey,
     *  Malaysia, China). Set whichever basis the university actually uses;
     *  leave the other null rather than converting. */
    tuition_per_year_eur: z.number().nullable(),
    semester_fee_eur: z.number().nullable(),
    note: z.string().nullable(),
  }),
  intakes: z.array(
    z.object({
      /** Use the term the country itself uses: German-speaking and Central
       *  European systems say "winter" for the October start; most others
       *  say "autumn". "rolling" means no fixed round. */
      term: z.enum(["winter", "summer", "autumn", "spring", "rolling"]),
      application_open: z.string().nullable(),
      application_deadline: z.string().nullable(),
      dates_confirmed: z.boolean(),
      typical_window: z
        .object({
          opens: z.string(),
          closes: z.string(),
        })
        .nullable(),
      note: z.string().nullable(),
    }),
  ),
  application: z.object({
    platform: z.enum([
      "direct", // the university's own portal, nothing else
      "national-portal", // one national service does everything (SE, FI)
      "direct+national-step", // university portal PLUS a mandatory national step (IT, FR, NL)
      "uni-assist", // Germany
      "uni-assist+portal", // Germany
    ]),
    /** Name of the national service, when there is one. */
    portal_name: z.string().nullable(),
    portal_url: z.string().url().nullable(),
    vpd_required: z.boolean().nullable(),
    fee_note: z.string().nullable(),
    apply_url: z.string().url().nullable(),
  }),
  requirements: z.object({
    ielts: z.enum(["required", "not_required", "moi_accepted", "varies"]),
    ielts_note: z.string().nullable(),
    gre: z.enum(["required", "recommended", "not_required"]),
    /** Local-language requirement, in the country's own terms. Null means
     *  there is nothing to say — the UI then shows no language row at all. */
    local_language_note: z.string().nullable(),
    aps_required: z.boolean(),
    background_note: z.string().nullable(),
  }),
  application_steps: z.array(z.string()),
  warnings: z.array(z.string()),
  program_url: z.string().url().startsWith("https"),
  last_verified: z.string(),
  verified: z.boolean(),
});

export type Program = z.infer<typeof ProgramSchema>;
