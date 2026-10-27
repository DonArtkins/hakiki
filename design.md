# Hakiki art direction

One idea: "Check before you send" — a calm second opinion in under 10 seconds (studio S1).
Audience believes every official-looking SMS might be real; Hakiki must feel like a trusted older
cousin, never a cop or a hype AI brand (docs/07). Direction: Calm Guardian — warm paper, deep green,
serif verdict headline, evidence highlighted in place. Losers: Safaricom-mimic green (banned,
misleading) and dark fintech (outdoor readability). Tokens live in code: `src/app/globals.css`
(custom properties from docs/07 section 3); type: Fraunces display + Inter UI via `next/font`;
4 px grid, radius 12/999/16, one soft shadow. Motion: CSS 150-250 ms ease-out, sequential highlight
fade, `prefers-reduced-motion` respected (KB Motion section 8: animate only to show cause).
Verification for UI work: 360/390 px screenshots, contrast >= 4.5:1, keyboard pass (studio S9).
