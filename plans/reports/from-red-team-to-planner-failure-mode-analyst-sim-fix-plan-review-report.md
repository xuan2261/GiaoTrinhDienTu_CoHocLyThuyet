# Red-Team Plan Review — Failure-Mode Analyst

Plan: `plans/260530-1811-simulation-physics-theory-fidelity-fixes/` (plan.md + phase 01–10)
Persona: adversarial failure-mode analyst. Read-only. Verdict: **DONE_WITH_CONCERNS** — plan is fixable but has 4 execution-blocking gaps.

Severity legend: P0 blocks plan / P1 high (mid-stream break) / P2 fix-before-cook.

---

## F1 (P1) — 220-line cap busts Phase 02 + Phase 06; no concrete split target

Release gate runs `test:sim:quality` = `audit_simulation_quality.py --all --max-js-lines 220` (package.json:9,33). Exempt list (`tools/audit_simulation_quality.py:21-46`) covers `sim-professional-lab.js`, `sim-physics-*`, `sim-route-renderer-primitives.js`, `ch2-trajectory-graph-renderers.js` — but NOT the per-route behavior files the plan edits.

Current counts (verified `wc -l`):
- `js/sims/ch2/ch2-kinematics-behaviors-a.js` = **200** (Phase 06 edits) — 20 lines headroom.
- `js/sims/ch2/ch2-kinematics-behaviors-b.js` = **176** (Phase 03 adds full IC-geometry solve + degenerate guards; Phase 06 too).
- `js/sims/ch1/ch1-support-renderers.js` = **167** (Phase 08).
- `js/sims/ch1/ch1-support-spatial-behaviors.js` = **166** (Phase 02 — biggest rewrite: controllable force-list + `checkEquilibrium()` for ch1-4-4 AND `reduceToResultant()` for ch1-4-1 in the SAME file, effort 1d).

ch1-support-spatial-behaviors.js at 166 + two physics rewrites almost certainly exceeds 220 → release gate RED. Phase 02/06 mitigation ("tách helper nếu cần") names no split file and no registry-update step. Splitting a behavior file requires re-registering in `sim-route-behavior-registry.js`.

**Plan change:** name the concrete spillover targets up front (e.g. a `ch1-spatial-equilibrium-helpers.js` + registry wiring) and add a per-phase success-criterion "`test:sim:quality` ≤220 still PASS for edited files". Do this BEFORE cook, not reactively.

---

## F2 (P1) — Phase 03 "IC computed each tick" collides with locked `static:true` + evolution baseline

ch2-5-2/5-3 are `static:true` (`ch2-kinematics-scenes.js:53`) and that flag is LOCKED by a GREEN unit test: `tests/phase-09-static-scene-flag.test.js:78-108` asserts `scene.static === true` for both, and ch2-5-3 absent from `appendTime`. Evolution baseline (`per-route-animation-sweep-baseline.json:378-399`) classifies both as `static-concept`, window `[1,2]`, `sampleMode: static-quick`. `check-canvas-evolution-baseline.js` (in release gate via `test:sim:browser`, package.json:15) hard-fails if a route leaves its frame-count window or flips sampleMode — and the current baseline carries NO `knownDefect` cushion (checked JSON).

Phase 03 says "tính IC mỗi tick". Static routes don't loop ticks. If the implementer reintroduces animation/ticks to recompute IC, it flips bucket `[1,2]`→animated → `check-canvas-evolution-baseline.js` RED AND `phase-09-static-scene-flag.test.js` RED. Note: the no-play spec (`phase-09-static-routes-no-play-button.spec.js:19`) is ch3-only, so it does NOT catch this — false sense of safety in the prompt premise.

**Plan change:** Phase 03 success criteria must state: compute IC inside `derived()` (snapshot, runs once on render), keep `static:true`, and add gate "phase-09-static-scene-flag.test.js + check-canvas-evolution-baseline.js stay GREEN". Forbid adding `tickWithoutButton`/animation to ch2-5-2.

---

## F3 (P1) — Phase 01 unit-label regex false-positives; physics-source guard fragile; Phase 07 invalidates Phase 01 gates

Phase 01 step 3 proposes regex `m(?!²)` to flag area-labeled-as-m. `m(?!²)` matches the 'm' in **every** `m/s` and `m/s²` readout ('m' followed by '/', not '²') → flags correct velocity/accel routes as unit errors. RED gate fires on healthy routes → cook agent chases phantom failures. (Readout units confirmed everywhere, e.g. `ch2-kinematics-scenes.js:69-86,105`.)

Physics-source guard (step 2) compares shared-physics raw floats to DOM readout text. DOM is FORMATTED: `toFixed(digits)`, `displayValue` maps `'hold'→'bám'`, unit scaling (`sim-professional-lab.js:214-232`). Raw-vs-formatted compare is brittle.

Ordering hazard: Phase 07 introduces `pxPerMeter` rescaling of coordinate/velocity readouts. Any Phase 01 assertion pinned to pre-scale pixel values goes RED after Phase 07 — a TDD self-inflicted regression. Plan never says Phase 01 gates get re-tuned post-Phase-07.

**Plan change:** (a) anchor regex to value context, e.g. area keys only, not bare `m(?!²)`; (b) read the unformatted state/derived value (or parse with tolerance + unit-aware), not the formatted card text; (c) add explicit note in Phase 07 + Phase 01: "after SI rescale, update the physics-source guard expected values; re-run Phase 01 gates."

---

## F4 (P1) — No baseline-refresh step anywhere; release gate can RED with no documented remediation

Grep of all phase files for `baseline|evolution|pixelmatch|visual` → only generic `test:sim:release` / `visual-quality` mentions, ZERO baseline-update commands.

Two baselines exist:
- canvas-evolution frame-count baseline — **IN release gate** (`test:sim:browser` → `check-canvas-evolution-baseline.js`). Frame-COUNT based, so survives pure pixel tweaks, BUT fails on bucket/evolution-behavior changes (Phase 03 IC, Phase 05 ch3-6-2 conservation fix, Phase 08 panel removal). Refresh: `npm run test:sim:browser:update-evolution-baseline`.
- pixelmatch / visual-evolution drift baseline (`sim-canvas-pixelmatch.spec.js:70-76`, `baselineDriftPct` default 0.08). **NOT in release gate**, but in README QA (`README.md:76`) via `test:sim:visual-quality:full`. ANY renderer edit in Phases 02–09 drifts >8% at t3 → RED. Refresh: `npm run test:sim:visual-quality:update-evolution-baseline`.

So: a "production-ready" QA run (`test:sim:visual-quality:full`) fails on every touched route, and the plan's own evolution gate can RED mid-stream with no instruction telling cook agent it's an intentional, human-reviewed refresh vs a real regression.

**Plan change:** add to Phase 10 (and note in 02–09): after physics/renderer edits land and are visually reviewed, regenerate BOTH baselines —
`npm run test:sim:browser:update-evolution-baseline` and
`npm run test:sim:visual-quality:update-evolution-baseline` — then re-run gates. State explicitly this is human-reviewed drift, not auto-accept (`SIM_ACCEPT_VISUAL_BASELINE_DRIFT` is the escape hatch, do NOT bake into CI).

---

## F5 (P2) — Phase 06 shared-file risk framing is INVERTED

`derived()` in `sim-professional-lab.js:170-190` returns ONE shared object for all 52 routes; `ae` is unconditionally computed at **line 184** (`Math.hypot(pointX-280, pointY-180)*ω²/10`). But `ae` is DISPLAYED only by ch2-4-4 (`ch2-kinematics-scenes.js:25` read2=`a_e`; `zz-simulation-contract-scenes.js:46`). `assessmentState` (line 193-211) does not propagate `ae`.

Therefore editing line 184 directly is **low-risk** — only ch2-4-4 consumes the value. Phase 06's stated mitigation ("ngắt leak tại điểm đọc readout của ch2-4-4 thay vì sửa hàm chung") is backwards: there is no per-route read point (readout system reads `d.ae` generically), so avoiding the shared edit forces adding route-conditional branching INTO the shared `derived()` — more risk, not less, and it grows a file already at 1671 lines (exempt from cap, but harder to reason about).

**Plan change:** flip the guidance — fix `ae` at `sim-professional-lab.js:184` directly (or override in ch2-4-4's behavior `derived`), since `ae` is consumed by exactly one route. Then run `test:sim:browser` to confirm no other route regressed. Drop the "avoid shared fn" warning.

---

## Verified-OK (no change needed)

- **Readout DOM selectors ARE uniform** (`.sim-readout-card`/`.sim-readout-value`/`.sim-title`/`.sim-container.sim-lab`) across all mountable routes — `simulation-visual-quality.spec.js:36-41,108` uses them globally. Phase 01's selector worry is low-risk; the uniform sim-lab shell covers it. (Formatting compare is the real issue — see F3.)
- `release` gate does NOT include `test:sim:visual-quality:full` (pixelmatch), so literal Phase-10 criterion can pass without pixel-baseline refresh — but that just hides F4, doesn't remove it.

---

## Unresolved questions

1. Is `test:sim:visual-quality:full` (pixelmatch) part of the team's CI / merge gate, or README-only? If CI, F4 escalates to P0 (every renderer phase breaks CI until baselines refreshed).
2. Phase 02: preferred spillover file name + behavior-registry wiring for ch1-support split — needs planner decision before cook (F1).
3. Does Phase 03 intend ch2-5-2 IC to update on user DRAG of mechanism points? If yes, confirm drag→derived re-render works without engine ticks (static path), else F2 forces an animation reintroduction.

Status: DONE_WITH_CONCERNS
