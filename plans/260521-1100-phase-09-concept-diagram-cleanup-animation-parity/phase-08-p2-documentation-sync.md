---
phase: 8
title: "P2 Documentation Sync"
status: completed
priority: P2
effort: "0.5d"
dependencies: [2, 3, 4, 5, 7]
---

# Phase 8: P2 Documentation Sync

## Context Links

- `docs/codebase-summary.md` — section "Simulation engine"
- `docs/project-changelog.md` — most recent entry is Phase 08 RC2/RC6 spring-mass overhaul
- `docs/project-roadmap.md` — Phase 08 currently last entry
- `docs/code-standards.md` — needs new "Sim renderer types" subsection
- `docs/journals/` — journal entry for the verification + Phase 09 closure
- `README.md` — npm scripts list (test:sim:browser:evolution, test:sim:browser:update-evolution-baseline)

## Overview

After Sprints 1-2 land, four docs and one journal entry must be updated to reflect (a) the new `static: true` + `tickWithoutButton: true` scene flags, (b) renderer-types pattern (concept-diagram vs animation scene), (c) the new evolution harness + npm scripts, (d) Phase 09 status (complete or partial), (e) the dropped Phase 06 + ch3-7-2 reclassification noted in the journal. No code change.

## Key Insights

- Per `documentation-management.md`: changelog and roadmap entries are mandatory after major milestones. Phase 09 qualifies (7+5 routes touched + 1 reclassified, new harness landed).
- `code-standards.md` should grow a new subsection: "Sim renderer types — concept diagram vs animation scene" with the heuristic "does scene have `static: true`? then renderer is pure-state-of-now; otherwise renderer must read `state._t`. If `static: true && tickWithoutButton: true`, the engine ticks without a Play affordance — used when readouts need `_t` but visualization stays time-invariant." Helps onboard new contributors.
- Journal entry should be honest: this verification surfaced a 2026-05-21 finding masked by a previous QA pass. Document the methodology gap (mount + interaction sweep ≠ per-second canvas evolution sweep), the F11 Phase-06 drop (planner-invented UX caught by red-team review), and the ch3-7-2 reclassification.

## Requirements

### Functional

- `docs/codebase-summary.md` updated:
  - "Simulation engine" gains `Static vs animated scenes` paragraph explaining `scene.static`, `scene.tickWithoutButton`, and `behavior.onTick` interaction.
  - Snapshot table includes `Static-concept routes count: 7 + Ch1 25 = 32 of 58 with no Play button`.
- `docs/project-changelog.md` adds Phase 09 entry: routes touched, new harness, breaking change to scene contract (`static` + `tickWithoutButton` fields).
- `docs/project-roadmap.md` marks Phase 09 complete (or in-progress with checkbox).
- `docs/code-standards.md` grows "Sim renderer types" subsection (5–10 lines).
- New journal `docs/journals/2026-05-22-phase-09-canvas-evolution-harness-and-renderer-cleanup-closeout.md`:
  - root-cause: state engine vs renderer separation; why earlier QA missed it
  - scope shipped (or partial)
  - leftover backlog (phases 9, 10)
- `README.md` "QA simulation" command list adds `npm run test:sim:browser:evolution` and update line.

### Non-functional

- Markdown remains lint-clean (existing repo doesn't enforce, but match style).
- No emojis added unless existing doc uses them.
- Vietnamese tone consistent with existing pages.

## Architecture

```
Sources of truth                    Targets to update
────────────────                    ───────────────────
Phase 02-06 PR diffs    →           docs/project-changelog.md
                                    docs/project-roadmap.md
Verification report     →           docs/journals/...closeout.md
Scene flag introduction →           docs/code-standards.md
                                    docs/codebase-summary.md
New npm scripts         →           README.md
```

## Related Code Files

### Modify
- `docs/codebase-summary.md`
- `docs/project-changelog.md`
- `docs/project-roadmap.md`
- `docs/code-standards.md`
- `README.md`

### Create
- `docs/journals/2026-05-22-phase-09-canvas-evolution-harness-and-renderer-cleanup-closeout.md`

### Read for context
- All phase-XX-*.md (this directory) for scope summary
- `qa-verification/qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md` for finding language

## Implementation Steps

1. Draft journal entry first (it's the longest); cite verification report, summarize root cause (renderer ignored `_t` while engine ticked it), scope shipped vs deferred, Sprint counts.
2. Append Phase 09 entry to `docs/project-changelog.md` per existing style:
   ```
   ## Phase 09 — 2026-05-22 — Concept-Diagram UX cleanup + animation parity (5 routes) + canvas evolution harness
   - feat(sim): scene `static: true` flag; 7 concept-only routes drop misleading Play button (a11y/UX); 3 of those carry `tickWithoutButton: true` so engine ticks without a Play affordance (F3 hybrid policy)
   - fix(sim): ch3-2-1 inertia law renderer reads engine-populated `state.v` and `state._t` so body translates when Fnet=0; soft-clamp halts body at canvas edge (no wrap-around)
   - feat(sim): animate ch3-1-2, ch3-5-1, ch3-5-2, ch2-5-1, ch3-7-2 with engine-time-derived state (ch3-7-2 reclassified from concept-only to animated)
   - feat(qa): `tests/sim-canvas-evolution.spec.js` 58-route engine-time-sampled canvas hash sweep
   - feat(qa): `tools/check-canvas-evolution-baseline.js` CI fail-on-drift; baseline JSON checked in
   - docs(sim): code-standards `Sim renderer types`; codebase-summary `Static vs animated scenes`; journal closeout
   ```
3. Append Phase 09 to `docs/project-roadmap.md` with status checkbox.
4. Add subsection in `docs/code-standards.md`:
   ```markdown
   ## Sim renderer types

   58 routes split into two renderer kinds:
   - **Concept diagram** (`scene.static === true`) — pure-state-of-now; never reads `state._t`. Used for FBD, theorem selectors, residual checkers, force-pair illustrations. Reader suppresses the Play button. Examples: `ch3-1-3`, `ch3-2-3`, `ch3-7-1`.
   - **Animation scene** (no `scene.static`) — renderer MUST consume `state._t` (and any time-derived state like `phi`, `omega · t`) so canvas evolves between t=0 and t=3s. Reader exposes Play. Examples: `ch3-2-1`, `ch3-5-3`, `ch2-1-1`.

   Lock: `tests/sim-canvas-evolution.spec.js` enforces bucket-specific `uniqueFrames` windows; `tools/check-canvas-evolution-baseline.js` fails CI on drift.
   ```
5. Update `docs/codebase-summary.md` "Simulation engine" section to mention `scene.static` flag and link to code-standards subsection.
6. Update `README.md` QA simulation command list with new `npm run test:sim:browser:evolution` and `update-evolution-baseline` lines, kept under the existing block.
7. Run `python tools/audit.py` to ensure no broken doc links / images introduced.
8. If phase 7's decision was `should-animate`, document the deferred work explicitly in roadmap as Phase 09b.

## Tests

| Test | Asserts |
|---|---|
| `python tools/audit.py` | No broken cross-references in modified docs. |
| `python tools/audit.py --strict-images` | Strict images gate still green. |
| Manual readthrough | Each modified file reads cleanly + Vietnamese consistent. |

## Todo List

- [x] Draft journal entry
- [x] Append changelog entry
- [x] Append roadmap entry
- [x] Add code-standards subsection
- [x] Update codebase-summary
- [x] Update README
- [x] `tools/audit.py` green

## Success Criteria

- [x] All 5 docs reflect Phase 09.
- [x] Journal entry created.
- [x] `audit.py` passes.

## Risk Assessment

- **README QA section already long** — keep new lines minimal; expand only if needed for discoverability.
- **Doc drift if phase 7 reopens** — journal explicitly notes "Phase 09 closes Sprints 1-2; Sprint 3 + backlog tracked separately"; safer than implying full closure.

## Security Considerations

None.

## Next Steps

Sprint 3 closes after this phase. Backlog (phases 9, 10) is tracked under same plan dir; pick up when capacity allows.
