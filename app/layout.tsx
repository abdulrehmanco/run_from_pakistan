import type { Metadata } from "next";
import { Newsreader, Inter, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { SITE_NAME, TAGLINE, SITE_URL } from "@/lib/site";
import { SiteFooter } from "@/components/site-footer";

// Display serif — h1s, scholarship names, section headings.
const fontDisplay = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

// Body sans — everything else. Inter: standard, high-legibility.
const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Utility mono — all dates, countdowns, and overline labels.
const fontMono = Spline_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
