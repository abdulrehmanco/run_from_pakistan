import { ImageResponse } from "next/og";
import {
  getAllScholarships,
  getScholarshipBySlug,
} from "@/lib/scholarships";
import { SITE_NAME } from "@/lib/site";

export const alt = "Scholarship details";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllScholarships().map((s) => ({ slug: s.id }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getScholarshipBySlug(slug);

  const overline = (s?.country ?? "Scholarship").toUpperCase();
  const name = s?.name ?? SITE_NAME;
  const sub =
    s?.funding_type === "full"
      ? "Fully funded"
      : s?.funding_type === "partial"
        ? "Partial funding"
        : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FBFAF7",
        }}
      >
        <div
          style={{ display: "flex", height: 12, backgroundColor: "#175243" }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              color: "#175243",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 6,
            }}
          >
            {overline}
          </div>
          <div
            style={{
              marginTop: 20,
              color: "#1F1D1A",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1,
            }}
          >
            {name}
          </div>
          {sub ? (
            <div style={{ marginTop: 20, color: "#514D45", fontSize: 34 }}>
              {sub}
            </div>
          ) : null}

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              color: "#175243",
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            {SITE_NAME}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
