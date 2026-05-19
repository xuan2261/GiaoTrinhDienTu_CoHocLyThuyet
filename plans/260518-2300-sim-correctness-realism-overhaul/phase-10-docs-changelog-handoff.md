---
phase: 10
title: "Docs Changelog And Handoff"
status: completed
priority: P2
effort: "3h"
dependencies: [9]
---

# Phase 10: Docs Changelog And Handoff

## Overview

Đồng bộ tài liệu: `docs/system-architecture.md` cập nhật contract `getAnchor`, palette unified, animation engine usage, preset gallery, impulse flash, a11y overlay; `docs/code-standards.md` thêm rule "no hardcoded hex in renderer" + "arrow length-only convention" + "a11y handle declaration"; `docs/design-guidelines.md` ghi rim/AO/spring helix conventions + WCAG 2.1 AA compliance; `docs/project-changelog.md` log đầy đủ; viết journal entry tổng hợp.

## Requirements

- Functional:
  - 4 docs files cập nhật.
  - 1 journal entry trong `docs/journals/`.
  - Plan status chuyển `completed`; tasks tương ứng đóng.
- Non-functional:
  - Docs link xuyên suốt: plan ↔ docs ↔ changelog.
  - Journal ngắn gọn (sacrifice grammar for concision per project rule).

## Related Code Files

- Modify: `docs/system-architecture.md` — phần "Runtime Contract":
  - Add: "Each route handle config must declare `getAnchor(state, d) → {x, y}`; engine asserts `|handle.get() - getAnchor()| ≤ 8px`."
  - Add: "Spring/cable rendering must derive `springEnd` from body anchor via `derivedSpringGeometry`."
  - Update: "Palette unified under `SimCore.COLORS` with theme-aware dark/light variants. No raw hex in renderer/behavior/primitive files."
  - Add: "Animation engine spec: preset gallery (no auto-cycle), trail buffer, impulse flash (Newton 3 invariant), spring autoplay."
  - Add: "A11y layer: ARIA button overlay per handle, keyboard nav (arrow keys + Shift+arrow), `prefers-reduced-motion` honored, aria-live state announcements."
- Modify: `docs/code-standards.md` — add section "Simulation primitive standards":
  - "No hardcoded hex `#[0-9a-f]{6}` anywhere under `js/sims/`, `js/sim-route-renderer-primitives.js`, `js/sim-visual-helpers.js`, behavior modules. Use `SimCore.color(key)`."
  - "All `realisticBody` calls go through 3-layer (AO + body + rim) primitive."
  - "All `arrow` calls accept `magnitude` (0..1, default 1.0). Length scales with magnitude; lineWidth fixed 2.5px; NO `shadowBlur` on arrows."
  - "Every handle declares `getAnchor(state, d)` AND `aria.label` (string or function)."
  - "Impulse flash on collision: 2 opposite vectors (Newton 3); NO spark/particle emission for rigid-body events."
- Modify: `docs/design-guidelines.md` — add sections:
  - Rim/AO/specular conventions (Phase 06 + 07).
  - Spring sinusoidal helix specs (Phase 05).
  - Arrow length-only scaling rationale (PhET / MyPhysicsLab convention).
  - Impulse flash physics rationale (xung lực J = Δp, Newton 3).
  - WCAG 2.1 AA compliance section: ARIA, keyboard nav, reduced-motion, color-blind safe via length not color.
- Modify: `docs/project-changelog.md` — entry under 2026-05-XX:
  ```
  ### Simulation Correctness And Realism Overhaul
  - Fix: handle/body anchor coupling on 58 routes (RC1) + fail-loud empty-handle route
  - Fix: spring/cable base alignment with mass body (RC4)
  - Fix: overlay text whitelist accepts physics labels + Vietnamese short terms (RC5)
  - Visual: sinusoidal spring helix replaces zigzag (RC3a)
  - Visual: rim highlight + AO on realisticBody, length-only magnitude arrows (RC3b)
  - Visual: wheel specular arc, OffscreenCanvas pattern cache (RC3c)
  - Animation: ch1 preset gallery (no auto-cycle), trail on ch2 trajectory, impulse flash on ch3-6-2 (RC2)
  - Theme: unified palette via SimCore.color(), light theme verified for 10 routes (RC6)
  - A11y: ARIA button overlay, keyboard navigation, prefers-reduced-motion, aria-live announcements (Phase 08b — WCAG 2.1 AA)
  ```
- Add: `docs/journals/260519-XXXX-sim-correctness-realism-overhaul.md` (date tag at completion).

## Implementation Steps

1. Update `docs/system-architecture.md` Runtime Contract section.
2. Add "Simulation primitive standards" section to `docs/code-standards.md`.
3. Update `docs/design-guidelines.md` rim/AO/specular + arrow + impulse + a11y sections.
4. Add `docs/project-changelog.md` entry with all RC fixes + a11y phase summarized.
5. Write journal entry referencing plan + key learnings + scope-cut rationale (sacrifice grammar for concision).
6. Update plan.md status: `completed`.
7. Run `/ck:journal` to verify journal format.
8. Verify cross-links: plan → reports, plan → research, docs → plan.

## Todo List

- [ ] system-architecture.md updated (contract + animation + a11y)
- [ ] code-standards.md primitive section added (hex ban, arrow rule, aria rule)
- [ ] design-guidelines.md rim/AO/spring/arrow/impulse/a11y sections
- [ ] project-changelog.md entry (8 bullets including a11y)
- [ ] Journal entry written
- [ ] plan.md status → completed
- [ ] Cross-links verified

## Success Criteria

- [ ] All 4 docs files have at least 1 commit referencing this plan
- [ ] Changelog entry mentions all 6 RCs + a11y phase
- [ ] Journal entry exists in `docs/journals/`
- [ ] plan.md frontmatter `status: completed`
- [ ] No broken links between plan/docs
- [ ] WCAG 2.1 AA compliance documented in design-guidelines.md

## Risk Assessment

- **Risk:** Docs drift if late-stage code changes don't reflect.
  **Mitigation:** Run docs sync as last step after Phase 09 release lock.
- **Risk:** Journal too verbose violates concision rule.
  **Mitigation:** Cap at 200 words; bullet form only.
- **Risk:** A11y compliance claim without external audit.
  **Mitigation:** Document as "internal NVDA / VoiceOver dry-run pass" rather than formal certification.

## Security Considerations
- N/A.

## Next Steps
- Plan archived via `/ck:plan archive`.
