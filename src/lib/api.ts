// Public API client for meetdelai.com — Mastra DELAI server on Hostinger.
// All endpoints are anonymous; leads/articles use RLS-gated anon insert/read.

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.thefoundai.app';

export interface LeadInput {
  contact_name: string;
  email: string;
  business_name?: string;
  phone?: string;
  website?: string;
  goal?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  referrer?: string;
}

export async function createLead(body: LeadInput): Promise<{ id: string } | null> {
  const utm = readUtm();
  const res = await fetch(`${API_BASE}/delai/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...utm,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      ...body,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.lead ?? null;
}

function readUtm(): Partial<LeadInput> {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  const out: Partial<LeadInput> = {};
  const keys: Array<keyof LeadInput> = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'];
  for (const k of keys) {
    const v = p.get(k as string);
    if (v) (out as any)[k] = v;
  }
  return out;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  hook?: string;
  hero_image_url?: string;
  category: 'engineering' | 'case_study' | 'industry_news';
  tags?: string[];
  reading_time_min?: number;
  published_at: string;
}

export interface Article extends ArticleSummary {
  body_md: string;
  body_html?: string;
  source_links?: Array<{ title: string; url: string }>;
  word_count?: number;
}

export async function listArticles(params: { category?: string; limit?: number; offset?: number } = {}): Promise<ArticleSummary[]> {
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.limit) q.set('limit', String(params.limit));
  if (params.offset) q.set('offset', String(params.offset));
  const res = await fetch(`${API_BASE}/delai/articles${q.toString() ? '?' + q : ''}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles ?? [];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const res = await fetch(`${API_BASE}/delai/articles/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.article ?? null;
}
