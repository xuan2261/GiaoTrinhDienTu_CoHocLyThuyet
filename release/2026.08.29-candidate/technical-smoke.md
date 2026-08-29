# Technical smoke — 2026.08.29-candidate

Observed: 2026-08-29

Artifact:
- Staging: `release/2026.08.29-candidate/package/`
- ZIP SHA-256: `f38996d8614f73dc7355124606c99bf983d01171e00dd0adc0f373a7b762ee0e`

## `file://`

- Fresh local state opened the reader and chapter quiz routes.
- Quiz rendered 100 questions and 8 scope options.
- Chapter reference tables rendered 19/27/25 core entries for Chapters 1/2/3.
- KaTeX vector accents stayed inside their symbol cells; document overflow was zero.
- Browser console/page errors: none.

## HTTP

- Staging served with `python -m http.server`.
- Quiz scope and chapter-reference routes loaded from the standalone package.
- Browser console/page errors: none.

## Boundary

This is technical smoke evidence, not independent candidate acceptance. `data/release-smoke-review.json` remains pending until an independent reviewer records environment, role, evidence and decision.
