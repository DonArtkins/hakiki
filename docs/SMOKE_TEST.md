# Smoke test log

Day-1 checks from `docs/04_TECH_STACK_AND_META_API.md` section 9. Nothing here is claimed until run.

| # | Check | Status | Evidence |
|---|---|---|---|
| 1 | `GET /v1/models` lists `muse-spark-1.3` from Kenya | NOT RUN | needs `MODEL_API_KEY` |
| 2 | Responses text call returns usage + cost fields | NOT RUN | needs `MODEL_API_KEY` |
| 3 | Structured output + tool call in one request | NOT RUN | needs `MODEL_API_KEY` |
| 4 | Vision transcription of a real screenshot | NOT RUN | needs sample + key |
| 5 | SAM 3.1 face mask stream | NOT RUN | P2, time-boxed 3 h |
| 6 | Real M-Pesa SMS starts with today's code prefix (2026-10-27 -> `UJR`) | NOT RUN | operator's own SMS |
