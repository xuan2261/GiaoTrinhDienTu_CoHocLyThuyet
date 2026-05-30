# Red-Team Review (Scope & Complexity Critic) — Sim Physics/Theory-Fidelity Fix Plan

Persona: YAGNI/KISS adversary. Plan: `260530-1811-simulation-physics-theory-fidelity-fixes` (10 phases, 23 routes).
Mode: read-only. Cross-checked against 3 chapter audits + master report.

## Verdict snapshot
- Coverage of the 23 BROKEN+WEAK is COMPLETE (no flagged route omitted). Good.
- Main problem is the OPPOSITE of under-scoping: Phase 09 smuggles 3 feature-adds disguised as WEAK→GOOD "polish".
- Plan is too big to land as one unit; P0/P1 (correctness) is hostage to P2 (cosmetic + feature-adds).
- Harness is proportionate (not over-engineered).

---

## 1. Feature-adds masquerading as fixes (Phase 09) — YAGNI

| Route | Plan item | Audit reality | Recommendation |
|---|---|---|---|
| ch3-6-3 | "add oblique/xiên collision (2D angle input)" | 1D head-on **correct + momentum-conserving (verified)**. Only "objective unmet", not broken. | **CUT → backlog.** Net-new 2D feature (angle input + 2D restitution + new renderer); disproportionate to a P2 polish phase. Make backlog the default, not the fallback. |
| ch2-1-2 | "add a moving object to sync with graphs" | Curves self-consistent (v=ẋ,a=ẍ); real bug = ω only scales cursor, curves ignore controls. | **SPLIT.** Keep the real fix (make curves respond to controls) now; **CUT** the new "moving object" visual to backlog. |
| ch2-4-1 | "add moving reference frame" | `v_a=v_e+v_r` triangle **correct**; only "moving frame not illustrated". | **CUT → backlog.** New animated-frame feature; physics already right. P2 disproportionate. |

Secondary (more defensible build-not-fix): ch3-5-3 "add control to vary I, ω=L/I" (P05) — the route's CORE objective (conservation of L) is currently not demonstrated at all, audit marks P1. KEEP, but acknowledge it's a build, lower priority than the teaches-wrong P0s.

KISS already applied well at ch3-3-2 (plan offers cheaper "fix visual to 1-spring" over "fix eq to 3-spring") — no creep there.

## 2. Phase granularity — MERGE P07 + P08

**Recommendation: MERGE into one "P2 Render/Label Sweep" phase.**
- Both are P2 cosmetic cross-cuts, identical dependency set `[2,3,4,5,6]`, both sweep all 52 routes via a tool (unit-label guard / `check-overlay-panels.js`).
- Merging consolidates one RED→GREEN cycle and **one** full-suite regression re-run instead of two.
- File-set overlap is partial (P07 = scene-config + readout-format; P08 = renderers + primitives), so merge doesn't fully eliminate renderer churn — but the bigger issue is below.

**Real regression-surface problem (flag regardless of merge):** several routes get their renderer edited across THREE phases:
- ch3-5-1: P07 (units) + P09 (a_CM∥ΣF) → consider also P08 label
- ch2-5-1: P07 + P08 + P09
- ch3-6-3: P08 + P09
Recommend grouping the P2 cosmetic-overlapping routes BY ROUTE, not by concern, to cut repeat renderer touches.

## 3. Scope size — SPLIT the plan

**Recommendation: SPLIT into two plans.**
- **Plan A (ship first):** P01 harness + P02–06 = **12 routes**, all real physics / teaches-wrong. High pedagogical value, must land fast (stop teaching wrong physics).
- **Plan B (follow-up):** P07–10 = cosmetic units + empty-panel + remaining WEAK polish + dead-code + docs (11 routes + sweeps + the 3 feature-adds).

Justification: dependency is one-directional (P2 depends on P0/P1, never reverse), so the split is clean. Bundling 23 routes + harness + dead-code + docs into one release gate means a stall on the Phase-09 feature-adds (oblique etc.) blocks the correctness fixes. Isolating the feature-add decisions into the lower-priority Plan B makes cutting them painless.

## 4. Under-scoping — no omissions, but one mis-classification

- All 23 BROKEN+WEAK covered. No flagged route dropped from phase tables.
- Plan even captures 2 GOOD-but-flawed routes beyond the 23: **ch3-2-1, ch3-2-3** (default-state, P09) — justified by master RC4.
- **RECLASSIFY flag — ch3-2-3:** audit is self-contradictory. ch3 verdict table marks it **GOOD**, but master RC4 says `a2=−50 m/s² is wrong by 5×` (should be ±10). If RC4 is right, this is a **P1 physics bug mislabeled GOOD**, not a P2 default-state nudge. Planner should verify `a2` sign/magnitude and re-sev if needed; currently parked in the lowest-priority P09.
- GOOD-route cosmetic items (ch1-1-8 "N N", ch2-5-3 "IÁ", ch2-1-1 pixel-units) are picked up by P07/P08 sweeps — covered.

## 5. Over-engineered harness — NO (proportionate), one KISS nudge

Three guards each map 1:1 to a distinct verified root cause:
- physics-source guard → RC1 (inline re-implementation, the systemic bug across 23 routes) — essential.
- unit-label regex guard → RC2 (wrong dimension labels, ≥8 routes) — cheap regex.
- empty-panel guard → RC5 (orphan panels) — **reuses existing** `tools/check-overlay-panels.js`.

These are 3 assertions in largely existing test files (extends `simulation-invariants.test.js` + `sim-route-invariants.js` pilot, plus one new Playwright spec) — not 3 frameworks. KEEP.

KISS nudge: run physics-source guard in **Node** (call shared module, compare to behavior `derived` — no browser needed). Reserve Playwright (`sim-theory-fidelity.spec.js`) only for DOM-truth checks (rendered unit text + empty-panel node count). The audit open-questions confirm empty-panel needs a live-browser check, so one browser spec is justified — just don't push physics-source into the browser layer.

## 6. Other notes
- **P07 Level B (pxPerMeter SI scale, 7 routes)** is the heaviest cosmetic sub-item. It is a **user-confirmed decision** (plan.md L14: Q1 = "cả hai mức"). Do NOT cut silently. If scope must shrink, raise Level B with the user as the candidate — do not unilaterally drop.
- **P09 effort (1.5d for 13 routes incl. 3 feature-adds)** is optimistic; if oblique 2D stays in, effort is under-estimated. Cutting the 3 adds (item 1) fixes this.
- **P10 dead-code removal (SimStatics)** confirmed dead by ch1 audit + master (separate `SimRegistry`, not consumed by professional-lab). Legit KISS cleanup; low risk with the grep guard already noted. Could fold into Plan B.

---

## Recommended actions (ranked)
1. **CUT** ch3-6-3 oblique + ch2-4-1 moving-frame to backlog; **SPLIT** ch2-1-2 (keep control-fix, cut moving-object). [P09]
2. **SPLIT** plan: A = P01+P02–06 (12 physics routes, ship first); B = P07–10 (cosmetic + adds + dead-code).
3. **MERGE** P07+P08 into one P2 sweep; group cosmetic-overlapping routes (ch3-5-1, ch2-5-1, ch3-6-3) by route to cut 3× renderer churn.
4. **VERIFY/RECLASSIFY** ch3-2-3 a2 (audit self-contradiction; possible P1 hiding in P09).
5. **KEEP** harness; move physics-source guard to Node, reserve Playwright for DOM-truth only.
6. **DEFER to user** (don't cut): P07 Level B pxPerMeter — user-confirmed at plan.md L14.

## Unresolved questions
1. ch3-2-3: is a2 actually wrong by 5× (master RC4) or correct (ch3 table GOOD)? Needs a grep/read of behaviors:65-71 to settle before sev assignment.
2. Does the user accept splitting into 2 plans, or is single-plan landing a hard requirement?
3. ch2-1-2 / ch2-4-1 / ch3-6-3: are the unmet pedagogical objectives (sync object / moving frame / oblique) acceptable as backlog, or must this plan close them to call the route GOOD?
