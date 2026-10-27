# HAKIKI — Research Pack (START HERE)

> Meta Global AI Developer Hackathon · Indie Developer track · Theme: **Build for Your World**
> Pack written: **Tue 27 Oct 2026**. Facts tagged **[VERIFIED]** were read from Meta's own docs/pages today. Anything tagged **[TEST DAY 1]** is unverified and has a 15-minute test in `10_BUILD_PLAN_8_DAYS.md`.

**One line:** Hakiki ("verify" in Swahili) is a scam-verification agent for Kenyan mobile-money users. You share a suspicious SMS, M-Pesa screenshot, link or voice note. It runs deterministic Kenya-specific checks plus a Muse Spark reasoning agent, then answers in Swahili, Sheng or English with the exact red flags and the exact next step ("don't refund — forward to 333").

---

## 1. The files (read in this order)

| # | File | Use it for |
|---|---|---|
| 00 | `00_README_START_HERE.md` | This page: decisions, Day-0 checklist, risks, sources |
| 01 | `01_HACKATHON_STRATEGY.md` | Rules, rubric → plan, MVP-vs-full answer, anti-patterns to avoid, bonus prizes |
| 02 | `02_PRODUCT_SPEC.md` | Problem, personas, scope tiers (P0–P3), user stories, metrics |
| 03 | `03_ARCHITECTURE.md` | **Most important.** System design, pipeline, agent loop, sequence diagrams, failure modes, privacy |
| 04 | `04_TECH_STACK_AND_META_API.md` | Stack choices, exact Meta API calls (Responses, vision, SAM, Image, Voice), code skeletons, costs |
| 05 | `05_DATABASE_ERD_SCHEMA.md` | ERD, full Postgres DDL, indexes, retention |
| 06 | `06_AUTH_AND_ABUSE_DESIGN.md` | Anonymous-first auth, Telegram linking, guardians, rate limits, budget kill-switch |
| 07 | `07_BRANDING_AND_DESIGN_SYSTEM.md` | Name, voice, palette, type, tokens, logo SVG, microcopy EN/SW, share-card spec |
| 08 | `08_UX_FLOWS_AND_WIREFRAMES.md` | Flows, mobile wireframes, states, Telegram scripts |
| 09 | `09_AI_PROMPTS_TAXONOMY_EVALS.md` | System prompt, JSON schemas, tools, Kenya scam taxonomy, eval plan |
| 10 | `10_BUILD_PLAN_8_DAYS.md` | Day-by-day plan, Claude Code prompts, cut lines, credit budget |
| 11 | `11_DEPLOY_AND_OPS.md` | Deploy steps, env var names, cost guardrails, monitoring, fallback |
| 12 | `12_DEMO_VIDEO_AND_SUBMISSION.md` | 3-minute script, shot list, README outline, submission + viral checklist |
| 13 | `CLAUDE.md` | Drop into the repo root so Claude Code follows these decisions |

---

## 2. Decisions locked (change only with a reason)

| Decision | Choice | Why (one line) |
|---|---|---|
| Product | Hakiki, scam verification for Kenya | Real, measurable harm; judges grasp it in one sentence; Kenya-specific rules Truecaller can't match |
| Track | **Indie Developer** | Individual builder; judged on creativity, technical ambition, "does it work" |
| Scope | **Polished MVP, one hero flow, deep** | 8 days solo. Depth beats breadth in the rubric (see file 01) |
| Hero flow | Share screenshot/text → streamed verdict with highlighted evidence → next steps | It is the demo |
| Channels | PWA (Android share-target) + Telegram bot | Both hit one API. WhatsApp-direct is out of scope (Business API verification) |
| Models | Muse Spark 1.3 (reasoning/vision/tools), SAM 3.1 (privacy redaction), Muse Image (share card), Muse Voice Transcribe / Muse Spark Open (voice, stretch) | Uses 4–5 Meta models for a real reason each (25% "Meta tooling" criterion) |
| Stack | Next.js (App Router, TS) + Postgres (Neon) + Drizzle + Upstash ratelimit + grammY, on Vercel | Fastest path for one dev + Claude Code; free tiers |
| Auth | Anonymous device session first; Telegram link; optional email later | No signup wall in front of the demo (judges must try it in 10 seconds) |
| Privacy | Store verdicts + HMAC-hashed indicators, **not** message bodies; Standard (not Contributor) mode for user data | Kenya DPA 2019; trust is the product |
| Repo | New public repo, first commit after kickoff, MIT | Rules: public repo, "built during the hackathon" |

---

## 3. Do these tonight (60–90 minutes) — Day 0

1. **Claim the $150 Meta credits** via the form on the Event Details page. Claim deadline is **Wed 4 Nov, 9:00 PM ET** but credits come "in batches", so do it now. A temporary card pre-authorisation may appear. **[Risk: Kenyan cards]** If it fails, ask in the Discord `#questions` channel today, not on day 6.
2. **Smoke-test the API key** (15 min). Run the 4 curls in `04_TECH_STACK_AND_META_API.md` §9. Confirm: `GET /v1/models` lists `muse-spark-1.3`; an image call works; `sam-3.1` returns a line of `<|box…|><|mask…|>`. The Spark preview was announced as **US-only** in July. Confirm it works from Nairobi on your key.
3. **Apply for Baseten credits** ($100, first 2,000 participants) and **Modal ($100, first 1,000)** via the links on the Event Details page. These pay for the open-weights route (Muse Spark Open) and the $10,000 *Best Build on Open Weight Models* bonus.
4. **Join the Discord**, introduce yourself in `#intros`. `#office-hours` runs daily 10–11 AM ET (= 17:00–18:00 EAT until 1 Nov, then 18:00–19:00 EAT).
5. **Create the repo** (`hakiki`, public, MIT) and make the first commit from the scaffold. Do **not** copy Griot code in. Reimplement patterns fresh and say so in the README ("patterns informed by my earlier work; all code written during the hackathon").
6. **Copy `CLAUDE.md` into the repo root**, and the whole `docs/` folder from this pack.
7. **Decide your Claude Code model route** (see §5 below, credit budgeting). This is the single most expensive decision you'll make this week.

---

## 4. Top risks (and what to do about each)

| # | Risk | Likelihood | Mitigation |
|---|---|---|---|
| 1 | Meta API blocked/limited outside US | Medium | Day-0 smoke test. Fallback: Muse Spark Open via Baseten/Fireworks/Together (OpenAI-compatible). Keep the model client behind `src/lib/meta.ts` |
| 2 | **Claude Code on Muse burns the credits** | **High** | Budget in file 10 §7. Consider Contributor-mode model for coding only (public repo code, no secrets) |
| 3 | Swahili/Sheng voice quality | High | Muse Voice Transcribe's 25 validated languages **do not include Swahili** [VERIFIED]. Test Muse Spark Open audio on Day 1; if poor, drop voice to P3 and don't show it in the video |
| 4 | SAM 3.1 gives poor masks on screenshots | Medium | SAM is scoped to *faces/avatars* (concrete objects it is good at), not text. Time-box 3 hours. Fallback: box-blur from Muse Spark grounding |
| 5 | Judges read it as a "basic image analyzer" | Medium | Show the pipeline: rules engine + agent + community signal + privacy redaction + evals. See file 01 §4 |
| 6 | False positives ("cry wolf") | Medium | Benign-heavy eval set, "can't tell" verdict, never say "100% safe" |
| 7 | Credits drained by strangers once the link is public | Medium | Per-device/IP limits + hard daily $ kill-switch (file 06) + "Judge mode" code |
| 8 | Scope creep | **High** | P-tiers and cut lines in file 02/10. Freeze features **Sun 1 Nov** |
| 9 | Defaming individuals via community reports | Low | Show indicators only after ≥3 reports from ≥2 devices; wording is "reported as scam-related by N people", with a takedown route |
| 10 | Kenya DPA 2019 | Low (prototype) | Privacy notice, minimisation, no body storage. Registration with ODPC is a *post-hackathon* step. Say so honestly |

---

## 5. Credits reality check

- You have **$150** Meta Model API credit. Muse Spark 1.3: **$1.25 / $4.25 per 1M tokens** (input/output), cached input **$0.15**. Reasoning tokens are billed as output **[VERIFIED]**.
- Estimated runtime cost per Hakiki check ≈ **$0.015–0.03** (about 7,500 checks per $150). **[Estimate. Measure it Day 1 from `usage` fields.]**
- **If Claude Code is pointed at Muse (Anthropic-format `ANTHROPIC_BASE_URL=https://api.meta.ai`), its tokens come out of the same $150.** Pro-tip (**[TEST DAY 1]**): Meta lists `muse-spark-1.3-contributor` at **$0.10 / $0.20 per 1M** (cached $0.002) but it lets Meta train on your content. That's acceptable for building a *public* open-source repo, and **never** acceptable for real user messages. Confirm your credits apply to Contributor-mode models.
- Billing page: set the **Spend Limit notification** to $150. It is a notification, not a hard cap. You need your own app-level kill switch (file 06).

---

## 6. What I could not verify (honest list)

- Whether your key works from Kenya, and whether the hackathon credits cover every model (Image, SAM, Voice, Contributor).
- Exact request shape for `POST /v1/images/generations` and `/edits` (docs page list exists; I did not open the reference). Use the Cookbook in the repo `github.com/meta-models/meta-model-cookbook` → `05_muse_image/`.
- Whether Meta offers zero-data-retention for text models. (It is mentioned for Voice.) Ask in `#questions`.
- M-Pesa SMS transaction-code date encoding is derived from a Kenyan press explainer, not Safaricom documentation. **Test it against your own real SMS** (today's messages should start `UJR`; see file 03 §5).
- Hotline numbers (333, 334, DCI) come from 2026 press/Safaricom pages. Re-check them before the video.
- Prize splits and bonus amounts were read from screenshots of the Participant Guide. Re-read the page.

---

## 7. Key dates (EAT, from the Participant Guide; ET → EAT is +7h until 1 Nov, then +8h)

| When | What |
|---|---|
| Tue 27 Oct, 19:00 EAT | Workshop: Agents 101 (multimodal agent) |
| Wed 28 Oct, 19:00 EAT | Workshop: Agents 102 (best practices for verifiable agents) — **attend; it maps to the "technical depth" score** |
| Fri 30 Oct, 19:00 EAT | Workshop: Fireworks (Muse Open models) |
| Sun 1 Nov | **Feature freeze (your own deadline)**. US clocks go back this day |
| Tue 3 Nov | Last full day for submission Q&A in Discord |
| **Wed 4 Nov, 21:00 ET = Thu 5 Nov, 05:00 EAT** | **Submission deadline** (also the credit-claim deadline) |
| **Your internal submit time** | **Wed 4 Nov, 12:00 EAT** (17 hours of buffer) |
| 4–8 Nov | Judging |
| Mon 9 Nov, 12:00 PM ET | Closing ceremony, top-10 live finals (5 per track) |
| Mon 16 Nov | Community-vote winner announced (Discord) |

Date maths: Nov 4 is after US DST ends (Sun 1 Nov), so 9 PM ET is 9 PM EST = 02:00 UTC Nov 5 = 05:00 EAT Nov 5.

---

## 8. Sources used (all opened 27 Oct 2026)

- Meta developer blog: *Build with Muse Spark* — https://dev.meta.ai/resources/blog/build-with-muse-spark
- Meta docs: Speech to text — https://dev.meta.ai/docs/speech-to-text
- Meta docs: Pricing and rate limits — https://dev.meta.ai/docs/pricing-rate-limits
- Meta docs: Structured output — https://dev.meta.ai/docs/structured-output
- Meta docs: Tool/function calling cookbook — https://dev.meta.ai/docs/cookbook/tool-function-calling
- Meta docs: Image understanding — https://dev.meta.ai/docs/image-understanding
- Meta docs: SAM — https://dev.meta.ai/docs/sam/segmenting · https://dev.meta.ai/docs/sam/reading-segmentation · https://dev.meta.ai/docs/sam/client-libraries
- Meta model pages: https://dev.meta.ai/models/sam-3-1/ · https://dev.meta.ai/models/muse-image/
- Muse Spark Open launch (Baseten): https://www.baseten.co/blog/muse-spark-open-launch/ · Unite.AI release summary
- Muse Voice Transcribe coverage: The New Stack; GIGAZINE; TechRepublic
- Vercel Functions limits: https://vercel.com/docs/functions/limitations (Hobby 300 s with Fluid compute)
- Kenya context: The Star (Sh29.9bn cybercrime Jul–Sep 2025), Eastleigh Voice/World Bank (49% received a scam), K24 (silent M-Pesa prompt scam), TechCabal (M-Pesa number masking, forward to 334), Safaricom fraud pages, Eastleigh Voice (transaction-code structure)
- Kenya DPA 2019: securiti.ai; ODPC registration pages; Bowmans
