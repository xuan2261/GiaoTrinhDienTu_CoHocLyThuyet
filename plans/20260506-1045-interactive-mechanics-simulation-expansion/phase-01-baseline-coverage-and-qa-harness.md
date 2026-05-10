# Phase 01 Baseline Coverage And QA Harness

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Baseline Coverage And QA Harness Report](./reports/baseline-coverage-and-qa-harness-report.md)
- [Coverage Matrix](./research/simulation-coverage-matrix.md)
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\README.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md`

## Overview

Priority: P1. Status: Complete. Establish baseline before changing simulation runtime. No feature code in this phase except optional test helper scripts if needed.

## Key Insights

- Existing app already has 18 sims.
- `js/simulations.js` is large and must not absorb all future work.
- No git repo detected; create explicit backup or snapshot before edits if implementation starts.

## Requirements

| Type | Requirement |
|---|---|
| Functional | Inventory current sim routes and expected visible behavior |
| Functional | Capture baseline validation commands |
| Non-functional | Do not alter generated `chapters/` or `js/pages.js` |
| Non-functional | Keep all checks runnable offline |

## Architecture

Baseline only. Verify current loader path:

`loadPage(id)` -> inject fragment -> `renderMath()` -> `initSimulations()` -> page nav.

## Related Code Files

| Action | File |
|---|---|
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\loader.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css` |
| Optional create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_routes.py` |

## Implementation Steps

1. Run baseline syntax and audit commands.
2. Extract `window.SIM_MAP` route list and compare with coverage matrix.
3. Open representative routes: `ch1-1-4`, `ch1-5-3`, `ch2-4-4`, `ch3-3-1`, `ch3-6-2`.
4. Record baseline failures before implementation.
5. Decide whether to add a lightweight smoke helper under `tools/`; only if manual QA becomes repetitive.

## Todo List

- [x] Run `node --check` for existing JS runtime.
- [x] Run `python -m compileall -q tools`.
- [x] Run `python tools\audit.py`.
- [x] Record current 18 sim routes and current gaps.
- [x] Document baseline issues in plan `reports/`.

## Tests And Verification

```powershell
node --check js\app.js
node --check js\loader.js
node --check js\quiz.js
node --check js\progress.js
node --check js\glossary.js
node --check js\notes.js
node --check js\simulations.js
python -m compileall -q tools
python tools\audit.py
python tools\smoke_simulation_routes.py
```

Manual verify:

- `index.html` opens.
- Existing sim pages show nonblank canvas.
- Console has no new errors.

## Success Criteria

- Baseline validation state known.
- Existing sim routes inventoried.
- No implementation starts with unknown runtime state.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Baseline already has defects | Document and separate from new regressions |
| Manual smoke too slow | Add focused helper script only |

## Security Considerations

No network, no secrets, no user data changes.

## Next Steps

Proceed to Phase 2 after baseline is clear.
