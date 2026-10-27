# Hakiki art direction

One idea: "Check before you send" — a calm second opinion in under 10 seconds (studio S1).
Audience believes every official-looking SMS might be real; Hakiki must feel like a trusted older
cousin, never a cop or a hype AI brand (docs/07). Direction: Calm Guardian — warm paper, deep green,
serif verdict headline, evidence highlighted in place. Losers: Safaricom-mimic green (banned,
misleading) and dark fintech (outdoor readability).

## Tokens (source of truth: `src/app/globals.css`, Tailwind v4 bridged via `@theme inline`)

docs/07 section 3 colours, plus the F02 refinement (2026-10-27, spec web/02): framed sheet on
`--canvas-inset`, E1/E2/E3 soft elevation, radius card 16 / sheet 20 / input 12 / pill, risk soft
fills and risk text variants, motion tokens 150/250 ms ease-out. Grammar borrowed from the inspo
method catalogued in `inspo/README.md` (tokens with provenance, warm canvas, hairline cards, pill
chips, overline labels, striped meters, segmented control); values stay Hakiki's. Rejected from
inspo: neumorphism, gradient buttons, dark-canvas dashboards, marketing spectacle in the product.

Contrast (computed 2026-10-27, both themes): every text pair >= 4.5:1; light warn text darkened to
`#8F6210` (5.35 on white) and safe text to `#157347` (5.87) — fills keep the brighter hues.
Type: Fraunces display + Inter UI via `next/font` (self-hosted); mono only for codes.
Components and conventions: `.baseline/docs/ui-registry.md` (private Baseline workspace).
Verification for UI work: 360/390 px + desktop screenshots, browser-run verdict flow, EN/SW toggle,
`check_ui_copy.py`, contrast table in the tracker (studio S9).

## Full-screen experience (2026-10-27)

No framed sheet. Landing is full viewport with one orchestrated reveal; the product uses a
full-viewport sidebar shell (mobile top and bottom bars), a disciplined dashboard from real
check history only, and the Studio where boldness is spent in one place: the live Hakiki
Machine. Animation discipline (operator direction): GSAP and Three.js only as route-level
dynamic imports, Three.js only inside the Studio machine surface, never in landing or
dashboard initial JS. Transform and opacity only; reduced motion keeps the same order.
