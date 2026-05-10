# Test Strategy Scene Identity Research

## Summary

Existing tests prove route mount, lifecycle, drag, and assessment basics. They do not prove that route scenes are distinct. Add identity gates before implementation, then turn them green phase by phase.

## Current Test Gap

| Existing gate | What it proves | Gap |
|---|---|---|
| `smoke_simulation_manifest.py` | 58 manifest routes and checkpoints | Does not inspect scene. |
| `smoke_simulation_runtime.py` | Globals, registry count, mount rollback | Does not compare route visuals. |
| `audit_simulation_quality.py` | File metrics, direct interaction metadata | Accepts 3 sliders/2 buttons for 58 routes. |
| `simulation-browser.spec.js @route-mount` | Each route mounts and chip matches route | A route chip can differ while scene same. |
| `@direct-drag-all` | Drag changes readout | Same drag/readout can pass every route. |

## New Gates

| Gate | Type | Purpose |
|---|---|---|
| `tools/smoke_simulation_scene_catalog.py` | static Python | Ensure every `SIM_MAP` route has one unique scene catalog entry. |
| `npm run test:sim:scene-identity` | browser Playwright | Ensure route title, controls/readout signature, and initial canvas differ. |
| `npm run test:sim:browser:route-mount` | existing browser | Ensure new architecture does not break mount. |
| `npm run test:sim:quality` | existing Python gates | Preserve manifest/quality constraints. |

## Catalog Smoke Requirements

- `--require-routes 58`
- route in `SIM_MAP` equals route in scene catalog
- `sceneId` unique
- `visualKey` unique
- each scene has `title`, `formula`, `template`, `initialState`, `controls`, `readouts`
- route-specific control/readout signature not empty
- optional `--routes` filter for phase gates

## Browser Scene Identity Requirements

- open every route via `file://`
- assert `.sim-lab-route-chip` equals route
- collect `.sim-title`, `.sim-info`, control labels, button labels
- collect initial canvas hash after deterministic first draw
- fail if two routes in same phase group have identical canvas hash and identical control/readout signature
- final strict mode: all 58 route initial canvas hashes unique, unless plan report documents approved exception

## Red-Green Protocol

1. Add identity test in Phase 1.
2. Run it against current code.
3. Confirm it fails with Ch1/Ch3 duplicate canvas groups.
4. Implement Phase 2 architecture.
5. Migrate route groups and run filtered identity gate.
6. Run full identity gate in Phase 11.

## Runtime Stability Notes

- Canvas hash must wait for `.sim-lab-route-chip` to match route and first draw complete.
- Avoid external request noise; block `http(s)` in Playwright as current tests do.
- If anti-aliasing causes cross-machine drift, compare duplicates within same run, not fixed expected hashes.

Unresolved questions: none.
