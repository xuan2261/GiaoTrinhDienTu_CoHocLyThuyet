---
title: "Phase 8: Khắc phục các bề mặt theo WCAG 2.2 AA"
status: pending
priority: P0
effort: "7-10 ngày + audit thủ công"
dependencies: [phase-05, phase-06, phase-07]
---

# Phase 8: Khắc phục các bề mặt theo WCAG 2.2 AA

## Overview

Khắc phục reusable surfaces và tạo evidence matrix automated + manual. Phase này không tự cấp chứng nhận WCAG; kết luận AA chỉ xuất hiện sau independent audit.

## Requirements

- Representative matrix: home, content, search, quiz, Sim2, Sim3+fallback, refs và PDF dialog; dark/light, keyboard, zoom/reflow.
- Skip link, landmarks, accessible names/states, focus order/visibility, target size, contrast, status messages.
- Search combobox/listbox, quiz semantic controls, Sim2 labels/playback names, Sim3 canvas/text fallback, PDF focus restore.
- Axe critical/serious = 0 trên scope; moderate findings triage, không suppress toàn cục.
- Manual checks cho SC không tự động hóa được; environment và reviewer recorded.

## Architecture

Shared shell/CSS/search/quiz surfaces được sửa trước, rồi route-specific exceptions. `tests/wcag-axe.spec.js` và `tests/wcag-keyboard.spec.js` chạy observable behavior; `./evidence/phase-08-wcag-22-aa-evidence.md` chứa manual matrix và conformance limitation.

## Related Code Files

- Modify: `index.html`, `js/app.js`, `js/quiz.js`, `css/style.css`.
- Verify/route to upstream owner: `js/sim2/core/controls.js`, `js/sim3/core/mode-toggle.js`, `js/sim3/core/three-shell.js`. Accessibility defects in these runtime files are fixed in plan `260713-1524`, not concurrently here.
- Reuse/extend: `tests/quiz-browser-render.spec.js`, `tests/pdf-viewer.spec.js`.
- Create: `tests/wcag-axe.spec.js`, `tests/wcag-keyboard.spec.js`, evidence report.
- Dependency: pin `@axe-core/playwright` as dev-only if approved.

## Tests Before

1. Keyboard walkthrough records missing skip link, click-only quiz options, unnamed controls and focus gaps.
2. Automated representative-route scan captures baseline violations without suppressions.
3. Manual contrast/focus/target/reflow/text-spacing matrix captures environment/screenshots.
4. Separate simulation behavior defect from accessibility defect and route to owning plan.

## Implementation Steps

1. **RED:** keyboard tests for skip-to-content, nav/sidebar/overlay, search, quiz, simulations, PDF dialog.
2. **RED:** axe tests across route/theme matrix.
3. Remediate shell landmarks, skip link, button names/states and focus management.
4. Integrate final Phase-5 search and Phase-6 quiz semantics.
5. Verify upstream Sim2 labels/output/button names and Sim3 toggle/canvas/fallback announcements. If a runtime accessibility defect remains, reopen/add the exact item in plan `260713-1524`; Phase 8 owns the failing cross-surface test and evidence, not a conflicting runtime edit.
6. Add global focus-visible tokens; replace every `outline:none` case with an equivalent or stronger visible focus treatment; audit contrast/target/reflow.
7. **GREEN:** focused suites pass with documented exceptions only when not in AA scope and independently reviewed.
8. Conduct manual audit; fix findings, rerun full matrix, obtain independent review.

## Tests After

- `npm run test:accessibility` (axe, landmarks, keyboard flows, reflow, and deterministic contrast).
- Quiz/search/PDF/simulation focused browser regression suites.
- Manual checks: keyboard-only, NVDA/target screen reader, 200%/400% zoom where applicable, text spacing, light/dark contrast, reduced motion.

## Todo

- [x] Freeze route/theme/assistive-tech matrix.
- [x] Add axe and keyboard RED suites.
- [x] Remediate shared shell/search/quiz/sim/PDF surfaces.
- [ ] Complete manual WCAG evidence.
- [ ] Obtain independent accessibility disposition.

## Success Criteria

- Zero axe critical/serious on approved matrix.
- All primary workflows complete keyboard-only with visible logical focus.
- Names/roles/values/statuses are programmatically exposed.
- Zoom/reflow/text spacing and target/contrast checks have recorded evidence.
- Final report says “tested against WCAG 2.2 AA” unless an independent audit artifact explicitly authorizes stronger conformance wording.

## Risk Assessment

- Axe pass overclaim: manual and independent gates remain mandatory.
- Visual changes break generated/layout assumptions: verify actual browser surfaces, not CSS source.
- Simulation accessibility conflicts with upstream runtime: coordinate shared control contract; runtime owner fixes behavior.

## Next Steps

Phase 10 includes the final accessibility gate in release; Phase 12 records the review disposition.