# 02 — Product Spec

## 1. Problem

Mobile money moves most small payments in Kenya, so scams are cheap, fast and personal. Reported cybercrime losses hit **Sh29.9B in Jul–Sep 2025**; the World Bank found **49%** of Kenyan mobile owners received a scam call/message, and about **3 in 4 know a victim**. Existing tools fail users:

| Gap | Evidence | Hakiki answer |
|---|---|---|
| Caller-ID apps judge *numbers*, not *messages* | Truecaller ~2/5 on Trustpilot; users complain of wrong labels | Judge the whole message/screenshot: wording, code, link, sender |
| Reporting is slow | Safaricom reporting lines (333 report, 334 verify) don't give an instant answer | Answer in seconds, then route to 333/DCI |
| Fakes imitate M-Pesa SMS | Edited SMS with fake balance, missing balance line, "*LOCKED*" | M-Pesa code + format validator, balance-line check |
| Elderly/relatives most exposed | Parents forward "is this real?" to kids | Guardian mode: a parent's risky check pings a trusted person |
| Language | Most tools English-only | Swahili, Sheng, English verdicts |

## 2. Users

| Persona | Need | Key feature |
|---|---|---|
| **Wanjiku, 34, mama mboga/merchant** | "Customer shows an M-Pesa screenshot; did money arrive?" | Fake payment-confirmation screenshot check |
| **Brian, 22, job seeker** | Fake job/TikTok-agent/"pay registration" scams | Job-scam rules, link check |
| **Mzee Otieno, 68** | Gets "sent by mistake, please reverse" | Plain Swahili answer, big buttons, guardian ping |
| **Faith, 29, daughter/guardian** | Wants to protect Mzee Otieno without hovering | Guardian link: sees risk level + summary, not full messages |
| **Judge (non-Kenyan)** | Understands in 10 seconds | Sample scams one tap, English toggle, clear video |

## 3. Hero flow (what the video shows)

1. User gets a scam SMS ("Confirmed. Sh15,000 sent to you by mistake, please reverse to 07xx…").
2. Taps **Share → Hakiki** (or pastes into Telegram bot).
3. In ~5–8 s the verdict streams: **HIGH RISK · Fake reversal scam**.
4. Evidence highlights: wrong sender (not "MPESA"), missing balance line, code `XXXXXXXXXX` fails structure check, urgency phrase.
5. Next steps in Swahili: *Usirudishe pesa. Angalia salio lako la M-Pesa. Tuma ujumbe huo kwa 333.*
6. Optional: share warning card; guardian notified.

## 4. Scope

### P0 — Must
- P0.1 Submit text, image (screenshot) or both (PWA + paste); max 5 MB image, client-side resize to 1600 px.
- P0.2 Extraction: sender, phone numbers, URLs, amounts, M-Pesa code, phrases (structured JSON).
- P0.3 Rules engine (file 03 §5): M-Pesa code validator, sender-ID check, balance-line check, URL heuristics, phone patterns, scam phrase matcher.
- P0.4 Agent verdict with schema: `risk` (safe/suspicious/high/unclear), `scam_type`, `confidence`, `reasons[]`, `next_steps[]`, `language`.
- P0.5 Streaming UI with highlighted evidence.
- P0.6 Languages: EN + SW toggle, auto-detect from input.
- P0.7 Anonymous session, history of last 50 checks, delete-my-data button.
- P0.8 Disclaimer: "Not 100%. If unsure, call 333 / DCI 0800 722 203."

### P1 — Should
- Telegram bot (text + photo) with identical verdict, deep link to web result.
- Guardian mode: invite code, parent's high-risk checks notify guardian (Telegram message or in-app inbox).
- Share card (Muse Image + deterministic text overlay).
- Community indicators: count of devices that reported same number/URL/code pattern.
- Eval harness + published results.

### P2 — Nice
Sheng responses; SAM face/avatar blur on screenshots; sample-scam gallery; PWA share-target; admin `/stats`.

### P3 — Stretch
Voice note; open-weights mode; USSD.

### Out of scope (say so)
WhatsApp-direct bot (Business API verification), payments, blocking numbers, automatic reporting to Safaricom, real fraud-loss guarantees.

## 5. User stories (acceptance criteria)

| ID | Story | Done when |
|---|---|---|
| U1 | As a user I paste an SMS and get a verdict | ≤8 s p50; verdict has ≥2 cited reasons; works offline-failure state |
| U2 | I share a screenshot | Text extracted, highlights show on the *typed* text, not the image |
| U3 | I prefer Swahili | Toggle persists; all next-steps localized |
| U4 | I'm unsure | "Unclear" verdict says what extra info helps (e.g., "upload the full SMS with sender") |
| U5 | I want to protect my parent | Invite code → parent accepts → high-risk checks appear for guardian |
| U6 | I want my data gone | One tap deletes checks, session, links |
| U7 | I want to warn others | Share card generated with no personal data |
| U8 | I report a false verdict | Feedback stored, counted in eval backlog |

## 6. Metrics (for README / video)

- Eval accuracy on a labelled set (≥60 cases, 40% benign): precision, recall, **false-positive rate on benign**.
- p50/p95 latency; cost per check (from `usage`).
- Live counters: checks run, scams caught, indicators seen ≥3 times.
- **Never** invent user numbers. Report only what you measured.

## 7. Risks to the product

| Risk | Handling |
|---|---|
| Saying "safe" for a scam | Verdict vocabulary: *Looks genuine* only if all structural checks pass; always keep "can still be wrong" line |
| Crying wolf on real M-Pesa SMS | Benign eval cases; "unclear" is allowed |
| Defamation via reports | Thresholded display (≥3 reports, ≥2 devices), neutral wording, takedown email |
| Abuse of credits | Rate limits + kill-switch (file 06) |
