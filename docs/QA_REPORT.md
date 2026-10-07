# QA Report — LeadFlow AI

**Build:** local production build (`next build && next start`) · **Date:** 2026-10-07
**Scope:** authentication, access control, lead CRUD, AI analysis, REST API, responsive layout
**Environment:** Chromium 153 (desktop 1280×720) and Pixel 7 emulation · PostgreSQL 16 · AI in offline mode (`AI_MOCK=1`)

## Summary

| Result | Count |
| --- | --- |
| Automated tests | 26 |
| Passed | 26 |
| Bugs found | 3 (all fixed) |

## Bugs found

### BUG-001 — PATCH wipes fields that were not sent · Severity: High · Fixed

**Steps to reproduce**
1. `POST /api/leads` with `{ "name": "A", "email": "a@x.io", "message": "Hello", "notes": "VIP" }`
2. `PATCH /api/leads/:id` with `{ "status": "WON" }`
3. `GET /api/leads/:id`

**Expected:** only `status` changes.
**Actual:** `message`, `notes` and `company` are reset to empty strings — customer data is lost.
**Root cause:** the update schema was `leadSchema.partial()`; Zod still applies `.default("")` on optional fields, so omitted fields were filled with defaults.
**Fix:** separate update schema built from the base fields without defaults.
**Regression test:** `e2e/api.spec.ts › PATCH only changes the fields that were sent`.

### BUG-002 — Status filter too wide on desktop · Severity: Low · Fixed

**Actual:** the status `<select>` stretched across the filter bar instead of 176px.
**Root cause:** the shared `.input` class was unlayered CSS, so it beat Tailwind utilities like `sm:w-44`.
**Fix:** moved `.input` into `@layer components`.

### BUG-003 — Badges stretch full width on mobile · Severity: Low · Fixed

**Actual:** status/temperature badges filled the whole row on narrow screens.
**Fix:** `w-fit` on badges.

## Notes / recommendations

- Real Claude analysis is not exercised in CI (cost + nondeterminism). Recommend a small nightly job with a real key that checks the response shape only.
- No rate limiting on `/login` yet — recommend adding before production.
