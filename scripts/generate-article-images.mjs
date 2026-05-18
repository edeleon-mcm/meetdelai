// Backfills hero_image_url for articles in aibizops_articles using fal.ai
// Flux Dev. Uploads PNGs to the aibizops-images Supabase Storage bucket
// (public) and writes the public URL back to the row.
//
// Usage:
//   FAL_KEY=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate-article-images.mjs
//
// Optional flags:
//   --slug=<slug>   regenerate just one article (overwrites existing image)
//   --force         regenerate even if hero_image_url is already set
//   --limit=N       cap how many to process (default: all)

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { setTimeout as sleep } from 'node:timers/promises';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bzmsvnonamwmuhpqinlq.supabase.co';
const SR = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FAL_KEY = process.env.FAL_KEY;
const BUCKET = 'aibizops-images';

// Model selection. Flux Schnell is ~8x cheaper than Flux Dev with editorial-
// good quality — fine for blueprint-style hero images. Override with
// IMAGE_MODEL=flux-dev (or flux-pro) when you want higher fidelity.
const MODELS = {
  'flux-schnell': { slug: 'fal-ai/flux/schnell', cost: 0.003, label: 'Flux Schnell' },
  'flux-dev':     { slug: 'fal-ai/flux/dev',     cost: 0.025, label: 'Flux Dev' },
  'flux-pro':     { slug: 'fal-ai/flux-pro/v1.1', cost: 0.04,  label: 'Flux Pro 1.1' },
};
const MODEL_KEY = process.env.IMAGE_MODEL || 'flux-schnell';
const MODEL = MODELS[MODEL_KEY] || MODELS['flux-schnell'];
const COST_PER_IMAGE = MODEL.cost;
const MAX_BUDGET = Number(process.env.MONTHLY_BUDGET_USD || 5);

function requireEnv() {
  if (!SR) throw new Error('SUPABASE_SERVICE_ROLE_KEY required');
  if (!FAL_KEY) throw new Error('FAL_KEY required');
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

let _sb;
function getSb() {
  if (!_sb) _sb = createClient(SUPABASE_URL, SR, { auth: { persistSession: false } });
  return _sb;
}

// ── Prompt builder ────────────────────────────────────────────────────────
//
// Brand: AI_BIZ_OPS — brutalist + blueprint, terracotta + ink + cream.
// Articles are technical content for SMB operators. Hero images should
// feel like industrial schematics, not stock illustrations.

function buildPrompt({ title, hook, category }) {
  const categoryHint = {
    engineering: 'engineering schematic with technical diagrams, isometric machinery, exposed cabling',
    case_study: 'industrial blueprint of a deployed system, annotated nodes connected by clean lines, sense of finished work',
    industry_news: 'editorial industrial illustration, abstract representation of a market force or capability shift',
  }[category] || 'industrial blueprint';

  // Anchor the visual language tightly so the set looks coherent.
  return [
    `Brutalist industrial illustration: ${categoryHint}.`,
    `Subject: "${title}".`,
    hook ? `Concept: ${hook}.` : '',
    'Style: terracotta orange (#F54E00) + deep ink black + cream paper background (#fff8f6).',
    'Hard 2px black borders, no gradients, no soft shadows, no glow, no neon.',
    'Monospace technical labels and tick marks scattered like blueprint annotations.',
    'Composition: centered, balanced, magazine cover energy.',
    'Aspect: 16:9, high detail, clean grain.',
    'NEGATIVE: no people, no faces, no readable English words, no logos, no stock-photo aesthetic, no 3D render, no AI giveaways like extra fingers or melted text.',
  ].filter(Boolean).join(' ');
}

// ── fal.ai submit + poll ──────────────────────────────────────────────────

async function falGenerate(prompt) {
  const r1 = await fetch(`https://queue.fal.run/${MODEL.slug}`, {
    method: 'POST',
    headers: { Authorization: `Key ${FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      image_size: { width: 1344, height: 768 }, // 16:9 hero
      num_images: 1,
      enable_safety_checker: false,
    }),
  });
  if (!r1.ok) throw new Error(`fal submit ${r1.status}: ${await r1.text()}`);
  const { status_url, response_url, request_id } = await r1.json();

  const deadline = Date.now() + 6 * 60 * 1000;
  while (Date.now() < deadline) {
    await sleep(2500);
    const sr = await fetch(status_url, { headers: { Authorization: `Key ${FAL_KEY}` } });
    if (!sr.ok) continue;
    const s = await sr.json();
    if (s.status === 'COMPLETED') break;
    if (s.status === 'FAILED' || s.status === 'ERROR') {
      throw new Error(`fal ${s.status}: ${JSON.stringify(s).slice(0, 300)}`);
    }
  }

  const fr = await fetch(response_url, { headers: { Authorization: `Key ${FAL_KEY}` } });
  if (!fr.ok) throw new Error(`fal result ${fr.status}`);
  const result = await fr.json();
  const url = result.images?.[0]?.url;
  if (!url) throw new Error(`no image: ${JSON.stringify(result).slice(0, 300)}`);
  return { url, request_id };
}

// ── Supabase Storage upload ───────────────────────────────────────────────

async function uploadPng(sbClient, slug, buf) {
  const key = `articles/${slug}-${Date.now()}.png`;
  const { error } = await sbClient.storage.from(BUCKET).upload(key, buf, {
    contentType: 'image/png',
    cacheControl: '31536000',
    upsert: true,
  });
  if (error) throw error;
  const { data } = sbClient.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

// ── Main ──────────────────────────────────────────────────────────────────

/**
 * Generate + upload + persist for one article. Reusable from
 * generate-from-found.mjs so newly inserted articles immediately get a
 * hero image.
 *
 * Returns the public URL (or null if skipped/failed).
 */
export async function generateForArticle({ id, slug, title, hook, category }, opts = {}) {
  requireEnv();
  const sbClient = opts.sb || getSb();
  if (!opts.force) {
    const { data: existing } = await sbClient
      .from('aibizops_articles')
      .select('hero_image_url')
      .eq('id', id)
      .single();
    if (existing?.hero_image_url) return existing.hero_image_url;
  }
  try {
    const prompt = buildPrompt({ title, hook, category });
    const { url: falUrl } = await falGenerate(prompt);
    const imgRes = await fetch(falUrl);
    if (!imgRes.ok) throw new Error(`download fal img ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const publicUrl = await uploadPng(sbClient, slug, buf);
    const { error: upErr } = await sbClient
      .from('aibizops_articles')
      .update({ hero_image_url: publicUrl })
      .eq('id', id);
    if (upErr) throw upErr;
    return publicUrl;
  } catch (e) {
    console.error(`[image-gen] ${slug}: ${e.message}`);
    return null;
  }
}

async function main() {
  requireEnv();
  const sb = getSb();
  let q = sb.from('aibizops_articles').select('id, slug, title, hook, category, hero_image_url').order('published_at', { ascending: false });
  if (args.slug) q = q.eq('slug', args.slug);
  else if (!args.force) q = q.is('hero_image_url', null);
  if (args.limit) q = q.limit(Number(args.limit));

  const { data: articles, error } = await q;
  if (error) throw error;
  if (!articles?.length) {
    console.log('No articles need images.');
    return;
  }

  const totalCost = articles.length * COST_PER_IMAGE;
  if (totalCost > MAX_BUDGET) {
    console.error(`Budget guard: ${articles.length} × $${COST_PER_IMAGE} = $${totalCost.toFixed(2)} > $${MAX_BUDGET}.`);
    console.error('Set MONTHLY_BUDGET_USD higher or use --limit.');
    process.exit(1);
  }

  console.log(`Generating ${articles.length} images (~$${totalCost.toFixed(2)} on ${MODEL.label})…`);

  let ok = 0, fail = 0;
  for (const a of articles) {
    process.stdout.write(`  • ${a.slug.padEnd(48)} `);
    try {
      const prompt = buildPrompt(a);
      const { url: falUrl } = await falGenerate(prompt);
      const imgRes = await fetch(falUrl);
      if (!imgRes.ok) throw new Error(`download fal img ${imgRes.status}`);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const publicUrl = await uploadPng(sb, a.slug, buf);
      const { error: upErr } = await sb
        .from('aibizops_articles')
        .update({ hero_image_url: publicUrl })
        .eq('id', a.id);
      if (upErr) throw upErr;
      console.log(`✓  ${publicUrl}`);
      ok++;
    } catch (e) {
      console.log(`✗  ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone. ${ok} ok, ${fail} failed. Spent ~$${(ok * COST_PER_IMAGE).toFixed(2)}.`);
}

// Only run main() when this file is invoked directly, not when imported
const isDirect = (() => {
  try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; }
})();
if (isDirect) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
