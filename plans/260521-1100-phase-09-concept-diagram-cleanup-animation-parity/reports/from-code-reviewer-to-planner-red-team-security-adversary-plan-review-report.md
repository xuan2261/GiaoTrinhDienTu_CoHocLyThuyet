# Red-Team Plan Review — Phase 09 Concept-Diagram Cleanup + Animation Parity

**Reviewer:** code-reviewer (hostile review, Security Adversary + Fact Checker hats)
**Plan dir:** `plans/260521-1100-phase-09-concept-diagram-cleanup-animation-parity/`
**Date:** 2026-05-21
**Verdict:** **DO NOT COOK AS WRITTEN**. Three critical fact-failures will silently brick the headline P0 scenario; one breaks TDD; several misroute file edits to non-existent paths. Full grep evidence below.

---

## Finding 1: `state._v0` does not exist anywhere in the codebase — the Phase 02 headline scenario silently no-ops

- **Severity:** Critical
- **Location:** Phase 2, sections "Overview" / "Key Insights" / "Requirements" / GREEN code block
- **Flaw:** Phase 02 builds its entire pedagogical justification on the claim that engine populates `state._v0`. Plan text: "Behavior file already exposes `state._v0` and `state._t` (engine ticks them), so no contract change." Renderer code uses `const v0 = state._v0 || 0;`. Reality: no producer writes `_v0` — anywhere.
- **Failure scenario:** Cook lands phase 02 verbatim. RED Node test passes (test author hand-sets `_v0: 4` in the stub state). Sweep spec passes (`F: 50, m: 5` → Fnet ≠ 0 branch covers `0.5 * a * t² * pxPerMeter`, body translates from acceleration alone). Reviewer ticks the `npm run test:sim:release` box. **In the actual browser**, the success criterion `ch3-2-1 body translates visibly when sliders set Fnet ≈ 0 with _v0 > 0` (plan.md L80) cannot be exercised — there is no UI control or initial-state hook for `_v0`, and `onTick_ch321` writes only `state.v` (initialized from `state.v || 5`), not `state._v0`. Pedagogy still broken at Fnet ≈ 0; harness gives a false GREEN. The single-most user-visible defect that motivates the whole plan slips through.
- **Evidence:**
  - `Grep "_v0"` against `js/` (excluding plan dir): zero matches in any production source (only matches are inside the plan documents themselves).
  - `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js:47-55` — `onTick_ch321` body: writes `state.accel`, `state.v` (uses `state.v || 5`), `state.x`, `state._t`. Never touches `_v0`.
  - `js/sims/ch3/ch3-dynamics-all-18-scenes.js:107-109` — ch3-2-1 controls expose only `F` and `alpha` sliders; no `_v0` slider, no `v0` slider, no `initialState._v0`.
- **Suggested fix:** Either (a) drop the `_v0` branch entirely and rely on `0.5 * a * t²` driven by F (already gives translation when slider Fnet ≠ 0; concede the Fnet=0 corner case); or (b) extend phase 02 scope to add a `v0` slider in `buildControls`/`buildInitial` for `ch3-2-1` AND add `state.v0 = (state.v0 || 0)` seeding in `onTick_ch321` so the renderer's `state._v0 || state.v0 || 0` actually reads a real value. Option (b) is what the plan text says it wants but the implementation steps don't deliver. Pick one and update the success criterion accordingly.

---

## Finding 2: Phase 02 / 03 cite renderer & scene files that do not exist — `Modify` lists are unactionable as written

- **Severity:** Critical
- **Location:** Phase 2 "Context Links" + "Read for context"; Phase 3 "Context Links" + "Related Code Files → Modify"
- **Flaw:** Plan cites `js/sims/ch3/ch3-newton-laws-behaviors.js` (phase 2 line 14, line 74; phase 3 line 15) and `js/sims/ch3/ch3-newton-laws-scenes.js` (phase 3 line 15). Neither exists. Behaviors live in `ch3-dynamics-newton-dalembert-behaviors.js` (and `ch3-dynamics-theorem-collision-behaviors.js`); scenes for ch3-1-3 / ch3-2-3 / ch3-2-5 live in the unified `ch3-dynamics-all-18-scenes.js`. Phase 06 makes the same mistake for ch2-5-1: cites `js/sims/ch2/ch2-kinematics-scenes.js` but ch2-5-1 is registered out of `ch2-relative-plane-motion-scenes.js` and rendered out of `ch2-instant-center-plane-motion-renderers.js`.
- **Failure scenario:** Sub-agent dispatched to "modify `ch3-newton-laws-scenes.js`" cannot find the file, either (a) creates a new file that no loader imports (silent no-op — scenes never wired up, RED tests stay red), or (b) wastes a NEEDS_CONTEXT round-trip. Even worse: Phase 03 step 4 says to add a `staticFor(routeId)` helper in **each** scene catalog file, but ch3-1-3/2-3/2-5/4-1/6-3/7-1/7-2 are all in the same file (`ch3-dynamics-all-18-scenes.js`) — not three separate files. The implementer either duplicates the helper across non-existent files or pollutes one file with three copies.
- **Evidence:**
  - `Glob js/sims/ch3/ch3-newton-laws-scenes.js` → "No files found".
  - `Glob js/sims/ch3/ch3-newton-laws-behaviors.js` → "No files found".
  - `js/sims/ch3/ch3-newton-laws-renderers.js:1-3` header comment: "Routes: ch3-1-2, ch3-1-3, ch3-2-1, ch3-2-2, ch3-2-3, ch3-2-5" — only the renderers file exists; behaviors/scenes are factored differently.
  - `js/sims/ch3/ch3-dynamics-all-18-scenes.js:18-89` — single catalog produces all 18 scenes including ch3-1-3 / ch3-2-3 / ch3-2-5 / ch3-4-1 / ch3-6-3 / ch3-7-1 / ch3-7-2.
  - `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js:198-205` — registry of all behaviors including `ch3-2-1`, `ch3-1-3`, `ch3-2-3`, `ch3-2-5`, `ch3-4-1`.
  - `js/sims/ch2/ch2-relative-plane-motion-scenes.js:22` — owns ch2-7-2 row (and almost certainly the row for ch2-5-1 by the same convention). `ch2-kinematics-scenes.js:30` lists ch2-7-2 too, but the active loader path needs to be verified before editing.
- **Suggested fix:** Replace every "ch3-newton-laws-behaviors.js" with `ch3-dynamics-newton-dalembert-behaviors.js`. Replace every "ch3-newton-laws-scenes.js" / "ch3-dynamics-all-18-scenes.js" instance with the unified path. For Phase 03, drop the per-file `staticFor` helper triplication and use a single allowlist constant in `ch3-dynamics-all-18-scenes.js` (referenced from `scene(row, …)`). For Phase 06, run the grep step `grep -n "ch2-5-1" js/sims/ch2/*.js` BEFORE the plan is approved (currently it's a TODO inside the implementation).

---

## Finding 3: Phase 03 claims "engine still ticks `_t` for readouts" after Play suppression — this is false; static routes will freeze `_t` at 0

- **Severity:** Critical
- **Location:** Phase 3, "Key Insights" (3rd bullet) + "Risk Assessment" (3rd bullet) + Phase 06 Risk note
- **Flaw:** Phase 03 sells the static-flag fix as cosmetic-only: "Phase 03 keeps `onTick` and the engine running for readout `_t` displays — only the **button** is suppressed. This separates 'play state existence' from 'play affordance'." This is materially wrong. The engine's `onTick` is only invoked from the animation loop; the loop only runs after `lab.resume()` (`js/sim-professional-lab.js:1602-1608`) which is reachable only via the Play button OR the `scene.autoplay` branch (`js/sim-professional-lab.js:1671`). Phase 03 step 7 explicitly "Skip the autoplay branch entirely" for static scenes. Net effect: no entry point starts the engine for static routes. `state._t` stays at 0 for the entire session.
- **Failure scenario:** Routes ch3-1-3, ch3-2-3, ch3-5-1, ch3-5-2, ch3-6-3, ch3-7-1, ch3-7-2 are listed in `readoutPolicyFor` with `appendTime: true` (`ch3-dynamics-all-18-scenes.js:206`). Of these, the plan flags ch3-1-3, ch3-2-3, ch3-6-3, ch3-7-1, ch3-7-2 as `static: true`. After phase 03 lands, those readouts display "t = 0.00 s" forever — and any state mutation inside `onTick_*` (e.g. `onTick_ch323` accumulates `state.v1`/`state.v2` per dt; `onTick_ch363` runs collision integrator) silently never runs, even though the readouts depend on those state fields. Existing learners see panels go from "live" to "frozen". The plan mitigation in Phase 03 risks ("verified — `appendTime` policy already includes the 7 concept routes per `readoutPolicyFor`") inverts cause and effect — `appendTime` lists routes that NEED `_t`, which is exactly the routes that break.
- **Evidence:**
  - `js/sim-professional-lab.js:1494-1495` — `behavior.onTick(scene, state, dt, time)` is called only inside the animation engine's frame callback (registered via `lab.anim.onFrame`, `js/sim-professional-lab.js:1500`).
  - `js/sim-professional-lab.js:1602-1608` — `lab.resume()` is what starts the engine; without Play button or autoplay, nothing else calls it.
  - `js/sim-professional-lab.js:1671` — autoplay branch is `if (scene.autoplay && !lab.prefersReducedMotion …)`; static scenes will not have autoplay (and Phase 03 step 7 explicitly disables the branch anyway).
  - `js/sims/ch3/ch3-dynamics-all-18-scenes.js:206` — `appendTime: ['ch3-1-3', 'ch3-2-3', 'ch3-5-1', 'ch3-5-2', 'ch3-6-3', 'ch3-7-1', 'ch3-7-2']`.
- **Suggested fix:** Either (a) keep a minimal "tick-without-button" loop for static routes that still want `_t` to advance (engine started on mount, Play button still suppressed), OR (b) restrict `static: true` to routes whose readouts do NOT use `appendTime` AND whose behavior `onTick` is a true no-op (the truly-concept-only ones). Suggested cleaner cut: keep static flag for ch3-7-1 (theorem selector — `problemType` is slider-driven), ch3-7-2 (residual checker — slider-driven), ch3-2-5 (FBD — `F` is slider-driven), ch2-7-2 (numeric checker — slider-driven). For ch3-1-3 / ch3-2-3 / ch3-4-1 / ch3-6-3, either keep Play OR autostart the engine on mount with no button. Update `appendTime` policy to match the cut.

---

## Finding 4: Phase 03 RED test for `[data-sim-play]` selector is a false-RED — the attribute is never set, so the assertion passes before the fix

- **Severity:** Critical
- **Location:** Phase 3, "RED" step 2 + "Tests" table (`page.$('[data-sim-play]')` assertions); also Phase 1 utils `clickPlay` step 3.
- **Flaw:** Plan asserts `await page.$('[data-sim-play]')` returns null on static routes after fix. Reality: `data-sim-play` is **not set anywhere** in the codebase, neither on the static nor non-static routes. The Play button is `core.addButton(lab.controls, '▶ Chạy', …)` with no data attribute. The RED assertion therefore evaluates true in *both* RED and GREEN states — TDD signal is dead before it is born.
- **Failure scenario:** Author writes the spec, runs it once with no production change, and Playwright reports PASS (selector returns null because `[data-sim-play]` is not on the button — but it is also not on any other routes). Author concludes the gating logic works without ever shipping the gate. After phase 03 "GREEN" merge, regression sneaks back in (somebody re-adds `core.addButton('▶ Chạy', …)` to a static route) and the spec stays GREEN — false confidence. The phase-1 `clickPlay` helper that "locates `[data-sim-play]` (or fallback button textContent match)" silently always falls back, so the harness never exercises the primary selector.
- **Evidence:**
  - `Grep "data-sim-play|data-action=\"play\"|sim-play"` in `js/`: zero matches.
  - `js/sim-professional-lab.js:1656-1661` — Play button creation does not call `setAttribute('data-sim-play', …)` and `core.addButton` (per `js/sim-lab-ui.js`) does not propagate any custom data attribute either.
- **Suggested fix:** Either (a) add `playButton.setAttribute('data-sim-play', '')` inside the conditional in `js/sim-professional-lab.js` as PART of the GREEN change so the RED test has a real fixed point (and update `core.addButton` if needed), OR (b) rewrite the RED assertion to a positive identification: `page.locator('button', { hasText: '▶ Chạy' })` count check (1 on non-static, 0 on static), AND add a positive control test (assert non-static route still has the button). Without a positive control, both tests in the table can pass on a fully unchanged tree.

---

## Finding 5: Phase 06 edits the wrong file for ch2-5-1 autoplay — `ch2-kinematics-scenes.js` has no `autoplayFor` and ch2-5-1 lives elsewhere

- **Severity:** High
- **Location:** Phase 6, "Architecture" + "Implementation Steps" steps 1, 4
- **Flaw:** Plan provides a code block for `js/sims/ch2/ch2-kinematics-scenes.js` adding an `autoplayFor(routeId)` helper. But (a) ch2-5-1 is registered out of `ch2-instant-center-plane-motion-renderers.js:115`, with the row in `ch2-relative-plane-motion-scenes.js` (the catalog `ch2-kinematics-scenes.js` does not list ch2-5-1 in the rows visible in head -40); (b) no ch2 scene catalog file currently has any `autoplay` key set on its produced scenes (no matches for `autoplay` in `js/sims/ch2/*.js`). So adding an `autoplayFor` helper requires also wiring it into the row-builder in the right catalog and updating `scene(row)` to call it — none of which the plan describes.
- **Failure scenario:** Sub-agent edits `ch2-kinematics-scenes.js` per plan, adds the helper. The helper is never called by `scene()` (because the existing row builder in that file likely doesn't include `autoplay` in scene shape, or ch2-5-1 isn't even produced from that file). Phase 06 RED test fails in GREEN state (`scene.autoplay` is undefined for ch2-5-1). Sub-agent reports BLOCKED, controller spends a round trip understanding the ch2 catalog topology — which Phase 06 step 1 admits ("Confirm which catalog owns the autoplay setter for ch2-5-1") was already a known unknown.
- **Evidence:**
  - `Grep "autoplay"` in `js/sims/ch2/`: only matches are inside this plan dir; zero hits in production code.
  - `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js:22, 45, 94, 115-117` — registers ch2-5-1, ch2-5-2, ch2-5-3.
  - `js/sims/ch2/ch2-relative-plane-motion-scenes.js:22` — owns ch2-7-2 row (and per the file's name, owns plane-motion 2.5.x scenes; needs grep verification but the kinematics catalog doesn't list 2.5.x in head).
- **Suggested fix:** Make Phase 06 step 1 a hard pre-step BEFORE plan approval: identify the ch2-5-1 scene-row file via grep, confirm whether `scene(row)` in that file produces an `autoplay` key, and replace the placeholder paths in the plan. If the ch2 catalog does not currently consume `autoplay`, the autoplay precedent is Ch3-only and Phase 06's "5 routes mount with autoplay" claim collapses to 4. Spell out the wiring change explicitly.

---

## Finding 6: Phase 07 cites chapter HTML paths that do not exist — investigation step has no source to read

- **Severity:** High
- **Location:** Phase 7, "Read for context" + step 1 (`Read chapters/ch2-5-2.html ...`)
- **Flaw:** Plan tells the investigator to read `chapters/ch2-5-2.html` and `chapters/ch2-5-3.html`. These paths do not exist; the chapter slugs use Roman-numeral section directories (`chapters/ch2/muc-V-2.html`, `chapters/ch2/muc-V-3.html`) per `js/loader.js`. The chapter index for ch2-5-2 isn't even listed in the visible loader entries (only `muc-V.html` exists per glob output). Without DOCX/chapter text, the decision matrix in Phase 07 cannot proceed.
- **Failure scenario:** Investigator opens the named files, gets ENOENT, falls back to grepping `tools/docx_site_manifest.json`. If the manifest covers only top-level section labels (likely), the decision defaults to "intentional-static" (per the risk-mitigation note) without sourced quotes — failing the success criterion "Decision documented in journal with sourced quotes."
- **Evidence:**
  - `Glob chapters/**/*.html`: no `ch2-5-2.html` / `ch2-5-3.html`; nearest matches are `chapters/ch2/muc-V.html` (no muc-V-2 or muc-V-3 in glob output for ch2).
  - `js/loader.js:106` shows the route → chapter convention: `'ch2-7-2': 'chapters/ch2/muc-VII-2.html'`. By that pattern ch2-5-2 should map to `chapters/ch2/muc-V-2.html` — but glob does not surface that file under chapters/ch2/ (only ch1 and ch3 have muc-V-2 / muc-V-3).
- **Suggested fix:** Replace the literal paths with the loader-resolved paths. Run `Glob chapters/ch2/muc-V*.html` BEFORE plan approval; if the chapter HTML for §2.5.2/§2.5.3 doesn't exist in this repo, the investigation must source from the original DOCX (path TBD) or the QA verification report. Otherwise mark Phase 07 BLOCKED on missing source material.

---

## Finding 7: Phase 05 ch3-5-1 orbit displacement claim "averages to ~0 over a period" is mathematically false for unequal masses

- **Severity:** High
- **Location:** Phase 5, sub-step 5b GREEN code (orbit injection) + the inline rationale comment
- **Flaw:** Plan says: "the orbit displaces *visualization* only — pedagogy preserved (each m_i wobbles around its mean position; their COM is unchanged because the orbit displacements average to ~0 over a period)." With three masses at phase offsets `i*2π/3` and equal radius `ri = 24`, the COM displacement of the visualization equals `(Σ mᵢ·rᵢ·cos(theta+ωt+φᵢ)) / Σ mᵢ`. For unequal masses (the default state has m=[2, 1.5, 1]) the three sinusoids do NOT sum to zero — they sum to a sinusoid of amplitude `~24·sqrt((2-1.5)² + (1.5-1)² + (2-1)²·…)/4.5 ≈ several pixels of net wobble`. The "C" point displayed at `xCM, yCM` is computed from the **base** positions, not from the orbiting positions, so the rendered COM marker will visibly diverge from the visual centroid of the three particles — a pedagogical regression on the very theorem the route teaches (`m·a_CM = ΣF_ext` requires the visual COM to track the marker).
- **Failure scenario:** Learner sees three masses orbiting; the "C" dot does NOT sit at the centroid of where they appear to be — it sits at the time-averaged centroid. For unequal masses this offset is visible (≈4-8 px). Visual-quality baseline updater rubber-stamps it. Course owner discovers the regression in user testing and asks for a revert.
- **Evidence:**
  - `js/sims/ch3/ch3-theorems-renderers.js:14-37` — `renderCh351CenterOfMass` computes xCM/yCM from base masses; the renderer does not (and per Phase 05's "no behavior change" constraint, must not) recompute the marker from orbiting positions.
  - Default state `js/sims/ch3/ch3-dynamics-all-18-scenes.js:76-80` — `masses: [{m:2}, {m:1.5}, {m:1}]` (not equal).
- **Suggested fix:** Either (a) recompute `xCM, yCM` from the orbiting `(ox, oy)` so the marker tracks the visual centroid (drops the "no behavior change" constraint by a few lines but preserves pedagogy), OR (b) constrain the orbit to mass-weighted-zero displacement: `Σ mᵢ·(cos(θ+ωt+φᵢ), sin(...)) = 0` requires solving for phase offsets at runtime, which is overengineered for the use case. Cleanest: drop the orbit and animate something else (e.g., `ΣF_ext` arrow rotates slowly, or one trajectory line traces); keep the static centroid pedagogy intact.

---

## Finding 8: npm script naming inconsistency between Phase 04 and Phase 09 — `update-evolution-baseline` vs `update-evolution-baseline-png`

- **Severity:** Medium
- **Location:** Phase 4 step 6 + Phase 9 step 6
- **Flaw:** Phase 04 introduces `npm run test:sim:browser:update-evolution-baseline`. Phase 09 (backlog) refers to `npm run test:sim:browser:update-evolution-baseline-png`. The two scripts cover different artefacts (JSON sweep baseline vs PNG visual baselines) but the names overlap enough that contributors will collide. Phase 09 doc step 6 also contradicts itself by naming the script for the README.md update via Phase 04 (Phase 08 step 6 cites both `evolution` and `update-evolution-baseline` — if Phase 09 lands later it will retroactively want a third script name).
- **Failure scenario:** Contributor runs the wrong script during baseline update, mixes JSON drift with PNG drift, ends up with mismatched committed artifacts. Or grep'ing for the script name finds two matches in the docs and one in package.json — which is the source of truth.
- **Evidence:**
  - `phase-04-p0-regression-harness-ci-hook.md:138` — `"test:sim:browser:update-evolution-baseline": "node tools/update-canvas-evolution-baseline.js"`.
  - `phase-09-backlog-visual-baseline-pixelmatch.md:85` — "via `npm run test:sim:browser:update-evolution-baseline-png`".
  - `phase-08-p2-documentation-sync.md:107` — README adds "test:sim:browser:evolution" and the update-baseline script.
- **Suggested fix:** Rename phase 09's script to `test:sim:browser:update-pixelmatch-baseline` so the names disambiguate by artefact (json baseline vs png baseline), and consolidate the README list under a single pipe-separated section in Phase 08 step 6 with explicit mapping {script → artefact}.

---

## Findings Summary

| # | Severity | Phase | One-line |
|---|----------|-------|----------|
| 1 | Critical | 02 | `state._v0` is never populated; renderer fix is a no-op for the headline scenario |
| 2 | Critical | 02, 03, 06 | Plan modifies non-existent files (`ch3-newton-laws-{behaviors,scenes}.js`, wrong ch2 catalog) |
| 3 | Critical | 03 | Suppressing Play stops `_t` advancement — readouts with `appendTime` freeze |
| 4 | Critical | 03 (& 01) | RED selector `[data-sim-play]` is never set anywhere — TDD signal dead-on-arrival |
| 5 | High     | 06 | ch2-5-1 autoplay edit targets wrong catalog; no `autoplayFor` exists in any ch2 file |
| 6 | High     | 07 | Cited chapter HTML paths (`chapters/ch2-5-2.html`) do not exist |
| 7 | High     | 05 | ch3-5-1 orbit displacement does NOT average to zero for the default unequal masses |
| 8 | Medium   | 04, 09 | Inconsistent npm script names for baseline updaters |

## Top 3 by Severity (must-fix before cooking)

1. **F1** — design-level. Nail `_v0` plumbing or drop the `_v0` branch.
2. **F2** — fact-level. Replace every wrong file path; merge the per-file `staticFor` triplication into a single allowlist.
3. **F3** — behavioral. Either add a "tick-without-button" mode for static routes that need `_t`, or shrink the `static: true` set to truly time-independent routes.

## Verified Anchors (in case implementer wants confirmed line refs)

- `js/sim-professional-lab.js:1656-1661` — Play button gate. **VERIFIED**.
- `js/sim-professional-lab.js:1494-1495` — `behavior.onTick(...)` call site. **VERIFIED**.
- `js/sim-professional-lab.js:1671-1675` — autoplay + `pauseAfterFrames`. **VERIFIED**.
- `js/sims/ch3/ch3-newton-laws-renderers.js:42-56` — `renderCh321InertiaLaw`. **VERIFIED**.
- `js/sims/ch3/ch3-theorems-renderers.js:14-37, 41-60, 64-86` — center-of-mass / impulse-momentum / angular-momentum. **VERIFIED**.
- `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js:22-43, 45-111` — plane-motion / instant-center / velocity-distribution. **VERIFIED**.
- `tests/phase-09-12-tdd.test.js` — exists; non-collision with proposed `sim-canvas-evolution.spec.js`. **VERIFIED**.
- `qa-verification/animation-sweep/per-route-animation-sweep-results.json` — exists. **VERIFIED**.
- `qa-verification/qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md` — exists. **VERIFIED**.
- `tests/simulation-visual-quality.spec.js` — exists. **VERIFIED**.
- `npm run test:sim:browser` script in `package.json:15` — exists. **VERIFIED**.
- `npm run test:sim:visual-quality:update` — exists (`package.json:23`). **VERIFIED**.
- `npm run test:sim:release` — exists (`package.json:26`). **VERIFIED**.
- `js/sims/ch3/ch3-newton-laws-behaviors.js` — **FAILED (not found)**.
- `js/sims/ch3/ch3-newton-laws-scenes.js` — **FAILED (not found)**.
- `chapters/ch2-5-2.html`, `chapters/ch2-5-3.html` — **FAILED (not found)**.
- `state._v0` references in `js/` — **FAILED (zero matches)**.
- `data-sim-play` attribute usage in `js/` — **FAILED (zero matches)**.
- `autoplayFor` in `js/sims/ch2/` — **FAILED (zero matches)**.

## Unresolved Questions

- Is the missing chapter HTML for §2.5.2 / §2.5.3 a known gap in this repo, or should Phase 07 source from `tools/docx_site_manifest.json` only?
- For the Phase 03 static set, is the intent really to freeze `_t` on those routes (lose `appendTime` readouts) — or did the plan author assume the engine ticks idempotently?
- Phase 06 wants a 5-frame preview-pause; with the `pauseAfterFrames` impl using `requestAnimationFrame` (not engine `dt`), 5 frames at 60Hz ≈ 83 ms — is the renderer's `_t`-driven term already large enough at t≈0.08 s to be visible? If not, preview-pause: 5 will look identical to no-autoplay.
