# Phase 02 - Readout Policy And Engine Guard

## Context Links

- [Research Synthesis](./research/research-synthesis.md)
- [Red Team Review](./reports/red-team-review.md)
- `js/sim-professional-lab.js`
- `docs/system-architecture.md`

## Overview

Priority: P0. Status: Complete. Add a small explicit readout policy in the shared engine so scene catalogs can opt out of generic/control/time echo without CSS hacks.

## Key Insights

- Root cause is append chain in `formatReadoutItems()`.
- Existing `appendGenericReadouts: false` is too coarse and does not cover control/time separately.
- Need backward-compatible policy to reduce blast radius.

## Requirements

- Functional: Support route scene policy for `appendMode`, `appendAlpha`, `appendControls`, `appendTime`.
- Functional: Preserve existing `appendGenericReadouts: false`.
- Functional: Do not dedup by equal displayed value globally.
- Non-functional: Small patch; no renderer rewrite; keep `data-readout-kind` and `data-readout-key`.

## Architecture

```text
scene.readoutPolicy
  -> resolveReadoutPolicy(scene, behavior)
  -> formatReadoutItems()
      scene.readouts
      optional mode
      optional alpha
      optional controls
      optional time
```

Suggested helper:

```js
function resolveReadoutPolicy(scene) {
  const generic = scene.appendGenericReadouts !== false;
  return Object.assign({
    appendMode: generic,
    appendAlpha: generic,
    appendControls: true,
    appendTime: true
  }, scene.readoutPolicy || {});
}
```

Scene cleanup phases can set stricter values.

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sim-professional-lab.js` |
| Modify | `tests/simulation-browser.spec.js` |
| Possibly modify | `tests/simulation-test-utils.js` |

## Implementation Steps

1. Add `resolveReadoutPolicy(scene)` near readout helpers.
2. Change `formatReadoutItems()` to consult policy.
3. Preserve `appendGenericReadouts: false` semantics.
4. Add test route assertions using existing route fixtures, not fake runtime.
5. Confirm current routes still render before scene catalog policy changes.

## Todo List

- [x] Add readout policy resolver.
- [x] Gate mode/alpha/control/time append helpers.
- [x] Add targeted browser assertions for policy behavior after scene changes.
- [x] Confirm no CSS/layout changes.

## Verify / Tests

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "readout dedup"
```

Expected:

- JS syntax passes.
- Existing routes still mount.
- Policy tests can detect when controls are no longer auto-echoed.

## Success Criteria

- Engine can express desired UX without per-route DOM hacks.
- No all-route regression introduced before scene updates.

## Risk Assessment

- Risk: default policy changes too much. Mitigation: keep default backward-compatible in engine; scene phases opt in.
- Risk: line count. Mitigation: small helper only; no large abstraction.

## Security Considerations

- DOM text remains `textContent`, no HTML injection.
- No new persistence.

## Next Steps

- Phase 03 applies policy and alias fixes to Ch1.
