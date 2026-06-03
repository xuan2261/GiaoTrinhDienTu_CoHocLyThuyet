# 2026-06-03 — Sim3 Three-Route Rollout

## Summary

Completed the next Sim3 optional pilot batch after auditing 25 Sim2 candidates. Added 3 new route-scoped adapters:

- `ch2-3-2`: transmission, gear pair opposite direction and open belt same direction.
- `ch2-4-4`: Coriolis relation with rotating frame, bead, `omega`, `v_rel`, `a_cor`.
- `ch3-5-3`: angular momentum conservation with radial masses and visual speed cue.

Sim2 remains canonical/default. Sim3 stays lazy, optional, and fallback-safe.

## Key Decisions

- Kept physics in Sim2 route state and existing physics modules; Sim3 adapters only consume rendered state.
- Added `js/sim3/core/three-primitives.js` only for repeated material/arrow/cylinder helpers.
- Kept visual capture dev-only and outside `test:sim:release`.

## Verification

- `npm run test:sim3:pilot`: PASS, 9/9.
- `npm run test:sim3:visual:capture`: PASS, 5/5.
- `npm run test:sim:release`: PASS.
- Code review: no blockers.
- Docs-manager: docs consistent with 5-route pilot scope.

## Follow-Up

- Review visual artifacts before considering stretch route `ch2-5-3`.
- Keep full 25-route Sim3 rollout out of scope until pilot evidence is accepted.
