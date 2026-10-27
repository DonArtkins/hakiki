# Hakiki decisions

Public, tracked. Baseline-private decisions with full reasoning live in `.baseline/docs/system-design/`
(git-excluded on this machine). A decision here never contradicts `docs/03_ARCHITECTURE.md` without a row below.

| ID | Decision | Alternative rejected | Reason | Status |
|---|---|---|---|---|
| ADR-1 | Rules before model | Pure LLM verdict | Cheaper, testable, cannot be talked down below a rule floor | proposed |
| ADR-2 | Responses API + `text.format` structured output | Chat Completions free text | Tools + schema together; schema-or-nothing gate | proposed |
| ADR-3 | No message-body or image storage | Store for training | Kenya DPA 2019; trust is the product | proposed |
| ADR-4 | Telegram bot, not WhatsApp-direct | WhatsApp Business API | Verification time exceeds the 8-day build | proposed |
| ADR-5 | Anonymous device session first | Mandatory signup | A judge must check a message in 10 seconds | proposed |
| ADR-6 | Single Next.js app, one engine `runCheck()` | Separate API service | One deploy, no channel logic in the engine | proposed |
| ADR-7 | Baseline in private mode on this machine | Public Baseline workflow files | Operator directive 2026-10-27; hackathon repo stays clean of workflow machinery | operator-directed |
| ADR-8 | Canonical specs in `docs/`; root duplicates deleted | Keep pack in `research/` only | `docs/` is the public spec layer; `research/` is intake provenance | operator-directed |
| ADR-9 | All `CLAUDE.md` content consolidated into Baseline-created agent files | Multiple CLAUDE.md copies | Operator directive 2026-10-27; single authority chain `CLAUDE.local.md` -> `.baseline/AGENTS.md` | operator-directed |
