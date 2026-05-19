---
title: "Simulation Correctness And Realism Overhaul"
description: "Fix handle/body decoupling, spring base drift, overlay text suppression, low-fidelity primitives, missing animation across 58 simulation routes. TDD-first, regression-safe, offline-friendly. Includes accessibility (ARIA + keyboard + reduced-motion)."
status: pending
priority: P1
effort: 60h
issue:
branch: master
tags: [bugfix, frontend, simulations, ux, qa, tdd, a11y]
blockedBy: []
blocks: []
created: 2026-05-18
source: "ck:plan --deep --tdd"
---

# Simulation Correctness And Realism Overhaul

## Overview

Plan này khắc phục triệt để 6 nhóm root cause đã xác định trong review ngày 2026-05-18: (RC1) handle kéo tách rời thân vật, (RC2) 25 route ch1 không có animation tự thân, (RC3) primitive vẽ sơ sài (spring zigzag, body phẳng, wheel không shine), (RC4) spring/cable base lệch điểm với mass body, (RC5) overlay text whitelist quá hẹp khiến label rỗng, (RC6) ba lớp palette mâu thuẫn và light theme chưa test.

Áp dụng Option E (hybrid) từ brainstorm: P0 correctness trước (RC1/RC4/RC5), P1 primitive overhaul (RC3), P2 animation density có kiểm soát (RC2/RC6). Mỗi phase tests-first, fail trước khi fix, không phá 58-route registry contract.

**Validation gate decisions (2026-05-18):**
- **ARIA language**: Tiếng Việt (target audience hải quân VN; NVDA/VoiceOver hỗ trợ tiếng Việt qua TTS).
- **prefers-reduced-motion + ch3-3-1 spring**: Skip autoplay AND render visible "Chạy mô phỏng" button cho user manual trigger (autoplay = decoration; spring oscillation = essential learning content).
- **A11y overlay pointer-events**: `pointer-events:none` default, `auto` chỉ khi focus. Capture-phase mousedown listener blurs focused button trước khi canvas drag start. Test `@a11y-pointer-events` covers regressions.
- **Visual baseline refresh**: After each visual-affecting phase enters GREEN, refresh `tests/__snapshots__/sim-visual-quality-baseline.json` for affected routes + commit baseline diff to plan reports/. Reviewer sees small per-phase deltas instead of overwhelming end-of-plan diff.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Simulation Canvas Overlay Cleanup](../260514-1900-simulation-canvas-overlay-cleanup/plan.md) | completed | Giữ contract `.sim-lab-overlay` chỉ chứa label ngắn; mở rộng whitelist KHÔNG đưa formula/value động ngược lại canvas |
| Builds on | [Simulation Readout Dedup Normalization](../260514-0617-simulation-readout-dedup-normalization/plan.md) | completed | Readout policy giữ nguyên; chỉ sửa renderer/handle, không sửa scene readouts |
| Builds on | [Simulation Right Inspector Panel](../260513-2300-simulation-right-inspector-panel/plan.md) | completed | Inspector formula/readout slot là source of truth, canvas chỉ trợ giúp |
| Coordinates with | [Fix Formula Image And Dupes](../260518-2100-fix-formula-image-and-dupes/fix-formula-as-image-duplicate-render-alt-text-hardening-plan.md) | in-progress | Không trùng phạm vi — plan đó xử lý hình ảnh trong text fragments, plan này xử lý canvas/sim |

## Research And Reports

| Report | Purpose |
|---|---|
| [Researcher: Canvas Realism Techniques](./research/researcher-canvas-realism.md) | Rim highlight, OffscreenCanvas patterns, sinusoidal spring, magnitude arrow, trail buffer, PhET/MyPhysicsLab analysis |
| [Researcher: TDD For Canvas Simulations](./research/researcher-tdd-strategies-canvas-simulation-structural-marks-pixel-regression-handle-invariants.md) | Structural marks subset assertions, canvasStats hash, handle-anchor invariants, deterministic onTick tests |
| [Review Report: Sim Quality Audit](./reports/review-sim-quality-audit.md) | 6 root causes with line:file evidence, screenshots, brainstorm trade-offs |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline TDD Harness And Failing Invariants](./phase-01-baseline-tdd-harness.md) | Complete | 12 Node-level RED tests created on master HEAD; 26 Playwright invariants parse and listed; baseline snapshot stub committed |
| 02 | [RC1 Handle Body Anchor Coupling](./phase-02-rc1-handle-body-anchor-coupling.md) | Partial | Engine fail-loud `resolveHandles` shipped; legacy fallback removed; ch1-1-3/ch1-2-1/ch1-1-8 explicit branches added. Per-renderer `getAnchor` migration across 58 routes deferred. |
| 03 | [RC4 Spring And Cable Base Coupling](./phase-03-rc4-spring-cable-base-coupling.md) | Partial | `P.spring` accepts `{ anchor, wallAnchor, gap }` + emits `springAnchor:` mark. Per-route renderer migration to anchor mode deferred. |
| 04 | [RC5 Overlay Text Whitelist Expansion](./phase-04-rc5-overlay-text-whitelist.md) | Complete | Whitelist accepts physics labels + Vietnamese short terms; Node test confirms accept/reject matrix. |
| 05 | [RC3a Primitive Spring Helix And Dual Pass](./phase-05-rc3a-primitive-spring-helix.md) | Complete | `P.spring` is now sinusoidal helix with dual-pass shadow; emits `spring:...:coilCount` for visual variants ≥80 verification. |
| 06 | [RC3b Body Rim AO And Length-only Arrow](./phase-06-rc3b-body-rim-ao-magnitude-arrow.md) | Complete | `realisticBody` emits `ao:` + `rim:`; `magnitudeArrow` length-only with fixed lineWidth and no shadowBlur. |
| 07 | [RC3c Wheel Rim Shine And Pattern Cache](./phase-07-rc3c-wheel-rim-shine-pattern-cache.md) | Complete | `realisticWheel` emits `shine:`; `getPattern`/`clearPatternCache`/`patternCacheStats` deterministic cache + theme-toggle invalidation; `wood` material added. |
| 08 | [RC2 RC6 Animation Density And Theme Parity](./phase-08-rc2-rc6-animation-density-theme-parity.md) | Pending | Preset gallery, trail buffer, impulse flash, autoplay, light theme parity not started. |
| 08b | [Accessibility ARIA Keyboard And Reduced Motion](./phase-08b-accessibility-aria-keyboard.md) | Complete | Engine: `setupA11yOverlay` (Vietnamese ARIA + keyboard nudge/shift/escape + debounced aria-live with coordinates) and `attachReducedMotion` (`lab.prefersReducedMotion` flag, leak-safe teardown) shipped. Readout smoothing snaps to target under reduced-motion. Downstream consumers in Phase 08 (preset tween, trail fade, autoplay, impulse flash) gated by Phase 08 itself — not yet built. |
| 09 | [Cross Route Regression And Release Gate](./phase-09-cross-route-regression-release-gate.md) | Complete | `npm run test:sim:release` GREEN end-to-end (188 browser + 4 interaction-engine + 8 unit suites + audit/quality/disposal/strict-equations/strict-images). 4 regressions surfaced (overlay regex out-of-sync with widened production whitelist, ch3-3-1/3-2 m-slider had no canvas effect, a11y overlay overflow at 390px) → fixed same session. |
| 10 | [Docs Changelog And Handoff](./phase-10-docs-changelog-handoff.md) | Complete | `docs/project-changelog.md` updated; journal at `docs/journals/260518-2330-cook-tdd-sim-correctness-realism-overhaul.md`. |

## Dependencies

- Runtime: static `HTML/CSS/JS`, must keep `file://` support; no runtime bundler.
- Engine: `js/sim-professional-lab.js`, `js/sim-rendering.js`, `js/sim-route-renderer-primitives.js`, `js/sim-visual-helpers.js`, `js/sim-animation-engine.js`, `js/sim-interactions.js`.
- Route renderers: `js/sims/ch1/*-renderers.js`, `js/sims/ch2/*-renderers.js`, `js/sims/ch3/*-renderers.js`.
- Behaviors: `js/sims/ch2/ch2-kinematics-behaviors-{a,b}.js`, `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`, `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`.
- Tests: `tests/simulation-test-utils.js`, `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js`, new `tests/sim-correctness-realism.test.js`, new `tests/sim-handle-anchor-invariants.spec.js`.
- Tools: `tools/audit_simulation_quality.py`, `tools/smoke_simulation_renderer_contract.py`, `tools/smoke_simulation_runtime.py`.
- Docs: `docs/system-architecture.md`, `docs/code-standards.md`, `docs/design-guidelines.md`, `docs/project-changelog.md`.

## Success Criteria

- [ ] All 58 routes maintain `|handle.get() - getAnchor()| ≤ 8px` invariant on slider/drag/preset state mutations
- [ ] No occurrence of `legacy-primary` handle id in active routes (`data-handle-ids`); empty-handle route throws fail-loud
- [ ] Spring/cable rendering shares base point with body anchor; no visual gap > 2px on any spring route
- [ ] `domLabelSuppressed` mark count drops from current >40 to 0 for declared route labels (manual labels still suppressed)
- [ ] Whitelist accepts Vietnamese short physics terms (`tĩnh`, `cân`, `phương`, `vận`, `lực`)
- [ ] Sinusoidal spring helix replaces zigzag (FFT-confirmed); visual variants ≥ 80 (currently ~30)
- [ ] Rim highlight + AO present on every `realisticBody`; arrow scales **length only** by magnitude (lineWidth fixed 2.5px, no shadowBlur)
- [ ] Wheel routes (ch2-2-2, ch2-2-3, ch2-3-2, ch2-3-3) show specular arc highlight
- [ ] Pattern cache returns same `CanvasPattern` instance for identical (material, theme) keys; cleared on theme toggle
- [ ] At least 3 ch1 routes (ch1-2-3, ch1-1-3, ch1-2-1) render **preset gallery** (no auto-cycle); idle 5s leaves state unchanged
- [ ] ch3-6-2 emits **2 impulse-flash arrows** (Newton 3 invariant — opposite, equal length) on collision; **zero spark/particle marks**
- [ ] ch2-1-1 shows 40-sample trail; ch3-3-1 oscillates by default after mount
- [ ] Light theme reaches visual parity with dark theme on 10 representative routes
- [ ] Zero hardcoded hex `#[0-9a-f]{6}` across all simulation source (renderers, behaviors, primitives, helpers)
- [ ] **A11y**: Every handle has ARIA button overlay; Tab + arrow keys drag; Enter/Space activate preset; `prefers-reduced-motion` disables tween/autoplay/fade
- [ ] All existing QA gates remain GREEN: `npm run test:sim:release`, `python tools/smoke_simulation_runtime.py`, `npm run test:sim:visual-quality`
- [ ] New tests in `tests/sim-correctness-realism.test.js`, `tests/sim-handle-anchor-invariants.spec.js`, and `tests/sim-accessibility.spec.js` GREEN
- [ ] Docs synchronized; journal entry written; WCAG 2.1 AA compliance noted

## Baseline Refresh Convention

After EACH visual-affecting phase (02, 03, 05, 06, 07, 08, 08b) enters GREEN:

1. Run `npm run test:sim:visual-quality -- --update-snapshots` for routes touched by that phase only.
2. Diff old vs new `tests/__snapshots__/sim-visual-quality-baseline.json` for those routes.
3. Save diff summary to `plans/260518-2300-sim-correctness-realism-overhaul/reports/baseline-delta-phase-NN.md`:
   - Route list affected.
   - Mark count delta per route.
   - Variants count delta per route.
   - Reviewer-friendly 1-line rationale ("RC1 anchor change → handle marker positions shift up to 8px").
4. Commit baseline JSON + delta report in the same commit as phase implementation.
5. Phase 09 final pass = sanity check across full 58 routes (no further baseline mutations expected).

This avoids end-of-plan reviewer fatigue when 58 routes drift simultaneously.
