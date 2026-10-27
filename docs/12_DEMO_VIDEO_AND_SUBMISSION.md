# 12 — Demo Video (≤ 3:00) & Submission

Demo = 25% of the score, Impact 30% — the video carries both. Re-read the Participant Guide's video requirements before recording (length, hosting, what to show).

## 1. Story arc (180 seconds)

| Time | Beat | On screen | Voice-over (draft) |
|---|---|---|---|
| 0:00–0:15 | Hook | Phone buzzes: "Confirmed. Sh15,000 sent to you by mistake, please reverse…" | "In Kenya, 49% of mobile users have received a scam message. This one cost a lot of people their rent." |
| 0:15–0:30 | Problem | Stat text overlay: Sh29.9B lost Jul–Sep 2025. Truecaller judges numbers, not messages | "Existing tools check the *number*. Scammers copy the *message*." |
| 0:30–0:45 | Solution | Hakiki logo + tagline; install PWA | "Meet Hakiki. Check before you send." |
| 0:45–1:30 | **Hero demo** | Android share sheet → Hakiki → stage chips → highlighted evidence → verdict + SW next steps | Narrate each stage: "It reads the message with Muse Spark, runs Kenya-specific checks, then reasons over the evidence." |
| 1:30–1:55 | Depth | Cut to architecture diagram (animated 3 boxes) + eval table (recall, FP rate) | "Rules first, model second, so the model can't be talked into 'safe'. 62 test cases: 94% recall, 3% false positives." (use only real numbers) |
| 1:55–2:15 | Guardian | Mama's phone sees scam → Faith's Telegram: "High-risk check: fake reversal" | "Faith protects her mother without reading her messages." |
| 2:15–2:30 | Community + share | "14 people reported this number"; share card posted to WhatsApp status | "Every check makes the next one smarter, with no message stored." |
| 2:30–2:50 | Meta tooling | Slide: Muse Spark (vision, tools, structured output), SAM 3.1 (privacy), Muse Image (cards) | One line each |
| 2:50–3:00 | Close | Logo, URL, repo | "Hakiki kabla ya kutuma. Try it at …" |

Trim anything not live. If SAM or voice isn't solid, delete that beat.

## 2. Shot list

1. Real phone screen recording (Android: built-in recorder, 1080p, 60 fps if possible). Clean notifications; Do Not Disturb on; battery full; mobile data indicator visible once to prove it works on the network.
2. Screen recording of the desktop for architecture/evals (OBS, 1080p).
3. B-roll (optional): Nairobi street/matatu stock **you filmed or licensed** (no copyrighted footage). Skip if short on time.
4. Webcam face intro: optional; 5 seconds max.

## 3. Production

| Task | Tool | Tip |
|---|---|---|
| Record screen | Android recorder / OBS | Record each beat separately, 2 takes |
| Voice | USB/earphone mic in a quiet room; Audacity noise reduction | Record VO *after* picture lock; read the script out loud twice first |
| Edit | CapCut / DaVinci Resolve / Kdenlive | Keep cuts every 3–5 s; captions burned in (judges may watch muted) |
| Music | YouTube Audio Library / Pixabay (royalty-free) | Low volume under VO |
| Export | 1080p H.264, ≤ 3:00 | Check length precisely; aim 2:50 |
| Host | YouTube (public/unlisted) | Title: "Hakiki — Check before you send (Meta Global AI Developer Hackathon)" |

Use fake/synthetic scam samples and your own number. **Never** show real victims, real personal numbers, or real M-Pesa balances.

## 4. Demo data to prepare

- 3 scam samples (reversal, fake job fee, fake M-Pesa SMS with no balance line) + 1 **benign** M-Pesa SMS (to show it doesn't cry wolf).
- Pre-warm: run each once 5 minutes before recording so the cache/DB is warm.
- Pre-seed the community counter for the sample number with legitimately created test reports, and label sample data as "demo data" in the repo; don't claim real user counts.
- Second phone / Telegram account for the guardian.

## 5. README outline (judges read this)

1. Title + one-liner + badges (CI, license)
2. **Live demo** link, **video** link, "Judge mode" note
3. The problem (3 stats with sources)
4. What Hakiki does (GIF of hero flow)
5. How it works (architecture diagram from file 03 §2/§3)
6. **How it uses Meta models** (table: model → what for → why)
7. Why it's not "just an image analyzer" (file 01 §4 table)
8. Evaluation results (table + how to reproduce)
9. Privacy & safety
10. Limitations & roadmap (honest)
11. Run locally
12. Built during the hackathon statement + patterns-from-prior-work note
13. Credits/acknowledgements, license

## 6. Submission checklist

- [ ] Re-read Participant Guide submission section (fields, video rules)
- [ ] Repo public, README complete, tag `v0.1-submission`
- [ ] Live URL tested on a second device & network
- [ ] Video uploaded, link opens logged-out
- [ ] Judge instructions (sample gallery, judge code) in submission notes
- [ ] Track: Indie Developer. Theme: Build for Your World
- [ ] Bonus: tick Open Weight only if actually running on Spark Open and documented
- [ ] Team/individual details correct; email `donyimbo@kabarak.ac.ke` or your preferred contact
- [ ] Submit **by Wed 4 Nov 12:00 EAT**; screenshot confirmation
- [ ] Hackathon deadline reminder: Thu 5 Nov 05:00 EAT

## 7. Going viral (community vote, 16 Nov)

- 30-second vertical clip (hero flow only), captions in EN/SW.
- Post to X, LinkedIn, TikTok, WhatsApp status/groups, Kenyan tech communities (Twitter/X Kenya tech, Nairobi dev groups, university groups). Tag the hackathon accounts/hashtags given in the guide.
- Post-submission, share the card generated for the top scam of the week.
- Ask for votes only where rules allow; don't spam Discord.

## 8. Pitch lines (reuse)

- "Truecaller judges the number. Hakiki judges the message."
- "Rules first, model second, so scammers can't talk the AI into 'safe'."
- "Protect your parents without reading their messages."
- "We store the verdict, not your message."

## 9. Q&A prep (finals, 4–5 min)

| Question | Answer |
|---|---|
| Why not just ask a chatbot? | Deterministic Kenyan checks + guardrails + community signal + evals. Chatbots can be talked into "safe" |
| False positives? | Benign set; "unclear" verdict; published FP rate |
| Data? | No bodies stored; hashed indicators; deletion |
| Why Meta models? | Multimodal vision, tool use, structured outputs, SAM for privacy, Muse Image for cards; open weights path for deployment in-country |
| Scale/cost? | ~$0.02 per check; caching; limits; kill-switch |
| What next? | WhatsApp channel, Safaricom/CA partnership for reporting, USSD, ODPC registration, Sheng fine-tuning on Spark Open |
