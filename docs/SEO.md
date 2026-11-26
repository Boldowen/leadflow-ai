# SEO guide

What is in place, how to verify it, and what still has to happen outside the codebase.

## Implemented

| Area | Where |
|---|---|
| Titles, descriptions, canonical URLs, Open Graph, Twitter cards | `src/app/layout.tsx` (defaults), each page's `metadata` |
| Social preview image (1200×630, from the logo) | `src/app/opengraph-image.tsx` |
| Favicon / app icons / manifest | `src/app/favicon.ico`, `icon.png`, `apple-icon.png`, `manifest.ts`, `public/brand/` |
| Structured data | Home: Organization, WebSite, SoftwareApplication, FAQPage. Docs and Privacy: BreadcrumbList (`src/lib/seo.ts`, `src/components/site/json-ld.tsx`) |
| robots.txt / sitemap.xml | `src/app/robots.ts`, `src/app/sitemap.ts` — only `/`, `/docs`, `/privacy` are listed |
| noindex | Login, sign-up, password reset, dashboard, admin, hosted forms, 404, and every non-production Vercel deployment (`X-Robots-Tag` + robots metadata) |
| Public pages | `/` (≈640 words since the redesign; FAQ answers stay in the HTML while collapsed), `/docs`, `/privacy` — static HTML, no JavaScript needed to read them |

Brand sources live in `design/brand/` (original `icon.png`, `logo.png`). The logo artwork has its own near-black background (#000007), so it is used on dark surfaces (site footer, social image); light headers use the icon plus the name as text.

## Google Search Console

The `emberza.dev` Domain property is verified by DNS (TXT record at name.com).

1. **Sitemaps** → enter the full URL `https://emberza.dev/sitemap.xml` (Domain properties need the full URL) → Submit.
2. **URL Inspection** → `https://emberza.dev/` → *Request indexing*. Repeat for `/docs` and `/privacy`.
3. After a few days check **Pages** (indexing) and **Enhancements → FAQ** for structured-data errors.

## Bing Webmaster Tools

1. Sign in at bing.com/webmasters → *Import from Google Search Console* (fastest), or add the site manually.
2. If it asks for a meta tag, put the token in `BING_SITE_VERIFICATION` in Vercel (Production) and redeploy.
3. Submit `https://emberza.dev/sitemap.xml`.

## External SEO checklist

Do these from your own accounts; nothing here was created automatically.

- [ ] **Product Hunt** launch: tagline "Know which leads to call first", gallery from `docs/screenshots/`, a maker comment explaining Hot/Warm/Cold scoring.
- [ ] **BetaList** and **Indie Hackers** product page; post a build log (how the AI scoring and form automation work).
- [ ] **AlternativeTo**: list Emberza as an alternative to lead-scoring / lightweight CRM tools.
- [ ] SaaS directories with real editorial review (e.g. SaaSHub, There's An AI For That, Futurepedia).
- [ ] **LinkedIn** company page linking to emberza.dev; share the docs page when you publish an integration.
- [ ] **GitHub** repository: set the website field to https://emberza.dev and add topics (lead-scoring, ai, nextjs).
- [ ] Educational articles worth writing once a blog exists: "How to qualify inbound leads with AI", "Hot, Warm, Cold: a simple lead scoring model for small teams", "Send website form leads to Google Sheets and Telegram".
- [ ] Ask agencies or tools you integrate with (e.g. a WordPress/Webflow tutorial) for genuine links. Avoid paid link schemes.

When real data exists, consider: testimonials (only with permission), a pricing page (only once plans exist), and an `/about` page with real company details.
