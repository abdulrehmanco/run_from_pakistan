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

## Phase roadmap

- [x] 1 — Scaffold
- [ ] 2 — Schema + types + seed data
- [ ] 3 — Dashboard cards + status logic
- [ ] 4 — Filters / search / sort
- [ ] 5 — Detail pages + SEO
- [ ] 6 — Polish / mobile / report-button
- [ ] 7 — Deploy + README

## Working agreement

- Do ONLY the current phase, then stop and report.
- Run `npm run build` before finishing a phase.
- Make a local git commit after each phase.
- Then stop and report.
