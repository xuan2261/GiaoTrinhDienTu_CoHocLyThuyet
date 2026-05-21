# Red-Team Plan Review — Failure Mode Analyst (Murphy's Law)

**Plan:** `plans/260521-1100-phase-09-concept-diagram-cleanup-animation-parity/`
**Persona:** Failure Mode Analyst + Flow Tracer
**Reviewed:** plan.md, phase-01..phase-10
**Verification scope:** `js/sim-professional-lab.js`, `js/sims/ch2/*`, `js/sims/ch3/*`, `qa-verification/animation-sweep/full-58-route-animation-sweep-browser-eval-driver.js`, existing test surface, package.json
**Date:** 2026-05-21

Verification cross-references the prior security-adversary and scope-complexity reports — duplicate findings (e.g. `state._v0` non-existence) are noted but not re-litigated; this pass focuses on *runtime ordering, async races, sampling aliasing, and visualization-vs-state divergences* the other passes did not exercise.

---

## Finding 1: Phase 06 step 6 spec is a guaranteed-fail by construction

- **Severity:** Critical
- **Location:** Phase 06, "REFACTOR" section, step 6 ("extend `sim-canvas-evolution.spec.js` asserting that after mount + 200ms settle, autoplay routes have `uniqueFrames(t=0..t=0.5s) ≥ 2`")
- **Flaw:** The plan presents this as a *passing* assertion that proves preview-pause "happened". Walked end-to-end, it always reads `uniqueFrames === 1`.
- **Failure scenario (Flow Tracer trace):**
  1. `mount(routeId)` runs synchronously; autoplay branch fires at `js/sim-professional-lab.js:1671-1674`.
  2. `lab.resume()` → `lab.anim.start()` (engine RAF loop on).
  3. `pauseAfterFrames(lab, 5)` schedules `requestAnimationFrame(tick)` — `js/sim-professional-lab.js:1506-1518`. Both `pauseAfterFrames` and the engine's `lab.anim.onFrame` ride the same RAF queue, so 5 RAF ticks ≈ 80 ms wall, advancing `state._t` ≈ 0.08 s.
  4. At RAF #5, `lab.pause()` runs → engine stops → button text reverts to "▶ Chạy".
  5. The new spec then "settles 200 ms" — by t = 200 ms the lab has been paused for ~120 ms; canvas content is frozen at the t = 80 ms frame.
  6. t0 hash sampled at +200 ms → frozen-frame hash X.
  7. t-at-0.5 s hash sampled at +700 ms → still frozen-frame hash X (no engine ticks since pause).
  8. `uniqueFrames = 1`. Assertion `≥ 2` fails on every route, every run.
- **Evidence:**
  - `js/sim-professional-lab.js:1506-1518` — `pauseAfterFrames` body.
  - `js/sim-professional-lab.js:1671-1675` — autoplay branch synchronously invokes both `lab.resume()` and `pauseAfterFrames` inside `mountBody`.
  - Phase 06 spec text: "after mount + 200ms settle … `uniqueFrames(t=0..t=0.5s) ≥ 2`" — but the only window in which evolution is visible is `[mount, mount+80ms]`, which 200 ms settle skips entirely.
- **Suggested fix:** Either (a) sample BEFORE settle (e.g. immediately, then again at +250 ms while preview is still running), (b) increase `frames` to span the settle period (≥ 16 frames ≈ 250 ms), or (c) drop the assertion and rely on the existing post-`clickPlay` invariant from Phase 01. Honest framing: preview-pause is a UX feature, not a sweep-detectable invariant.

---

## Finding 2: Phase 02's preview-pause delivers 0.26 pixels of motion — pedagogy success criterion is unfulfillable visually

- **Severity:** Critical
- **Location:** Phase 06, "Functional" requirement bullet (`{ mode: 'preview-pause', frames: 5 }` for ch3-2-1) combined with plan.md success criterion line 83: "learners see motion within first 5 frames after mount".
- **Flaw:** The Phase 02 fix uses `0.5 * a * t² * pxPerMeter` with `pxPerMeter = 8`. For default sliders (F = 50, m = 5 → a = 10 m/s²), 5 frames at 60 Hz is `t = 5 × 0.0167 = 0.083 s`. Translation is `0.5 × 10 × 0.0833² × 8 = 0.28 pixels`. Sub-pixel. A learner cannot perceive 0.28 px of body shift.
- **Failure scenario:** Mount route → autoplay fires → 5 frames elapse → body has moved 1/4 of one pixel → engine pauses → user sees a still frame indistinguishable from t=0. Plan.md success criterion "Autoplay `preview-pause: 5` set on 5 newly animated routes; learners see motion within first 5 frames after mount" is met by metadata only; the pedagogical claim ("the canvas evolved between t=0 and t=3s") is unfulfilled at the preview window.
- **Evidence:**
  - Phase 02 GREEN code at plan section "GREEN", line `pxPerMeter = 8`, `dx = 0.5 * a * t * t * pxPerMeter`.
  - `js/sim-professional-lab.js:1506-1517` — RAF-counting (60 Hz wall) → 5 frames = 83 ms.
  - `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js:47-55` — `onTick_ch321` advances `state._t` by `dt` per RAF; `dt ≈ 0.0167 s`.
- **Suggested fix:** Either (a) lengthen preview to ~30 frames (~500 ms) so a 1.2 m/s motion is perceptible, or (b) set `frames` per-route based on each route's `dx/dt` magnitude with a "minimum 8 px" budget, or (c) revisit the pedagogy: if 5 frames is the right UX, the renderer must amplify visual motion (e.g. `pxPerMeter = 80` for the inertia demo specifically). Whatever path is chosen, the success-criterion wording must shift from "5 frames after mount" to "preview window must produce ≥ N px of body translation".

---

## Finding 3: Phase 03 plan claim that "engine still ticks `_t` for static routes" is false; `_t` readouts will permanently display 0.00 s

- **Severity:** High
- **Location:** Phase 03, "Key Insights" bullet 3 ("Phase 03 keeps `onTick` and the engine running for readout `_t` displays") and Phase 03 "Risk Assessment" bullet 3 ("readouts that show `_t` still update for static routes — verified").
- **Flaw:** The engine RAF loop only runs after `lab.anim.start()` is invoked. For static routes (per Phase 03), the Play button is suppressed AND `autoplay = false` (default; not changed by Phase 03). With no Play and no autoplay, `lab.anim.start()` is never called. `behavior.onTick` is registered as the frame callback but never invoked. `state._t` stays at its initial value (0).
- **Failure scenario (Flow Tracer trace):**
  1. Mount static route → `lab.anim = animEngine.bindToLab(...)` — `js/sim-professional-lab.js:1561`.
  2. `lab.isPlaying = false` — line 1565.
  3. `core.addButton(... '▶ Chạy' ...)` is short-circuited by `!scene.static` — Phase 03 step 6.
  4. `startBehaviorAnimation(...)` registers `onFrame` callback — line 1668. RAF callback exists but is dormant; `lab.anim.start()` was never called.
  5. Autoplay branch at line 1671: `scene.autoplay` is `false` → branch skipped.
  6. Result: no `requestAnimationFrame` is scheduled by the engine. `behavior.onTick` is never called. `state._t` remains 0 forever.
  7. The `appendTime` policy at `js/sims/ch3/ch3-dynamics-all-18-scenes.js:206` includes ch3-1-3, ch3-2-3, ch3-6-3, ch3-7-1, ch3-7-2 — all of which are in Phase 03's static-set. Their "thời gian: 0.00 s" readout is now a constant, contradicting the plan's "verified" claim.
- **Evidence:**
  - `js/sim-professional-lab.js:1500` — `lab.anim.onFrame(onFrame)` registers callback.
  - `js/sim-professional-lab.js:1604` — `lab.anim.start()` is only invoked from `lab.resume()`.
  - `js/sim-professional-lab.js:1657-1660` — `lab.resume` only fires from Play button click handler.
  - `js/sim-professional-lab.js:1671` — autoplay branch is the only other entry point; `scene.autoplay` is false for the 8 static routes.
  - `tests/simulation-runtime-regressions.test.js:193` — confirms "behavior.onTick routes must open paused for direct manipulation" (engine NOT auto-started).
- **Suggested fix:** Either (a) drop the misleading risk-mitigation note and accept that `_t` readout is meaningless for static routes — also drop those routes from `appendTime` policy; or (b) add a synchronous "tick once on slider change" hook that calls `behavior.onTick(scene, state, 0)` for static routes so derived state updates without RAF; or (c) hard-disable the time readout for `scene.static` routes via a Phase 03 step. Pick one and do it explicitly — the current plan papers over the inconsistency.

---

## Finding 4: 16×16 hash grid aliases ch3-1-2's pulse animation; uniqueFrames flake-fails to 2 on a clean codebase

- **Severity:** High
- **Location:** Phase 01 step 3 (`sampleGridHash` step=16 design) combined with Phase 05 sub-section 5a (ch3-1-2 GREEN code: `lenPulse = 1 + 0.3 * Math.sin(0.8 * t)`).
- **Flaw:** The grid sampler reads pixels at `Math.floor((x/grid) * w)` step every 760/16 ≈ 47 px horizontally. The pulse-modulated arrow at ch3-1-2 has length `(state.F||50) * 1.2 * lenPulse = 60 * (1 + 0.3 sin(0.8t))`. At sample times t = 0, 1, 2, 3:
  - t=0 → lenPulse = 1.000 → arrow length 60.0 px
  - t=1 → lenPulse = 1.215 → arrow length 72.9 px
  - t=2 → lenPulse = 1.299 → arrow length 77.9 px
  - t=3 → lenPulse = 1.198 → arrow length 71.9 px
  Adjacent frames differ by 5 px or less; with the 47 px sampling stride, the head of the arrow (bright neon stroke ~2 px wide) will land in the *same grid cell* across t=1, t=2, t=3 frames. Inner pulse motion happens *between* sample points — sampler sees the stationary base but not the pulsing tip. FNV-style hash sums collide.
- **Failure scenario:** Phase 04 baseline window for ch3-1-2 is `[3, 4]`. Sweep returns `uniqueFrames = 2`. CI fails on a perfectly working renderer. Engineer adjusts `pxPerMeter` slider on a Tuesday; Friday the hash flips to 3 because pulse phase aligned with grid; following Tuesday it flips back. Heisenbug.
- **Evidence:**
  - `qa-verification/animation-sweep/full-58-route-animation-sweep-browser-eval-driver.js:71-89` — `frameHash` body, sampling step = 16.
  - Phase 05 plan section 5a GREEN: `lenPulse = 1 + 0.3 * Math.sin(0.8 * t)`; arrow at `blockX + 78 + (state.F || 50) * 1.2 * lenPulse`.
  - Plan's own admission, Phase 01 "Risk Assessment": "step=16 already proven in driver; if flaky, fall back to step=8 + per-quadrant subsum" — the fallback acknowledges the aliasing risk; Phase 05's slow-pulse renderer is exactly the pattern that triggers it.
- **Suggested fix:** Make the threshold pulse-amplitude-aware. Two options that work without abandoning step=16: (a) drop ch3-1-2's `0.8` angular freq to ~2.5 rad/s so 4 samples cover ~1 full pulse cycle (`4 × 2.5 / (2π) ≈ 1.6 cycles`), guaranteeing distinct hashes; (b) add `1` to the hash from a panel-area sample by also reading the `domMath` rendered numeric — Phase 05 GREEN already updates label "F = …" but the label text doesn't change here, so this doesn't help. Real fix: lower step to 8 OR widen `lenPulse` amplitude to ≥ 50 px peak-to-peak.

---

## Finding 5: Phase 02 wrap-around at canvas edge breaks the "F-arrows anchored on body" pedagogy mid-frame

- **Severity:** High
- **Location:** Phase 02, "GREEN" code block, line `const wrapped = ((baseX + dx - 68) % 432 + 432) % 432 + 68;`
- **Flaw:** Three arrows draw at `bodyX + 82` (right of body), `bodyX - 60` (left of body), and `bodyX + 82 + Fnet` (Fnet at right). At wrap (bodyX = 500 → 68), the LEFT arrow `bodyX - 60` becomes 8 — *inside the canvas frame margin (68)*. The Fnet arrow re-anchors near the left edge with the head still pointing rightward. For a learner watching, the body teleports across the canvas while the F arrows visually flip orientation context (they don't change direction in code, but the spatial relationship to the body inverts because `bodyX` snapped from 500 to 68).
- **Failure scenario:** User sets F=10 (Fnet ≠ 0 branch), starts Play. Body accelerates rightward via 0.5·a·t². At ~ t = 4.6 s it crosses bodyX = 500, then jumps to bodyX = 68. F₂ arrow at `bodyX - 60 = 8` is now off the lab plot area. Fnet arrow at `bodyX + 82 + 10 = 160` overlays the "quán tính" panel at (72, 84, 150, 68) — drawing through pedagogy text. Learner sees ARROWS PASS THROUGH THE LABEL "quán tính".
- **Evidence:**
  - Phase 02 GREEN code: arrows at `bodyX + 82`, `bodyX - 60`, `bodyX + 82 + Fnet`.
  - Original renderer at `js/sims/ch3/ch3-newton-laws-renderers.js:42-56` — same arrow anchors, no wrap (so this bug is *introduced* by Phase 02).
  - Plan's own dismissal in Phase 02 Risk Assessment: "Wrap-around may be visually distracting — acceptable; teaching v=const includes 'body keeps going forever' intuition." Underweights the actual failure mode (arrows over labels, off-plot anchors).
- **Suggested fix:** Hide all body-anchored arrows during the 100 ms after a wrap event (track `lastWrapTime`), OR replace wrap with a soft-clamp `bodyX = Math.min(500, baseX + dx)` and stop animation when clamped (Phase 02 plan dismisses scroll camera as "cheaper" — the cheaper path is simpler still: stop). Either way the plan must specify it; "acceptable" is not a fix.

---

## Finding 6: Phase 05 ch3-5-1 visualization contradicts the readout/derived-state COM

- **Severity:** High
- **Location:** Phase 05 sub-section 5b ("ch3-5-1 center of mass"), GREEN code: `xi(t) = xCM + ri*cos(t + θi)`.
- **Flaw:** The plan adds renderer-side orbit displacement around each mass's `m.x/m.y` while the BEHAVIOR's `derived_ch351` continues to compute COM from the static `m.x` values (`js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js:128-143`). The readout panel displays `aCM = F/totalM` and `xCM` based on those static positions. Now the canvas shows three particles dancing around fixed center points — but the COM marker and readout are computed as if no dance were happening. Plan note: "pedagogical: visualization wobble; mathematical COM unchanged because the orbit displacements average to ~0 over a period". This is mathematically true *over a period*, but never at any instantaneous frame.
- **Failure scenario:** Learner pauses at t = 1.0 s. Particle m₁ is at `xCM + 24*cos(0.6 + 0)`; particle m₂ is at `xCM + 24*cos(0.6 + 2π/3)`; particle m₃ at `xCM + 24*cos(0.6 + 4π/3)`. The visual centroid of the three rendered particles, weighted by `m.m`, is *not* `xCM` (only equal-mass cases produce COM-invariant orbits with phase 2π/3 offsets — `m₁=2, m₂=1.5, m₃=1` is unequal). The drawn COM marker is at `xCM`; the visual centroid of the particles is offset. The learner sees the COM dot OFFSET FROM THE MIDDLE OF THE PARTICLES — directly contradicting the lesson "khối tâm là trọng tâm khối lượng".
- **Evidence:**
  - `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js:128-143` — `derived_ch351` accumulates `xCM += (item.x || 0) * mass`.
  - Phase 05 5b GREEN: orbit `xi(t) = xCM + ri * cos(theta_i)` *applied to render*; behavior unchanged.
  - Plan's claim: "their COM is unchanged because the orbit displacements average to ~0 over a period" — true only for equal masses with 2π/N phase spacing. Initial state at line 76-80 is unequal masses (2, 1.5, 1).
- **Suggested fix:** Either (a) make the orbit equal-amplitude on equal masses only (requires changing initial state to 1, 1, 1 — pedagogy concession); or (b) drop ch3-5-1 from Phase 05 and bucket it as `static-concept` (COM is a snapshot lesson, not a motion lesson — same argument Phase 07 makes for ch2-5-2/3); or (c) animate via a translation that preserves mass-weighted centroid exactly: shift all three particles by the same `(dx, dy)` so xCM moves to xCM+dx — but then the lesson becomes "COM follows when system translates", which is a different lesson. Pick the lesson, then animate to it.

---

## Finding 7: `pauseAfterFrames` schedules RAF without dispose registration; rapid route navigation calls `lab.pause()` on a stale lab

- **Severity:** Medium
- **Location:** Phase 06 implicitly relies on `pauseAfterFrames` correctness; Phase 06 Risk Assessment dismisses with "loader already disposes lab on route change; verified by `tests/simulation-runtime-regressions.test.js`." Verification shows the dispose path does NOT cancel pending RAF.
- **Flaw:** `pauseAfterFrames` schedules `requestAnimationFrame(tick)` at line 1517. The closure captures `lab` directly. Mount-scope `onDispose` (line 1645-1648, 1502-1503) cleans up resize/katex listeners and frame callbacks, but does NOT cancel the in-flight RAF chain spawned by `pauseAfterFrames`. If a user navigates to a different route within the 80 ms window (5 frames @ 60 Hz), the RAF fires post-dispose and calls `lab.pause()` on a lab whose `lab.anim` may now be a no-op stub or whose state has been mutated by the new route's mount.
- **Failure scenario:** Phase 04 sweep harness mounts route N → starts playing → loader disposes for route N+1 within 50 ms → 30 ms later, route-N's queued RAF fires → calls `lab.pause()` on stale lab. Two outcomes:
  - Best case: stub `lab.anim.pause` runs, no-op. But `updatePlayButton()` runs against a DOM node already removed by the new mount — silent no-op.
  - Worst case: the spec is racing two mounts; the stale `pauseAfterFrames` calls `lab.pause()` which calls `updatePlayButton()` which mutates a button still in DOM (sibling, not yet GC'd) → button text flips on the wrong route.
- **Evidence:**
  - `js/sim-professional-lab.js:1506-1518` — `pauseAfterFrames` body; no `cancelAnimationFrame` handle saved.
  - `js/sim-professional-lab.js:1500-1503` — only `removeFrameCallback` is registered with scope; the standalone `requestAnimationFrame(tick)` calls are NOT scoped.
  - `tests/simulation-runtime-regressions.test.js:193-205` — verifies dispose cancels resize/katex listeners; does NOT verify cancellation of `pauseAfterFrames`-scheduled RAF.
- **Suggested fix:** Capture `let rafId = requestAnimationFrame(tick)` and reassign on each tick; register `scope.onDispose(() => cancelAnimationFrame(rafId))` from the call site. Phase 06 should add an explicit RED test: rapid mount → dispose within 50 ms → assert no `lab.pause()` runs after dispose. This is a one-evening fix; it should be in Phase 06's TDD list, not deferred.

---

## Finding 8: Phase 04's CI gate is decoupled from per-frame timing, so `[3,4]` window will flake on slow CI / DPR=2 / headed runs

- **Severity:** Medium
- **Location:** Phase 04 "Functional" requirement, `expectedUniqueFrames` window `[3,4]` for animated routes; combined with Phase 01 "Spec must complete in ≤ 90s on dev hardware".
- **Flaw:** The harness samples at fixed 1 s wall-clock intervals. Animated routes are expected to advance `state._t` proportional to wall time IF the engine RAF runs at 60 Hz. Under any of: (a) Playwright headed mode (40-50 Hz under CPU pressure), (b) device pixel ratio 2 (canvas is 1520×880 pixels — `getImageData` 4× slower), (c) CI shared runner with neighbor noise (sustained 30 Hz), the engine RAF integrates `_t` by `dt = 1/30` per tick. State at t = 1 s real-time is ½ of state at 1 s on dev. For routes with weak time-dependence (ch3-1-2's `0.8 * sin`, ch3-5-1's `0.6 rad/s` orbit), uniqueFrames between samples can collapse from 4 to 2.
- **Failure scenario:** Sprint 1 lands on master. CI environment is 2-vCPU GitHub Actions runner. ch3-1-2's `lenPulse(t)` at slow-CI integrated time (0.5, 1.0, 1.5) instead of (1, 2, 3) hits `sin(0.4), sin(0.8), sin(1.2)` → pulse values closer together → grid samples within antialiasing tolerance → uniqueFrames = 2. CI red on a code-correct merge. On-call engineer reverts the merge; integration debt accumulates.
- **Evidence:**
  - `qa-verification/animation-sweep/full-58-route-animation-sweep-browser-eval-driver.js:140-152` — fixed `await sleep(1000)` between samples.
  - Engine RAF at `js/sim-professional-lab.js:1494-1499` — `behavior.onTick(scene, state, dt, time)` is dt-driven; engine ticks ~RAF rate, but plan never enforces the rate ↔ uniqueFrames relationship.
  - Plan's own concession in Phase 04 Risk Assessment: "if recurring flake, widen to `[2,4]` per route only" — the plan acknowledges flake, then defers the fix.
- **Suggested fix:** Trade fixed 1-s sleep for a *t-driven* sample: poll `lab.smoothedState._t` until it crosses 1, 2, 3 (engine clock, not wall clock). This decouples uniqueFrames from CI host speed and makes the test a true "did the renderer evolve through 1, 2, 3 seconds of simulation time" assertion. Currently the plan tests "did the renderer evolve through ~1, ~2, ~3 seconds of *wall* time" — which is not what we care about pedagogically and not what CI can guarantee.

---

## Summary

**Findings by severity:**
- Critical: 2
- High: 4
- Medium: 2
- Total: 8

**Top 3 by severity (with concrete failure):**
1. **F1 (Critical)** — Phase 06 step 6's "uniqueFrames ≥ 2 in 0.5 s without clicking Play" assertion is mathematically impossible: `pauseAfterFrames` finishes at 80 ms, the spec settles 200 ms; samples are taken on a frozen frame.
2. **F2 (Critical)** — preview-pause: 5 yields 0.28 px of body translation for ch3-2-1; "learners see motion in 5 frames" is wishful, not verifiable.
3. **F3 (High)** — Phase 03 plan claim "engine still ticks `_t` for static routes" is false; `_t` readouts permanently read 0.00 s on the 8 affected concept routes; risk-mitigation note is a false reassurance.

**Cross-cutting recommendation:** Phase 04's window `[3,4]` and Phase 06's preview-pause spec are both *wall-clock-coupled* — they will flake on any environment whose RAF rate is not 60 Hz. Convert both to *engine-time-coupled* assertions (poll `state._t` crossings) before any of them lands in the CI release gate. Otherwise this plan trades one verification gap (the original 13-route defect) for a different one (a flaky harness that masks regressions inside its own variance).

**Unresolved questions for the planner:**
- Is preview-pause N=5 deliberate UX, or did the original Phase 06 author target a *time* budget (~80 ms) without realizing the visual translation is sub-pixel?
- For Phase 03 static routes, is the time readout supposed to be removed, or is the engine supposed to tick `_t` even without user input? Pick one — the current plan is internally inconsistent.
- For Phase 05 ch3-5-1, is the lesson "COM is the mass-weighted centroid" (snapshot, static-concept) or "COM moves under net external force" (animation needed for ΣF_ext = M·a_CM)? The chosen orbit-around-static-positions animates *neither* lesson clearly.
