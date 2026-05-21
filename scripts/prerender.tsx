/**
 * Slim prerender for meetdelai.com — emits static HTML for /, /intelligence,
 * and /intelligence/:slug so crawlers see content, not an empty root.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as React from 'react';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://meetdelai.com';
const ARTICLES_API = (process.env.VITE_API_URL || 'https://api.thefoundai.app') + '/delai/articles?limit=200';

interface Article {
  id: string;
  slug: string;
  title: string;
  hook?: string;
  hero_image_url?: string;
  category?: string;
  tags?: string[];
  reading_time_min?: number;
  published_at?: string;
}

async function fetchArticles(): Promise<Article[]> {
  try {
    const res = await fetch(ARTICLES_API);
    if (!res.ok) return [];
    const data = (await res.json()) as { articles?: Article[] };
    return data.articles ?? [];
  } catch {
    return [];
  }
}

const PORTFOLIO = [
  { name: 'Found',    tag: 'Operational intelligence',  blurb: 'Operational intelligence for people and teams.' },
  { name: 'Modus',    tag: 'SMB automation',            blurb: 'Automation systems for SMB operations.' },
  { name: 'BiTES',    tag: 'Food intelligence',         blurb: 'AI-powered food intelligence and nutrition tracking.' },
  { name: 'HostGPT',  tag: 'Hospitality AI',            blurb: 'Hospitality AI for guest communication and operations.' },
  { name: 'PAGE',     tag: 'Payments',                  blurb: 'Modern payment tools for independent operators.' },
  { name: 'Munchies', tag: 'Conversational ordering',   blurb: 'Conversational ordering and delivery infrastructure.' },
];

const CAPABILITIES = [
  { name: 'AI Assistants',                body: 'Voice, chat, and operational AI systems designed around real customer interactions and internal workflows.' },
  { name: 'Operational Automation',       body: 'Workflow engines that connect fragmented systems, automate repetitive tasks, and reduce operational drag.' },
  { name: 'Customer Experience Systems',  body: 'Ordering, payments, communication, and service flows designed for modern customer expectations.' },
  { name: 'Internal Intelligence',        body: 'Knowledge systems that help businesses organize information, preserve context, and operate more intelligently over time.' },
];

const OPERATING_PRINCIPLES = [
  'Observability from day one',
  'Human approval loops where needed',
  'Workflow reliability over AI hype',
  'Fast iteration cycles',
  'Real operational deployment',
  'Long-term maintainability',
];

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-line bg-bg px-5 sm:px-8 py-4">
        <a href="/" className="font-display text-xl text-ink">DELAI.</a>
        <div className="flex items-center gap-8 font-body text-sm">
          <a href="/" className="text-ink-muted">Home</a>
          <a href="/intelligence" className="text-ink-muted">Writing</a>
          <a href="mailto:hello@meetdelai.com" className="text-ink-muted">Contact</a>
        </div>
      </nav>
      {children}
      <footer className="mt-24 border-t border-line">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12">
          <p className="font-display text-2xl text-ink">DELAI.</p>
          <p className="mt-2 text-sm text-ink-muted">© {new Date().getFullYear()} DeLeonAI Holdings LLC</p>
        </div>
      </footer>
    </>
  );
}

function HomePage() {
  return (
    <Chrome>
      <main>
        <section className="mx-auto max-w-6xl px-5 sm:px-8 pt-20 sm:pt-32 pb-24">
          <p className="label-mono mb-8">DELAI</p>
          <h1 className="font-display text-headline-xl text-ink max-w-4xl">
            Operational AI for real businesses.
          </h1>
          <p className="mt-8 text-body-lg text-ink-muted max-w-3xl">
            The next generation of business software will not be dashboards and manual workflows.
            It will be systems that observe, respond, automate, and operate alongside the business in real time.
          </p>
          <p className="mt-4 text-body-lg text-ink max-w-3xl">DELAI builds those systems.</p>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
            <p className="label-mono mb-6">Built for operators</p>
            <h2 className="font-display text-headline-lg text-ink max-w-3xl">
              Restaurants. Hospitality. Service businesses. Property operations. Local commerce.
            </h2>
            <p className="mt-8 text-body-md text-ink-muted max-w-3xl">
              Businesses that move fast do not need more software tabs. They need operational systems that reduce friction,
              automate repetitive work, improve customer experience, and help teams move faster with less overhead.
            </p>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
            <p className="label-mono mb-6">What DELAI builds</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {CAPABILITIES.map((c) => (
                <div key={c.name} className="border border-line p-6">
                  <h3 className="font-display text-2xl text-ink">{c.name}</h3>
                  <p className="mt-3 text-sm text-ink-muted">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
            <p className="label-mono mb-6">Products in production</p>
            <p className="mt-2 text-body-md text-ink-muted max-w-3xl">
              Every DELAI product operates as a live testing ground for the systems, infrastructure, and workflows behind the platform.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PORTFOLIO.map((p) => (
                <div key={p.name} className="border border-line p-6">
                  <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                  <p className="label-mono mt-1">{p.tag}</p>
                  <p className="mt-4 text-sm text-ink-muted">{p.blurb}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 py-24">
            <p className="label-mono mb-6">How DELAI operates</p>
            <h2 className="font-display text-headline-lg text-ink">Built for production.</h2>
            <p className="mt-4 text-body-md text-ink-muted max-w-3xl">
              The goal is not to generate demos. The goal is to create systems that survive real operational environments.
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {OPERATING_PRINCIPLES.map((p) => (
                <li key={p} className="border border-line p-5 text-sm text-ink">{p}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </Chrome>
  );
}

function IntelligenceIndex({ articles }: { articles: Article[] }) {
  return (
    <Chrome>
      <main className="mx-auto max-w-6xl px-5 sm:px-8 pt-20 sm:pt-32 pb-24">
        <p className="label-mono mb-6">Writing</p>
        <h1 className="font-display text-headline-xl text-ink">Notes from the operator chair.</h1>
        <div className="mt-12 grid gap-px bg-line">
          {articles.map((a) => (
            <a key={a.id} href={`/intelligence/${a.slug}`} className="block bg-bg p-6">
              <h2 className="font-display text-headline-md text-ink">{a.title}</h2>
              {a.hook ? <p className="mt-2 text-body-md text-ink-muted">{a.hook}</p> : null}
            </a>
          ))}
        </div>
      </main>
    </Chrome>
  );
}

function ArticleStub({ article }: { article: Article }) {
  return (
    <Chrome>
      <main className="mx-auto max-w-3xl px-5 sm:px-8 pt-20 sm:pt-32 pb-24">
        <p className="label-mono">{(article.category ?? 'essay').toUpperCase()}</p>
        <h1 className="mt-3 font-display text-headline-lg text-ink">{article.title}</h1>
        {article.hook ? <p className="mt-4 text-body-lg text-ink-muted">{article.hook}</p> : null}
        <p className="mt-12 text-body-md text-ink-muted">
          Full essay at <a href={`${ORIGIN}/intelligence/${article.slug}`} className="underline">{ORIGIN}/intelligence/{article.slug}</a>
        </p>
      </main>
    </Chrome>
  );
}

const indexHtmlTemplate = readFileSync(join(DIST, 'index.html'), 'utf-8');

function applyTemplate({ body, title, description, canonical }: { body: string; title: string; description: string; canonical: string }): string {
  let html = indexHtmlTemplate;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(description)}" />`);
  html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  if (!html.includes('rel="canonical"')) {
    html = html.replace('</head>', `    <link rel="canonical" href="${canonical}" />\n  </head>`);
  }
  if (!html.includes('<div id="root"></div>')) throw new Error('Could not find <div id="root"></div> in dist/index.html');
  html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  return html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function writeRoute(route: string, html: string): void {
  const path = route === '/' ? join(DIST, 'index.html') : join(DIST, route.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
}

async function main() {
  const articles = await fetchArticles();
  let count = 0;

  writeRoute('/', applyTemplate({
    body: renderToStaticMarkup(<HomePage />),
    title: 'DELAI — Operational AI for real businesses',
    description: 'DELAI builds operational AI systems for restaurants, hospitality, service businesses, and local commerce. Six products in production prove the platform works.',
    canonical: `${ORIGIN}/`,
  }));
  count++;

  writeRoute('/intelligence', applyTemplate({
    body: renderToStaticMarkup(<IntelligenceIndex articles={articles} />),
    title: 'Writing — DELAI',
    description: 'Essays on AI-native software, operator discipline, and building from scratch.',
    canonical: `${ORIGIN}/intelligence`,
  }));
  count++;

  for (const a of articles) {
    writeRoute(`/intelligence/${a.slug}`, applyTemplate({
      body: renderToStaticMarkup(<ArticleStub article={a} />),
      title: `${a.title} — DELAI`,
      description: a.hook || a.title,
      canonical: `${ORIGIN}/intelligence/${a.slug}`,
    }));
    count++;
  }

  console.log(`[prerender] wrote ${count} static HTML pages (${articles.length} articles)`);
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
