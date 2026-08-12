---
title: "Fix all Sim2 and Sim3 simulation defects"
description: "Deep TDD remediation of physics, timing, geometry, lifecycle, accessibility, visual QA, and release gates for all 25 Sim2 and 10 Sim3 routes."
status: pending
priority: P1
branch: "master"
tags: [bugfix, refactor, frontend, critical, tech-debt, sim2, sim3, tdd]
blockedBy: []
blocks: []
supersedes:
  - 260531-1657-sim2-pro-visual-ux-theory-upgrade
  - 260606-sim3-third-visual-polish-tdd
  - 260606-sim3-third-visual-polish-deep-tdd
created: "2026-07-13T08:25:01.071Z"
createdBy: "ck:plan"
source: skill
---

# Fix all Sim2 and Sim3 simulation defects

## Overview

Sửa toàn bộ lỗi đã xác minh trong review ngày 2026-07-13 trên **25 Sim2 + 10 Sim3**. Phạm vi giữ nguyên theo lựa chọn `HOLD SCOPE`: correctness vật lý, animation timing, collision/state, clipping/domain, responsive, keyboard/accessibility, hệ tọa độ 3D, hình học adapter, WebGL lifecycle/fallback, route-level QA, visual artifacts và release gates. Không thêm mô phỏng mới, dependency runtime mới, bundler hay thay đổi nội dung DOCX.

## Verified Baseline

- `npm run test:sim:release`: pass, gồm 25 route association, 110 mount tests, app/content/quiz.
- `npm run test:sim3:pilot`: 19/19 pass.
- `npm run test:sim:visual:baseline`: fail 3/5 tại `ch2-3-2`, `ch2-4-4`, `ch3-6-2`.
- Confirmed calculations:
  - `sliderCrankRodAngle(1,2,π/2)` trả `35.264°`, đúng phải `30°`.
  - `potentialEnergy(2,0,3)` trả `58.86 J`, đúng phải `0`.
  - Collision mặc định cho `v1' < 0`, `v2' > 0`, nhưng exit predicate đang kiểm tra hướng ngược.
- Existing tests can pass despite route wiring/sign/geometry defects; phase 1 freezes executable contracts before fixes.

## Scope

### In scope

- Shared Sim2 core/physics and every affected 2D route.
- Shared Sim3 core and all 10 3D adapters.
- Production `index.html`/loader integration, fixtures, test helpers, probes, capture/contact-sheet/baseline tooling.
- README/docs refresh only after runtime and tests are final.

### Out of scope

- New simulation routes or new teaching content.
- Changes to generated `chapters/`, `images/`, `js/pages.js`, canonical DOCX, or dated `release/`.
- New runtime dependencies, framework migration, WebGPU, physics-engine replacement.
- Pixel-baseline updates before human triage of actual/expected/diff.

## Locked Architecture Decisions

1. Preserve public mount contract: `SIM_MAP[id](container) -> { dispose }`.
2. Sim2 remains canonical/default; Sim3 remains optional with safe 2D fallback.
3. Sim2 playback uses one fixed-step clock driven by RAF timestamps; manual step and playback share the same update path.
4. Sim2 resize preserves route state. Use stable logical coordinates plus CSS scaling, DPR-aware canvas, pointer remapping, and disposable resize observation.
5. Sim3 uses one right-handed world convention:
   - `+X`: right, `+Y`: up, `+Z`: toward viewer.
   - Horizontal source plane: `(x,y) -> (x,elevation,-y)`, positive angular axis `+Y`.
   - Vertical source plane: `(x,y) -> (x,y,depth)`, positive angular axis `+Z`.
6. Sim3 rendering is demand-driven by default. Continuous RAF must be explicit.
7. Tests compute independent numeric/geometric oracles; debug strings and route-name grep cannot prove correctness.
8. Capture output is run-specific and strict. Missing controls, routes, shots, files, errors, duplicates, stale artifacts, or warnings fail the gate.

## Cross-Plan Dependencies

| Relationship | Plan | Resolution |
|---|---|---|
| Supersedes | `260531-1657-sim2-pro-visual-ux-theory-upgrade` | Old pending metadata contradicted completed phases; cancel and point here |
| Supersedes | `260606-sim3-third-visual-polish-tdd` | Narrow visual-only scope replaced by full correctness plan |
| Supersedes | `260606-sim3-third-visual-polish-deep-tdd` | Narrow three-route scope replaced by all ten adapters |

## Execution Dependency Graph

```text
P1 route/contracts
 ├─> P2 Sim2 helpers ─> P3 Sim2 clock ─> P4 Sim2 responsive/a11y ─> P5 Sim2 routes
 └─> P6 Sim3 coordinates ─> P7 Sim3 core ─> P8 Sim3 statics/kinematics
                                             └─> P9 transmission/relative
                                             └─> P10 dynamics/collision
P5 + P8 + P9 + P10 ─> P11 visual/release gates ─> P12 docs/final verification
```

Every implementation phase follows `RED -> confirm intended failure -> GREEN -> refactor -> scoped gate -> regression gate`. Do not update expected screenshots during RED/GREEN work.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Freeze Simulation Contracts](./phase-01-freeze-simulation-contracts.md) | Pending |
| 2 | [Correct Sim2 Physics Helpers](./phase-02-correct-sim2-physics-helpers.md) | Pending |
| 3 | [Build Deterministic Sim2 Clock](./phase-03-build-deterministic-sim2-clock.md) | Pending |
| 4 | [Make Sim2 Responsive and Accessible](./phase-04-make-sim2-responsive-and-accessible.md) | Pending |
| 5 | [Repair Sim2 Route Behavior](./phase-05-repair-sim2-route-behavior.md) | Pending |
| 6 | [Establish Sim3 Coordinate Foundation](./phase-06-establish-sim3-coordinate-foundation.md) | Pending |
| 7 | [Harden Sim3 Core Runtime](./phase-07-harden-sim3-core-runtime.md) | Pending |
| 8 | [Correct Sim3 Statics and Kinematics](./phase-08-correct-sim3-statics-and-kinematics.md) | Pending |
| 9 | [Correct Sim3 Transmission and Relative Motion](./phase-09-correct-sim3-transmission-and-relative-motion.md) | Pending |
| 10 | [Correct Sim3 Dynamics and Collision](./phase-10-correct-sim3-dynamics-and-collision.md) | Pending |
| 11 | [Strengthen Visual and Release Gates](./phase-11-strengthen-visual-and-release-gates.md) | Pending |
| 12 | [Complete Documentation and Final Verification](./phase-12-complete-documentation-and-final-verification.md) | Pending |

## Dependencies

- Runtime: vendored Three.js, existing plain HTML/CSS/UMD modules.
- Dev-only: Node.js, npm, Playwright/Chromium already in `package-lock.json`.
- No lint/typecheck/build scripts exist; use explicit Node syntax/tests and Playwright gates.

## Global Acceptance Criteria

- [ ] All 25 Sim2 route contracts execute through mounted factories with independent physics oracles.
- [ ] All 10 Sim3 adapters satisfy independent coordinate, geometry, state, fallback, and disposal contracts.
- [ ] Playback is refresh-rate independent at 30/60/120/144 Hz timestamp sequences; pause/resume does not jump.
- [ ] Responsive matrices pass at 360/520/900/1024 px and DPR 1/2 with no horizontal overflow or transform drift.
- [ ] Every interactive handle is keyboard-operable, named, focus-visible, clamped, and disposed cleanly.
- [ ] Zero owned RAF callbacks and zero live WebGL resources remain after dispose/repeated navigation/toggle.
- [ ] Production `index.html` exercises 25 Sim2 and 10 Sim3 paths, not fixture-only mounts.
- [ ] All fallback reasons preserve usable 2D and announce status accessibly.
- [ ] Strict captures contain exactly the expected route/shot sets; baseline diffs are human-triaged.
- [ ] `test:sim:release` and `test:sim:release:full` pass three consecutive retry-free runs.
- [ ] No generated content, canonical DOCX, release package, or unrelated user changes are modified.

## Risk Policy

- Physics/sign/geometry changes are correctness fixes, not cosmetic snapshot updates.
- Migrate shared contracts before route batches; run the full prior gate after every shared-core phase.
- Preserve old debug metric keys where compatibility tests use them, but never use self-reported metrics as the sole oracle.
- Negative/singular states not reachable from current UI are still tested at pure adapter/helper boundaries.
- If a visual diff cannot be explained by a reviewed contract change, fix it rather than increasing thresholds.

## Unresolved Questions

None. Scope and supersession decisions were explicitly confirmed by the user.
