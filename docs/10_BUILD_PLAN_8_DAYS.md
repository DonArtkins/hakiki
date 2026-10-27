# 10 — Build Plan (Tue 27 Oct → Wed 4 Nov, internal submit noon EAT)

Rhythm: 6–8 focused hours/day. Every day ends with **a deployed, working thing** (even if ugly). Commit hourly.

## 0. Schedule at a glance

| Day | Date | Goal | Exit test |
|---|---|---|---|
| 0 | Tue 27 Oct | Setup, smoke tests, scaffold, deploy "hello" | `/api/health` live on Vercel; smoke test results in `docs/SMOKE_TEST.md` |
| 1 | Wed 28 | Engine core: schemas, Meta client, rules, M-Pesa validator, extraction | `pnpm test` green; CLI `pnpm check "text"` prints findings + extraction |
| 2 | Thu 29 | Agent + SSE + hero UI | Paste scam → streamed verdict in browser (local + Vercel) |
| 3 | Fri 30 | DB, sessions, history, i18n EN/SW, Telegram bot | Same verdict in Telegram; history persists; first 30 eval cases |
| 4 | Sat 31 | Guardian mode, community indicators, share card | Guardian gets Telegram ping; card downloads |
| 5 | Sun 1 Nov | **FEATURE FREEZE** · evals to 60+ · PWA share-target · SAM (time-boxed) | Eval report generated; share from Android works |
| 6 | Mon 2 | Hardening, mobile polish, usability test, record video | Raw footage done; budget kill-switch tested |
| 7 | Tue 3 | Edit video, README, repo clean, final eval numbers | Video 2:50–3:00 exported; README complete |
| 8 | Wed 4 | Submit by 12:00 EAT | Confirmation screenshot saved |

Evenings: Agents 101 (Tue 19:00), Agents 102 (Wed 19:00), Fireworks (Fri 19:00). Stay for the first 30 minutes only if time is short; the recordings may be posted in Discord.

## 1. Day 0 detail (tonight/today)

1. Claim credits, Baseten/Modal, Discord (file 00 §3).
2. `pnpm create next-app hakiki --ts --tailwind --app --src-dir`, add deps (file 04 §11), `git init`, public GitHub repo, MIT license, `.gitignore` incl. `.env*`.
3. Copy `CLAUDE.md` + `docs/`.
4. Run the smoke test (file 04 §9). **If the API fails from Kenya → post in Discord `#questions` immediately and switch `MODEL_BASE_URL` to a Baseten/Fireworks endpoint.**
5. Create Neon DB, Upstash Redis, Vercel project; add env vars (file 11 §2); deploy.
6. Test real M-Pesa SMS date code (today should be `UJR…`).

## 2. Day-by-day Claude Code prompts (copy/paste, adjust)

Use one prompt per task; start a fresh session per day; keep `CLAUDE.md` loaded.

**D1-a** "Read CLAUDE.md and docs/03, docs/09 §1. Create `src/engine/schemas.ts` with Zod `Extraction`, `RuleFinding`, `Verdict` exactly as specified. Add `src/lib/meta.ts` as in docs/04 §3."

**D1-b** "Implement `src/engine/rules/` per docs/03 §5 (R01–R14), each a pure function with Vitest tests: at least 3 positive and 2 negative cases per rule. M-Pesa validator per sketch; tests must use dates 2025-10-27 → `TJR` and 2026-10-27 → `UJR` prefixes."

**D1-c** "Implement `src/engine/extract.ts` using Responses API with structured output (docs/04 §4). Text-only input: regex first, call the model only if no sender/phone/url found. Add `scripts/check.ts` CLI."

**D2-a** "Implement `src/engine/agent.ts` per docs/03 §4 and docs/04 §5 with three read-only tools backed by `data/playbook`. Max 3 turns, 25 s abort, rules-only fallback, one repair retry."

**D2-b** "Implement `POST /api/check` as SSE with events stage/rules/verdict/done/error. Add `ground.ts` that maps reasons' `quote` to spans in extracted text."

**D2-c** "Build home page + result view per docs/08 §3 using tokens in docs/07 §3. Mobile first. Stage chips, highlighted text, VerdictCard, bilingual strings from `src/lib/i18n`."

**D3-a** "Create Drizzle schema from docs/05 §2, migrations, seed `scam_types` from `data/playbook`. Implement anonymous session per docs/06 §2."

**D3-b** "History page + `GET /api/checks`. Persist verdicts (no bodies) and hashed indicators per docs/05 §3."

**D3-c** "grammY webhook at `/api/telegram/webhook` using the same `runCheck()`; edit message as stages complete; HTML parse mode; `/start`, `/lang`, `/delete`, link code flow docs/06 §3."

**D4-a** "Guardian flow per docs/06 §4 including consent screen and notification to Telegram or inbox. No message content in notifications."

**D4-b** "Community indicators: upsert on check, thresholds ≥3 reports & ≥2 devices, `community_lookup` tool, UI line."

**D4-c** "Share card: `/api/share/[id]` with `@vercel/og`, background from `public/cards/<scam_type>.png`, bilingual text, 1080×1350. Add `/s/[slug]` public page."

**D5-a** "Build `evals/run.ts` per docs/09 §5, with `--mode rules|full|llm-only`; write `evals/report.md`."

**D5-b** "PWA manifest + service worker + `/share` handler per docs/08 §5."

**D5-c** (time-box 3 h) "SAM face redaction per docs/04 §6; fall back to box blur."

**D6-a** "Add budget kill-switch per docs/06 §7 and admin endpoint. Add tests with mocked Redis."

**D6-b** "Accessibility and low-end pass: contrast, aria-live, bundle size < 250 KB first load. Fix Lighthouse issues ≥ 90 mobile."

## 3. Cut lines (apply honestly; decide at the stated time)

| Time | If behind… | Cut |
|---|---|---|
| End Day 2 (Thu night) | Hero flow not streaming | Cut Telegram; focus web |
| End Day 3 | DB not done | Use in-memory + cookie history only; cut guardians' DB (keep as mock in video? **No**, don't fake — cut it) |
| End Day 4 | Share card not done | Plain HTML share page, no Muse Image (note: Meta tooling score then = Spark + SAM; consider one cheap Image call for backgrounds) |
| Day 5 | SAM bad | Cut SAM; mention as roadmap |
| Day 5 | Evals < 40 cases | Ship what you have; report honest n |
| Sun 1 Nov | Anything unfinished | **Freeze.** Days 6–7 are for video and polish only |

Never show a feature in the video that isn't live.

## 4. Daily ritual (10 min)

Morning: read yesterday's commit log; write today's 3 outcomes in `docs/LOG.md`. Evening: deploy, run `pnpm test`, push, post a one-line update in Discord.

## 5. Definition of done (submission)

- [ ] Public URL works on mobile data without login
- [ ] Hero flow ≤ 8 s p50; streaming visible
- [ ] EN + SW complete
- [ ] Telegram bot live (or removed from README)
- [ ] ≥ 60 eval cases and report in README
- [ ] Budget kill-switch tested
- [ ] README: problem, demo link, architecture diagram, model-use table, evals, privacy, limitations, setup
- [ ] Video ≤ 3:00 uploaded (YouTube unlisted/public)
- [ ] No secrets in repo (`gitleaks detect`)
- [ ] Submission form filled and confirmation saved

## 6. Time-saving rules for a solo first-timer

1. Copy the layout of file 03 §9 exactly. Don't reinvent structure.
2. Ugly-but-working beats beautiful-but-broken until Day 5.
3. Never debug for more than 30 minutes alone: ask Claude Code with the error + file, or ask in Discord.
4. Use real device testing early (Day 2), not Day 6.
5. Don't build admin dashboards. Use SQL in Neon console.

## 7. Credit budget ($150 Meta credit)

| Bucket | Plan | Notes |
|---|---|---|
| Claude Code on Muse (dev) | ≤ **$50** | If using Anthropic-route to Meta; tight prompts; `/clear` often. If Contributor model works for coding, ~13× cheaper |
| Evals | ≤ **$25** | 60 cases × ~$0.02 × 4 modes ≈ $5 per full pass; budget 5 passes |
| Demo / testing during dev | ≤ **$10** | Hundreds of checks |
| Muse Image | ≤ **$2** | 16 backgrounds + retries |
| SAM | ≤ **$3** | $2.50 / 1k images |
| **Runtime reserve (public link, judging week)** | **≥ $60** | Kill-switch total cap $40 + ~$20 slack |
| Contingency | ~$0–10 | |

Track daily: `select date(created_at), sum(cost_usd) from model_calls group by 1` plus the Meta console. If dev spending hits $50 before Day 4, switch coding to Claude with your own plan, or the Contributor route, or write more by hand.
