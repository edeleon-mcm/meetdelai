# meetdelai.com

Personal brand site for Edwin De Leon / DELAI. Founder showcase + portfolio + advisory CTA + writing archive.

## Stack
- React 19 + Vite 7 + TypeScript + Tailwind 3
- Monochrome DELAI design system (`#06080c` bg, Instrument Serif + DM Sans + Space Mono, no border-radius, no gradients)
- Backend: Mastra DELAI on Hostinger — `api.thefoundai.app/delai/*`
- Schema: Supabase `bzmsvnonamwmuhpqinlq` — `delai_leads`, `delai_articles`

## Routes
| Path | Page |
|---|---|
| `/` | Landing — founder hero, DELAI portfolio, how-I-work, advisory CTA |
| `/intelligence` | Writing archive — list of essays |
| `/intelligence/:slug` | Essay detail (markdown render) |

## Local
```bash
cp .env.example .env
npm install
npm run dev
```

Build: `npm run build` (prebuild generates sitemap; postbuild prerenders static HTML for crawlers).

## Hosting
- **GitHub:** `edeleon-mcm/meetdelai`
- **Vercel project:** `meetdelai`
- **Production domain:** `meetdelai.com`
- **Auto-deploy:** push to `main` → Vercel builds + promotes to production.

### Vercel env (production)
| Key | Value |
|---|---|
| `VITE_API_URL` | `https://api.thefoundai.app` (default) |

## Backend endpoints used
| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/delai/leads` | anon (public) | Lead capture from contact form |
| `GET` | `/delai/articles` | anon | Writing archive list |
| `GET` | `/delai/articles/:slug` | anon | Essay detail |

Backend lives in `mcm-agents/server/src/api/routes/delai.ts` (Hostinger Mastra, `PRODUCT_FILTER=delai`).

## DELAI portfolio links
- Found — `https://thefoundai.app`
- Modus — `https://modus-chi.vercel.app`
- BiTES — `https://bites.mycloudmenu.com`
- HostGPT — `https://myhostgpt.com`
- PAGE — `https://meetpage.app`
- Munchies — `https://munchies.pr`

Update `PORTFOLIO` in `src/pages/Landing.tsx` and `src/components/Footer.tsx` when adding new products.
