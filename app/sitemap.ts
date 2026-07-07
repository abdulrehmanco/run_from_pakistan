import type { MetadataRoute } from "next";
import { getAllScholarships } from "@/lib/scholarships";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const home = {
    url: SITE_URL,
    changeFrequency: "weekly" as const,
    priority: 1,
  };

  const details = getAllScholarships().map((s) => ({
    url: `${SITE_URL}/scholarship/${s.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [home, ...details];
}
