---
phase: 7
title: "P2 Investigate ch2-5-2 ch2-5-3 Motion Intent"
status: completed
priority: P2
effort: "0.5d"
dependencies: [4]
---

# Phase 7: P2 Investigate ch2-5-2 / ch2-5-3 Motion Intent

## Context Links

- Verification report mục 3.2: `ch2-5-2 / ch2-5-3 uniqueFrames=2`
- Renderers: `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js:45-111`
- Behaviors: `js/sims/ch2/ch2-kinematics-behaviors-b.js`
- Phase 04 baseline: classify in `STATIC_ROUTES_CONCEPT_DIAGRAM` if intentional, otherwise schedule animation work.

## Overview

Both routes show `uniqueFrames === 2`: one snap on Play click, then static. Verification report deemed this *probably* intentional (instant-center demonstrates a tức-thời/instantaneous state — not motion over time). This phase confirms intent by reading behavior + scene comments + DOCX source, then either (a) documents the design choice in the scene catalog and bucket the routes as `static-concept`, or (b) schedules an animation followup ticket.

**No code shipped from this phase unless decision is "should animate"**, in which case it spawns a phase-7b implementation slot.

## Key Insights

- ch2-5-2 (instant center) has a `state.theta` and `omega` already; renderer pulses IC marker via `Math.sin(state.phi * 3)` but uses `state.phi`, not `state._t`. Motion would imply rotating crank — pedagogical question: does the lesson demand watching the IC migrate, or is the snapshot sufficient?
- ch2-5-3 (velocity distribution) shows v ∝ r as a static slice. Animating would mean rotating the bar around IC — same question.
- DOCX source is the authority. If the chapter text says "tâm vận tốc tức thời" (instantaneous), static is correct. If text says "as the crank rotates", animation is wanted.

## Requirements

### Functional (decision artifact)

- A short `docs/journals/...` decision note recording: read of DOCX text for §2.5.2 and §2.5.3, behavior file inspection, conclusion (`intentional-static` | `should-animate`).
- If `intentional-static`: scene catalog gains `static: true` on these 2 routes (same mechanism as phase 03), routes move from `animated-defect` baseline window to `static-concept`.
- If `should-animate`: a phase-7b stub file is created with the same structure as phase-05 sub-step (RED → GREEN → REFACTOR for 1 renderer), and the route stays in `animated-defect` baseline with `knownDefect: "phase-7b-animate"`.

### Non-functional

- Read-only investigation phase. No production code change unless decision is `intentional-static` (then 2-line scene flag change).
- Keep journal entry under 60 lines.

## Architecture

```
Inputs → Decision matrix
─────────────────────────
DOCX §2.5.2 wording
DOCX §2.5.3 wording
behavior file: do `_t`/`omega` actually evolve?

If wording = "tức thời" / "tại một thời điểm":
  → bucket: static-concept; flag scene.static = true; close.

If wording = "khi vật quay" / "while rotating" / "as crank moves":
  → bucket: animated; create phase-7b animation slot; phase 09 incomplete until done.
```

## Related Code Files

### Read for context (no edit unless decision-driven)
- `chapters/ch2-5-2.html`, `chapters/ch2-5-3.html` (extracted DOCX fragment)
- `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`
- `js/sims/ch2/ch2-kinematics-behaviors-b.js` — confirm `onTick` populates `_t`

### Conditionally modify
- `js/sims/ch2/ch2-kinematics-scenes.js` (`static: true` flag, only if intentional-static)
- `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json` (window adjusted)
- `tests/sim-canvas-evolution-fixtures.js` (bucket flip)

### Conditionally create
- `phase-07b-animate-ch2-5-2-ch2-5-3.md` — stub for follow-up animation work

### Always create
- `docs/journals/2026-05-22-ch2-5-2-and-ch2-5-3-motion-intent-decision.md` — decision note (or similar dated kebab name)

## Implementation Steps

1. Read `chapters/ch2-5-2.html` and `chapters/ch2-5-3.html`. Search Vietnamese keywords: "tức thời", "tại thời điểm", "khi quay", "trong quá trình".
2. Inspect `ch2-kinematics-behaviors-b.js` `onTick` for these 2 routes — does `_t` advance? If yes, animation is wired in state but renderer ignores it.
3. Check existing manifest text in `tools/docx_site_manifest.json` for the section title — does it say "tức thời" (instantaneous) or "chuyển động phẳng" (plane motion)?
4. Decision matrix:
   - **All sources say instantaneous** → file decision: `intentional-static`. Add `static: true` to scene rows. Update fixtures + baseline. Close phase.
   - **Any source says rotation/over time** → file decision: `should-animate`. Create `phase-07b-animate-ch2-5-2-ch2-5-3.md` with TDD structure modeled on phase 05 (renderer reads `_t`, rotates crank/bar, wraps `phi mod 2π`). Phase 09 stays open until 7b lands.
5. Write journal entry recording: which sources read, what each said, decision, scope of follow-up.
6. If `intentional-static`: re-run `npm run test:sim:browser` to confirm 2 routes move to `static-concept` bucket cleanly.

## Tests

| Test | Asserts |
|---|---|
| `sim-canvas-evolution.spec.js` | If `intentional-static`: 2 routes hit `[1,2]` window. If `should-animate`: 2 routes still tagged `knownDefect`. |
| Journal entry exists | `ls docs/journals/2026-05-22-ch2-5-2-and-ch2-5-3-motion-intent-decision.md` returns the file. |

## Todo List

- [x] Read chapters/ch2-5-2.html for "tức thời" vs "khi quay"
- [x] Read chapters/ch2-5-3.html for same
- [x] Inspect behavior file for `_t` activity
- [x] Decision recorded in journal
- [x] Conditional: scene flag added OR phase-7b stub created
- [x] Baseline JSON updated to match decision

## Success Criteria

- [x] Decision documented in journal with sourced quotes.
- [x] Either: 2 scenes carry `static: true` and tests pass, OR phase-7b stub created.
- [x] Baseline JSON consistent with decision.

## Risk Assessment

- **DOCX text ambiguous** → cite the most explicit phrase, default to `intentional-static` (less invasive); reopen if course owner objects later.
- **Behavior advances `_t` but renderer doesn't read it** → this is the same defect class as phase 02; if course wording supports motion, scope creep is minor (same RED→GREEN pattern).

## Security Considerations

None.

## Next Steps

Phase 08 (docs sync) consumes the journal entry created here.
