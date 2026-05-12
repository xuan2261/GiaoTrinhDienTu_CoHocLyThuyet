# Ch1 QA Final Report

Date: 2026-05-12

## Scope

- Plan: `plans/260512-0544-ch1-decuong-interaction-upgrade/plan.md`
- Active Ch1 routes: 25/25
- Main changes: physical Ch1 handle labels, Ch1 prefix QA gates, pilot reference-only reconcile, Ch1 parallelogram readout consistency, disposal release-gate hardening, docs architecture sync.

## Verification

| Command | Result |
|---|---|
| `npm run test:sim:unit` | PASS |
| `python tools\test_simulation_qa_tools.py` | PASS, 14 tests |
| `python tools\smoke_simulation_routes.py --require-p1` | PASS, P1 covered 58/58 |
| `python tools\smoke_simulation_manifest.py --routes ch1 --require-routes 25 --require-objectives --require-direct` | PASS |
| `python tools\smoke_simulation_scene_catalog.py --strict --routes ch1 --require-routes 25` | PASS |
| `python tools\smoke_simulation_renderer_contract.py --strict --routes ch1 --require-routes 25` | PASS |
| `python tools\smoke_simulation_runtime.py --routes ch1 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup` | PASS |
| `python tools\audit_simulation_quality.py --all --routes ch1 --require-lab-shell ch1 --require-direct-interaction ch1 --max-js-lines 220` | PASS |
| `npx playwright test tests/simulation-interaction-engine.spec.js --grep "parallelogram overlay"` | PASS, 1 test |
| `npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag"` | PASS, 10 tests |
| `npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag\|@keyboard\|@touch\|@reset"` | PASS, 13 tests |
| `npx playwright test tests/mass-conversion-audit.spec.js --grep "ch1"` | PASS, 25 tests |
| `npm run test:sim:quality` | PASS |
| `npm run test:sim:semantic` | PASS |
| `npm run test:sim:browser` | PASS, 150 tests |
| `npm run test:sim:visual-quality` | PASS, 4 tests |
| `python tools\audit.py` | PASS, 102 files, 0 warnings/errors |
| `node tools/audit_v2_disposal.js` | PASS, static server self-start, CDP heap metric, heap delta 1.16 MB in standalone rerun |
| `npm run test:sim:release` | PASS |
| `git diff --check` | PASS; only LF/CRLF warnings from Git |

## Evidence

- Baseline matrix: `reports/ch1-route-baseline-matrix.md`
- Screenshots: `reports/screenshots/ch1-2-3.png`, `ch1-3-1.png`, `ch1-5-3.png`, `ch1-7-2.png`
- Browser regressions added: Ch1 handles must avoid `legacy`, `construction`, `điểm`, and `kéo`; `ch1-2-3` `|R|` readout must match parallelogram overlay after `F2` drag.
- Unit regression added: disposal audit throws on unavailable heap metrics or heap delta over threshold.

## Notes

- First `npm run test:sim:release` failed at stale disposal audit hardcoded to port `8080`; fixed by making the audit start an internal static server, then full release passed.
- Code review found `ch1-2-3` readout/overlay mismatch (`|R|` vs canvas `R`) and disposal audit warning-only leak behavior. Both fixed before final release rerun.
- A targeted `@direct-drag` rerun caught an over-broad `alpha` derived change on `ch2-1-1`; scope narrowed to Ch1 and rerun passed.
- No Ch1-specific blocker remains before Ch2 work.

## Unresolved Questions

Không có.
