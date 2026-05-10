---
type: plan-review
title: "Canvas HTML Overlay Migration Plan Review"
date: "2026-05-07 16:27"
skills: ["ck:debug", "ck:brainstorm", "ck:project-organization"]
status: "needs-revision"
---

# Canvas HTML Overlay Migration Plan Review

## Summary
- **Issue:** Plan stale vs current simulation architecture.
- **Impact:** If implemented as written, likely duplicate overlay, duplicate KaTeX loading, weaker QA, route coverage miss.
- **Root cause:** Plan assumes no lab overlay/KaTeX and mixes architecture migration + localization + formula polish in broad phases.
- **Status:** Not ready for implementation.
- **Recommendation:** Rewrite plan around existing `.sim-lab-overlay`, 58-route contract gates, and incremental formula-only DOM overlay.

## Evidence
- `index.html` already loads KaTeX local first, CDN fallback: lines 11-13, 302-306.
- `js/sim-lab-ui.js` already creates `.sim-lab-scene` and `.sim-lab-overlay`: lines 75-81.
- `css/style.css` already styles `.sim-lab-overlay`: line 1192.
- Current route gates pass:
  - `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2`
  - `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58 --require-assessment-links --report-current`
  - `npm run test:sim:quality:baseline`

## Findings

### P0 - Architecture Assumption Wrong
Phase 1 says create new overlay in `sim-core.js` and add KaTeX CDN. Current code already has lab overlay in `SimLabUI`, and KaTeX is already offline-first with CDN fallback.

Risk: adding overlay in `createSimContainer` can create two overlay concepts: generic `sim-overlay` plus existing `sim-lab-overlay`. Breaks DRY and can cause CSS/layout ambiguity.

### P0 - Offline Contract Risk
Plan says insert KaTeX CDN links. Current browser tests block external requests for `file://` route smoke. Adding CDN-first or extra CDN dependencies can break offline-first guarantee.

Correct framing: do not change KaTeX loading unless proving current local-first fallback inadequate.

### P0 - Route Count Wrong
Phase 5 says manual sweep through `~40` simulation routes. Current manifest and QA gate are 58 routes. Plan must use 58 everywhere.

### P1 - Overlay Primitive Contract Underspecified
Plan proposes `P.domLabel`/`P.domPanel`, but does not define:
- how renderer gets `lab.overlay`
- keyed DOM identity per route/frame
- cleanup lifecycle on route dispose
- scaling with responsive canvas
- how structural renderer contract remains unique

Recommended API: `SimProfessionalLab.draw()` calls `P.beginOverlay(lab.overlay, lab.canvas, routeId)` before route renderer and `P.endOverlay()` after. Route renderers can call `P.domLabel(ctx, key, x, y, content, options)` without changing renderer function signatures.

### P1 - Localization Scope Incomplete
Phase 2 only targets manifest `prompt`. English remains in scene catalogs, renderer literals, fallback labels, legends, readout strings, and canvas handle labels.

Examples found:
- `js/sim-professional-lab.js`: `Simulation lab`, `Legacy scene`, `Handle`, `Vector`, `Readout`, `mode=`, `deg`
- `js/sims/ch*/`: renderer/panel strings like `Particle path`, `Static, sliding, rolling friction modes`, `Newton second law`

Plan needs a text inventory first, not just prompt translation.

### P1 - QA Gates Too Weak
Success criteria are mostly visual/manual. Current repo has strict gates for:
- 58 route manifest/objectives/checkpoints
- renderer/behavior uniqueness
- scene identity
- route mount via `file://`
- direct drag/readout
- assessment precondition and positive save path
- responsive 375/768/1280

Plan must list exact commands, not "manual sweep" only.

### P2 - Effort Estimate Too Low
Total 16h for architecture, localization, Ch1/Ch2/Ch3 migration, and E2E is optimistic. The work touches 13 renderer files, 7 scene catalog files, manifest, CSS, lab UI/professional engine, and browser QA.

More realistic: 1 focused architecture spike + 3 chapter batches + release verification. Keep each batch small.

### P2 - Plan File Structure Incomplete
Phase files miss required project sections: Context Links, Key Insights, Todo List, Security Considerations, Next Steps. Before implementation, plan should be rewritten to match repo planning rules.

## Brainstormed Approaches

### Approach A - Reuse Existing Lab Overlay
Add minimal overlay manager to `sim-route-renderer-primitives.js`, activated by `SimProfessionalLab.draw()`. Only formulas/high-value panels become DOM/KaTeX. Regular labels stay canvas.

Pros: KISS, minimal API churn, preserves renderer signature, aligns current `.sim-lab-overlay`.
Cons: Need careful DOM diff and cleanup.

Verdict: Recommended.

### Approach B - Move Overlay Into `sim-core.js`
Make `createSimContainer()` return `overlay`, then adapt all lab code around it.

Pros: generic for legacy simulations.
Cons: duplicates existing `SimLabUI` responsibility, higher regression risk, not needed for current 58 lab routes.

Verdict: Reject unless legacy non-lab simulations truly need overlay.

### Approach C - No Coordinate Overlay, Use Existing Panels Only
Keep canvas labels, render math in formula/status panels below canvas.

Pros: lowest risk, near-zero performance risk.
Cons: less direct spatial annotation, weaker visual upgrade.

Verdict: Acceptable fallback if overlay performance or schedule risk dominates.

## Recommended Revised Plan

### Phase 0 - Baseline & Inventory
- Confirm 58 route baseline commands pass.
- Inventory English strings in manifest, scene catalogs, renderers, professional lab shell.
- Decide term glossary: keep symbols/technical abbreviations when appropriate.

### Phase 1 - Overlay Manager On Existing Lab Overlay
- Do not add KaTeX CDN.
- Do not create a second overlay in `sim-core.js`.
- Add `beginOverlay/endOverlay/domLabel/domPanel/domMath` using existing `.sim-lab-overlay`.
- DOM updates keyed and diffed; remove stale nodes at `endOverlay`.
- Add resize/scaling check.

### Phase 2 - Data/UI Localization
- Translate manifest prompts/objectives only where natural.
- Translate scene titles, formulas, feedback/readouts, legends, fallback strings.
- Keep code keys, rendererId, behaviorId, expectedRendererId untouched.

### Phase 3 - Chapter Batches
- Ch1 first, then run unit + quality + route-mount subset.
- Ch2 next, then same gates.
- Ch3 next, then same gates.
- Convert only true formulas/panels to DOM/KaTeX; keep simple moving labels canvas.

### Phase 4 - Release Verification
- `npm run test:sim:unit`
- `npm run test:sim:quality`
- `npm run test:sim:semantic`
- `npm run test:sim:browser:route-mount`
- `npm run test:sim:browser:baseline`
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage`
- If visual polish changes are broad: run `npm run test:sim:browser`.

## Success Metrics
- 58/58 route mount pass through `file://`.
- No external network request required for KaTeX.
- Renderer contract still unique: 58 rendererId, 58 behaviorId, no family dispatch.
- Overlay labels align at 375, 768, 1280 widths.
- No stale DOM overlay nodes after route navigation.
- No English instructional UI text except accepted symbols/technical abbreviations.

## Previously Unresolved Questions
- Do we want full Vietnamese for UI terms like `handle`, `readout`, `mode`, or keep them as technical UI words?
- Are coordinate KaTeX labels required for every formula, or only for selected high-value annotations?
- Should this plan replace current `plan.md`, or become a new correction plan?

## Resolved Decisions
- User decision 2026-05-07: UI terms like `handle`, `readout`, `mode` must be 100% Vietnamese.
- User decision 2026-05-07: every coordinate formula must use KaTeX overlay.
- User decision 2026-05-07: revise existing plan files directly.
