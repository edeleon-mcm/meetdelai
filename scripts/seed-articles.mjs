// Seeds three founding articles for /aibizops/articles via direct LLM call
// + service-role insert. One per category: engineering, case_study,
// industry_news. Articles land as DRAFT — flip to published in Modus when
// you're happy with the voice.
//
// Usage: node /tmp/seed-articles.mjs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bzmsvnonamwmuhpqinlq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;

if (!SERVICE_ROLE_KEY) { console.error('SUPABASE_SERVICE_ROLE_KEY required'); process.exit(1); }
if (!GROQ_KEY) { console.error('GROQ_API_KEY required'); process.exit(1); }

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const SYSTEM = `You are SYS_ARCHITECT, the technical content engine for AI_BIZ_OPS — a brand that delivers practical AI automation for growth-minded businesses. Your voice is engineering-first, anti-fluff, anti-chatbot. Every article must teach the reader something they can implement, not just describe trends.

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

const SEEDS = [
  {
    category: 'engineering',
    user: `Write an engineering article about RAG (retrieval-augmented generation) deployment patterns for small businesses. Focus on the gap between hello-world tutorials and production: chunking strategy, embedding model choice, vector DB cost trade-offs, retrieval evaluation, and citation requirements. Include a concrete pseudo-architecture for a 50K-document KB serving < 4s queries on a SMB budget. Audience: an operator who has read AI buzz and is now picking up the wrench.`,
  },
  {
    category: 'case_study',
    user: `Write a case study article (no real client names) about an AI lead-routing engine deployed for a South Florida real estate brokerage. Cover: incoming volume (multi-channel — site, IG DMs, GBP, SMS), the classifier (intent + urgency), the routing logic, the integration with their CRM, and observed outcomes (response-time reduction, conversion lift). Make it feel like an engineer's post-mortem, not marketing. Include the actual signals they monitored.`,
  },
  {
    category: 'industry_news',
    user: `Write an industry-news article about the 2026 state of AI agents in operations: where they actually work in production today (lead intake, document parsing, voice agents), where they still fail (long-horizon reasoning, multi-step workflows without humans in the loop), and what the leverage looks like for SMBs. Cite three concrete capability shifts in 2026 and what they unlock for a 50-person business. No vendor cheerleading.`,
  },
];

async function generate(seed) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: seed.user },
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

for (const seed of SEEDS) {
  console.log(`[gen] ${seed.category} — calling Groq…`);
  let art;
  try {
    art = await generate(seed);
  } catch (err) {
    console.error(`[gen] failed: ${err.message}`);
    continue;
  }
  if (!art.slug || !art.title || !art.body_md) {
    console.error(`[gen] missing fields, skipping. got: ${Object.keys(art).join(',')}`);
    continue;
  }
  const rt = readingTime(art.body_md);
  const slug = String(art.slug).slice(0, 80).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const { data, error } = await sb
    .from('aibizops_articles')
    .insert({
      slug,
      title: String(art.title).slice(0, 200),
      hook: String(art.hook || '').slice(0, 200),
      body_md: String(art.body_md),
      category: ['engineering', 'case_study', 'industry_news'].includes(art.category) ? art.category : seed.category,
      tags: Array.isArray(art.tags) ? art.tags.slice(0, 8) : [],
      hero_image_prompt: String(art.hero_image_prompt || '').slice(0, 500),
      word_count: rt.words,
      reading_time_min: rt.mins,
      status: 'draft',
    })
    .select('id, slug, title, status, word_count, reading_time_min')
    .single();
  if (error) {
    console.error(`[gen] insert failed: ${error.message}`);
    continue;
  }
  console.log(`[ok] ${data.category || seed.category} → ${data.slug} (${data.word_count}w, ${data.reading_time_min}m) status=${data.status}`);
}

console.log('\n[done] Articles inserted as DRAFT. Review in Supabase or Modus, flip to status=published when ready.');
