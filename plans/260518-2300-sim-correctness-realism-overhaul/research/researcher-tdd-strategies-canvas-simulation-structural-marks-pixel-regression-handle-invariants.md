# TDD Strategies for Canvas-Based Simulations
**Researcher:** TDD Canvas  
**Date:** 2026-05-18  
**Context:** 58-route DeCuong simulation suite, Playwright + Node vm tests, static offline site

---

## 1. Structural Marks Pattern

**What it is:** Intercept canvas draw calls and record them as strings (`"arc:380:220:18"`, `"lineTo:500:300"`). Assert on the sequence or presence of marks rather than pixels.

**Already in this repo:** `sim-route-renderer-primitives.js` implements this fully — `resetMarks(routeId)`, `mark(kind, ...vals)`, `marks()`, `traceContext(ctx)`. The `data-structural-marks` attribute is written to the lab wrapper DOM node and read back by `labState()` in `simulation-test-utils.js`. The trace wraps 10 canvas methods (`fillRect`, `arc`, `ellipse`, `moveTo`, `lineTo`, etc.) up to a 360-mark limit.

**Pros:**
- Deterministic: no font/AA/GPU variance
- Fast: runs in Node vm without a browser
- Catches regressions in draw-call topology (body moved, spring missing, arrow disappeared)
- Already wired — zero infra cost to use

**Cons:**
- Sensitive to coordinate rounding: `arc:380:220` vs `arc:381:220` fails on float drift
- Sequence order matters; parallel draw calls in different order = false failure
- Does not catch color/style regressions (only geometry)
- 360-mark cap silently truncates complex scenes

**Gotchas:**
- `mark()` rounds floats to integers (`Math.round`). Tests must do the same when building expected strings.
- `withoutTrace(fn)` suppresses marks for decorative draws — use it for backgrounds/grids so marks stay signal-only.
- `traceContext` is idempotent (`__simRouteTraceWrapped` guard) but must be called before the first draw, not after.
- Assert on a **subset** (`.some()` / `.filter()`) not the full sequence — full-sequence asserts break on any cosmetic addition.

**Recommended use:** Assert that key primitives appear (`body:arc`, `spring:lineTo`, `force-arrow:lineTo`) and that their rounded coordinates match the physics state. Do not assert full sequence order.

---

## 2. Pixel-Snapshot Testing

**Golden PNG + tolerance approach:** Capture `canvas.toDataURL()`, store as baseline PNG, diff with pixelmatch at a per-pixel tolerance (typically 0.1–0.15).

**Where canvas tests typically fail:**
- **Font kerning:** `fillText` output varies by OS font hinting (Windows ClearType vs macOS CoreText). Same font, different pixel positions.
- **Sub-pixel anti-aliasing:** Arc/ellipse edges differ by 1–2px between Chrome versions and GPU backends.
- **System fonts:** `"Segoe UI", Inter, sans-serif` (used in this repo's `label()`) resolves differently on Windows vs Mac — character widths shift.
- **Canvas scaling:** DPR (devicePixelRatio) differences between CI and dev machines cause full-image size mismatches.

**Current repo approach:** `canvasStats()` in `simulation-test-utils.js` uses a FNV-style pixel hash over a 2px stride sample, plus `variants` count and `ink` count. This is a lightweight "not blank" check, not a golden-image regression test. It avoids all the above failure modes.

**Verdict:** Full golden-PNG testing is not worth adding for this project. The font/AA variance across Windows + Mac (the stated constraint) makes baseline maintenance expensive. The existing hash + variants approach is the right level for "canvas is not blank and has drawn something meaningful."

---

## 3. State-Invariant Testing for Handle Drag

**The invariant:** After any state mutation (drag, tick, reset, slider change), `handle.get()` must return a point equal to the body's canvas anchor.

**Pattern (Node vm, no browser):**
```js
const state = { bx: 380, by: 220, F: 60, angle: Math.PI / 4 };
behavior.onTick(ctx, state, 0.1, 0.1);
// The renderer computes handle tip from state
const tip = computeTip(state); // same formula as getTip in addVectorHandle config
const anchor = { x: state.bx, y: state.by };
assert.ok(Math.abs(tip.x - anchor.x - ...) < 1e-9, 'tip offset from anchor is deterministic');
```

**For the "handle and body always coincide" case** (vector handle base = body position):
- The `addVectorHandle` config's `getTip` closure captures `state` by reference.
- The invariant is: `getTip().x === bodyX(state)` at every tick, not just at t=0.
- Test by running `onTick` with 5–10 different state mutations and asserting the relationship holds each time.
- This is a **property test**, not a point test — vary inputs, assert the relationship.

**Gotcha:** `applyConstraint` in `sim-interactions.js` may clamp the handle position. The invariant must be tested *after* constraint application, not on raw `getTip()`.

---

## 4. Animation Tick TDD

**Pattern already in repo** (`phase-01-tdd.test.js`):
- vm context with `requestAnimationFrame: cb => setTimeout(cb, 16)` — deterministic mock
- `engine.tick(timestamp)` called with explicit timestamps: `tick(0)`, `tick(100)`, `tick(120)`
- Assert `updateCalls` count and `lastDelta` value

**For behavior-level tick TDD** (already used in `phase-08-tdd.test.js` and `phase-09-12-tdd.test.js`):
```js
// t=0: initial state
behavior.onTick(ctx, state, 0, 0);
assertInitialInvariants(state);

// t=Δt: one step
behavior.onTick(ctx, state, 0.05, 0.05);
assertPhysicsStep(state, 0.05);

// t=N·Δt: accumulated
for (let i = 0; i < 20; i++) behavior.onTick(ctx, state, 0.05, 0.05);
assertLongRunInvariants(state); // energy bounds, no NaN, no Infinity
```

**Deterministic seed:** The behaviors in this repo are deterministic (no `Math.random()`). No seed needed. If randomness is added, inject it via `state.seed` and mock at the behavior level.

**Key assertions at each tick level:**
- t=0: no NaN in any state field, readout keys present
- t=Δt: physics formula holds (e.g., `an ≈ v²/ρ`)
- t=N·Δt: no energy explosion, trajectory arrays bounded, no Infinity

---

## 5. Visual Regression Infra — Recommendation

**Options evaluated:**

| Option | Offline static | Windows+Mac | Docker-free | Maintenance |
|---|---|---|---|---|
| Playwright `toHaveScreenshot` (pixelmatch) | Yes | Yes | Yes | High — golden PNGs per OS |
| jest-image-snapshot | Yes | Yes | Yes | High — same font/AA problem |
| Custom canvas hash (current) | Yes | Yes | Yes | Low — hash is platform-neutral |

**Recommendation: keep and extend the existing `canvasStats()` hash approach.**

Rationale: The repo already has `canvasStats()` returning `{ hash, variants, ink, edge }`. This is platform-neutral because it samples pixel data after rendering, not before. Extend it with:
- `assert variants > N` (scene-specific minimum, e.g. 50 for a complex statics scene)
- `assert ink > M` (minimum non-blank pixels)
- `assert edge.left === 0 && edge.right === 0` (no content bleeding to canvas edge)

Do NOT add Playwright `toHaveScreenshot` or jest-image-snapshot. Both require per-OS golden baselines and will produce false failures on Windows vs Mac due to font rendering differences in `label()` calls.

---

## 6. "Fix Bug X Without Breaking 57 Other Routes" — Diff-Only Invariants

**Pattern:** Capture a baseline snapshot of all 58 routes before the fix, apply the fix, assert only the changed routes differ and all others are identical.

```js
// Before fix: capture baseline
const baseline = {};
for (const route of ALL_ROUTES) {
  await openRoute(page, route);
  baseline[route] = await canvasStats(page);
}

// Apply fix, then:
for (const route of ALL_ROUTES) {
  await openRoute(page, route);
  const after = await canvasStats(page);
  if (FIXED_ROUTES.includes(route)) {
    expect(after.hash).not.toBe(baseline[route].hash); // fix changed it
  } else {
    expect(after.variants).toBeCloseTo(baseline[route].variants, -1); // others stable
    expect(after.ink).toBeCloseTo(baseline[route].ink, -1);
  }
}
```

**Structural marks for diff-only:** Assert that the mark sequence for non-fixed routes is identical (same mark count, same key primitives). This is cheaper than pixel comparison and catches accidental regressions in draw topology.

**Existing pattern to leverage:** The `@route-mount` loop in `simulation-browser.spec.js` already iterates all 58 routes. Add a `@regression-guard` tag to a separate test that runs the baseline/after comparison only when `FIXED_ROUTES` env var is set.

---

## 7. "Handle and Body Always Coincide" — Generic Across 58 Routes

**The invariant:** For any route with a vector handle, the handle's base point (anchor) must equal the body's canvas position at every tick.

**Generic test structure:**
```js
for (const route of ALL_ROUTES) {
  const scene = SimSceneRegistry.get(route);
  if (!scene || !scene.interactions) continue;
  const state = { ...scene.initialState };
  behavior.onTick({ routeId: route }, state, 0.05, 0.05);
  // Each interaction config that has getAnchor must match body position
  for (const interaction of scene.interactions) {
    if (typeof interaction.getAnchor !== 'function') continue;
    const anchor = interaction.getAnchor(state);
    const body = interaction.getBodyPosition(state);
    assert.ok(Math.abs(anchor.x - body.x) < 1, `${route}: handle anchor x must equal body x`);
    assert.ok(Math.abs(anchor.y - body.y) < 1, `${route}: handle anchor y must equal body y`);
  }
}
```

**Practical constraint:** The current `addVectorHandle` config does not expose `getAnchor` — the anchor is implicit (the body position in state). The generic test requires either:
1. Adding `getAnchor` to the interaction config (preferred — explicit contract), or
2. Deriving anchor from the renderer's structural marks: the first `arc` mark in a frame is typically the body center.

**Recommended approach:** Add `getAnchor: (state) => ({ x: state.bx, y: state.by })` to each `addVectorHandle` config. Then the generic test above works across all 58 routes with zero per-route special-casing. This is a one-time annotation cost, not ongoing maintenance.

---

## Unresolved Questions

1. The `data-structural-marks` attribute is written by `sim-professional-lab.js` after each render frame — but only if the renderer calls `marks()` and the lab passes them through. Confirm all 58 renderers call `resetMarks()` + `traceContext()` at frame start, or the attribute will be stale/empty for some routes.

2. The `canvasStats()` hash uses a 2px stride sample. For routes with fine detail (spring coils, trajectory dots), the stride may miss ink. Consider stride=1 for routes where `variants` is suspiciously low.

3. `addVectorHandle` does not currently expose `getAnchor`. The generic handle/body coincidence test (§7) requires a small API addition before it can be written.
