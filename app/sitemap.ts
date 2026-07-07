import type { MetadataRoute } from "next";
import { getAllScholarships } from "@/lib/scholarships";
import {
  getActiveAdmissionCountries,
  getAllPrograms,
} from "@/lib/programs";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const weekly = "weekly" as const;

  const staticRoutes = [
    { url: SITE_URL, changeFrequency: weekly, priority: 1 },
    { url: `${SITE_URL}/admissions`, changeFrequency: weekly, priority: 0.9 },
  ];

  const scholarships = getAllScholarships().map((s) => ({
    url: `${SITE_URL}/scholarship/${s.id}`,
    changeFrequency: weekly,
    priority: 0.8,
  }));

  const countryRoutes = getActiveAdmissionCountries().map((c) => ({
    url: `${SITE_URL}/admissions/${c.country_slug}`,
    changeFrequency: weekly,
    priority: 0.8,
  }));

  const programs = getAllPrograms().map((p) => ({
    url: `${SITE_URL}/admissions/${p.country_slug}/${p.id}`,
    changeFrequency: weekly,
    priority: 0.7,
  }));

  return [...staticRoutes, ...scholarships, ...countryRoutes, ...programs];
}
