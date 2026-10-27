# Hakiki — Check before you send

*Hakiki kabla ya kutuma.*

Hakiki is a scam-verification agent for Kenyan mobile-money users. Share a suspicious SMS, M-Pesa
screenshot, link or (later) voice note. Deterministic Kenya-specific checks run first; a Muse Spark
agent then reasons over the evidence pack and answers in English, Swahili or Sheng with the exact red
flags and the exact next step. It never says "100% safe".

**Verdict vocabulary:** `safe` (strict conditions only) · `suspicious` · `high` · `unclear`.

## Why it is not a generic image analyser

| Generic wrapper | Hakiki |
|---|---|
| Sends an image to an LLM | Extracts fields, runs deterministic Kenyan rules first (M-Pesa code/date, sender ID, balance line, URL shape, reversal phrases), then the agent reasons over evidence |
| One-shot answer | Schema-validated verdict, rule floors the model cannot lower, cited evidence spans |
| No memory | Community indicators as HMAC hashes only: "reported by N people", shown at >=3 reports from >=2 devices |
| No safety story | No message bodies stored, redaction before persist, budget kill-switch, benign-heavy evals |

## Architecture in one line

`Guard -> Extract -> Rules (R01-R14) -> Indicators -> Evidence pack -> Agent (read-only tools) ->
Schema validate + one repair -> Ground spans -> Stream verdict -> Persist verdict + hashes only`

Full design: `docs/03_ARCHITECTURE.md`. Build plan: `docs/10_BUILD_PLAN_8_DAYS.md`.

## Develop

```bash
pnpm install
cp .env.example .env.local   # fill MODEL_API_KEY, DATABASE_URL, secrets
pnpm dev
pnpm test                    # free; run before any model-spending eval
pnpm check "Confirmed. Sh15,000 sent to you by mistake, please reverse"
pnpm eval --mode rules       # rules-only eval, no model spend
```

Stack: Next.js App Router (TypeScript), Tailwind, Drizzle + Neon Postgres, Upstash Redis, grammY
(Telegram), `jose` sessions, Zod, `openai` SDK pointed at Meta (`MODEL_BASE_URL`, default
`https://api.meta.ai/v1`). The model client lives only in `src/lib/meta.ts`.

## Privacy

Raw text and images live in memory for one request only. Stored: verdicts, redacted reason text and
HMAC-SHA256 indicator hashes (180 days). Standard model IDs only for user data, never `-contributor`.

License: MIT. Built during the Meta Global AI Developer Hackathon (Indie track); patterns informed by
earlier work, all code in this repo written during the event.
