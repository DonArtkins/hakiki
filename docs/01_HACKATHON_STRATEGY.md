# 01 — Hackathon Strategy (how to actually win)

## 1. The rules that shape every decision

| Rule | Consequence for Hakiki |
|---|---|
| Public repo required | Repo is public from the first commit. No secrets in git (`.env*` ignored, `.env.example` only) |
| 3-minute demo video | The video is half the score. Build the hero flow for the camera first (file 12) |
| Only features built during the hackathon | New repo, first commit after kickoff. Don't paste Griot code. README says "patterns informed by prior work, code written in-event" |
| Banned/generic ideas: mental-health advisor, skin/blemish detector, education chatbot, job-application screener, nutrition coach, personality analyzer, sports analyzer, basic RAG, simple image analyzers, anything political | Hakiki must **not look like "upload image → LLM describes it"**. It is a pipeline: deterministic rules + agent with tools + community signal + redaction + evals |
| Indie Developer track | Judged on creativity, technical ambition, does-it-work. Solo is fine |
| Theme "Build for Your World" | Kenya, M-Pesa, Swahili/Sheng: specific, local, real. Lean into it in the first 10 seconds of the video |

## 2. Rubric → plan

| Criterion | Weight | What judges want | What Hakiki shows |
|---|---|---|---|
| **Impact** | 30 | Real problem, real users, measurable | Sh29.9B lost Jul–Sep 2025; 49% of Kenyan mobile owners hit by scam msg/call; 3 in 4 know a victim. Family-guardian mode (protect parents). Live URL anyone can try |
| **Meta tooling** | 25 | Meaningful use of Meta models, not a token call | Muse Spark 1.3 (vision + tool calls + structured output + reasoning), SAM 3.1 (face/avatar privacy redaction), Muse Image (shareable warning card), Voice/Spark Open (voice note, stretch). One-line reason for each model in README |
| **Technical depth** | 20 | Architecture, reliability, evals | Rules engine → evidence pack → agent loop → schema-validated verdict; HMAC indicator DB; eval harness with numbers in README; budget kill-switch; failure-mode table |
| **Demo** | 25 | Clear story, works on camera | Real-looking scam in, verdict out in ≤8 s, streamed highlights, Swahili toggle, guardian ping, share card |

**Scoring logic:** Impact and Demo are 55%. Don't spend day 6 on a perfect schema while the video is unrecorded.

## 3. MVP vs full product (your question)

**Answer: a polished MVP of ONE hero flow, built deep.** Judges review hundreds of entries in 4 days. They reward one thing that works end-to-end and is clearly thought through, over ten half-working features. "Full product" is not expected from a solo builder in 8 days.

Practical rule: a feature is in only if it appears in the video or strengthens a rubric line.

| Tier | Meaning | Items |
|---|---|---|
| P0 (must) | Hero flow works live | Paste/share text or screenshot → verdict stream → red flags highlighted → next steps; EN + SW; M-Pesa code validator; scam taxonomy rules; anonymous session; history |
| P1 (should) | Makes it win | Telegram bot (same API); guardian link; share card via Muse Image; community indicator counts; eval harness + README numbers |
| P2 (nice) | Only if ahead | Sheng; SAM face redaction; "judge mode" demo samples; PWA share-target polish; admin stats page |
| P3 (stretch) | Probably cut | Voice note via Spark Open; Open-weights bonus build; USSD/SMS |

## 4. Anti-pattern check: "this is just an image analyzer"

Put this table in the README and say it in the video:

| Generic wrapper | Hakiki |
|---|---|
| Sends image to LLM, prints text | Extracts structured fields, runs **deterministic Kenyan checks first** (code format/date, sender ID, URL, phone patterns, reversal-script phrases), then agent reasons over the evidence pack |
| One-shot answer | Schema-validated verdict + confidence + cited evidence + localized next step |
| No memory | Community indicator DB (hashed): "this number reported by 14 people this week" |
| No safety story | No bodies stored; redaction; DPA notes; kill-switch; false-positive eval |
| Unmeasured | Eval set with precision/recall and benign false-positive rate published |

## 5. Bonus prizes (read the Participant Guide again; amounts from screenshots)

- **Best Build on Open Weight Models ($10k bonus)**: needs the app to run on Muse Spark Open. Cheap approach: keep the model client provider-agnostic (`MODEL_BASE_URL`, `MODEL_ID`) and make a documented "open mode" switch pointing at Baseten (`meta-models/muse-spark-open-1026`). Run the eval set on both and report. This costs ~half a day; do it only after P0+P1 are done.
- **Community vote**: share card + public link + 30-second clip for X/LinkedIn/WhatsApp status. See file 12.

## 6. Winning behaviours

1. Submit by **Wed 4 Nov 12:00 EAT**. Deadline is Thu 5 Nov 05:00 EAT. Don't gamble on the last night.
2. Attend Agents 102 (verifiable agents). Copy their vocabulary into the README (guardrails, evals, tracing).
3. Post progress in Discord. Judges and Meta staff read it.
4. Keep a `docs/DECISIONS.md` and `docs/EVALS.md` in the repo. They are cheap and signal depth.
5. Test on a **real mid-range Android phone on mobile data**. That is the target user.
6. Never claim what you didn't verify. "Heuristic + AI, can be wrong; report to 333" is both honest and safer.
