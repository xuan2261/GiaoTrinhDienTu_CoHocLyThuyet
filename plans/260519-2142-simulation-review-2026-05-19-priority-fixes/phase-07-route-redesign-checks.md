# Phase 07 — Route Redesign Checks

## Spec
`tests/sim-review-2026-05-19/route-redesign-checks.spec.js`
- For each route in `REDESIGN_ROUTES`, the surface (`structuralMarks ∪ visibleText`) must match every regex listed in `REDESIGN_EXPECTED_MARKS[route]`.

Plus `physics-invariants.test.js` ch3-5-2:
  - `scenes['ch3-5-2'].initialState` must seed `m: 2`, `J: 20`, `deltaP: 20`.
  - `behaviors['ch3-5-2'].onReset(...)` re-seeds same values into state.

## Routes & Expected Marks (`REDESIGN_ROUTES` — 7)
- ch1-3-1: contact-point, surface-normal, normal-arc
- ch1-3-3: force-label-f, link-type-label, reaction-offset
- ch1-3-7: axis-aligned-member, in-frame-axial-arrow
- ch1-4-2: moment-legend, axis-unit-e, axis-projection
- ch1-5-1: contact-triangle-anchor, friction-offset-labels, no-rr-duplicate
- ch1-5-4: wedge-apex-load, alpha-phi-arcs, attached-normal
- ch3-5-3: angular-momentum-panel, rotating-mass, rv-vectors

## Fix Steps
1. For each route, edit its renderer/behavior to:
   - Emit each required structural mark (via `SimRouteRendererPrimitives.mark`).
   - Or render a labeled DOM element whose text matches the regex.
2. ch3-5-2 scene seed: ensure `initialState = { m: 2, J: 20, deltaP: 20, ... }`.
3. ch3-5-2 behavior `onReset(scope, state) { state.m = 2; state.J = 20; state.deltaP = 20; ... }`.
4. Run:
   - `node tests/sim-review-2026-05-19/physics-invariants.test.js`
   - `npx playwright test tests/sim-review-2026-05-19/route-redesign-checks.spec.js`

## Done When
- All required regexes match for all 7 routes
- ch3-5-2 physics seed assertions PASS
