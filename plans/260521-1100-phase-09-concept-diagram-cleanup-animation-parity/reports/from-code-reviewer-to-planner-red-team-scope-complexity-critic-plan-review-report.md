# Red-Team Plan Review — Scope & Complexity Critic
**Plan:** `plans/260521-1100-phase-09-concept-diagram-cleanup-animation-parity/`
**Reviewer persona:** Scope & Complexity Critic + Contract Verifier
**Date:** 2026-05-21
**Method:** plan files + grep/read against actual codebase (no build/lint/test runs)

---

## Headline

The verification report (`qa-verification/qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md`) yields a small, well-bounded fix list:
- 1 renderer needs `state._t` (ch3-2-1)
- 8 routes need a `static` flag so the misleading Play button disappears
- 4 renderers can optionally consume `state._t`
- 2 routes (ch2-5-2/3) need a 30-min content-owner decision

The plan transforms this into **10 phases, 4 sprints, 8 new test files, 2 new npm tools, 3 new npm scripts, a checked-in baseline JSON, an 80-PNG pixelmatch tier-2, and an interaction-sweep expansion** — most of which is harness building, not the fix itself. Three of the testing primitives the plan relies on (`state._v0`, `window.SIM_SCENES.get()`, `[data-sim-play]`) **do not exist in the codebase**, so the proposed RED tests would silently misfire.

Recommendation: collapse Sprint 1 (phases 1-4) into a single PR, kill phases 7/8/9/10 outright, fold the docs sync into the same PR.

---

## Finding 1: Three referenced APIs do not exist — tests as written cannot work

- **Severity:** Critical
- **Location:** Phase 1 (utils), Phase 2 (renderer fix), Phase 3 (spec selector), Phase 6 (autoplay test)
- **Flaw:** Three identifiers the plan treats as load-bearing have **zero hits** in the actual codebase:

  1. `state._v0` — `grep -rn "_v0" js/` → **no matches** (only plan files reference it).
     - Phase 02 hinges on `bodyX += state._v0 * state._t * pxPerMeter` for the "Fnet=0 ⇒ v=const" branch. Without `_v0` populated, the branch is dead code — body still won't translate when the user sets F=0. The phase's own risk note admits "Phase 03 behaviors leave `_v0` unbound; default 0" — which means the headline pedagogy claim ("body translates visibly when sliders set Fnet ≈ 0") fails on success-criteria checkbox: `plan.md:80`.
     - Counter-evidence: `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js:47-55` already maintains `state.v` with `Math.abs(state.accel) < 0.01 ? (state.v || 5)` — i.e. the engine already preserves a residual velocity. The renderer should consume `state.v` (which is populated), not invent `state._v0` (which is not).

  2. `window.SIM_SCENES.get(routeId)` — `grep -rn "SIM_SCENES" js/` → **no matches**. Referenced in `phase-03 step 1` and `phase-06 step 2` as the assertion vehicle. Phase 03 hand-waves with "or registry equivalent in Node-side stub via `require('../js/...')`" — but the JS files use `(function() { ... })()` IIFEs and `window.SimRouteRenderers.register(...)` style — they do **not** export anything CommonJS-loadable. `require('../js/sims/ch3/ch3-newton-laws-renderers.js')` from a Node test would side-effect-load against an undefined `window`. The whole RED-test mechanism is unimplemented.

  3. `[data-sim-play]` — `grep -rn "data-sim-play" js/` → **no matches**. `js/sim-core.js:234-241` `addButton()` creates `<button class="sim-btn">` with `textContent` only — no data attribute. So `expect(await page.$('[data-sim-play]')).toBeNull()` (phase-03-step-2) returns `null` on **every** route — static or animated — and the assertion vacuously passes (or fails uniformly), not actually proving Play-button suppression.

- **Failure scenario:** All RED tests in Sprint 1 are constructed against APIs that don't exist. Phase 02 lands a renderer change that doesn't fix the user-visible defect. Phase 03's no-Play-button spec passes regardless of whether the production fix landed. The CI gate is theater — green on regressions.
- **Evidence:**
  ```
  $ grep -rn "_v0\|SIM_SCENES\|data-sim-play" js/
  (no matches)
  $ grep -n "addButton" js/sim-core.js
  234:function addButton(container, text, onClick) {
       const btn = document.createElement('button');
       btn.className = 'sim-btn';
       btn.textContent = text;
  ```
- **Suggested fix:** Before any phase ships, decide:
  - Use existing `state.v` (engine-populated) for the inertia-law renderer fix — drop `_v0` entirely.
  - Add `data-sim-play="true"` to the actual Play button in `sim-professional-lab.js:1657` *as part of phase 03* (it's a 1-line change), then write the spec against that selector.
  - Replace `window.SIM_SCENES.get` with a real assertion path: render the scene to a DOM, query the rendered controls (`page.locator('button:has-text("▶ Chạy")').count()`), or expose scenes via a deterministic registry and assert on that.

---

## Finding 2: Sprint 1 four-phase TDD ceremony is over-engineered for a one-time, well-bounded defect

- **Severity:** High
- **Location:** Plan §Sprint Plan; phases 01-04
- **Flaw:** The whole verification report's fix surface is:
  - 1 file edit ≈ 12 lines (`js/sims/ch3/ch3-newton-laws-renderers.js:42-56`)
  - 8 catalog rows + 1 short-circuit in `js/sim-professional-lab.js:1656` (≈ 4 net lines + 8 flags)

  Sprint 1 inflates this into:
  - Phase 1: 4 new files (`tests/sim-canvas-evolution-fixtures.js`, `tests/canvas-evolution-utils.js`, `tests/sim-canvas-evolution.spec.js`, `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json`)
  - Phase 4: 2 new tools (`tools/check-canvas-evolution-baseline.js`, `tools/update-canvas-evolution-baseline.js`), 3 new npm scripts, 1 baseline JSON tracked under git

  The harness exists to catch *future* regressions of the same class. But the regression class is "renderer doesn't read `state._t`" — already trivially preventable via a code-standards docstring + grep-on-PR (phase 8 / phase 10 already write that doc). The harness adds maintenance burden:
  - Baseline JSON drift on every legitimate renderer tweak
  - Per-route window thresholds that are arbitrary (see Finding 6)
  - 58-route Playwright sweep now in the default `test:sim:browser` chain (`package.json:21`)

- **Failure scenario:** First time someone tightens an animation easing curve, baseline JSON shows drift; they `npm run test:sim:browser:update-evolution-baseline`; six months later nobody remembers what the baseline guarantees, and intentional regressions get blessed via "yeah just regen".
- **Evidence:** Verification report (`qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md:184-187`) ranks the issues as "ưu tiên trung bình" (medium priority) and "ưu tiên thấp" (low priority) — not regression-prevention-worthy. The harness scope is Claude-invented, not user/owner-requested.
- **Suggested fix:** Single PR:
  1. Edit `renderCh321InertiaLaw` (consume `state.v` → `bodyX`).
  2. Add `static` flag to 8 scenes + short-circuit in `sim-professional-lab.js`.
  3. Optionally add a one-shot Node assertion that the renderer functions for the 13 ex-flagged routes contain `state._t` OR scene metadata has `static: true` (≈ 30 lines). No JSON baseline. No two new tools.

---

## Finding 3: Phase 1 "knownDefect bypass" defeats the entire TDD premise

- **Severity:** High
- **Location:** Phase 1 §Implementation Steps "GREEN — bypass for phase 1" (step 8)
- **Flaw:** The plan writes a spec, hits 13 RED routes, then **wraps the assertion in `if (!route.knownDefect) assert(...)`** "to make phase-1 spec pass on commit" (`phase-01:114`). That's not RED-then-GREEN — that's "ship a green test that asserts nothing for the routes we care about". Phases 2/3/5 then have to remember to remove their own knownDefect tag — coupling spec scaffolding to production change rollouts in a non-obvious way.
- **Failure scenario:** Someone lands phase 02 but forgets the JSON edit; spec stays green even though ch3-2-1 hasn't been fixed. Or worse: someone pre-tags a *future* defect as `knownDefect` to land a half-fix.
- **Evidence:** `phase-01-foundation-tdd-setup.md:113-115`:
  > Wrap the per-bucket assertion in a guard `if (!route.knownDefect) assert(...)`. This makes phase-1 spec **pass on commit** while documenting the gap.
- **Suggested fix:** If you're going to land Phase 1 separately (which is itself questionable per Finding 2), put the spec under `tests/expected-failures/` or `test.fixme()` — at least be honest about what's skipped. Better: don't land Phase 1 until Phases 2+3 are ready; cook them as one PR.

---

## Finding 4: Phase 06 autoplay preview-pause is an invented feature, not a verification finding

- **Severity:** High
- **Location:** Phase 06 §Overview, Success Criteria `plan.md:83`
- **Flaw:** The user-facing prompt for this plan was the verification report. That report's "Issues còn lại" (`§8`) is exactly two items:
  1. Add `_t` to renderer **OR** hide Play button (medium prio)
  2. Concept-diagram routes show Play button — UX confusion (low prio)

  Nowhere does it ask "show motion within first 5 frames after mount". Phase 06 invents this as a "P1" with `effort: 0.5d`, ships a fixture test pinning 8 routes' autoplay configs, plus a Playwright preview-detection sub-spec. The justification ("learners see motion within first 5 frames after mount") is the planner's UX opinion, not a verification finding or content-owner ask.

  5 frames @ 16 ms ≈ 80 ms. Either the user noticed motion in 80 ms (in which case they'd notice it within the 1 s preview anyway after clicking Play), or they didn't (in which case 5 frames is too short). The threshold is unmotivated.

- **Failure scenario:** Default autoplay on routes the content owner expected to be paused changes the pedagogical pacing of the lesson. Reduced-motion users still see no autoplay (existing behavior), so the change only affects default-motion users — meaning it's a UX bet without a UX trial.
- **Evidence:** Verification report `§8` lists 2 issues; neither is autoplay defaults. Phase 06's "Key Insights" (`phase-06:25-29`) is editorial reasoning, no source citation.
- **Suggested fix:** Drop Phase 06. If the content owner specifically asks for autoplay-on-mount for the 5 newly animated routes, ship it then — as a 1-line `autoplayFor` edit, not a 0.5d phase with its own test fixture.

---

## Finding 5: Phase 07 is a 30-minute decision masquerading as a phase

- **Severity:** Medium
- **Location:** Phase 07 (entire file)
- **Flaw:** "Read 2 chapter HTML files for keywords, decide static-vs-animate, write a journal entry." That's 30 min of reading + 5 min of writing. Promoting it to a 0.5d phase with its own dependency graph (`dependencies: [4]`), conditional follow-up phase (`phase-07b`), and dedicated journal entry creates ceremony without value. Worse, Phase 1 already commits the bucket placement of ch2-5-2/3 — so Phase 07 is gated on a decision that was already made implicitly (`phase-01:84` includes ch2-5-2/3 → animated bucket OR not? — the fixture only lists 8 concept routes, so ch2-5-2/3 land in the *animated* bucket by exclusion, contradicting the verification report's finding that they're "đúng spec" / intentional-static at `qa-verification/qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md:77`).
- **Failure scenario:** Phase 1 sweep flags ch2-5-2/3 as RED (animated bucket, uniqueFrames=2 < 3); Phase 7 later decides they're static-concept; baseline must be edited *again*. That's the harness eating its own tail — exactly the "noisy baseline drift" risk Phase 4 hand-waves.
- **Evidence:** `phase-01:84` defines `STATIC_ROUTES_CONCEPT_DIAGRAM = [8 routes]` — does **not** include ch2-5-2/3, so they fall into "rest" → animated bucket. `qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md:77` says ch2-5-2/3 are "đúng spec".
- **Suggested fix:** Make this a checkbox on Phase 03: "decide ch2-5-2/3 as static-concept (default) or open ticket". Move the 2 routes into `STATIC_ROUTES_CONCEPT_DIAGRAM` (10 routes total) at Phase 1 commit, removing the bucket-flip churn.

---

## Finding 6: "≥3 unique frame hashes" threshold has no derivation; bucket windows are arbitrary

- **Severity:** Medium
- **Location:** `plan.md:82` Success Criteria; Phase 04 §Key Insights "windows"
- **Flaw:** Plan asserts `uniqueFrames ∈ [3,4]` for animated, `[1,2]` for static, `[1,1]` for concept-static. The 4 samples are at t=0,1,2,3 → max 4. Why `≥3`?
  - If the renderer paints a 1 Hz oscillator at integer second offsets, sampling at t=0,1,2,3 captures the same phase 4× → `uniqueFrames=1` (false negative).
  - If the renderer paints anti-aliased subpixel jitter, `uniqueFrames=4` always (false positive). Verification used 16×16 grid which dampens this — but tolerance is unstated for CI variance.
  - The "static-concept" `[1,1]` window is too tight: any static route with a dynamic readout overlay (KaTeX render timing, focus ring) could show `uniqueFrames=2` once.

  No derivation, no threshold-noise analysis. "Animated lower bound = 3" is a guess.

- **Failure scenario:** Flake in CI; threshold widened to `[2,4]` per route (Phase 4 risk note already pre-bakes this) — at which point the harness signal-to-noise is `≤ 50 %`, not regression-catching.
- **Evidence:** `phase-01:60` "STATIC → uniqueFrames ∈ {1, 2} (2 allowed for one-shot snap); ANIMATED → uniqueFrames ≥ 3" — no derivation. `phase-04:27` "Animated routes: [3,4]. Static: [1,2]. Concept-static (post-phase-3): [1,1]" — three discrete buckets pulled from thin air.
- **Suggested fix:** If the harness must ship: capture 6 samples at sub-second offsets (t=0, 0.4, 0.8, 1.6, 2.4, 3.0) → minimum noise floor is 2 (anti-aliasing); animated minimum is 4 (≥66% unique). Document the threshold-vs-noise reasoning in a comment. Or skip thresholds entirely and just diff against baseline directly (Finding 2 path).

---

## Finding 7: Phase 5 `lenPulse = 1 + 0.3*sin(0.8*t)` is gold plating with no physics basis

- **Severity:** Medium
- **Location:** Phase 05 §5a ch3-1-2, lines 102-110 of phase doc
- **Flaw:** ch3-1-2 teaches `a = F/m` — a *static* algebraic relation, no time dimension. Verification report classifies ch3-1-2 as "concept diagram (force-acceleration arrow)" at line 105 of the report — i.e. it is **arguably** in the same bucket as ch3-1-3, ch3-2-3, etc. that get `static: true` in Phase 03. Phase 5a "animates" it by pulsing the arrow length sinusoidally — visually noisy, pedagogically meaningless ("force isn't actually oscillating"). It's animation-for-the-test-checkbox.
- **Failure scenario:** Learner sees an arrow pulsing at 0.8 rad/s and asks "why is the force varying?" — pedagogy net loss vs the static diagram.
- **Evidence:** Verification report `§4`, line 105: `ch3-1-2 | ✓ | ✓ | ✗ | concept diagram (force-acceleration arrow)`. The category is "concept diagram", not "should-animate". Only the line 139 §4.2 *suggestion* table promotes it to "should animate (candidate)" — a planner judgement, not a verification finding.
- **Suggested fix:** Move ch3-1-2 to `STATIC_ROUTES_CONCEPT_DIAGRAM` (9 routes total). Drop §5a. Sprint 2 becomes 3 routes, not 4 — even smaller scope.

---

## Finding 8: Phase 08 docs sync should be inline with the shipping PR, not a phase

- **Severity:** Medium
- **Location:** Phase 08 (entire file)
- **Flaw:** `docs/codebase-summary.md`, `docs/project-changelog.md`, `docs/code-standards.md` updates that describe scene.static, the harness, and the new npm scripts must land **with** the code changes, otherwise the docs lie until Phase 08 lands. Splitting into a separate phase guarantees a window where docs are stale. The user's `documentation-management.md` rule says "After Feature Implementation: Update roadmap progress status and changelog entries" — i.e. inline.
- **Failure scenario:** Sprint 1 lands; Sprint 2 starts; somebody reads `docs/code-standards.md` and sees no mention of `scene.static`, writes a new renderer that ignores it. Three weeks later Phase 08 retrofits the docs.
- **Evidence:** `~/.claude/rules/documentation-management.md` (user global) — "After Feature Implementation: Update roadmap progress status and changelog entries". Plan instead defers to Sprint 3.
- **Suggested fix:** Delete Phase 08. Add a "docs updated" checkbox to each shipping phase. The journal entry at plan close is fine as a separate artifact (it summarizes shipped state, doesn't enable future work).

---

## Finding 9: Phases 9 + 10 are explicit backlog cruft — delete, don't defer

- **Severity:** Medium
- **Location:** Phases 09 (pixelmatch) + 10 (harness expansion + axe-core)
- **Flaw:** Both phases are titled "Backlog" and admit non-essential scope. Carrying them in the plan dir creates:
  - **Sunk-cost gravity** — they get scheduled "after current work" forever.
  - **Dependency confusion** — Phase 9 deps on `[4,5,6]`, Phase 10 deps on `[4]`. Phases 5/6 were already questionable (Findings 4, 7). Phase 9 introduces a new npm dep (`pixelmatch`, `pngjs`) and 16 MB of PNG baselines for a "tier-2" check that the Phase 4 hash sweep already covers. Phase 10 spends a day promoting the existing 14-route interaction sweep to all 58, when `tests/simulation-browser.spec.js` already mounts all 58 routes.
  - **Maintenance debt** — pixelmatch baselines on a Vietnamese-language KaTeX-rendered canvas will drift on every browser update.
- **Failure scenario:** Phase 9 ships, dev workflow grows to "if you change a renderer, you might need to regen 4 PNG baselines per route" → either ignored (signal lost) or dutifully refreshed (signal lost more slowly).
- **Evidence:** Phase 09 `Overview` line 24: "This is **backlog** because phase 04's hash-based sweep already catches the original symptom (no evolution). Pixelmatch is the second-tier net..." — author admits redundancy.
- **Suggested fix:** Delete `phase-09-backlog-visual-baseline-pixelmatch.md` and `phase-10-backlog-harness-expansion-a11y-code-standards.md`. If pixelmatch is genuinely needed later, write a fresh plan against a real defect, not a speculative tier.

---

## Finding 10: The 13/8/5 math is consistent in plan, but 13 ≠ 13 once Phase 7 decides

- **Severity:** Medium
- **Location:** `plan.md:21-23`, Phase 1 fixture, Phase 7 decision matrix
- **Flaw:** Verification report bucketing (verified by grep against `qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md`):
  - 8 concept-static (ch3-1-3, ch3-2-3, ch3-2-5, ch3-4-1, ch3-6-3, ch3-7-1, ch3-7-2, ch2-7-2) — line 138
  - 5 should-animate-candidate (ch3-1-2, ch3-2-1, ch3-5-1, ch3-5-2, ch2-5-1) — line 139
  - **= 13 RED routes (line 90)**
  - **+ 2 ambiguous** (ch2-5-2, ch2-5-3) flagged separately at line 77 with `uniqueFrames=2` — *neither* counted in the 13 nor classified.

  Plan's Phase 1 fixture commits ch2-5-2/3 implicitly to the *animated* bucket (because they're not in `STATIC_ROUTES_CONCEPT_DIAGRAM`). Phase 7 then proposes to flip them to static-concept. So the 8 grows to 10 if Phase 7 says "intentional-static" — invalidating the "8 concept routes" headline in `plan.md:24`.

  Internal-consistency: the plan's count is right *if* Phase 7 hasn't run yet. After Phase 7 ("intentional-static" outcome, the documented expectation), it's 10 + 5 = 15, not 8 + 5 = 13. Plan headline is stale-on-arrival.

- **Failure scenario:** Sprint 1 ships claiming "8 concept-only routes lose Play button"; user counts 8 routes; later Phase 7 adds 2 more; user asks "wait, 10 now?".
- **Evidence:** Verification report line 77: `ch2-5-2 | 2 | chỉ frame đầu lệch, sau đó đứng (instant-center static — đúng spec)`. Line 138 lists 8 in the concept-static row. Plan line 23: "8 concept-diagram routes". Phase 7 risks growing this.
- **Suggested fix:** Either include ch2-5-2/3 in the static-concept bucket from Phase 1 (10 routes total, drop Phase 7), or document the inclusion as a Phase 7 sub-step that reopens the headline count.

---

## Top 3 recommendations

1. **Collapse Sprint 1 (phases 1-4) into one PR.** Edit ch3-2-1 renderer (≈ 12 lines), flag 8-10 scenes static (≈ 1 line each + 4 lines in `sim-professional-lab.js:1656`), update changelog inline. Skip the per-second canvas hash harness; it's a maintenance cost without a recurring threat.
2. **Delete phases 06, 07, 08, 09, 10.** Phase 06 is invented UX. Phase 07 is a 30-min decision. Phase 08 docs belong with the code PR. Phases 09/10 are explicit backlog cruft.
3. **Before any phase ships, fix the three nonexistent APIs** (`state._v0`, `window.SIM_SCENES`, `[data-sim-play]`). Use `state.v` (already populated by behavior), add `data-sim-play="true"` in the actual `addButton` call, and assert via DOM presence — not via an imaginary scene registry.

---

## Total findings

| Severity | Count |
|---|---|
| Critical | 1 |
| High | 3 |
| Medium | 6 |
| **Total** | **10** |

## Top 3 by severity

1. **F1 (Critical)** — Three referenced APIs don't exist; tests as written cannot work.
2. **F2 (High)** — Sprint 1 four-phase TDD ceremony is over-engineered for the actual fix surface.
3. **F4 (High)** — Phase 06 autoplay preview-pause is an invented feature, not a verification finding.

## Unresolved questions

- Did the content owner specifically request autoplay defaults, or is that planner conjecture?
- Is the `tests/sim-canvas-evolution.spec.js` baseline JSON expected to be re-blessed on every renderer tweak (in which case it's a tripwire, not a regression gate)?
- Should ch3-1-2 (Finding 7) really be "animated", or is it a concept diagram that the planner mis-classified?
