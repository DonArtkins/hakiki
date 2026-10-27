# 07 — Branding & Design System

## 1. Brand

| | |
|---|---|
| Name | **Hakiki** (Swahili: "verify / make sure") |
| Tagline EN | *Check before you send.* |
| Tagline SW | *Hakiki kabla ya kutuma.* |
| Promise | A calm, fast second opinion on any suspicious message |
| Personality | Calm, direct, protective, never scary, never preachy. A trusted older cousin who knows tech |
| Not | A cop, a lawyer, a robot, or a hype-y "AI" brand |
| Verify domain idea | `hakiki.app` / `hakiki.vercel.app` for the demo |

**Naming safety:** check no existing trademark conflict in Kenya before any post-hackathon launch. For the hackathon, "Hakiki" is fine.

## 2. Voice & tone

- Short sentences. Active verbs. No jargon ("phishing" → "fake message").
- Start with the answer: **"Likely a scam."** then why, then what to do.
- Swahili: simple standard Swahili for the UI; Sheng only inside optional "Sheng mode" verdict text (keep it friendly, not mocking).
- Never say "100% safe". Use "Looks genuine, but stay careful."
- Never blame the user. "Many people get this one."

## 3. Colour tokens

Chosen to feel trustworthy and local without copying Safaricom green or M-Pesa branding. (Do not use M-Pesa/Safaricom logos anywhere.)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FAF8F4` | `#101412` | Page |
| `--surface` | `#FFFFFF` | `#18201C` | Cards |
| `--ink` | `#14201A` | `#EEF3EF` | Text |
| `--muted` | `#5B6B62` | `#9DB0A5` | Secondary |
| `--brand` | `#0F6B4F` | `#3DDC97` | Primary buttons, logo |
| `--brand-ink` | `#FFFFFF` | `#06231A` | Text on brand |
| `--safe` | `#1E8E5A` | `#4ADE9A` | Looks genuine |
| `--warn` | `#B7791F` | `#F5B544` | Suspicious |
| `--danger` | `#C0392B` | `#FF6B5B` | High risk |
| `--unclear` | `#5B6B8C` | `#9AA8CF` | Can't tell |
| `--highlight` | `#FFE9A8` | `#5A4A12` | Evidence highlight |
| `--border` | `#E4E0D8` | `#2A3630` | Lines |

Contrast: verify ≥4.5:1 for text pairs (use the browser devtools contrast checker). Risk is never colour-only: each verdict has an icon + word.

## 4. Typography

- UI: **Inter** (variable) or system UI stack fallback `ui-sans-serif, system-ui`. 
- Display (verdict headline): **Fraunces** or **DM Serif Display**, 600, to feel human. One display face only.
- Sizes (mobile-first): body 16, small 14, verdict headline 28/32, H2 20, min touch target 48 px.
- Load fonts with `next/font` (self-hosted, subset latin) to stay fast on 3G/4G.

## 5. Spacing, radius, motion

- 4-px grid. Radius: 12 (cards), 999 (chips), 16 (sheets).
- Shadow: one soft shadow only (`0 4px 16px rgb(0 0 0 / .06)`).
- Motion: 150–250 ms ease-out; verdict card slides up; highlights fade in sequentially (60 ms stagger). Respect `prefers-reduced-motion`.

## 6. Components (build only these)

`Button`, `Chip` (stage + risk), `VerdictCard`, `EvidenceList`, `HighlightedText`, `NextSteps`, `LangToggle`, `UploadDrop`, `HistoryItem`, `GuardianBanner`, `Toast`, `Sheet`, `SampleGallery`, `ShareCard`.

### VerdictCard anatomy

```
┌───────────────────────────────┐
│ 🛑  LIKELY A SCAM             │  ← risk chip (icon+word+colour)
│ Fake reversal scam            │  ← scam type (display font)
│ Confidence ▓▓▓▓▓▓▓▓░░ High    │
├───────────────────────────────┤
│ Why we think so               │
│ • Sender is not "MPESA"   [R02]│
│ • No balance line         [R03]│
│ • "Please reverse" script [R04]│
├───────────────────────────────┤
│ What to do now                │
│ 1 Don't send any money back   │
│ 2 Check your M-Pesa balance   │
│ 3 Forward the SMS to 333      │
│ [Call 333] [Share warning]    │
└───────────────────────────────┘
```

## 7. Logo (inline SVG, use as favicon + header)

A shield with a check whose tick stem forms a speech-bubble tail (message + verification).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Hakiki">
  <path d="M32 4 8 12v18c0 15 10 26 24 30 14-4 24-15 24-30V12L32 4Z" fill="#0F6B4F"/>
  <path d="M20 33l8 8 17-18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 46l-4 8 10-5" fill="#0F6B4F"/>
</svg>
```
Wordmark: "hakiki" lowercase in the display font, brand colour. App icon: logo on `--brand` rounded-square, 512×512 maskable.

## 8. Microcopy (EN / SW)

| Key | EN | SW |
|---|---|---|
| tagline | Check before you send. | Hakiki kabla ya kutuma. |
| paste_placeholder | Paste the message here | Bandika ujumbe hapa |
| upload | Upload screenshot | Pakia picha ya skrini |
| check_btn | Check it | Hakiki |
| stage_extract | Reading the message… | Inasoma ujumbe… |
| stage_rules | Running Kenya scam checks… | Inakagua dalili za utapeli… |
| stage_reason | Thinking it through… | Inachambua… |
| risk_high | Likely a scam | Huenda ni utapeli |
| risk_suspicious | Suspicious — be careful | Una shaka — kuwa mwangalifu |
| risk_safe | Looks genuine, but stay careful | Inaonekana halali, lakini kuwa makini |
| risk_unclear | Can't tell yet | Siwezi kuamua bado |
| why | Why we think so | Sababu |
| next | What to do now | Cha kufanya sasa |
| dont_send | Don't send money back | Usirudishe pesa |
| forward_333 | Forward the SMS to 333 | Tuma ujumbe huo kwa 333 |
| call_dci | DCI hotline 0800 722 203 | Simu ya DCI 0800 722 203 |
| disclaimer | Hakiki can be wrong. When in doubt, call 333. | Hakiki inaweza kukosea. Ukiwa na shaka, piga 333. |
| privacy | We don't keep your message. | Hatuhifadhi ujumbe wako. |
| delete | Delete my data | Futa data yangu |
| guardian_invite | Let someone you trust get alerts | Mruhusu unayemwamini apate tahadhari |
| guardian_consent | They see the risk level, never your messages. | Wanaona kiwango cha hatari, si ujumbe wako. |
| share_warning | Warn others | Waonye wengine |
| feedback_wrong | This was wrong | Hii haikuwa sahihi |

Native-speaker review: ask one Swahili speaker to read all SW strings before recording.

## 9. Share card (1080×1350, 4:5)

- Background: Muse Image generated per scam type, abstract, brand colours, no faces, no real brands.
- Overlay (deterministic, `@vercel/og`): risk chip, scam type (EN+SW), 3 bullet red flags (generic, no PII), "Hakiki kabla ya kutuma", URL.
- Text-safe zone: 80 px margins. Footer: small "Check yours: hakiki.vercel.app".
- Example headline: "Got 'sent by mistake, please reverse'? It's a scam. / Umetumiwa 'tumetuma kimakosa'? Ni utapeli."

## 10. Accessibility & low-end device

- WCAG AA contrast, focus rings, labels on inputs, `aria-live="polite"` on streaming verdict.
- Page weight target < 250 KB JS on first load; no heavy animation libraries.
- Works with 360 px width screens; large tap targets; offline banner.
