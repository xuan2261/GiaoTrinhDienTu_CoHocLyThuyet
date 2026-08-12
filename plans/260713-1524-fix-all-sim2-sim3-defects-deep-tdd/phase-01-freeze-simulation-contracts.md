---
phase: 1
title: "Freeze Simulation Contracts"
status: pending
priority: P1
dependencies: []
effort: "1-2 days"
---

# Phase 1: Freeze Simulation Contracts

## Overview

Establish executable route truth before changing runtime behavior. Replace source-text route-name checks with manifests and machine-verifiable contract metadata for exactly 25 Sim2 and 10 Sim3 routes.

## Context Links

- [Plan overview](./plan.md)
- `js/sim2/sim2-route-manifest.js`
- `js/sim2/registry.js`
- `tests/sim2-route-coverage.test.js`
- `index.html`, `js/loader.js`

## Requirements

- Functional:
  - One canonical Sim2 manifest and one canonical Sim3 manifest.
  - Cross-check manifest IDs against registry/adapter globals, production script tags, route source files, loader content map, and fixtures.
  - Every route maps to a named executable contract descriptor, not a comment/string occurrence.
- Non-functional:
  - Pure Node gate, deterministic, no browser/network.
  - No runtime behavior or physics change in this phase.
  - Preserve route IDs and current `SIM_MAP` contract.

## Architecture

```text
sim2-route-manifest ─┬─> SIM_MAP factories
                    ├─> route contract table
sim3-route-manifest ├─> adapter globals + script tags
                    └─> fixtures + production integration matrix
```

Contract descriptors contain route ID, chapter, engine, source file, test scenario ID, interaction kind, expected oracle kind, and optional Sim3 adapter global. Later tests import this table and must execute each descriptor.

## File Inventory

| Action | File | Change | Test impact |
|---|---|---|---|
| Create | `js/sim3/sim3-route-manifest.js` | Canonical 10-route UMD/CommonJS manifest | New route-truth assertions |
| Create | `tests/support/simulation-route-contracts.js` | 25 Sim2 + 10 Sim3 executable metadata | Used by phases 2, 8-10 |
| Create | `tests/simulation-route-truth.test.js` | Exact set and wiring checks | New fast Node gate |
| Modify | `tests/sim2-route-coverage.test.js` | Remove `physicsSrc.includes(id)` and mount-source grep | Prevent comment-only coverage |
| Modify | `package.json` | Add `test:sim:contracts`; compose into physics gate | Required before later phases |
| Inspect only | `index.html`, `js/loader.js`, chapter fixtures | Sources for cross-check | No production edits unless RED proves omission |

## Function and Interface Checklist

- [ ] `sim3-route-manifest.js` exports in browser and CommonJS.
- [ ] IDs unique and match `^ch\d-\d-\d$`.
- [ ] Each Sim2 descriptor resolves one factory.
- [ ] Each Sim3 descriptor resolves one adapter source/global and one Sim2 base route.
- [ ] Contract descriptor has a callable/scenario reference, not only free text.
- [ ] Unknown, duplicate, missing, or extra routes fail with actionable messages.
- [ ] Generated/release copies are excluded from route discovery.

## Dependency Map

- Blocks phases 2-12.
- Does not depend on runtime fixes.
- `simulation-route-contracts.js` becomes the shared input for production E2E, fallback, capture, and probe validation.

## Test Scenario Matrix

| Scenario | RED condition | Expected GREEN |
|---|---|---|
| Comment contains route ID but no contract | Existing test passes falsely | New test fails |
| Missing Sim3 adapter script | Manifest/source mismatch | Exact missing path/global reported |
| Duplicate route descriptor | Duplicate ID | Gate fails |
| Unknown fixture route | Extra fixture script | Gate fails |
| Loader/base route mismatch | Content route missing | Gate fails |
| Complete current tree | 25 Sim2 + 10 Sim3 | Gate passes |

## Tests Before

1. Add failing tests proving a route-name comment cannot satisfy coverage.
2. Add exact expected counts and set equality checks.
3. Add mutation-style fixtures in memory: remove/duplicate/rename one descriptor and assert failure.
4. Confirm RED failure reason before changing existing coverage logic.

## Refactor

1. Create Sim3 manifest using the existing Sim2 UMD/CommonJS pattern.
2. Centralize route metadata in `tests/support/simulation-route-contracts.js`.
3. Replace grep assertions with imported descriptors and actual factory/global resolution.
4. Keep current palette/removal guards unchanged.

## Tests After

- Validate script ordering and file existence.
- Validate production index and chapter fixtures include the required core/adapter files.
- Validate every contract ID is consumed once by the contract registry.
- Add a summary count to test output: `25 Sim2 / 10 Sim3 / 35 contracts`.

## Implementation Steps

1. Run current contract/coverage tests and save baseline output.
2. Write RED mutation cases.
3. Add Sim3 manifest and contract table.
4. Replace source-text checks.
5. Add npm script and run fast gate.
6. Run existing physics/mount gates to prove no runtime regression.

## Regression Gate

```powershell
npm run test:sim:contracts
npm run test:sim:physics
npm run test:sim:mount
```

## Success Criteria

- [ ] Exactly 25 Sim2 and 10 Sim3 routes verified.
- [ ] Route-name comments cannot satisfy coverage.
- [ ] Manifest, files, globals, script tags, fixtures, and loader mappings agree.
- [ ] Existing Sim2 release tests remain green.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Parsing `index.html` becomes brittle | Parse only script `src` values and route IDs; avoid formatting assumptions |
| Test metadata duplicates production physics | Store scenario/oracle identifiers only; numerical oracles live in tests |
| Manifest added but not loaded offline | Verify production and fixture script order in Node gate |

## Security Considerations

No new network or user input. Resolve paths under repository root and reject traversal in test helpers.

## Next Steps

Phase 2 consumes the contract table to execute all mounted Sim2 physics scenarios.
