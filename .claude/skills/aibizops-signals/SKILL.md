---
name: aibizops-signals
description: Use when working with the AI_BIZ_OPS Found-driven article engine — the `aibizops:foundSignals` agent in mcm_agents that turns Found signals into engineering-voiced articles. Triggers on tasks like "generate an article", "review signals", "publish a draft", or anything touching aibizops_articles / found_signals tables.
---

# AI_BIZ_OPS — Found Signals Agent

The article engine is a **registered agent**, not a wrapper. Discipline lives in one place.

## What it is

- **Agent key:** `aibizops:foundSignals` (registered in `mcm_agents` table, product='platform', metadata.owner_product='aibizops')
- **Model:** `llama-3.3-70b-versatile` on Groq (cheap + fast for long-form generation)
- **Harness:** `runAgentLoop` in `mcm-agents/server/src/lib/agents.ts`
- **Tools:**
  - `aibizops-list-found-signals` — read `found_signals` rows by score/recency, optionally exclude already-articled URLs
  - `aibizops-insert-article-draft` — write to `aibizops_articles` as DRAFT + best-effort fal.ai hero image
- **Skill at:** `.claude/skills/aibizops-signals/SKILL.md` (this file)

## How to invoke it

Production path — the admin UI calls:

```
POST /aibizops/articles/generate     (admin auth — Tier 3)
{
  "signals": [{ "id":"...", "title":"...", "summary":"...", "url":"...", "tags":["..."] }],
  "categoryHint": "engineering" | "case_study" | "industry_news"  // optional
}
```

Returns `{ article: { id, slug, status: 'draft', hero_image_url }, agent: { steps, tokens, latency_ms } }`.

The agent will:
1. Inspect the cluster
2. Optionally pull more signals via `aibizops-list-found-signals` if the cluster is thin
3. Draft the article in its head
4. Call `aibizops-insert-article-draft` to persist
5. Return the slug + a one-line confirmation

The handler reads the inserted row from the tool result — never re-parses the agent's text.

## How to edit the agent

1. **Prompt / model / temperature:** edit the row in `mcm_agents` directly (or via the agent-builder UI), then `POST /hooks/agent-reload { "key": "aibizops:foundSignals" }` to pick up the change without a redeploy.
2. **Tools:** edit `mcm-agents/server/src/mastra/tools/aibizops/<tool>.ts`, then deploy (rsync to Hostinger + `docker compose up -d --force-recreate delai_mastra`).
3. **Tool list (which tools the agent can call):** edit the `tools` array on the `mcm_agents` row.

## What NOT to do

- **Do not inline a SYSTEM prompt + Groq fetch in a route handler.** That's a wrapper. The pre-2026-05-03 `handleGenerateArticle` did this — see the Y-Elmer audit at `docs/agent-audits/2026-05-01-aibizops.md` (TBD).
- **Do not bypass the agent for new generation paths.** The Hostinger cron at `/usr/local/bin/aibizops-articles.sh` currently calls a script that talks to Groq directly — that gets refactored in PR-A to call the agent endpoint.
- **Do not skip the `source_urls` field** when calling `aibizops-insert-article-draft`. Articles without citations are not auditable.

## Admin UI

- `/admin/signals` — live `found_signals` feed, "Generate" button per cluster → calls the agent endpoint
- `/admin/intelligence` — list of articles with status (draft/published), publish toggle

Both gated by `AuthGate` (`@mycloudmenu.com`, `@myfluxe.com`, `deleonea@gmail.com`).

## Telemetry

Currently telemetry inherits from the platform-level `agent_calls` writer (none registered yet for aibizops). PR-B adds `aibizops_agent_calls` + `aibizops_agent_health` view following the BiTES + Munchies pattern.
