---
phase: 6
title: "Establish Sim3 Coordinate Foundation"
status: completed
priority: P1
dependencies: [1]
effort: "1-2 days"
---

# Phase 6: Establish Sim3 Coordinate Foundation

## Overview

Define and test one explicit right-handed coordinate convention for every Sim3 adapter. Add pure mapping helpers and shared signed-vector rendering primitives before migrating route geometry.

## Requirements

- World convention: `+X` right, `+Y` up, `+Z` toward viewer.
- Horizontal source plane maps `(x,y)` to `(x,elevation,-y)`, axial scalar to `+Y`.
- Vertical source plane maps `(x,y)` to `(x,y,depth)`, axial scalar to `+Z`.
- Zero vectors remain zero/hidden; never invent a positive direction.
- Adapters must select a plane explicitly.

## Architecture

`Sim3Coordinates` is pure UMD/CommonJS and does not depend on DOM or Three.js:

```js
point2D(point, { plane, elevation, depth })
vector2D(vector, { plane })
axisVector(scalar, plane)
cross(a, b)
dot(a, b)
CONVENTION
```

`Sim3Primitives.updateArrow()` receives a signed world vector, separates physical direction from display-length clamp, and handles true zero deterministically.

## File Inventory

| Action | File | Change | Test impact |
|---|---|---|---|
| Create | `js/sim3/core/coordinate-system.js` | Pure convention/mapping API | Node contract |
| Create | `tests/sim3-coordinate-system.test.js` | Basis/cross/sign/zero tests | New fast gate |
| Modify | `js/sim3/core/three-primitives.js` | Shared signed-vector updater | Later adapter phases |
| Modify | `index.html` | Load coordinates before adapters | Offline production |
| Modify | Three chapter fixtures | Same script ordering | Browser tests |
| Modify | `package.json` | Add coordinate test to Sim3 gate | Release wiring |

## Function and Interface Checklist

- [x] `X × Y = Z`, `Y × Z = X`, `Z × X = Y`.
- [x] Horizontal mapped `+x × +source-y = +Y`.
- [x] Vertical mapped `+x × +source-y = +Z`.
- [x] Point and vector mappings do not mutate inputs.
- [x] Plane argument is required and invalid planes throw clear errors.
- [x] `axisVector(-ω)` preserves negative direction.
- [x] Arrow updater hides/configures zero without arbitrary orientation.
- [x] Display clamp changes only mesh scale, never physical/debug magnitude.

## Dependency Map

- Depends only on phase 1 route truth.
- Blocks phases 8-10 adapter migrations.
- Phase 7 core runtime can proceed after API/script ordering is stable.

## Test Scenario Matrix

| Scenario | Input | Expected |
|---|---|---|
| Basis | Unit axes | Right-handed cross products |
| Horizontal | source `r=(1,0)`, `v=(0,1)` | axial `+Y` |
| Vertical | same source vectors | axial `+Z` |
| Negative scalar | `ω=-2` | negative axial vector |
| Zero | zero point/vector/axis | finite exact zero |
| Immutability | frozen objects | no mutation |
| Invalid plane | missing/unknown | deterministic error |

## Tests Before

1. Add RED test requiring the missing module.
2. Encode basis and source-plane sign preservation independently.
3. Add zero, negative, and immutability cases.
4. Add shared arrow behavior tests using minimal Three.js objects.

## Refactor

1. Implement pure coordinate module.
2. Add script wiring in production and fixtures.
3. Consolidate duplicated arrow orientation/length code in `three-primitives.js`.
4. Do not migrate adapters yet; route-specific tests and changes stay phases 8-10.

## Tests After

- Browser smoke confirms `window.Sim3Coordinates`.
- CommonJS tests confirm identical results.
- Script-order test fails if an adapter loads before coordinate foundation.

## Implementation Steps

1. Write coordinate RED tests.
2. Add pure UMD/CommonJS implementation.
3. Add shared arrow updater and tests.
4. Wire index/fixtures.
5. Run existing 19 Sim3 pilot tests to prove compatibility.

## Regression Gate

```powershell
node tests/sim3-coordinate-system.test.js
npm run test:sim:contracts
npm run test:sim3:pilot
npm run test:sim:mount
```

## Success Criteria

- [x] Convention is explicit, right-handed, pure, and fully unit-tested.
- [x] Zero/negative vectors remain physically meaningful.
- [x] Production and fixtures load the module in correct order.
- [x] Existing Sim3 behavior remains unchanged until route phases.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Global y-to-z flip causes broad visual changes | Foundation only; migrate route batches separately |
| Helper hides sign via normalization | Test signed axial/dot/cross values before rendering |
| New abstraction duplicates Three.js | Keep plain `{x,y,z}` math and minimal API |

## Verification Evidence

- `npm run test:sim3:coordinates`: passed basis, plane-sign, zero, negative, immutability, invalid-plane, overflow, signed-arrow, clamp, and executable script-order contracts.
- `npm run test:sim3:pilot`: 20 passed, including browser-global coordinate smoke.
- `npm run test:sim:contracts`: passed for 25 Sim2, 10 Sim3, and 35 route contracts.
- `npm run test:sim:mount`: 129 passed.
- Independent fallback review found two medium numeric edge cases and two low test/allocation weaknesses; all received regression coverage and source fixes.

## Security Considerations

Pure numeric code. Validate finite inputs at adapter boundaries; do not silently emit invalid vectors.

## Next Steps

Phase 7 hardens shell lifecycle, resize, DPR, fallback, accessibility, and disposal before adapters migrate.
