# Phase 03 — Autoplay Preview Mode

## Spec
`tests/sim-review-2026-05-19/empty-panel-hint.spec.js` — second loop.
- `AUTOPLAY_PREVIEW_ROUTES`: scene's `autoplay` must match `{ mode: 'preview-pause', frames: > 0 }`.

## Routes (`AUTOPLAY_PREVIEW_ROUTES` — 2)
ch3-5-4, ch3-6-2

## Root Cause Hypothesis
Scene defs lack `autoplay` metadata. Need `scene.autoplay = { mode: 'preview-pause', frames: N }`.

## Fix Steps
1. Add `autoplay: { mode: 'preview-pause', frames: 60 }` to each scene def.
2. Run spec: `npx playwright test tests/sim-review-2026-05-19/empty-panel-hint.spec.js`.

## Done When
- 2 spec assertions PASS

## Note
The runtime behavior of preview-pause (auto-play 60 frames then pause) is not asserted by the spec — only the metadata. Implementation runtime hook can land separately if not already present in `SimSceneRegistry` consumers.
