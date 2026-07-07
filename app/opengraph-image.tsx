import { ImageResponse } from "next/og";
import { SITE_NAME, TAGLINE } from "@/lib/site";

// Hex values are inlined: CSS variables and Tailwind do not exist inside
// ImageResponse. Default fonts only — no font files are fetched.
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            backgroundColor: "#175243",
            padding: "64px 72px",
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -1.5,
              lineHeight: 1.05,
            }}
          >
            {SITE_NAME}
          </div>
          <div style={{ color: "#FFFFFF", opacity: 0.85, fontSize: 32 }}>
            {TAGLINE}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            padding: "0 72px 64px",
          }}
        >
          <div
            style={{
              color: "#514D45",
              fontSize: 30,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Real deadlines · Real links · No noise
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
