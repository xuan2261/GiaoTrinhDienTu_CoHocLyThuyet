# Phase 11 - Full Semantic Browser QA And Release Gates

## Context Links

- `package.json`
- `tests/simulation-browser.spec.js`
- `tools/test_simulation_qa_tools.py`
- `tools/audit_simulation_quality.py`

## Overview

Priority: P0. Status: Complete. Make strict renderer uniqueness part of the canonical QA/release pipeline.

## Requirements

- `npm run test:sim:release` explicitly runs strict renderer contract.
- Browser QA catches metadata-only uniqueness.
- Full suite still works under `file://` and static server.

## Architecture

Add scripts:

```json
"test:sim:renderer-contract": "python tools/smoke_simulation_renderer_contract.py --strict --require-routes 58 && playwright test tests/simulation-browser.spec.js --grep @renderer-contract",
"test:sim:semantic": "npm run test:sim:scene-identity && npm run test:sim:renderer-contract"
```

Then include `npm run test:sim:semantic` in release.

## Related Code Files

| Action | File |
|---|---|
| Modify | `package.json` |
| Modify | `tests/simulation-browser.spec.js` |
| Modify | `tools/test_simulation_qa_tools.py` |
| Modify | `tools/audit_simulation_quality.py` |
| Modify | `README.md` QA section if needed |

## Implementation Steps

1. Add npm scripts.
2. Add Python tests for renderer contract tool.
3. Add browser tests for all routes with masked structural identity.
4. Add representative concept interaction tests.
5. Run full release gate.
6. Save final QA report.

## Todo List

- [x] Wire npm scripts.
- [x] Add tool regression tests.
- [x] Add all-route browser renderer contract test.
- [x] Run release gate.
- [x] Save `reports/final-qa-report.md`.

## Success Criteria

- Static strict renderer contract: PASS 58/58.
- Browser renderer contract: PASS 58/58.
- `npm run test:sim:release`: PASS.
- No hidden external requests under `file://`.

## Verify Gate

```powershell
python -m compileall -q tools
python tools\test_simulation_qa_tools.py
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:browser
npm run test:sim:release
```

## Risk Assessment

- Risk: full browser suite time increases. Mitigation: keep `test:sim:renderer-contract` focused; release can be slower than baseline.

## Security Considerations

Browser tests keep external request block for `file://` routes.

## Next Steps

Docs and handoff.


