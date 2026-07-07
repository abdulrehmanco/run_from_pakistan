import { z } from "zod";

export const ScholarshipSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  country: z.string(),
  country_code: z.string(),
  cities: z.array(z.string()),
  universities: z.array(z.string()),
  degree_levels: z.array(z.enum(["BS", "MS", "PhD"])),
  fields_of_study: z.array(z.string()),
  funding_type: z.enum(["full", "partial"]),
  funding_details: z.object({
    tuition_covered: z.boolean(),
    monthly_stipend: z.string().nullable(),
    airfare_covered: z.boolean(),
    health_insurance: z.boolean(),
    other_benefits: z.array(z.string()),
  }),
  dates: z.object({
    application_open: z.string().nullable(),
    application_deadline: z.string().nullable(),
    dates_confirmed: z.boolean(),
    typical_cycle: z
      .object({
        opens: z.string(),
        closes: z.string(),
      })
      .nullable(),
    cycle_note: z.string().nullable(),
  }),
  blockers: z.object({
    ielts: z.enum(["required", "not_required", "moi_accepted", "varies"]),
    ielts_note: z.string().nullable(),
    application_fee: z
      .object({
        amount: z.number(),
        currency: z.string(),
        note: z.string().nullable(),
      })
      .nullable(),
    admission_required_first: z.boolean(),
    admission_note: z.string().nullable(),
    unusual_documents: z.array(z.string()),
  }),
  documents_required: z.array(z.string()),
  application_steps: z.array(z.string()),
  eligibility: z.object({
    open_to_pakistanis: z.boolean(),
    age_limit: z.string().nullable(),
    min_academic: z.string().nullable(),
    work_experience: z.string().nullable(),
    other: z.array(z.string()),
  }),
  official_url: z.string().url().startsWith("https"),
  apply_url: z.string().url().nullable(),
  last_verified: z.string(),
  verified: z.boolean(),
  warnings: z.array(z.string()),
});

export type Scholarship = z.infer<typeof ScholarshipSchema>;
