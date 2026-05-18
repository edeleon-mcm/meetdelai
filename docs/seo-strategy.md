# AI_BIZ_OPS — SEO Strategy

> Why this is harder than MCM products: BiTES / Munchies / Lite all sell **a thing** — a menu, a meal, a delivery. The keyword maps cleanly: `restaurant menu app miami`. AI consulting sells **a process** — automation, integration, deployment. The buyer doesn't always know what they need yet, and the keyword space is crowded with content marketers, agencies, and SaaS pretending to be consultants.
>
> So we win on three different vectors than MCM products: **geo + industry combos** (long-tail with low CPC), **use-case pages** (commercial intent without naming us), and **engineering authority articles** (top-of-funnel that earns trust).

---

## Search intent map

| Intent | Example query | Page type | Conversion lever |
|---|---|---|---|
| **Geo commercial** | "ai consultant miami" | Geo funnel `/fl/:city` | Lead modal pre-filled with city |
| **Industry commercial** | "ai for real estate brokers" | Industry page `/industry/:slug` | Modal pre-filled with industry |
| **Geo × industry** | "ai automation real estate fort lauderdale" | Combo page `/fl/:city/:industry` | Modal pre-filled with both |
| **Use-case commercial** | "automate lead followup with ai" | Use-case page `/use-case/:slug` | Concrete deploy spec + CTA |
| **Educational top-of-funnel** | "what is rag" / "ai cost benchmarks" | Article `/intelligence/:slug` | Sidebar CTA + footer CTA |
| **Comparison** | "ai consultant vs zapier" / "build vs buy ai" | Article (high effort, later) | Same |
| **Brand** | "ai_biz_ops" / "aiforbusinesshelp" | Landing | Direct |

---

## Site architecture

```
/                                  Landing
/intelligence                      Article archive (3 categories)
/intelligence/:slug                Article detail
/industries                        Industry index (6 verticals)
/industry/:slug                    Industry deep page
/use-cases                         Use-case index
/use-case/:slug                    Use-case deep page
/fl/:city                          Geo funnel (7 South FL cities)
/fl/:city/:industry                Geo × industry combo (42 pages)
/changelog                         Build log (rolling, dog-foods authority)
```

42 combo pages from one template + 6 industry pages + 5 use-case pages = **53 indexable landing pages** in the South FL pilot, with one source-of-truth registry for cities and industries.

---

## Keyword targets — South FL pilot

### Tier 1 — geo commercial (highest LTV, hardest competition)
- ai consultant miami / fort lauderdale / boca / west palm / naples / tampa / orlando
- ai automation [city]
- ai agency [city]

### Tier 2 — industry commercial (high LTV, medium competition)
- ai for real estate / restaurants / healthcare / law firms / ecommerce / logistics
- [industry] ai automation
- ai tools for [industry]

### Tier 3 — geo × industry combo (medium LTV, low competition — the win)
- ai for real estate miami
- ai automation restaurants fort lauderdale
- healthcare ai consultant west palm
- *(this is where we eat lunch — these queries are real and barely contested)*

### Tier 4 — use-case (medium LTV, varies)
- automate lead followup
- ai document extraction
- voice ai for small business
- ai customer support agent
- ai knowledge base

### Tier 5 — educational (top-of-funnel, supports authority)
- what is rag (retrieval augmented generation)
- ai cost benchmarks small business
- chatgpt vs claude for business
- *Each article picks one and goes deep. Published articles back the consulting brand.*

---

## Industry list (6 verticals)
1. real-estate
2. restaurants
3. healthcare
4. professional-services *(law, accounting, consulting)*
5. ecommerce
6. logistics

## Use-case list (5)
1. lead-routing — inbound classification + routing
2. document-extraction — OCR + structured output
3. voice-agents — outbound + inbound calling
4. customer-support — multi-channel agent
5. knowledge-base — RAG for internal/external

---

## On-page SEO checklist (per template)

- ✅ One `<h1>` per page, includes primary keyword
- ✅ Meta title under 60 chars, meta description under 160
- ✅ Canonical URL set
- ✅ JSON-LD structured data:
  - Geo pages → `LocalBusiness` + `Service`
  - Industry pages → `Service`
  - Use-case pages → `Service` + `HowTo`
  - Articles → `Article` + `BreadcrumbList`
  - Site-wide → `Organization`
- ✅ OG + Twitter card tags (one shared OG image fallback, per-page override when we have a hero)
- ✅ Internal cross-links from every page back to: 2 related geo, 2 related industry, 1 use-case
- ✅ Sitemap.xml generated at build time, posted to Google Search Console
- ✅ Robots.txt allow-all (no auth-gated pages exist on this site)

---

## Content cadence

| Cadence | Action | Owner |
|---|---|---|
| Daily (cron 09:00 EST) | Found pipeline pulls AI/business signals → top cluster auto-generates a DRAFT article in `aibizops_articles` | mcm-agents EC2 |
| 2× weekly | Owner reviews drafts in Modus, edits voice/details, flips to `published` | Eddie via Modus |
| Monthly | Add 1 use-case page when a deploy ships (real customer story → case_study category article + use-case page update) | Eddie |
| Quarterly | Audit which geo × industry combos have traffic; expand list to next regions (Tampa Bay metro, Orlando metro, then Atlanta) | Eddie |

---

## Internal linking strategy

Three tiers, all auto-generated from the city + industry + use-case registries:

1. **Footer (every page)** — Link block with all geo cities + industries + use-cases
2. **Page sidebar / inline mid-content** — 3 related pages: same geo (different industry), same industry (different geo), top use-case
3. **Article cards** — Articles surface contextually by tag match on geo + industry pages ("Latest engineering reads from Miami real estate")

This creates a dense internal graph without manual curation. Every new city automatically gets backlinked from 6 industry pages + 5 use-case pages + every existing geo page in the same state.

---

## Tracking

- Plausible.io (privacy-first, no cookie banner) — page views, conversions on lead modal
- Lead source attribution: UTM + referrer captured on lead insert (already wired in `LeadCaptureModal`)
- Modus pulls weekly + monthly counts, surfaces in RUN signals — "leads down 30% wk-over-wk in Miami funnel"
- Search Console + Bing Webmaster connected after DNS lands
- Schema.org validation: every page run through Rich Results Test before merging to main

---

## Build phasing

**Phase 1 (this push)** — Industries + use-cases + geo×industry combo template + sitemap. ~53 indexable pages. SEO foundation lands in one PR.

**Phase 2** — JSON-LD schema generators per page type. Plausible. Search Console + Bing Webmaster connection.

**Phase 3** — Found cron generator goes live (daily article DRAFT). Owner workflow in Modus to publish.

**Phase 4** — Comparison pages (`/vs/zapier` etc) and educational deep guides. Higher effort, lower urgency.
