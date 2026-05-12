# DeCuong-Style Simulation UX Refresh

## Overview

Priority: high
Status: done

Refresh shared simulation UX for all 58 P1 routes so direct manipulation is visible, consistent, and close to the interaction model in `DeCuong_CoHocLyThuyet.html`.

## Key Insights

- Runtime route coverage already passes: 58/58 P1 routes mount through `SimProfessionalLab`.
- Root cause for uneven usability: route-owned handles exist but the shared engine does not draw a common handle layer after renderer output.
- Best scope: update shared lab/rendering/CSS so all routes improve together.

## Requirements

- Show visible route-owned drag handles on every simulation canvas.
- Keep readout cards immediate and clearer with semantic colors.
- Keep touch targets >= 44px and no horizontal overflow.
- Keep offline `file://` runtime and current route registry contracts.

## Related Code Files

- `js/sim-professional-lab.js`
- `js/sim-rendering.js`
- `js/sim-lab-ui.js`
- `css/style.css`
- `docs/project-roadmap.md`
- `docs/project-changelog.md`

## Implementation Steps

1. [x] Draw shared route handles after route renderer output.
2. [x] Redraw on hover/active handle changes and expose clearer status text.
3. [x] Add a compact handle legend in the shared lab shell.
4. [x] Polish readout and handle styles to match DeCuong interaction cues.
5. [x] Add comprehensive control/handle/animation audit for all 58 routes.
6. [x] Run final simulation smoke/unit/browser checks.

## Success Criteria

- `npm run test:sim:unit` passes.
- `python tools\smoke_simulation_routes.py --require-p1` passes.
- `python tools\smoke_simulation_runtime.py ...` passes.
- Browser interaction/visual smoke passes or any pre-existing blocker is documented.

## Risk Assessment

- Adding visible handle drawing changes canvas ink metrics; validate with visual-quality tests.
- Existing dirty worktree includes unrelated/untracked route files; avoid reverting user changes.

## Security Considerations

- No network/runtime dependency added.
- Continue using `textContent` and DOM APIs; no raw HTML injection.

## Verification

- `npm run test:sim:unit` pass.
- `python tools\audit.py` pass: 102/102 files OK, 0 warnings, 0 errors.
- `python tools\smoke_simulation_routes.py --require-p1` pass: 58/58 P1 covered.
- `python tools\audit_simulation_quality.py --all --max-js-lines 220` pass.
- `npx playwright test tests/simulation-browser.spec.js tests/simulation-interaction-engine.spec.js tests/simulation-visual-quality.spec.js` pass: 93/93 tests.

## Next Steps

- Optional release cleanup: decide whether legacy/untracked `js/routes/*` files should stay outside active runtime or be removed from package.

## Câu hỏi chưa rõ

- Có cần dọn các file legacy/untracked `js/routes/*` ra khỏi release package không?
