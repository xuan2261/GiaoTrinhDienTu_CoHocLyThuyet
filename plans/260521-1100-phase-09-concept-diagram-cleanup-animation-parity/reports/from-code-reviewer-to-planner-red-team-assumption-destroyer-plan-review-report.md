---
from: code-reviewer
to: planner
plan: 260521-1100-phase-09-concept-diagram-cleanup-animation-parity
mode: red-team / assumption-destroyer (Scope Auditor, Full tier)
date: 2026-05-21
total_findings: 8
severity_breakdown: { Critical: 4, High: 3, Medium: 1 }
---

# Red-Team Plan Review — Assumption Destroyer

Hostile review of the Phase-09 plan. The two prior red-team reviews (security-adversary, scope-complexity-critic) already flagged `state._v0`, `window.SIM_SCENES`, and `[data-sim-play]` as nonexistent APIs. This pass focuses on *new* assumption failures missed by those reviews, with grep-verified evidence.

---

## Finding 1: Removing Play on "static" routes silently freezes `state._t` — breaking 7 of 8 routes' time readouts and ch3-7-2's evolving residuals

- **Severity:** Critical
- **Location:** Phase 03 "Key Insights" (line 30) — claim that engine still ticks `_t` after Play removal; Phase 03 "Risk Assessment" (line 162) — `appendTime` readouts assumed harmless.
- **Flaw:** The plan asserts "Existing engine still ticks `_t` → harmless; readouts that show `_t` still update for static routes (verified — `appendTime` policy already includes the 7 concept routes per `readoutPolicyFor`)." This is **wrong**. The engine only advances `state._t` while `lab.anim` is running, and `lab.anim` is started **only** via `lab.resume()`, which is called **only** when (a) the Play button is clicked, or (b) `scene.autoplay` is truthy. Phase 03 removes Play *and* keeps `autoplay: false` (default for these 8 routes per `autoplayFor` returning `false`), so `lab.resume()` is never called → `onFrame` never fires → `behavior.onTick(...)` never runs → `state._t` is frozen at 0 forever.
- **Failure scenario:**
  - User opens ch3-7-2 ("Numeric checker") after Phase 03 ships.
  - Behavior `onTick_ch372` (`js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js:116-126`) is designed to compute `residual1..4 = sin/cos(t * k) * scale` — *time-varying* oscillation that the renderer consumes via `d.residual1..4` (`js/sims/ch3/ch3-collision-exercises-renderers.js:121-124`). With `_t` frozen, residuals stay at the t=0 sin(0)=0/cos(0)=1 constant snapshot. Score reads 100 forever (`100 - (0+0.01+0+0.025)*400 ≈ 86` at t=0 vs cycling 60–95 in animation), so the "numeric checker" no longer demonstrates checking — it is a dead diagram.
  - Same regression for **ch3-1-3** (pseudo-force readout), **ch3-2-3** (Newton-III pair), **ch3-5-1** (CM acceleration), **ch3-5-2** (impulse-momentum), **ch3-6-3** (collision residual), **ch3-7-1** (theorem selector) — all have `appendTime: true` per `js/sims/ch3/ch3-dynamics-all-18-scenes.js:206`, all currently rely on Play click → `_t` tick → readout text update.
- **Evidence:**
  - `js/sim-professional-lab.js:1668` — `startBehaviorAnimation(lab, scene, state, draw, behavior, scope);` registers `onFrame`, but does not call `start()`.
  - `js/sim-professional-lab.js:1602-1608` — `lab.resume()` is the only path that does `lab.anim.start()`.
  - `js/sim-professional-lab.js:1671-1675` — `lab.resume()` only invoked when `scene.autoplay` is truthy.
  - `js/sims/ch3/ch3-dynamics-all-18-scenes.js:198-203` — `autoplayFor` returns `false` for all 8 candidate "static" routes (ch3-1-3, ch3-2-3, ch3-2-5, ch3-4-1, ch3-6-3, ch3-7-1, ch3-7-2 are not in the truthy branches; ch2-7-2 also not).
  - `js/sims/ch3/ch3-dynamics-all-18-scenes.js:206` — `appendTime: ['ch3-1-3', 'ch3-2-3', 'ch3-5-1', 'ch3-5-2', 'ch3-6-3', 'ch3-7-1', 'ch3-7-2']` — six of these are also tagged `static` by the plan, and the appendTime readout will now be stuck at "t=0.00 s" for the lifetime of the route mount.
  - `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js:116-126` — `onTick_ch372` writes time-oscillating residuals; **verifies behavior is intentionally non-static**.
- **Suggested fix:** Phase 03 must NOT short-circuit the Play button without also (a) removing the `appendTime` flag for those routes (so the dead readout is suppressed), and (b) deciding what happens to time-evolving residuals like ch3-7-2 (either: start `lab.anim` unconditionally for routes whose behavior writes time-derived state but suppress only the user-facing button; or move `static: true` only to the truly time-independent renderers — ch3-2-3 force-pair, ch3-2-5 dynamic-FBD, ch3-4-1 D'Alembert — and re-classify the others).

---

## Finding 2: ch3-7-2's `static: true` claim contradicts its own behavior file — the route is animated by design

- **Severity:** Critical
- **Location:** Phase 03 Overview / "Key Insights" line 28; baseline classification "static-concept" for `ch3-7-2`.
- **Flaw:** The plan classifies ch3-7-2 as a "concept diagram (đúng spec)" alongside FBD selectors. This is wrong. The behavior file populates `residual1..4` and `score` as time-oscillating quantities (`Math.sin(t*2), Math.cos(t*1.5), …`). The renderer reads them. The lesson "kiểm tra số liệu động lực học" is about *watching residuals fluctuate around their physical bound*, not a static snapshot. Verification report's `uniqueFrames=1` reading is an **engine-not-running** artifact (Finding 1), not a "design intent" signal.
- **Failure scenario:** Plan ships, ch3-7-2 has its Play button removed, `_t` is frozen, residuals are stuck at their t=0 values, score is constant. The route's pedagogical message — "see numerical error oscillate as the physics engine runs" — is silently destroyed. No test in the plan catches this (Phase 03 RED test only checks `[data-sim-play]` is null, not that the residuals continue to evolve).
- **Evidence:**
  - `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js:117-125`:
    ```
    state.residual1 = (0.02 + 0.01 * Math.sin(t * 2)) * scale;
    state.residual2 = (0.03 + 0.01 * Math.cos(t * 1.5)) * scale;
    state.residual3 = (0.01 + 0.005 * Math.sin(t * 3)) * scale;
    state.residual4 = (0.04 + 0.015 * Math.cos(t * 2.5)) * scale;
    state.score    = Math.max(0, Math.min(100, 100 - (...)*400));
    state._t = t + dt;
    ```
  - `js/sims/ch3/ch3-collision-exercises-renderers.js:121-134` — renderer consumes `d.residual1..4` and `d.score` directly into the bar graph.
  - `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js:180-189` — `derived_ch372` computes the same oscillating residuals from `s._t`. They will be evaluated at frozen t=0 if the engine never ticks.
- **Suggested fix:** Reclassify ch3-7-2 as `animated`, not `static-concept`. Schedule it in a sub-task of Phase 05 (renderer already reads `_t`-derived state correctly through `d`, so the actual fix may be zero renderer code — only ensure the engine ticks). Same scrutiny needs to be applied to ch3-7-1 (selector — likely truly static) and ch3-6-3 (collision solver — `pBefore/pAfter` are *not* time-dependent in `onTick_ch363`, so probably truly static; verify per route).

---

## Finding 3: `state._v0` nonexistent — Phase 02 headline pedagogy is unimplementable as written (re-raised, with new evidence ignored by prior reviews)

- **Severity:** Critical
- **Location:** Phase 02 Overview, lines 22-24, 36, 56-58, 102-106; success criterion `plan.md:80`.
- **Flaw:** Plan claims "Behavior file already exposes `state._v0` and `state._t` (engine ticks them), so no contract change." It does not. **No producer writes `_v0` anywhere** in `js/`. Two prior red-team reviews flagged this, but the plan file is still on disk unmodified. Worse: the **adjacent existing fallback** is already `state.v` — `onTick_ch321` writes `state.v = Math.abs(state.accel) < 0.01 ? (state.v || 5) : (state.v || 0) + state.accel * dt`. So when `Fnet ≈ 0` *and* `state.v` is already truthy, engine *already* maintains a constant velocity. The fix is "renderer should consume `state.v` (engine-populated)," not "renderer should consume `state._v0` (nonexistent)."
- **Failure scenario:** Phase 02 RED test passes (it stubs `_v0` directly into `state` for the unit test), Phase 02 GREEN renderer ships, browser-mounted scene has `state._v0 = undefined` because no producer ever populates it (initialState has only `omega:1.5, theta, m:5, F:50, alpha:0` — see `js/sims/ch3/ch3-dynamics-all-18-scenes.js` initial state for ch3-2-1). Renderer falls through `v0 || 0 → 0` branch. The "Fnet=0 ⇒ body translates" pedagogy is dead; success criterion `plan.md:80` ("ch3-2-1 body translates visibly when sliders set Fnet ≈ 0 with `_v0 > 0`") is **structurally unfulfillable** because no slider/input produces `_v0`.
- **Evidence:**
  - `grep -rn "_v0" js/` → 0 hits in production source. Only matches are inside `plans/` dir.
  - `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js:47-55` — `onTick_ch321`: writes `state.accel`, `state.v`, `state.x`, `state._t`. Never touches `_v0`.
  - `js/sims/ch3/ch3-dynamics-all-18-scenes.js` — controls schema for ch3-2-1 exposes only `F` and `alpha` sliders.
  - Prior review at `plans/.../reports/from-code-reviewer-to-planner-red-team-security-adversary-plan-review-report.md:10-20` already established this. Re-raising because plan file is unchanged.
- **Suggested fix:** Drop `_v0` entirely from the plan. Use `state.v` (engine-populated, branch-clamped to nonzero when accel<0.01 in `onTick_ch321`) as the velocity term: `dx = (state.v || 0) * (state._t || 0) * pxPerMeter` with the existing accel-branch unchanged. Update `success criterion plan.md:80` to: "with default initial v=5 m/s, body translates when F=0 (sliders confirm v retained on the v=const branch)."

---

## Finding 4: Phase 5d (ch2-5-1) double-applies `omega · t` — rotation will run at 2× design rate

- **Severity:** High
- **Location:** Phase 05 sub-step 5d, line 184 ("`const phi = phi0 + omega * t;` // NEW").
- **Flaw:** The plan treats `state.phi` as a static initial offset and adds another `omega * t` term in the renderer. But the engine's `onTick_ch251` (the ch2-5-1 behavior) already advances `state.phi` per frame: `state.phi = ((state.phi || 0) + omega * dt) % (2 * Math.PI);`. So the renderer's `phi = state.phi + omega * t` is `(integrated_omega) + (omega * t)` ≈ 2 × `omega * t`. Visual rotation runs at twice the omega the user dialed in. Worse, `phi0` term grows unbounded (no `% 2π`).
- **Failure scenario:** User sets ω = 1.0 rad/s. Engine advances `state.phi` to ~3 after 3 s. Renderer adds another `1.0 × 3 = 3` → angles bar rotated ~6 rad in 3 s — appears to spin at 2 rad/s, not 1 rad/s. `tests/simulation-invariants.test.js` invariant `|v_B - v_A| ≈ ω·|AB|` will fail because vBA in renderer is computed from `omega * (by - ay0)` where `(by - ay0)` is the *2x-rotated* position, not the engine state's actual position.
- **Evidence:**
  - `js/sims/ch2/ch2-kinematics-behaviors-b.js:107-119` — `onTick_ch251`: explicit `state.phi = ((state.phi || 0) + omega * dt) % (2 * Math.PI);` engine integration.
  - Phase 05 plan line 184: `const phi0 = state.phi || 0; const phi = phi0 + omega * t;` — the bug.
  - `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js:22-43` — the existing renderer reads `state.phi` directly and uses it as the rendered angle, not as an "initial offset". The plan's edit changes semantics.
- **Suggested fix:** Either (a) read `state.phi` as the rendered angle and don't add `omega * t` (engine already integrated), and rotate B around A by `state.phi`, OR (b) explicitly stop the engine integration of phi for this route (defeats existing onTick contract). Option (a) is correct.

---

## Finding 5: Phase 5b ch3-5-1 orbit visualization desyncs from the COM dot — pedagogy actively wrong

- **Severity:** High
- **Location:** Phase 05 sub-step 5b, lines 130-138; "Note" at line 139 claims "their COM is unchanged because the orbit displacements average to ~0 over a period."
- **Flaw:** The note misuses period-averaging. At any *single* frame, the orbit-displaced positions of (m1, m2, m3) have a COM that is **not** equal to the static `xCM, yCM` computed from the base `m.x, m.y` values. The plan keeps `xCM, yCM` computed from base positions (`xCM = Σ m_i · m.x_i / Σm_i`), then displaces each visible mass to `(m.x + ri·cos(θ_i + ω·t), m.y + ri·sin(...))`, but does **not** recompute `xCM, yCM` from displaced positions. So the COM dot is drawn at a location that is **not** the centroid of the visible masses for any non-zero `t` (except at exact period boundaries). Lesson: "The big point labeled 'C' is the center of mass of these three points." Visual: it isn't.
- **Failure scenario:** Student sees three mass dots orbiting their bases; they geometrically eye-ball the centroid → it's offset from the labeled 'C' dot for ~98% of the period. The route now teaches the *opposite* of its physics theorem (`m·a_CM = ΣF_ext`).
- **Evidence:**
  - `js/sims/ch3/ch3-theorems-renderers.js:14-37` — current `renderCh351CenterOfMass`: `xCM = Σ m·m.x / totalM` from `state.masses` array values; the dot at `xCM, yCM` is the true centroid of the displayed masses.
  - Phase 05 sub-step 5b line 131-138 displaces *only* the displayed positions (not `xCM, yCM`), creating the visual mismatch.
  - The "averages to ~0 over a period" rationale is mathematically true at integer-period sample points — but the rendered frame is sampled at `state._t` arbitrary times, not period boundaries.
- **Suggested fix:** Recompute `xCM, yCM` from the displaced positions (`ox, oy` for each mass). Then the COM dot stays at the visual centroid even though absolute positions wobble — pedagogy preserved. Alternatively (and better): drop the orbit and instead translate the whole cluster under an external force that ticks `xCM` per Newton-II — that *is* the theorem on the panel.

---

## Finding 6: Phase 1 timing budget is internally contradictory — sequential 58 × 4 s = 232 s vs claimed ≤ 90 s, with worker parallelism explicitly forbidden

- **Severity:** High
- **Location:** Phase 01 Non-functional req (line 41) — "Spec must complete in ≤ 90s on dev hardware (~58 routes × 4s ≈ 232s naive; parallelize via Playwright workers, or run sequentially in single page-context with 1s sleeps — driver already proved this works in <90s)." Risk Assessment line 154: "do not parallelize across workers (state pollution between routes)."
- **Flaw:** The Phase 1 budget cannot be met. Sequential execution requires `goto + waitForCanvasMounted (8 s timeout) + 4 × 1s sleeps + sample` per route. Even at the optimistic floor (1 s mount + 3 s sampling + ~0.3 s overhead = 4.3 s/route), 58 routes ≈ 250 s. The plan claims "driver already proved this works in <90s" but does not cite a measurement file, and the mount step in `tests/simulation-browser.spec.js` consistently takes 1–2 s per route. Worker parallelism is the only way to get under 90 s — and that path is explicitly forbidden in the same phase.
- **Failure scenario:** Phase 1 spec lands; first CI run takes ~4 min; Phase 4 wires it into `test:sim:browser` per default `playwright test` invocation. CI total exceeds the existing 5 min target the plan promises in Phase 4 line 170. Either CI starts timing out, or Phase 4 success criterion ("`npm run test:sim:browser` runs the new spec; total runtime ≤ 5 min") is silently violated.
- **Evidence:**
  - `tests/simulation-browser.spec.js` exists per plan reference — typical patterns in repo show 1–2 s/route mount overhead.
  - Phase 01 sleep schedule: `t0 + click + 1s + 1s + 1s = ~3s` minimum, plus mount + navigate.
  - Phase 01 Risk Assessment line 154 forbids parallel workers.
- **Suggested fix:** Either (a) drop the "≤ 90 s" claim and budget 4 min, then update Phase 4 total runtime accordingly; (b) port the in-page async loop from `qa-verification/animation-sweep/full-58-route-animation-sweep-browser-eval-driver.js` into a *single* Playwright `page.evaluate` block (no per-route navigate — all 58 mount in one page) — but then route-isolation fails because handlers leak across mounts; (c) parallelize across workers and absorb the state-pollution risk explicitly (each worker gets a fresh page, so no real pollution).

---

## Finding 7: `[data-sim-play]` selector and `window.SIM_SCENES.get()` registry don't exist — Phase 1 utils, Phase 3 RED tests, Phase 6 fixture test all reference symbols that aren't in the codebase

- **Severity:** High
- **Location:** Phase 01 step 3 (`canvas-evolution-utils.js → clickPlay → '[data-sim-play]'`), Phase 03 step 1 (`window.SIM_SCENES.get(routeId)`), Phase 06 step 2 (`window.SIM_SCENES.get(routeId).autoplay`).
- **Flaw:**
  - The Play button is created by `core.addButton(lab.controls, '▶ Chạy', …)` in `js/sim-professional-lab.js:1657`. `addButton` (`js/sim-core.js:234-241`) sets only `className = 'sim-btn'` and `textContent = '▶ Chạy'`. There is no `data-sim-play` attribute. Selectors using `[data-sim-play]` will return `null` always — Phase 03's RED test will pass *immediately* (false-positive GREEN) before the static flag is even added.
  - The scene registry global is `window.SimSceneRegistry` (`js/sim-scene-registry.js:49`), not `window.SIM_SCENES`. Calls to `window.SIM_SCENES.get(routeId)` throw `Cannot read property 'get' of undefined`. Phase 03 unit test setup, Phase 06 unit test setup, all silently fail at the require stage.
- **Failure scenario:** Author runs the RED tests, all pass on commit (because selectors find nothing and registry calls throw before any assertion runs in some test frameworks; or fail noisily — either way, never test the actual invariant). GREEN step ships scene-flag changes that nobody verified are visible in the DOM.
- **Evidence:**
  - `js/sim-core.js:234-241` — `addButton` definition; no data-attribute set.
  - `grep -rn "data-sim-play" js/` → 0 hits.
  - `grep -rn "SIM_SCENES" js/` → 0 hits. Only `window.SimSceneRegistry` exists.
  - Prior reviews at both peer reports already flagged this.
- **Suggested fix:** Add `btn.setAttribute('data-sim-play', 'true')` in `addButton` (or in the specific Play-button construction site at `sim-professional-lab.js:1657`) **as part of Phase 03 GREEN** — must precede the RED test assertion. For the registry: replace all `SIM_SCENES.get(routeId)` with `window.SimSceneRegistry.get(routeId)` (verify the registry exposes `get(id)`; the code uses `getActiveScope`/`registerMany`).

---

## Finding 8: Phase 6 ambiguity about ch2-5-1's autoplay catalog reveals planner did not grep — only one of the two suspect files is even loaded

- **Severity:** Medium
- **Location:** Phase 06 "Pre-step" (line 84), Phase 06 Architecture (line 61).
- **Flaw:** The plan punts the question to "step 1" with `grep -n "ch2-5-1" js/sims/ch2/*.js | grep -i "autoplay\|preview"`. A 30-second grep would have answered it: `index.html:359` loads only `js/sims/ch2/ch2-kinematics-scenes.js`, not `ch2-relative-plane-motion-scenes.js` or `ch2-particle-rotation-transmission-scenes.js`. The relative-plane-motion-scenes.js file *defines* a `scene()` factory (lines 25-54) but **never calls `registry.registerMany(...)`** — it is dead code. Furthermore, `ch2-kinematics-scenes.js` has no `autoplay` field at all (controls/initial state only), so adding `autoplay: 'preview-pause'` requires inserting the property into the `scene` factory at lines 33-51, not "edit `autoplayFor()`" (no such function exists in the ch2 catalog).
- **Failure scenario:** Implementation engineer follows Phase 06 step 4 ("edit `autoplayFor` (or equivalent) in the ch2 catalog confirmed in step 1, adding ch2-5-1") and edits the wrong file (the unloaded one), commits, ships. ch2-5-1 has no autoplay in production, but the new fixture test passes because Node-side require'd the dead file's exports.
- **Evidence:**
  - `index.html:359` — `<script src="js/sims/ch2/ch2-kinematics-scenes.js"></script>` (loaded).
  - `index.html` does **not** include `ch2-relative-plane-motion-scenes.js` (grep against index.html for that filename → 0 hits).
  - `js/sims/ch2/ch2-relative-plane-motion-scenes.js:1-60` — defines `rows` and a `scene()` factory but never `registry.registerMany(rows.map(scene))`. The IIFE just exits.
  - `js/sims/ch2/ch2-kinematics-scenes.js:33-51` — `scene()` factory returns object with `controls`, `readouts`, `initialState`; no `autoplay` field; no `autoplayFor` helper.
  - `js/sims/ch3/ch3-dynamics-all-18-scenes.js:198-203` — only `autoplayFor` definition in the codebase.
- **Suggested fix:** Phase 06 must (a) state explicitly: "The active ch2 catalog is `js/sims/ch2/ch2-kinematics-scenes.js`; the other two scene files in `js/sims/ch2/` are dead (verified: `index.html` does not load them and `ch2-relative-plane-motion-scenes.js:60` ends without `registerMany`)." (b) change Phase 06 step 4 to "**add** `autoplay: …` field to the scene returned by `scene()` in `ch2-kinematics-scenes.js` for routeId === 'ch2-5-1'", since no `autoplayFor` exists yet there. (c) Phase 8 should journal the dead-file confusion so future planners grep first.

---

# Summary

8 findings: **4 Critical**, **3 High**, **1 Medium**.

The plan rests on three load-bearing assumptions that are individually false against the codebase:
1. Engine ticks `_t` after Play removal (Finding 1) — engine actually halts.
2. `state._v0` exists and is populated (Finding 3) — never written by anyone.
3. Phase 03's "8 routes are concept-only" classification (Finding 2) — at least ch3-7-2 is animated by design.

These three undermine 60% of the headline pedagogy claims (Sprint 1 success criteria `plan.md:78-86`). Findings 4-5 destroy two of the four Phase-05 animation candidates. Findings 6-7 reduce the harness to a no-op. Finding 8 is a craftsmanship miss but cheap to fix.

Recommend **plan revision before cooking**, not "cook with caveats". Specifically:
- Resolve Finding 1 by deciding *engine policy* for static routes (always-tick or never-tick) and updating `appendTime` and `static` flag semantics together.
- Reclassify ch3-7-2 (and audit ch3-7-1, ch3-6-3) before accepting the "8 static routes" list.
- Drop `_v0` end-to-end; redirect to existing engine-populated `state.v`.
- Verify Phase 5d and 5b math against the existing engine integration before issuing test specs.
- Fix the harness API references (`data-sim-play`, `SimSceneRegistry`) before Phase 1 lands.

## Unresolved questions

1. Is ch3-7-1 (theorem selector) genuinely concept-only, or does its `state._t`-driven `problemType` cycling at `onTick_ch371` count as "evolution"? Plan classifies as static; verification report says `uniqueFrames=1`, but that's the engine-not-ticking artifact (Finding 1).
2. Should `lab.anim` be unconditionally started for routes whose behavior writes to time-derived readouts, regardless of Play button visibility? Engine currently ties anim-running to user-visible Play state; this conflation is the root cause of Finding 1.
3. Phase 09's `tests/sim-canvas-evolution.spec.js` filename collides with the plan dir name (also "phase-09"); Phase 1 step 1 mentions the namespace check but does not confirm the existing `tests/phase-09-12-tdd.test.js` namespace claim is still owned. Worth a journal note.
