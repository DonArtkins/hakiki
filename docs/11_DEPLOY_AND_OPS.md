# 11 — Deploy & Ops

## 1. Accounts to create (all free tiers)

| Service | For | Notes |
|---|---|---|
| GitHub | Public repo, CI | MIT license |
| Vercel (Hobby) | Hosting | 300 s max duration with Fluid compute [VERIFIED]. Hobby is non-commercial: fine for hackathon |
| Neon | Postgres | Use the pooled connection string |
| Upstash | Redis | REST URL + token |
| Telegram `@BotFather` | Bot token | `/newbot` → "Hakiki" `@HakikiKEBot` (name may be taken; pick any) |
| Baseten / Modal | Open-weights bonus | Optional |
| Meta developer console | API key, credits | Set spend-limit notification |
| YouTube | Video host | Unlisted or public |

## 2. Environment variables

| Name | Where | Notes |
|---|---|---|
| `MODEL_API_KEY` | Vercel + local `.env.local` | Meta key |
| `MODEL_BASE_URL` | same | default `https://api.meta.ai/v1` |
| `MODEL_ID` | same | `muse-spark-1.3` |
| `DATABASE_URL` | same | Neon pooled |
| `UPSTASH_REDIS_REST_URL/TOKEN` | same | |
| `SESSION_SECRET` | same | `openssl rand -hex 32` |
| `INDICATOR_PEPPER` | same | `openssl rand -hex 32`; **never rotate** after launch without migration |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET` | same | |
| `ADMIN_TOKEN`, `JUDGE_CODE` | same | |
| `DAILY_CAP_USD=6`, `TOTAL_CAP_USD=40` | same | |
| `APP_URL` | same | `https://hakiki.vercel.app` |

Commit `.env.example` with names only.

## 3. Deploy steps

1. `vercel link` → `vercel env add` for each variable (Production + Preview).
2. `pnpm drizzle-kit migrate` against Neon (run locally with `DATABASE_URL`).
3. `pnpm db:seed`.
4. `vercel --prod`.
5. Telegram webhook:
   ```bash
   curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
     -d "url=$APP_URL/api/telegram/webhook" -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
   ```
   Handler must verify header `X-Telegram-Bot-Api-Secret-Token`.
6. Vercel cron (`vercel.json`): `{"crons":[{"path":"/api/cron/cleanup","schedule":"0 2 * * *"}]}` (Hobby allows daily crons). Guard with `CRON_SECRET`.
7. Custom domain (optional): not needed. `*.vercel.app` is fine.
8. Smoke test production from your phone on mobile data.

## 4. Route config reminders

```ts
// src/app/api/check/route.ts
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
```
SSE: return `new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "X-Accel-Buffering": "no" } })`. Flush a first event immediately.

## 5. CI (GitHub Actions)

`.github/workflows/ci.yml`: install → `pnpm lint` → `pnpm test` (rules + schemas) → `pnpm eval --mode rules` (no credits spent) → build. Add a badge to README.

## 6. Monitoring (cheap)

- `model_calls` table + a hidden `/admin/stats` (token-protected) showing: checks today, mean latency, cost today/total, error rate, top scam types.
- Vercel logs for 5xx. Log trace id per check; **never log message text** (use a `log()` wrapper that drops fields named `text`, `body`, `message`).
- UptimeRobot (free) ping `/api/health` every 5 min; health returns `{ok, db, redis, model:"skipped"}` without spending credits.

## 7. Fallbacks

| Failure | Plan B |
|---|---|
| Meta API outage on judging day | Rules-only mode already ships; banner explains. Also keep a recorded video |
| Credits exhausted | Kill-switch → rules-only; Spark Open on Baseten credits ($100) as secondary provider by env switch |
| Vercel limit hit | Redeploy on Render/Fly via Dockerfile (write one on Day 6 only if time) |
| Neon cold start | First request +1–2 s; warm with the cron/uptime ping |
| Telegram webhook failure | Web app unaffected |

## 8. Judging-week operations (4–9 Nov)

- Check spend each morning/evening. Lower `DAILY_CAP_USD` if traffic spikes.
- Do not deploy risky changes after Wed 4 Nov noon. Hotfix only for outages.
- Pin the repo's README top: live link, video link, "Judge mode" instructions (code in submission notes, not in the repo).
- Respond to GitHub issues/Discord questions within hours.

## 9. Privacy page (ship it; 1 screen)

Contents: what we process (message in memory only), what we store (verdict + hashed indicators 30/180 days), model provider (Meta Model API, Standard mode), your rights (delete button, email), cross-border note (processing via Meta's API; safeguards depend on Meta's terms), contact email, "prototype built for a hackathon; not yet registered with the ODPC; will register before public launch". Honest beats polished.

## 10. Repo hygiene checklist

README, LICENSE, `.env.example`, `docs/` (this pack minus personal notes), `CLAUDE.md`, `evals/`, tests, no `node_modules`, no secrets, meaningful commit messages, tags `v0.1-submission`.
