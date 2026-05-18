/**
 * REAL Found-driven article generator. Pulls top recent signals from
 * `found_signals` (the live Found intelligence pipeline output),
 * clusters them by tag overlap, and generates one article per cluster
 * via Groq with the SYS_ARCHITECT prompt. Source URLs from each
 * cluster get attached as `source_links` so articles cite the actual
 * news/papers they synthesize from.
 *
 * Distributes across categories by classifying each cluster:
 *   engineering  — signals tagged with deploy/eval/rag/architecture/code
 *   case_study   — signals tagged with customer/case/deployment/launch
 *   industry_news — everything else (announcements, research, trends)
 *
 * Run: SUPABASE_SERVICE_ROLE_KEY=… GROQ_API_KEY=… node scripts/generate-from-found.mjs
 *      [--count=12] [--dry-run]
 */

import { createClient } from '@supabase/supabase-js';
import { generateForArticle } from './generate-article-images.mjs';

const SUPABASE_URL = 'https://bzmsvnonamwmuhpqinlq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;

if (!SERVICE_ROLE_KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY required'); process.exit(1); }
if (!GROQ_KEY) { console.error('GROQ_API_KEY required'); process.exit(1); }

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=').concat(['true']).slice(0, 2)));
const TARGET_COUNT = Number(args.count ?? 12);
const DRY = !!args['dry-run'];

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SYSTEM = `You are SYS_ARCHITECT, the technical content engine for AI_BIZ_OPS — a brand that delivers practical AI automation for growth-minded businesses. Your voice is engineering-first, anti-fluff, anti-chatbot. Every article must teach the reader something they can implement, not just describe trends.

You synthesize multiple real signals into one cohesive article. Cite the signals as natural references in the body when relevant. Pull a tight engineering-grade thread that ties the cluster together — don't just summarize each signal in turn.

Format STRICT JSON, no prose:
{
  "slug": "kebab-case-url-slug-max-80-chars",
  "title": "Title Case, max 90 chars, specific outcome-driven",
  "hook": "Single sentence under 160 chars that frames the operational problem",
  "body_md": "Full article in markdown, 800-1200 words. Sections with ## headers. Include at least one concrete deployment example (code, architecture, or step-by-step). End with a 'Bottom line' paragraph.",
  "category": "engineering|case_study|industry_news",
  "tags": ["3-6 lowercase snake_case tags"],
  "hero_image_prompt": "1-sentence prompt describing an industrial blueprint / engineering schematic style hero image, terracotta + black on cream, monospace overlays, no people, no text in image"
}`;

const ENGINEERING_TAGS = new Set(['deploy', 'deployment', 'rag', 'eval', 'architecture', 'inference', 'fine_tuning', 'vector_db', 'mlops', 'infrastructure', 'code', 'sdk', 'api', 'open_source', 'embedding', 'latency', 'cost']);
const CASE_TAGS = new Set(['customer', 'case_study', 'launch', 'enterprise', 'production', 'business', 'startup', 'company', 'adoption', 'real_world', 'rollout']);

function classifyCluster(tags) {
  const lower = tags.map((t) => String(t).toLowerCase());
  if (lower.some((t) => ENGINEERING_TAGS.has(t))) return 'engineering';
  if (lower.some((t) => CASE_TAGS.has(t))) return 'case_study';
  return 'industry_news';
}

function jaccardSim(a, b) {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const A = new Set(a.map((x) => String(x).toLowerCase()));
  const B = new Set(b.map((x) => String(x).toLowerCase()));
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

/** Greedy clustering — assigns each signal to the existing cluster with
 *  highest Jaccard tag overlap (≥0.25), or starts a new cluster. */
function clusterSignals(signals, maxPerCluster = 4) {
  const clusters = [];
  for (const s of signals) {
    let best = null;
    let bestSim = 0.25;
    for (const c of clusters) {
      if (c.length >= maxPerCluster) continue;
      const sim = jaccardSim(s.tags || [], c[0].tags || []);
      if (sim > bestSim) {
        bestSim = sim;
        best = c;
      }
    }
    if (best) best.push(s);
    else clusters.push([s]);
  }
  return clusters;
}

async function generate(cluster) {
  const seedBlocks = cluster
    .map((s, i) => `[${i + 1}] ${s.title}\n${s.what_happened || s.why_it_matters || ''}${s.source_url ? `\nSource: ${s.source_url}` : ''}`)
    .join('\n\n');
  const tagHint = Array.from(new Set(cluster.flatMap((s) => s.tags || []).map((t) => String(t).toLowerCase()))).slice(0, 8).join(', ');

  const userPrompt = `Synthesize one article from these real signals (pulled from Found's intelligence pipeline). Find the engineering thread that ties them together — don't summarize each one separately.

Signal cluster (shared tags: ${tagHint}):

${seedBlocks}

Produce the JSON shape exactly. The article should feel like a senior engineer connecting these dots for an SMB operator deciding what to deploy.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? '{}');
}

function readingTime(md) {
  const words = md.split(/\s+/).filter(Boolean).length;
  return { words, mins: Math.max(1, Math.round(words / 220)) };
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log(`[found-gen] target=${TARGET_COUNT} dry=${DRY}`);

const since = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();
const { data: signals, error: fetchErr } = await sb
  .from('found_signals')
  .select('id, title, source, source_url, what_happened, why_it_matters, signal_score, tags, published_at')
  .gte('created_at', since)
  .gte('signal_score', 55)
  .order('signal_score', { ascending: false })
  .limit(60);

if (fetchErr) { console.error('[found-gen] fetch error:', fetchErr.message); process.exit(1); }
console.log(`[found-gen] pulled ${signals.length} fresh signals (score≥55, last 21d)`);

if (!signals.length) {
  console.error('[found-gen] no signals — Found pipeline empty?');
  process.exit(1);
}

const clusters = clusterSignals(signals).slice(0, TARGET_COUNT);
console.log(`[found-gen] formed ${clusters.length} clusters`);

// Track existing slugs so we don't dup-key
const { data: existing } = await sb.from('aibizops_articles').select('slug');
const existingSlugs = new Set((existing || []).map((r) => r.slug));

let inserted = 0;
let skipped = 0;
for (const cluster of clusters) {
  const clusterTags = Array.from(new Set(cluster.flatMap((s) => s.tags || []).map((t) => String(t).toLowerCase())));
  const fallbackCategory = classifyCluster(clusterTags);
  const sigSummary = cluster.map((s) => `"${s.title}"`).join(' + ');
  console.log(`\n[found-gen] cluster (${cluster.length} signals · ${fallbackCategory}): ${sigSummary.slice(0, 120)}`);

  if (DRY) { skipped++; continue; }

  let art;
  try {
    art = await generate(cluster);
  } catch (err) {
    console.error(`[found-gen] gen failed: ${err.message}`);
    continue;
  }
  if (!art.slug || !art.title || !art.body_md) {
    console.error(`[found-gen] missing fields, got: ${Object.keys(art).join(',')}`);
    continue;
  }

  let slug = String(art.slug).slice(0, 80).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  // Avoid slug collisions
  let suffix = 2;
  while (existingSlugs.has(slug)) {
    slug = `${slug}-${suffix++}`.slice(0, 80);
  }
  existingSlugs.add(slug);

  const rt = readingTime(art.body_md);
  // LLM consistently defaults to 'engineering' regardless of cluster shape,
  // so use the heuristic classifier (driven by the cluster's actual tags)
  // as the source of truth. Keeps categories balanced.
  const category = fallbackCategory;

  const { data: row, error: insErr } = await sb
    .from('aibizops_articles')
    .insert({
      slug,
      title: String(art.title).slice(0, 200),
      hook: String(art.hook || '').slice(0, 200),
      body_md: String(art.body_md),
      category,
      tags: Array.isArray(art.tags) ? art.tags.slice(0, 8).map((t) => String(t).slice(0, 32)) : clusterTags.slice(0, 6),
      hero_image_prompt: String(art.hero_image_prompt || '').slice(0, 500),
      source_signal_ids: cluster.map((s) => s.id),
      source_links: cluster
        .filter((s) => s.source_url)
        .map((s) => ({ title: s.title, url: s.source_url })),
      word_count: rt.words,
      reading_time_min: rt.mins,
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .select('id, slug, category, word_count')
    .single();

  if (insErr) {
    console.error(`[found-gen] insert error: ${insErr.message}`);
    continue;
  }
  inserted++;
  console.log(`[ok] ${row.category}/${row.slug} (${row.word_count}w)`);

  // Generate hero image (best-effort — failure here doesn't block the article)
  if (process.env.FAL_KEY) {
    const url = await generateForArticle({
      id: row.id,
      slug: row.slug,
      title: art.title,
      hook: art.hook,
      category: row.category,
    }, { sb });
    if (url) console.log(`[img] ${row.slug} -> ${url.split('/').pop()}`);
  }
}

console.log(`\n[done] inserted=${inserted} skipped=${skipped} total_clusters=${clusters.length}`);
