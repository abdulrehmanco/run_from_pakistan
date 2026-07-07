# ScholarDash

## What this project is

ScholarDash is a zero-cost web dashboard that helps Pakistani students find
fully-funded international scholarships. It shows filterable scholarship cards
with status (Open / Opening Soon / Closed), a deadline countdown, funding
coverage, and blocker warnings (IELTS required? application fee? admission
offer needed first? unusual documents?). Every scholarship links to its
official page and shows a last_verified date so students can trust the info.

## Hard rules

- $0 budget: static Next.js site on the Vercel free tier. No database, no
  backend, no auth.
- All scholarship data lives ONLY in `data/scholarships.json`. Nowhere else.
- Every scholarship record must include `official_url` and `last_verified`.
- NEVER invent or guess real deadlines. Any placeholder data must set
  `"verified": false`.
- All UI copy is in plain, simple English: short sentences, no jargon.
- GitHub is OFF-LIMITS. Never run `git push`, `git remote add`, the `gh` CLI,
  or anything that contacts GitHub or any remote. Local git commits only. The
  user handles GitHub personally at the very end.

## Design language

Theme: **"quiet academic, departures-board"** — calm, typographic, trustworthy.
One bold move (deep-green masthead + mono dates); everything else disciplined.
**All future UI must use these tokens — no new colors or fonts without updating
this section.**

**Fonts** (via `next/font/google`, self-hosted at build, wired in `globals.css`
`@theme`):
- `font-display` — **Newsreader** (500, 600): h1s, scholarship names, section
  headings.
- `font-sans` — **Inter** (400, 500, 600, 700): body / everything else (default).
- `font-mono` — **Spline Sans Mono** (400, 500): ALL dates, deadlines,
  countdowns, and overline labels. Use `tabular-nums` for figures.

**Color tokens** (defined in `app/globals.css` `:root`; never hardcode hex in
components):
- `--background #FBFAF7` ivory · `--card #FFFFFF` · `--foreground #1F1D1A` ink
- `--muted-foreground #514D45` (≈8:1 on ivory) · `--border #E6E3DB` hairline
- `--primary #054D3A` deep emerald (masthead + CTAs) · `--primary-foreground #FFFFFF` · `--ring #054D3A`
- `--gold #B8892D` (utility `text-gold`/`border-gold`) — sparingly: active count,
  small rules, link-hover underlines
- `--urgent #A63B1F` — countdown when `daysLeft <= 14`

**Status colors** live in ONE map: `STATUS_STYLES` (+ `STATUS_STRIP`) in
`components/status-view.tsx`, imported by both cards and detail pages. Chip
color families live in `components/scholarship-badges.tsx`; callout tints in
`components/callout.tsx`. These three files are the only places status/chip/
callout color literals may appear.
- open → bg `#D1FAE5` / text `#065F46` / border `#6EE7B7` · strip `#10B981`
- opening_soon → bg `#FEF3C7` / text `#92400E` / border `#FCD34D` · strip `#F59E0B`
- closed → bg `#FBE7E3` / text `#B23A26` / border `#F3B4A8` · strip `#E05B45`
- unknown → bg `#F0EEE8` / text `#57534B` / border `#E0DCD1` · strip `#DAD5C8`
- Status is never conveyed by color alone — text labels always accompany it.

**Feel**: `max-w-6xl`; generous vertical rhythm; `leading-relaxed`; hairline
borders not drop-shadows (shadow only as a whisper on card hover); radius
`rounded-md`/`lg` max (only small chips are more rounded — nothing pill-huge);
soft-green `::selection`; visible `focus-visible` rings; 150–200ms ease-out
transitions on interactive elements only, all wrapped in a
`prefers-reduced-motion` guard.

**Forbidden** (AI-template tells): purple/indigo/violet; any gradient;
glassmorphism / backdrop-blur; neon or saturated SaaS blue; the cream +
terracotta/coral "warm AI" palette (`#D97757`); black-bg + acid-green; emoji as
decoration (flag emojis as data are fine); ✨/🚀; stock illustrations; heavy
stacked shadows; animated background blobs; ALL-CAPS shouting buttons (mono
uppercase overlines are labels — the one exception); decorative 01/02/03
numbering where order carries no meaning.

## Phase roadmap

- [x] 1 — Scaffold
- [x] 2 — Schema + types + seed data
- [x] 3 — Dashboard cards + status logic
- [x] 4 — Filters / search / sort
- [x] 5 — Detail pages + SEO
- [x] 6 — Polish / mobile / report-button
- [ ] 7 — Deploy (user-led, Vercel CLI or manual GitHub) + README

## Working agreement

- Do ONLY the current phase, then stop and report.
- From now on, every phase must pass BOTH `npm run validate-data` AND
  `npm run build` before committing.
- Make a local git commit after each phase.
- Then stop and report.
