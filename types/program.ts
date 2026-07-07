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
    semester_fee_eur: z.number().nullable(),
    note: z.string().nullable(),
  }),
  intakes: z.array(
    z.object({
      term: z.enum(["winter", "summer"]),
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
    platform: z.enum(["uni-assist", "direct", "uni-assist+portal"]),
    vpd_required: z.boolean().nullable(),
    fee_note: z.string().nullable(),
    apply_url: z.string().url().nullable(),
  }),
  requirements: z.object({
    ielts: z.enum(["required", "not_required", "moi_accepted", "varies"]),
    ielts_note: z.string().nullable(),
    gre: z.enum(["required", "recommended", "not_required"]),
    german_required: z.string().nullable(),
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
