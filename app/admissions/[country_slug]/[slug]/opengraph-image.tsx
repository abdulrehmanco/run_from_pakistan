import { ImageResponse } from "next/og";
import { getAllPrograms, getProgramBySlug } from "@/lib/programs";
import { SITE_NAME } from "@/lib/site";

export const alt = "Program details";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllPrograms().map((p) => ({
    country_slug: p.country_slug,
    slug: p.id,
  }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ country_slug: string; slug: string }>;
}) {
  const { slug } = await params;
  const p = getProgramBySlug(slug);

  const overline = (p?.country ?? "University program").toUpperCase();
  const name = p?.program_name ?? SITE_NAME;
  const sub = p ? `${p.degree} · ${p.university}` : "";

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
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1,
            }}
          >
            {name}
          </div>
          {sub ? (
            <div style={{ marginTop: 20, color: "#514D45", fontSize: 32 }}>
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
