# 04 — Tech Stack & Meta API (exact calls)

> Code below follows Meta's docs as read on 27 Oct 2026. Field names marked **[CHECK]** should be confirmed against `dev.meta.ai/docs` or the cookbook repo (`github.com/meta-models/meta-model-cookbook`) during the Day-1 smoke test.

## 1. Stack

| Layer | Choice | Why | Alternative |
|---|---|---|---|
| Framework | Next.js 15 App Router, TypeScript | One deploy for UI + API + SSE | — |
| UI | Tailwind CSS + shadcn/ui primitives (only the few you need) | Fast, accessible | Plain CSS |
| DB | Neon Postgres (free) | Serverless, pooled | Supabase |
| ORM | Drizzle | Light, SQL-first, great with Claude Code | Prisma |
| Rate limit | Upstash Redis + `@upstash/ratelimit` | Edge-friendly | Postgres table |
| Bot | grammY (webhook mode) | Typed, tiny | Telegraf |
| Validation | Zod | Same schema → JSON Schema for Meta | — |
| Sessions | `jose` signed cookie (JWT HS256) | No auth vendor | — |
| i18n | Own JSON dictionaries `en`/`sw` | Tiny | next-intl |
| Tests | Vitest | Rules + eval runner | — |
| Hosting | Vercel Hobby | Free, 300 s with Fluid compute [VERIFIED] | Fly/Render |
| PWA | `manifest` with `share_target` + minimal service worker | Android share sheet | — |

Node 20+. Package manager: pnpm.

## 2. Meta Model API facts you need

| Item | Value |
|---|---|
| Base URL | `https://api.meta.ai/v1` (OpenAI-SDK compatible) |
| Recommended endpoint | **Responses API** (`/v1/responses`); Chat Completions and Anthropic Messages also work |
| Models | `muse-spark-1.3` (latest), `-1.2`, `-1.1`, `*-contributor`, `muse-image-1.0`, `sam-3.1`, `muse-voice-transcribe-1.0`, `muse-wonder-1.0` |
| Prices (per 1M tok) | Spark $1.25 in / $4.25 out / $0.15 cached; Contributor $0.10 / $0.20 / $0.002. SAM $2.50 per 1k images; Muse Image $0.01/image; Voice $0.18/hour; web_search $2.50/1k |
| Rate limits | Spark 3000 RPM / 4M TPM; Image 150 RPM; SAM 3000 RPM |
| Tools | `tool_choice` only `"auto"`; `web_search` only in Responses |
| Structured output | `text.format` (Responses) / `response_format` (Chat); depth ≤ 10, no recursive schemas, `strict` optional |
| Images in | `input_image` with URL or data URL, ≤ 50 per request |
| Reasoning | `reasoning.effort` (Responses) / `reasoning_effort` (Chat). Reasoning tokens bill as output |
| Caching | Put the static prefix first (system prompt, playbook) |

## 3. Model client (`src/lib/meta.ts`)

```ts
import OpenAI from "openai";

export const meta = new OpenAI({
  baseURL: process.env.MODEL_BASE_URL ?? "https://api.meta.ai/v1",
  apiKey: process.env.MODEL_API_KEY!,
  timeout: 25_000,
  maxRetries: 1,
});

export const MODELS = {
  reason: process.env.MODEL_ID ?? "muse-spark-1.3",
  sam: "sam-3.1",
  image: "muse-image-1.0",
};

// Cost accounting
const PRICE = { in: 1.25 / 1e6, out: 4.25 / 1e6, cached: 0.15 / 1e6 };
export function costOf(u: { input_tokens: number; output_tokens: number; input_tokens_details?: { cached_tokens?: number } }) {
  const cached = u.input_tokens_details?.cached_tokens ?? 0;
  return (u.input_tokens - cached) * PRICE.in + cached * PRICE.cached + u.output_tokens * PRICE.out;
}
```
The same client works for open-weights mode by setting `MODEL_BASE_URL` (Baseten/Fireworks/Together are OpenAI-compatible) and `MODEL_ID` (`meta-models/muse-spark-open-1026` on Baseten for the hackathon).

## 4. Extraction call (vision → JSON)

```ts
import { zodTextFormat } from "openai/helpers/zod";
import { Extraction } from "@/engine/schemas";

const res = await meta.responses.create({
  model: MODELS.reason,
  reasoning: { effort: "low" },
  max_output_tokens: 600,
  input: [
    { role: "system", content: EXTRACT_SYSTEM },          // static, cacheable
    { role: "user", content: [
        { type: "input_text", text: userText ?? "Extract fields from this screenshot." },
        ...(imageDataUrl ? [{ type: "input_image", image_url: imageDataUrl }] : []),
    ]},
  ],
  text: { format: zodTextFormat(Extraction, "extraction") },   // [CHECK] helper support; else hand-write JSON Schema
});
const extraction = Extraction.parse(JSON.parse(res.output_text));
```
If the OpenAI helper doesn't map cleanly to Meta, send raw: `text: { format: { type: "json_schema", name: "extraction", schema: <json>, strict: false } }`.

Keep the system prompt short for any **grounding** call (boxes on a 0–1000 grid); long prompts hurt perception tasks [VERIFIED in image-understanding docs].

## 5. Agent call with tools

```ts
const tools = [
  { type: "function", name: "lookup_playbook", description: "Get official next steps and numbers for a scam type",
    parameters: { type: "object", properties: { scam_type: { type: "string" } }, required: ["scam_type"] } },
  { type: "function", name: "community_lookup", description: "Counts of reports for hashed indicators",
    parameters: { type: "object", properties: { kinds: { type: "array", items: { type: "string" } } }, required: ["kinds"] } },
  { type: "function", name: "check_url_shape", description: "Static analysis of a URL (no network)",
    parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } },
];

let input: any[] = [{ role: "system", content: AGENT_SYSTEM }, { role: "user", content: evidencePackJson }];
for (let turn = 0; turn < 3; turn++) {
  const r = await meta.responses.create({
    model: MODELS.reason, input, tools, tool_choice: "auto",
    reasoning: { effort: "medium" }, max_output_tokens: 900,
    text: { format: { type: "json_schema", name: "verdict", schema: VerdictJsonSchema } },
  });
  const calls = r.output.filter((o: any) => o.type === "function_call");
  if (!calls.length) return Verdict.parse(JSON.parse(r.output_text));
  input.push(...r.output);
  for (const c of calls) input.push({ type: "function_call_output", call_id: c.call_id, output: JSON.stringify(await runTool(c.name, JSON.parse(c.arguments))) });
}
// fallthrough: rules-only verdict
```
**[CHECK]** whether structured output and tool calls can be combined in one request on the Responses API. If not, use two steps: (1) tool turns with free text; (2) final call with `text.format` and no tools. Docs say Responses API supports tools + structured output; confirm with the smoke test.

## 6. SAM 3.1 — face/avatar redaction (P2)

- One **noun phrase per request**, Responses API, `stream: true`.
- Ask for `"face"` and `"profile picture"` separately (2 calls = $0.005).
- Metadata: `mask_encoding: "one_bit"`, `include_confidence: "true"`.
- Stream grammar: `<0f>id<|box;x1..y2;w;h|><|mask;x=0;y=0;data=H,W,~payload|>` (base85).
- Use `@meta-sam/parser` (≥ 0.0.13 for confidence) and `@meta-sam/graphics` to decode.

```ts
const stream = await meta.responses.create({
  model: "sam-3.1", stream: true,
  input: [{ role: "user", content: [
    { type: "input_image", image_url: dataUrl },
    { type: "input_text", text: "face" },
  ]}],
  metadata: { mask_encoding: "one_bit", include_confidence: "true" },   // [CHECK] exact placement
});
// accumulate text deltas → parse with @meta-sam/parser → masks → blur on canvas (sharp or OffscreenCanvas)
```
Time-box to 3 hours. If masks are bad, use boxes only (blur rectangles).

## 7. Muse Image — share card (P1)

- `POST /v1/images/generations`, model `muse-image-1.0`, $0.01 per image. **[CHECK request shape in cookbook `05_muse_image/`]**.
- Use it for the *background art only* (abstract warning pattern, brand colours). Overlay all text (verdict, scam type, advice) deterministically with `satori`/`@vercel/og` so text is never garbled.
- Cache one generated background per scam type (16 images = $0.16), then reuse. Don't generate per request.

## 8. Voice (P3)

- Muse Voice Transcribe: `POST /v1/asr/transcribe` multipart; WAV mono 16-bit PCM 16/24 kHz; ≤10 min / 32 MB; or WebSocket `/v1/asr/realtime`. 25 validated languages; **Swahili not included** [VERIFIED].
- Alternative: Spark Open (omni) via Baseten for audio → Swahili transcription. Test quality on 5 real voice notes. If poor, cut.

## 9. Day-1 smoke tests (copy-paste)

```bash
export K=$MODEL_API_KEY

# 1. Models visible from Kenya?
curl -s https://api.meta.ai/v1/models -H "Authorization: Bearer $K" | head -c 800

# 2. Text + usage + cost fields
curl -s https://api.meta.ai/v1/responses -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
 -d '{"model":"muse-spark-1.3","input":"Reply with the word ok.","max_output_tokens":50}'

# 3. Structured output + tool in one request
curl -s https://api.meta.ai/v1/responses -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
 -d '{"model":"muse-spark-1.3","input":"Classify: \"Tumetuma pesa kimakosa, rudisha 07...\"","text":{"format":{"type":"json_schema","name":"t","schema":{"type":"object","properties":{"scam":{"type":"boolean"},"type":{"type":"string"}},"required":["scam","type"],"additionalProperties":false}}}}'

# 4. Vision (use a real screenshot, base64)
IMG=$(base64 -w0 sample.png)
curl -s https://api.meta.ai/v1/responses -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
 -d "{\"model\":\"muse-spark-1.3\",\"input\":[{\"role\":\"user\",\"content\":[{\"type\":\"input_text\",\"text\":\"Transcribe all text.\"},{\"type\":\"input_image\",\"image_url\":\"data:image/png;base64,$IMG\"}]}]}"

# 5. SAM
curl -sN https://api.meta.ai/v1/responses -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
 -d "{\"model\":\"sam-3.1\",\"stream\":true,\"input\":[{\"role\":\"user\",\"content\":[{\"type\":\"input_image\",\"image_url\":\"data:image/png;base64,$IMG\"},{\"type\":\"input_text\",\"text\":\"face\"}]}],\"metadata\":{\"mask_encoding\":\"one_bit\"}}" | head -c 600
```
Record: latency, `usage` tokens, any 4xx body. Paste results into `docs/SMOKE_TEST.md`.

## 10. Claude Code on Muse (credit strategy)

```bash
export ANTHROPIC_BASE_URL=https://api.meta.ai
export ANTHROPIC_AUTH_TOKEN=$MODEL_API_KEY      # or ANTHROPIC_API_KEY per your setup
export ANTHROPIC_MODEL=muse-spark-1.3
```
Everything Claude Code reads/writes costs credits. Tactics: short sessions, `/clear` between tasks, `CLAUDE.md` concise, never paste whole node_modules/logs, use `--max-turns`. Budget in file 10 §7.

## 11. Dependencies

```
pnpm add next react react-dom openai zod drizzle-orm @neondatabase/serverless jose grammy \
  @upstash/ratelimit @upstash/redis @vercel/og sharp @meta-sam/parser @meta-sam/graphics
pnpm add -D typescript drizzle-kit vitest tailwindcss @types/node
```
