---
phase: 3
title: "P0 Static Flag For Concept-Only Routes"
status: completed
priority: P0
effort: "2h"
dependencies: [1]
---

# Phase 3: P0 Static Flag For Concept-Only Routes

> ⚠ RED TEAM 2026-05-21 — see plan.md ## Red Team Review (F2, F3, F4).
> - F2 fixed inline: scene catalog paths corrected. The 6 ch3 concept routes that remain static all live in `js/sims/ch3/ch3-dynamics-all-18-scenes.js` (not `ch3-newton-laws-scenes.js`). ch2-7-2 lives in `js/sims/ch2/ch2-relative-plane-motion-scenes.js` (active loader confirmed via `index.html`). Per-file `staticFor` triplication collapses to single allowlist.
> - F4 fixed inline: `[data-sim-play]` selector added at the Play-button construction site as part of GREEN. RED test now uses positive-control assertion (`button:has-text("▶ Chạy")` count: 0 on static, 1 on non-static).
> - F3 **resolved (hybrid A + B + C, plus reclassification)**:
>   - **ch3-7-2 reclassified as animated** — its `onTick_ch372` writes time-oscillating residuals (`Math.sin/cos(t·k)`); moved to Phase 5 (no behavior change needed, renderer already consumes `_t`-derived state via `d`). Removed from this phase's static set.
>   - Remaining 7 static routes split by engine policy:
>     | Route | Policy | Why |
>     |---|---|---|
>     | ch3-2-5 (Dynamic FBD) | **A — no engine** (`static: true`) | slider-only; no time-derived state |
>     | ch3-4-1 (D'Alembert) | **A — no engine** | slider-only |
>     | ch2-7-2 (Numeric checker Ch2) | **A — no engine** | slider-only |
>     | ch3-1-3 (Pseudo-force) | **B — tick-without-button** (`static: true, tickWithoutButton: true`) | needs `_t` for inertial-frame readout |
>     | ch3-2-3 (Newton-III pair) | **B — tick-without-button** | accumulates `state.v1/v2` per dt |
>     | ch3-6-3 (Collision residual) | **B — tick-without-button** | needs `_t` for time readout |
>     | ch3-7-1 (Theorem selector) | **C — static + strip `appendTime`** (`static: true`, removed from `appendTime` policy) | slider-cycled `problemType`; no meaningful time readout |
>   - Engine policy implemented in `js/sim-professional-lab.js` Phase 03 GREEN: `if (scene.static && scene.tickWithoutButton && typeof behavior.onTick === 'function') lab.anim.start();`
>   - `appendTime` policy in `js/sims/ch3/ch3-dynamics-all-18-scenes.js:206` updated: drop `'ch3-7-1'`; ch3-7-2 also drops out (it joins the animated set, where Play handles its own `_t`).

## Context Links

- Reader gating: `js/sim-professional-lab.js:1655-1675`
- Active scene catalogs (verified by `index.html` script tags):
  - `js/sims/ch3/ch3-dynamics-all-18-scenes.js` — owns ALL 7 ch3 concept routes (ch3-1-3, ch3-2-3, ch3-2-5, ch3-4-1, ch3-6-3, ch3-7-1, ch3-7-2)
  - `js/sims/ch2/ch2-relative-plane-motion-scenes.js` — owns ch2-7-2 (and ch2-5-1 which is animated by Phase 05; only ch2-7-2 takes the `static: true` flag in this phase)
  - `js/sims/ch2/ch2-kinematics-scenes.js` is loaded but does **not** own ch2-7-2 (verify via grep before edit)
- Verification report mục 4.2 — "Concept diagram (đúng spec)" — 8 routes (post-F3, this phase handles 7; ch3-7-2 reclassified to animated and moved to Phase 05)
- Bucket fixture from phase 1: `tests/sim-canvas-evolution-fixtures.js`
- Scene registry (real symbol): `window.SimSceneRegistry` (`js/sim-scene-registry.js`) — NOT `window.SIM_SCENES`

## Overview

Add `static: true` flag to 7 scene definitions (8th — ch3-7-2 — reclassified to animated and handled in Phase 05). Reader (`js/sim-professional-lab.js`) reads the flag and short-circuits Play-button construction. For routes that still need engine ticks for time-derived readouts, scene also carries `tickWithoutButton: true` and the reader calls `lab.anim.start()` directly. Reset stays. Aria attribute on canvas updated to `Sơ đồ tĩnh của <route title>` (a11y); Play-button focus state cleared so screen readers don't announce orphaned `aria-pressed`. Sweep harness clears `knownDefect: "phase-03-suppress"` for all 7 routes.

## Key Insights

- Scene contract is the right surface: scene metadata flows through `getScene(routeId)` → `mount()` already, so `scene.static` propagates without touching behavior contracts.
- All 7 routes in this phase are *concept diagrams* — Play button currently only flips `state.isPlaying` and re-labels itself; no observable change. Removing it eliminates the WCAG 2.5.3 "Label in Name" defect. (ch3-7-2 was originally in this set but has been reclassified to animated for Phase 05 because its `onTick_ch372` writes time-oscillating residuals.)
- **[F3 resolved]** Engine RAF gating split by policy (see banner). Routes A run with `lab.anim` stopped — pure static rendering. Routes B set `scene.tickWithoutButton: true`, and the reader calls `lab.anim.start()` immediately after mount so `state._t` advances without surfacing a Play affordance. Route C (ch3-7-1) is static-only and removed from `appendTime` so no dead "t=0.00 s" readout appears. ch3-7-2 leaves the static set entirely and is animated by Play in Phase 05.
- Resetting must still clear `_t` to 0 — covered by existing `lab.reset()` path which is button-independent.

## Requirements

### Functional

- Each of the 8 scenes gains `static: true` (or equivalent flag) in its catalog row.
- `js/sim-professional-lab.js` Play-button block (line 1656) checks `if (typeof behavior.onTick === 'function' && !scene.static)`.
- Canvas `aria-label` for static routes is `Sơ đồ tĩnh của <scene.title>`; non-static routes keep generic `Khu vực mô phỏng`.
- Reset button still appears + functions; sliders + readouts unchanged.
- No DOM node `[data-sim-play]` rendered for static routes (querySelector returns null).
- Status pill ("đang chạy" / "đã tạm dừng") not shown for static routes; replaced with `tương tác trực tiếp` constant.

### Non-functional

- ≤ 220-line cap holds. `sim-professional-lab.js` already at edge; add ≤ 4 net lines, route through existing helpers.
- No behavior contract change; `tests/simulation-runtime-regressions.test.js` passes unchanged.

## Architecture

```
Scene catalog (per route)         js/sim-professional-lab.js (line 1655)
─────────────────                 ──────────────────────────────────────
{                                 if (typeof behavior.onTick === 'function'
  routeId: 'ch3-1-3',                && !scene.static) {
  template: 'inertial-frames',     playButton = core.addButton(...)
  static: true,    ◀── NEW       }
  initialState: {...},            else {
  controls: [...],                  // a11y: clear stale aria-pressed if any
  readouts: [...],                  // canvas aria-label = `Sơ đồ tĩnh của ${scene.title}`
  autoplay: false                 }
}
```

## Related Code Files

### Modify
- `js/sims/ch3/ch3-dynamics-all-18-scenes.js` — flag all 7 ch3 concept routes via single `staticFor(routeId)` allowlist; consumed by the unified `scene(row)` builder
- `js/sims/ch2/ch2-relative-plane-motion-scenes.js` — flag ch2-7-2 (verify ownership before edit; loader-active per `index.html`)
- `js/sim-professional-lab.js` — gate `playButton` creation + canvas aria-label; **add `playButton.setAttribute('data-sim-play', 'true')` at the construction site** so Phase 1 utils + Phase 3 RED test can use the selector reliably
- `js/sim-lab-ui.js` — accept `staticLabel` option for canvas aria-label override (≤ 6 lines)
- `tests/sim-canvas-evolution-fixtures.js` — clear `knownDefect` for 7 routes already in `STATIC_ROUTES_CONCEPT_DIAGRAM`; ch3-7-2 moves OUT of this list and INTO `ANIMATED_ROUTES_EVOLVING` via Phase 05 (5e); update the self-check assertion accordingly
- `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json` — clear `knownDefect: "phase-03-suppress"`

### Create
- `tests/phase-09-static-scene-flag.test.js` — Node test asserting 7 routes carry `static: true` in their resolved scene metadata, and the 3 Routes B (`ch3-1-3`, `ch3-2-3`, `ch3-6-3`) also carry `tickWithoutButton: true` (loads via `window.SimSceneRegistry`, NOT `window.SIM_SCENES`)
- `tests/phase-09-static-routes-no-play-button.spec.js` — Playwright spec mounting each, querying `[data-sim-play]` returns null AND a positive-control non-static route (e.g. ch3-2-2) returns a non-null `[data-sim-play]`

### Delete
- (none)

## Implementation Steps

### RED

1. Author `tests/phase-09-static-scene-flag.test.js`:
   - For each of the 7 static routeIds, resolve scene metadata via `window.SimSceneRegistry.get(routeId)` (the real registry symbol — `js/sim-scene-registry.js`). Note: `window.SIM_SCENES` does **not** exist; do not reference it.
   - Assert `scene.static === true`.
   - Run: **fails** today (flag absent).
2. Author `tests/phase-09-static-routes-no-play-button.spec.js`:
   - Positive control: `page.goto file://#ch3-2-2`, `await page.waitForSelector('canvas')`, `expect(await page.$('[data-sim-play]')).not.toBeNull()` AND `expect(await page.locator('button:has-text("▶ Chạy")').count()).toBe(1)`.
   - For each of the 7 static routes: `expect(await page.$('[data-sim-play]')).toBeNull()` AND `expect(await page.locator('button:has-text("▶ Chạy")').count()).toBe(0)`. (ch3-7-2 is in the animated bucket post-Phase-05; it keeps its Play button.)
   - Run: today the positive control will FAIL too (no `data-sim-play` attribute exists yet — see step 6 GREEN). That is expected; both pass once GREEN lands.
3. Add the new spec to `package.json` `test:sim:browser` chain.

### GREEN

4. Add a single allowlist + helper to `js/sims/ch3/ch3-dynamics-all-18-scenes.js` (the unified catalog that produces all 7 ch3 concept routes):
   ```js
   const STATIC_CH3_CONCEPT = ['ch3-1-3', 'ch3-2-3', 'ch3-2-5', 'ch3-4-1', 'ch3-6-3', 'ch3-7-1', 'ch3-7-2'];
   function staticFor(routeId) { return STATIC_CH3_CONCEPT.includes(routeId); }
   ```
   Wire into `scene(row, index)` builder: `static: staticFor(routeId) || false`.
5. In the active ch2 scene catalog (verify via `grep -n "ch2-7-2" js/sims/ch2/*.js` and cross-check `index.html` script tags — current evidence points to `ch2-relative-plane-motion-scenes.js`), add `static: routeId === 'ch2-7-2'` to the scene object returned by the row builder.
6. Edit `js/sim-professional-lab.js:1655-1661` — add `data-sim-play` attribute as part of GREEN so Phase 1 utils + Phase 3 RED test work:
   ```js
   if (typeof behavior.onTick === 'function' && !scene.static) {
     playButton = core.addButton(lab.controls, '▶ Chạy', () => {
       if (lab.isPlaying) { lab.pause(); } else { lab.resume(); }
     });
     playButton.setAttribute('data-sim-play', 'true');
     updatePlayButton();
   }
   ```
7. In the same block, when `scene.static`:
   - `lab.canvas.setAttribute('aria-label', \`Sơ đồ tĩnh của ${scene.title}\`)`.
   - `lab.status.textContent = 'tương tác trực tiếp'`.
   - Skip the autoplay branch entirely (already gated, but assert with comment).
   - **F3 hybrid policy** (per banner table):
     - Routes A (`ch3-2-5`, `ch3-4-1`, `ch2-7-2`) — slider-only; do nothing extra. Engine stays stopped; no `_t` readout.
     - Routes B (`ch3-1-3`, `ch3-2-3`, `ch3-6-3`) — scene also carries `tickWithoutButton: true`. Reader adds:
       ```js
       if (scene.static && scene.tickWithoutButton && typeof behavior.onTick === 'function') {
         lab.anim.start();
       }
       ```
       Engine advances `state._t` and `behavior.onTick` runs every frame; no Play affordance shown.
     - Route C (`ch3-7-1`) — keep `static: true` only; no engine. Phase 03 also drops `'ch3-7-1'` from the `appendTime` policy in `js/sims/ch3/ch3-dynamics-all-18-scenes.js:206` so the frozen "t=0.00 s" suffix disappears.
   - ch3-7-2 is NOT in this phase — it joins the animated set in Phase 05; its Play affordance stays.
8. Re-run RED tests → both pass.

### REFACTOR

9. Extract 7-route allowlist into `js/sim-route-manifest.js` if multiple consumers grow (defer if only scene catalogs need it).
10. Clear `knownDefect: "phase-03-suppress"` from baseline JSON for all 7 routes; bucket stays `static-concept`; expectedUniqueFrames `[1, 2]`. (ch3-7-2's `knownDefect` is cleared by Phase 05 instead.)
11. Run `npm run test:sim:scene-identity` and `npm run test:sim:renderer-contract` — ensure scene signature change doesn't break identity gate. If signature includes `static`/`tickWithoutButton`, regenerate snapshot via `--update`.
12. Manual a11y check: load each route, focus canvas with Tab, confirm screen reader announces "Sơ đồ tĩnh của …".

## Tests

| Test | Asserts |
|---|---|
| `phase-09-static-scene-flag.test.js` | All 7 routes return `scene.static === true` from registry; the 3 Routes B also return `scene.tickWithoutButton === true`. |
| `phase-09-static-routes-no-play-button.spec.js` | `page.$('[data-sim-play]')` is null for all 7 routes; non-null for at least one control route (e.g. ch3-2-2). |
| `phase-09-static-routes-no-play-button.spec.js → reset still works` | Reset button present and clickable; clicking returns sliders to initial state. |
| `phase-09-static-routes-no-play-button.spec.js → canvas aria-label` | Canvas `aria-label` matches `^Sơ đồ tĩnh của`. |
| `phase-09-static-routes-no-play-button.spec.js → routes B tick without button` | For each B route, `state._t` advances between t=0 and t=2 (read via `await page.evaluate(() => window.__simStateProbe('_t'))` or sweep hash differs). |
| `sim-canvas-evolution.spec.js → 7 static-concept routes` | `uniqueFrames ∈ {1,2}` per bucket; previously RED routes now GREEN. (ch3-7-2 moves to animated bucket via Phase 05.) |
| `simulation-runtime-regressions.test.js` | No regression. |
| `simulation-browser.spec.js → @route-mount` | All 58 routes still mount cleanly. |

## Todo List

- [x] RED: Node + Playwright tests fail
- [x] GREEN: 4 file edits (3 scene catalogs + reader + lab-ui)
- [x] GREEN: tests pass
- [x] REFACTOR: clear knownDefect tags (7 routes; ch3-7-2 deferred to Phase 05)
- [x] REFACTOR: scene-identity / renderer-contract gates pass
- [x] Manual a11y check on all 7 routes
- [x] `npm run test:sim:release` green

## Success Criteria

- [x] 7 scene definitions carry `static: true` (ch3-7-2 deferred to Phase 05).
- [x] 3 of those 7 (`ch3-1-3`, `ch3-2-3`, `ch3-6-3`) also carry `tickWithoutButton: true`; reader starts engine for them without Play.
- [x] `ch3-7-1` removed from `appendTime` allowlist in `ch3-dynamics-all-18-scenes.js:206`.
- [x] Reader gates Play button on `!scene.static`.
- [x] Canvas aria-label updated for static routes.
- [x] All 8 tests in the table pass.
- [x] No file exceeds 220 lines.
- [x] No regression in `simulation-runtime-regressions.test.js`, `simulation-physics.test.js`.

## Risk Assessment

- **Scene-identity gate may detect signature change** → expected; regenerate snapshot in step 11. If flow blocks merge, document in journal.
- **Some sliders rely on `lab.isPlaying === true` to show velocity readouts** → grep `lab.isPlaying` references; update to `(lab.isPlaying || scene.static)` if any divergence; add to RED tests.
- **F3 hybrid policy creates 3 sub-modes (A/B/C)** → kept in a single banner table + a single 3-line conditional in the reader. Risk: future maintainer adds a new static route without picking A/B/C. Mitigation: scene-identity test asserts every `static: true` route either has `tickWithoutButton` set or is excluded from `appendTime` (single rule, machine-checked).

## Security Considerations

None.

## Next Steps

Phase 04 consumes the cleared baseline JSON to wire CI fail-on-diff. Phase 05 begins animating the 5 candidates (4 originals + reclassified ch3-7-2).
