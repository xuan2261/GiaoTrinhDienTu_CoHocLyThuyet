## Code Review Summary

### Scope
- Files: `js/sim3/sims/ch2-5-3-3d.js`, `js/sim2/sims/ch2/ch2-5-3.js`, `index.html`, `tests/fixtures/sim2-ch2.html`, `tests/sim3-pilot-fallback-dispose.spec.js`, `tools/sim3-visual/pilot-capture.spec.js`, README/docs/journal, plan files.
- LOC: tracked diff 117 insertions / 11 deletions; new adapter 79 lines; journal 29 lines.
- Focus: current working-tree changes for Sim3 `ch2-5-3` single-route rollout.
- Scout findings: checked script order, public `SIM_MAP` mount contract, 2D default path, state handoff from Sim2, WebGL/renderer fallback, repeated toggle lifecycle, dispose cleanup, docs/plan claims.

### Overall Assessment
No blocking issues found. Acceptance criteria are met by code and focused tests. Public mount contract remains unchanged: `ch2-5-3` is still registered by Sim2 and returns `{ dispose }`; Sim3 is optional route-local wrapper.

### Critical Issues
None.

### High Priority
None.

### Medium Priority
None.

### Low Priority
- [README.md:93] README still points "Visual artifacts cho batch mới" to the older `plans/260603-1858.../visuals/`, while current capture config and files use `plans/260603-2100.../visuals/`.
  Fix: update this line to the current plan path or phrase it generically as per-plan visual artifacts.

### Acceptance Criteria
- `ch2-5-3` exposes `2D | 3D` toggle and starts in 2D: met. `Sim3Mode.attach()` defaults `mode = '2d'`, creates no 3D host until 3D click.
- 3D mode renders offline with one canvas and no CDN/bundler dependency: met. `index.html` loads vendored `lib/three/three.umd.min.js`; Playwright asserts one `.sim3-canvas`.
- IC drag and `omega` slider update Sim3 debug state deterministically: met. Sim2 computes canonical `instantCenterVelocity()` then forwards `omega`, `ic`, `radius`, `vM`; test covers slider and drag.
- 3D scene teaches `v_M = omega x r_{M/P}` without dense vector clutter: met by visual inspection. Scene has IC post, sample M, radius guide, one `v_M` arrow, one `omega` arrow.
- WebGL/renderer failures fall back to 2D with Vietnamese message: met. Route-specific forced WebGL test covers `ch2-5-3`; shared renderer failure test covers core path.
- Repeated 2D/3D toggles do not duplicate canvas: met.
- Dispose removes Sim3 host/canvas/toggle and leaves no page errors: met.
- Public mount contract unchanged: met.

### Edge Cases Found by Scout
- `render2()` references `sim3` before declaration textually, but execution happens after `const sim3` initialization; no TDZ runtime path found.
- Static route stops Sim3 RAF after setup via `shell.stop()`; `setState()` still renders on state changes. This is acceptable and avoids idle animation work.
- Visual capture writes artifacts, so I did not re-run it during review to respect "Do not modify files"; existing artifact is present and nonblank.

### Positive Observations
- Sim3 adapter does not duplicate physics; it consumes Sim2-derived state.
- Fallback/dispose tests include route-specific `ch2-5-3` coverage and existing shared core failure coverage.

### Recommended Actions
1. Fix README visual artifact path wording before final closeout.
2. Keep current implementation otherwise; no blocking code changes recommended.

### Metrics
- Type Coverage: N/A, plain JS project.
- Test Coverage: focused Sim3 pilot 11/11 passed; Sim2 release gate passed.
- Linting Issues: 0 from `git diff --check`; `node --check` passed for changed JS/spec files.

### Verification
- `npm run test:sim3:pilot`: PASS, 11/11.
- `npm run test:sim:release`: PASS (`sim2:physics`, 104 Playwright mount tests, content, quiz).
- `node --check js/sim3/sims/ch2-5-3-3d.js; node --check js/sim2/sims/ch2/ch2-5-3.js; node --check tests/sim3-pilot-fallback-dispose.spec.js; node --check tools/sim3-visual/pilot-capture.spec.js`: PASS.
- `git diff --check`: PASS, only CRLF conversion warnings.

### Unresolved Questions
None.

**Status:** DONE_WITH_CONCERNS
**Summary:** Review complete. No blocking issues; implementation satisfies the rollout acceptance criteria and verification gates passed.
**Concerns/Blockers:** One low-priority README doc drift on visual artifact path; no blockers.
