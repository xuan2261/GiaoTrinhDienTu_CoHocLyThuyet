# Phase 01 - Baseline Semantic Failure Gates

## Context Links

- [Codebase Scout Report](./reports/codebase-scout-report.md)
- [Renderer Contract Research](./research/renderer-contract-research.md)
- Current files: `js/sim-scene-templates.js`, `js/sim-professional-lab.js`, `tests/simulation-browser.spec.js`, `tools/smoke_simulation_scene_catalog.py`

## Overview

Priority: P0. Status: Complete. Created failing tests that prove the current implementation is still family-level generic despite existing gates passing.

## Key Insights

- Existing `scene-identity` pass is not enough.
- New gate must fail before implementation; otherwise it is not measuring the bug.

## Requirements

- Static gate detects fewer than 58 unique route renderer functions.
- Static gate detects final dispatch by `family`.
- Browser gate can mask route text/formula and still detect structural similarity.
- No runtime behavior changes in this phase.

## Architecture

Add QA-only tools first:

```text
tools/smoke_simulation_renderer_contract.py
tests/simulation-browser.spec.js @renderer-contract
package.json test:sim:renderer-contract
```

## Related Code Files

| Action | File |
|---|---|
| Create | `tools/smoke_simulation_renderer_contract.py` |
| Modify | `tests/simulation-browser.spec.js` |
| Modify | `package.json` |
| Create | `plans/.../reports/phase-01-baseline-renderer-contract-report.md` |

## Implementation Steps

1. Parse `SIM_MAP` routes and scene catalog routes.
2. Add static check for `rendererId`, renderer registry presence, function name, normalized body hash.
3. Add interim current-code mode that reports `family` renderer collapse.
4. Add browser helper that returns `{ routeId, rendererId, maskedCanvasHash, structuralMarks }`.
5. Run gate expecting failure on current code; save report.
6. Add npm script, but do not include in release until Phase 11.

## Todo List

- [x] Create renderer contract smoke tool.
- [x] Add browser masked identity helper.
- [x] Add `test:sim:renderer-contract`.
- [x] Record failing baseline output.

## Success Criteria

- `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` fails current code.
- Failure message names root cause: missing renderer registry / family dispatch / duplicate renderer.
- Existing `npm run test:sim:scene-identity` still passes, proving old gate gap.

## Verify Gate

```powershell
python tools\smoke_simulation_renderer_contract.py --report-current --expect-fail
npm run test:sim:scene-identity
npm run test:sim:unit
```

## Risk Assessment

- Risk: brittle source parsing. Mitigation: parse registry output through Node VM when possible, source regex only for dispatch anti-patterns.

## Security Considerations

No user data, no network, no new storage keys.

## Next Steps

Phase 02 adds the runtime contract that makes the new gate pass structurally.

