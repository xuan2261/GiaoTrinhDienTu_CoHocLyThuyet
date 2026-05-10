# Phase 02 - Registry Deduplication

## Context Links

- [Audit finding 2](../reports/260508-0846-simulation-browser-audit/report.md)
- [Scout report](./reports/scout-report.md)

## Overview

Priority: P1. Status: Complete. Remove duplicate Ch2 scene/renderer registrations and turn overwrite warnings into failing QA.

## Key Insights

- `ch2-particle-rotation-transmission-scenes.js` and `ch2-kinematics-scenes.js` overlap.
- `ch2-particle-renderers.js` and `ch2-trajectory-graph-renderers.js` both register `ch2-1-1..ch2-1-4`.
- Registry uniqueness after overwrite is not enough.

## Requirements

- Each route registers exactly one scene and one renderer at boot.
- No overwrite warnings in browser console.
- Preserve final route identities and renderer contracts.

## Architecture

Canonicalize Ch2 route ownership:

- Keep one scene source per route.
- Keep one renderer source per route.
- Use registry warnings only as dev safety; tests fail if warning appears.

## Related Code Files

Modify:
- `index.html`
- `js/sims/ch2/ch2-particle-rotation-transmission-scenes.js`
- `js/sims/ch2/ch2-kinematics-scenes.js`
- `js/sims/ch2/ch2-particle-renderers.js`
- `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- `js/sim-scene-registry.js`
- `js/sim-route-renderer-registry.js`
- `tools/smoke_simulation_renderer_contract.py`
- `tests/simulation-visual-quality.spec.js`

Delete:
- None by default. Delete only if a duplicate file becomes empty and all script references are updated.

## Implementation Steps

1. List all scene registrations per route from Ch2 modules.
2. Decide canonical file per route family:
   - `ch2-kinematics-scenes.js` owns Ch2 scenes unless a narrower file is required.
   - `ch2-trajectory-graph-renderers.js` owns `ch2-1-1..ch2-1-4`.
3. Remove duplicate rows/registrations, not runtime fallbacks.
4. Update `index.html` script load order only if a file is removed.
5. Add QA assertion: no browser console text matching:
   - `Simulation scene overwritten`
   - `Route renderer overwritten`
   - `Route behavior overwritten`
6. Optionally update static smoke to detect duplicate route ids across registration source files.

## Todo List

- [x] Build duplicate map for scenes/renderers.
- [x] Remove Ch2 duplicate registrations.
- [x] Add console overwrite test.
- [x] Confirm final 58 route count.
- [x] Confirm no route identity regression.

## Verification & Tests

Run:

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
npm run test:sim:renderer-contract
npm run test:sim:scene-identity
npm run test:sim:visual-quality
```

Expected:
- 58 scene routes.
- 58 renderer routes.
- 0 overwrite warnings.
- Scene identity still unique.
- Release gate passed: `npm run test:sim:release`.

## Success Criteria

- Browser boot produces no overwrite warnings.
- Ch2 `ch2-1-1..ch2-1-4` still render canonical rich visual.
- Existing browser suite remains green.

## Risk Assessment

- Risk: removing earlier Ch2 file removes routes beyond `ch2-1-1..ch2-1-4`. Mitigation: route count and scene identity tests after each edit.

## Security Considerations

- No security-sensitive data touched.

## Next Steps

Phase 03 can safely add handle contracts without fighting registration order drift.
