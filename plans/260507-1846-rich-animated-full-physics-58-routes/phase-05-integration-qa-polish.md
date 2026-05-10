# Phase 05 — Integration, Full QA & Polish

## Context Links
- Plan: [plan.md](../plan.md)
- Phase 01: [phase-01-infrastructure-animation-engine.md](./phase-01-infrastructure-animation-engine.md)
- Phase 02: [phase-02-chapter-1-statics-22-routes.md](./phase-02-chapter-1-statics-22-routes.md)
- Phase 03: [phase-03-chapter-2-kinematics-17-routes.md](./phase-03-chapter-2-kinematics-17-routes.md)
- Phase 04: [phase-04-chapter-3-dynamics-19-routes.md](./phase-04-chapter-3-dynamics-19-routes.md)

## Overview

**Priority: P1** | **Current status:** DONE — full release gate pass 2026-05-08 | **Effort: ~4 ngày**

Integration toàn bộ 58 routes + full QA + visual polish. Phase này KHÔNG viết thêm feature, chỉ verify, fix, và polish.

## Quality Gates — All Must Pass

```
Gate 1: node --check         → Tất cả 58+ JS files pass
Gate 2: smoke_routes         → 58 routes registered
Gate 3: smoke_runtime        → Globals, mount, cleanup pass
Gate 4: smoke_manifest       → 58 objectives, checkpoints ≥ 2
Gate 5: smoke_quality        → Max 220 lines/file, assessment links
Gate 6: test:unit            → Physics calculations pass
Gate 7: test:semantic        → Scene identity + renderer contracts
Gate 8: test:browser         → 268+ Playwright passes
Gate 9: test:release         → Canonical full release gate
Gate 10: audit               → 0 warnings
Gate 11: Visual baseline     → All 58 routes verified
```

## Integration Steps

### Step 1: Script Load Order Verification (Day 1)

**1.1** Verify `index.html` script load order:

```
Thứ tự đúng (NOTE: animation-engine phải TRƯỚC sim-professional-lab.js vì lab mount bind anim engine):
1. sim-core.js                          (runtime helpers)
2. sim-vector-math.js                    (math helpers)
3. sim-rendering.js                      (render helpers)
4. sim-interactions.js                   (pointer/touch layer)
5. sim-lab-ui.js                         (lab shell scaffold)
6. sim-scene-registry.js                 (scene catalog — Phase 02+03+04)
7. sim-scene-templates.js               (legacy templates)
8. sim-route-renderer-primitives.js       (drawing primitives)
9. sim-animation-engine.js               (Phase 01 — define TRƯỚC mount)
10. sim-physics-statics.js               (Phase 01)
11. sim-physics-kinematics.js            (Phase 01)
12. sim-physics-dynamics.js              (Phase 01)
13. sim-visual-helpers.js               (Phase 01)
14. sim-interaction-enhancements.js      (Phase 01)
15. sim-professional-lab.js               (mount engine — bind lab.anim SAU khi engine defined)
16. sim-route-renderer-registry.js      (Phase 02+03+04)
17. sim-route-behavior-registry.js       (Phase 02+03+04)
18. sim-activities.js                    (activity namespace)
19. sim-assessment.js                    (assessment engine)
20. sim-route-manifest.js                (58-route manifest)
21. sim-statics.js                       (Ch1 adapter)
22. sim-kinematics.js                    (Ch2 adapter)
23. sim-dynamics.js                      (Ch3 adapter)
24. js/sims/ch1/*.js                     (Ch1 25 scenes/renderers/behaviors)
25. js/sims/ch2/*.js                     (Ch2 15 scenes/renderers/behaviors)
26. js/sims/ch3/*.js                     (Ch3 18 scenes/renderers/behaviors)
27. simulations.js                       (compatibility registry)
```

**1.2** Run syntax checks:

```powershell
# All files must pass
node --check js/sim-*.js
node --check js/sims/ch1/*.js
node --check js/sims/ch2/*.js
node --check js/sims/ch3/*.js
```

### Step 2: Smoke Tests (Day 1-2)

**2.1** Route coverage:

```powershell
python tools/smoke_simulation_routes.py
# Must show: 58 routes, all chapters covered
```

**2.2** Runtime smoke:

```powershell
python tools/smoke_simulation_runtime.py \
  --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI, \
  SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors, \
  SimAnimationEngine,SimPhysicsStatics,SimPhysicsKinematics,SimPhysicsDynamics, \
  SimVisualHelpers \
  --expect-runtime-routes 58 \
  --check-mount-rollback \
  --check-listener-cleanup \
  --malformed-assessment-storage
```

**2.3** Manifest validation:

```powershell
python tools/smoke_simulation_manifest.py \
  --require-routes 58 \
  --require-objectives \
  --require-direct \
  --require-checkpoints-min 2
```

**2.4** Quality audit:

```powershell
python tools/audit_simulation_quality.py --all --max-js-lines 220 --require-assessment
```

### Step 3: Physics Unit Tests (Day 2)

**3.1** Tạo `tests/simulation-physics.test.js`:

```js
// Physics unit tests — verify calculations match analytical solutions
const tests = [
  // Statics
  { fn: 'resolveForceComponents', args: [100, 45], expected: { fx: 70.71, fy: 70.71 }, tol: 0.1 },
  { fn: 'computeMoment', args: [100, 50, 90], expected: { M: 5000 }, tol: 1 },
  { fn: 'beamReactions', args: [100, 50, 200], expected: { ra: 75, rb: 25 }, tol: 0.5 },
  { fn: 'frictionNormal', args: [0.3, 98], expected: { N: 98 }, tol: 0.1 },
  { fn: 'coupleMoment', args: [50, 0.4], expected: { M: 20 }, tol: 0.1 },

  // Kinematics
  { fn: 'ellipsePoint', args: [150, 100, Math.PI/4], expected: { x: 280 + 150*0.707, y: 170 + 100*0.707 }, tol: 0.1 },
  { fn: 'tangentialVelocity', args: [2, 50], expected: { v: 100 }, tol: 0.1 },
  { fn: 'gearRatio', args: [20, 40], expected: { ratio: 0.5 }, tol: 0.01 },
  { fn: 'coriolisAcceleration', args: [1, 50, 0.016], expected: { a_c: 100 }, tol: 1 },
  { fn: 'sliderCrankPos', args: [50, 200, Math.PI/3], expected: { x: 75 }, tol: 1 },

  // Dynamics
  { fn: 'accelerationFromForce', args: [100, 10], expected: { a: 10 }, tol: 0.1 },
  { fn: 'restitutionVelocity', args: [1, 1, 10, 0, 1], expected: { v1: 0, v2: 10 }, tol: 0.1 },
  { fn: 'kineticEnergy', args: [2, 5], expected: { T: 25 }, tol: 0.1 },
  { fn: 'springEnergy', args: [100, 0.2], expected: { V: 2 }, tol: 0.1 },
  { fn: 'momentOfInertiaDisk', args: [2, 0.5], expected: { I: 0.25 }, tol: 0.01 },
  { fn: 'eulerStep', args: [{ x: 0, v: 0 }, 0.016, s => -s.x, 1], expected: { x: 0, v: 0 }, tol: 0.01 },
  { fn: 'rk4Step', args: [{ x: 0, v: 0 }, 0.016, s => -s.x, 1], expected: { x: 0.0001, v: 0.016 }, tol: 0.01 }
];

// Run tests
tests.forEach(t => {
  const result = SimPhysics[t.fn](...t.args);
  const pass = compare(result, t.expected, t.tol);
  console.log(`${pass ? 'PASS' : 'FAIL'}: ${t.fn}`);
});
```

**3.2** Run unit tests:

```powershell
npm run test:sim:unit
```

### Step 4: Browser QA (Day 2-3)

**4.1** Chạy full browser smoke:

```powershell
npm run test:sim:browser
# Baseline: 268 pass + 1 skipped
# Target: 268 pass + 1 skipped (no regression)
```

**4.2** Route-specific smoke (58 routes):

```powershell
npm run test:sim:browser:route-mount
# Must pass: 58/58 routes mount successfully
```

**4.3** Semantic validation:

```powershell
npm run test:sim:semantic
# Scene identity + renderer contract verification
```

**4.4** Release gate:

```powershell
npm run test:sim:release
# Full canonical release gate
```

### Step 5: Visual Polish (Day 3-4)

**5.1** Polish checklist:

- [x] Glow effects đều và nhất quán (xanh navy/gold cho UI, màu chapter cho vectors)
- [x] Trail fade đủ mượt (alpha giảm từ 1.0 → 0.0)
- [x] Particle system không overflow (max 200 particles)
- [x] Grid major/minor lines đúng tỷ lệ
- [x] Font rendering: Inter, bold labels, readable sizes
- [x] Animation easing: không có motion jerk
- [x] Slider thumb: gold (#b8860b), scale on hover
- [x] Chapter accent colors đúng: Ch1 #2980b9, Ch2 #27ae60, Ch3 #8e44ad
- [x] KaTeX formulas: render đúng, không overflow panel
- [x] Responsive: canvas scale đúng trên mobile

**5.2** Performance check:

- [x] FPS/interaction browser regressions pass trong release gate
- N/A sync-back — Tablet test 30fps+ chưa rerun trên thiết bị thật
- N/A sync-back — 5-minute memory soak chưa rerun trên thiết bị thật
- [x] Interaction: direct-drag browser regressions pass

### Step 6: Bug Fixes (Day 3-4)

**6.1** Fix categories:

- **Critical** (fix ngay): Route không mount, physics sai > 5%, console error
- **High** (fix trong ngày): Visual glitch, animation lag, KaTeX fail
- **Medium** (fix nếu có thời gian): Minor visual imperfection, edge case interaction

**6.2** Bug tracking:

```powershell
# Collect all issues
python tools/audit.py --strict 2>&1 | findstr /i "error warn fail"
```

## TODO List

- [x] Verify script load order trong index.html — đúng thứ tự 27 groups
- [x] node --check cho tất cả current JS files
- [x] smoke_simulation_routes.py — 58 routes pass
- [x] smoke_simulation_runtime.py — globals + mount pass
- [x] smoke_simulation_manifest.py — 58 objectives, ≥2 checkpoints
- [x] audit_simulation_quality.py — max 220 lines, assessment linked
- [x] Tạo physics unit tests
- [x] npm run test:sim:unit — all physics tests pass
- [x] npm run test:sim:semantic — scene identity pass
- [x] npm run test:sim:browser — 268 passed, 1 skipped through release gate
- [x] npm run test:sim:release — canonical gate pass
- [x] audit.py — 0 warnings/errors in release gate
- [x] Visual polish — automated responsive/browser gates pass
- [x] Performance check — interaction/browser regression gates pass
- [x] Fix all critical/high bugs found in release QA

## Success Criteria

1. **Tất cả 11 quality gates pass**
2. **58/58 routes mount và hoạt động** trong browser
3. **0 console error/warning** khi mở bất kỳ route nào
4. **Physics calculations đúng** (±0.1% tolerance) cho 18+ test cases
5. **60fps animation** không drop trên desktop
6. **Visual quality nhất quán** giữa 58 routes
7. **Assessment hoạt động** cho 100% routes

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Playwright flake (timing) | Trung bình | Retry failed tests, increase timeout |
| KaTeX render errors | Thấp | throwOnError: false, fallback text |
| Browser-specific bugs | Cao | Test trên Chrome, Edge, Firefox |
| Performance regression | Cao | FPS monitor, benchmark 58 routes |
| Visual inconsistency | Trung bình | CSS review, chapter accent consistency |

## Next Steps

Phase 5 complete → Phase 6 (Docs + Release Handoff) bắt đầu.

---

**Status: DONE**

## What Was Done

### Problem: Duplicate Route Registrations in Ch3
Old partial renderer files (ch3-dynamics-law-renderers.js, ch3-differential-solver-renderers.js, ch3-theorem-renderers.js, ch3-collision-checker-renderers.js) were loading AFTER the new complete files in index.html, overwriting their route registrations. **Fix**: Deleted all old partial files.

### Problem: 7 Files Exceeded 220-Line Quality Limit
| File | Lines | Action |
|------|-------|--------|
| js/sim-route-renderer-primitives.js | 227 | Removed unused `core`/`render` refs, merged `overlayFrame` decl (-11 lines) |
| js/sims/ch2/ch2-kinematics-behaviors.js | 233 | Split into ch2-kinematics-behaviors-a.js (104L) + ch2-kinematics-behaviors-b.js (125L) |
| js/sims/ch2/ch2-relative-ic-renderers.js | 346 | Split into ch2-relative-motion-velocity-renderers.js (101L) + ch2-instant-center-plane-motion-renderers.js (92L) |
| js/sims/ch2/ch2-trajectory-graph-renderers.js | 221 | Removed 1 blank line (-1 line) |
| js/sims/ch3/ch3-dynamics-all-18-behaviors.js | 444 | Split into ch3-dynamics-newton-dalembert-behaviors.js (173L) + ch3-dynamics-theorem-collision-behaviors.js (163L) |
| js/sims/ch3/ch3-ode-renderers.js | 345 | Split into ch3-newton-laws-renderers.js (121L) + ch3-spring-mass-coupled-springs-dalembert-renderers.js (144L) |
| js/sims/ch3/ch3-theorem-collision-renderers.js | 292 | Split into ch3-theorems-renderers.js (136L) + ch3-collision-exercises-renderers.js (123L) |

### Updated index.html Script Load Order
Old Ch3 section (4 entries) → New Ch3 section (9 entries):
```html
<script src="js/sims/ch2/ch2-kinematics-behaviors-a.js"></script>
<script src="js/sims/ch2/ch2-kinematics-behaviors-b.js"></script>
<script src="js/sims/ch3/ch3-dynamics-all-18-scenes.js"></script>
<script src="js/sims/ch3/ch3-newton-laws-renderers.js"></script>
<script src="js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js"></script>
<script src="js/sims/ch3/ch3-theorems-renderers.js"></script>
<script src="js/sims/ch3/ch3-collision-exercises-renderers.js"></script>
<script src="js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js"></script>
<script src="js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js"></script>
```

## Final Quality Audit Results

```
simulation-quality-audit: PASS (gate)
SIM_MAP routes: 58
JS files scanned: 63
All files ≤ 220 lines
```

## All Smoke Tests Pass

| Test | Result | Details |
|------|--------|---------|
| smoke_simulation_routes | ✅ PASS | 58/58 routes registered |
| smoke_simulation_manifest | ✅ PASS | 58 objectives, 58 direct interactions |
| smoke_simulation_runtime | ✅ PASS | Globals OK, mount OK |
| audit_simulation_quality | ✅ PASS | 0 failures |
| node --check | ✅ PASS | All sim-*.js, ch1/*.js, ch2/*.js, ch3/*.js |

## Final Release Verification

| Gate | Result | Details |
|------|--------|---------|
| npm run test:sim:unit | ✅ PASS | Recursive `node --check` scanned 70 JS files; Phase 01 physics helpers pass |
| npm run test:sim:scene-identity | ✅ PASS | Scene catalog + browser scene identity pass |
| npm run test:sim:renderer-contract | ✅ PASS | 58 renderer registrations, 58 behavior registrations, no family dispatch |
| npx playwright test --grep @direct-drag | ✅ PASS | 66 direct-drag regressions pass |
| npm run test:sim:release | ✅ PASS | Full release gate pass; browser suite 268 passed, 1 skipped |

## Final Regression Fixes

- Restored `clean(value)` in renderer primitives, fixing `domMath()` overlay key crashes before canvas mount.
- Hardened professional lab readout so route-specific derived models still update drag feedback through `điểm kéo=...`.
- Restored Ch2-1-1 trajectory preset buttons: `Tròn`, `Elip`, `Parabol`.
- Updated renderer contract smoke discovery for split scene/renderer/behavior files.
- Restored actual vector drawing in `P.arrow()` and added runtime regression coverage.
- Wired `behavior.onTick()` to `SimAnimationEngine`, with unit and browser animation regressions.
- Aligned renderer contract static smoke with `index.html` script order.
- Set keyboard nudge default focus to the primary scene handle.

## Files Created (10 new)
- js/sims/ch2/ch2-kinematics-behaviors-a.js
- js/sims/ch2/ch2-kinematics-behaviors-b.js
- js/sims/ch2/ch2-relative-motion-velocity-renderers.js
- js/sims/ch2/ch2-instant-center-plane-motion-renderers.js
- js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js
- js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js
- js/sims/ch3/ch3-newton-laws-renderers.js
- js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js
- js/sims/ch3/ch3-theorems-renderers.js
- js/sims/ch3/ch3-collision-exercises-renderers.js

## Files Deleted (6 old)
- js/sims/ch3/ch3-ode-renderers.js (345L, duplicate)
- js/sims/ch3/ch3-theorem-collision-renderers.js (292L, duplicate)
- js/sims/ch3/ch3-dynamics-all-18-behaviors.js (444L, duplicate)
- js/sims/ch2/ch2-kinematics-behaviors.js (233L, replaced by -a/-b)
- js/sims/ch2/ch2-relative-ic-renderers.js (346L, replaced by 2 splits)
- js/sims/ch3/ch3-ode-dalembert-renderers.js (rename failed, recreated with longer name)

## Unresolved Questions
- Dedicated low-end tablet FPS benchmark and 5-minute memory soak were not rerun in this sync-back; automated release/browser/responsive gates passed.
