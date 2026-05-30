# Ch1 Statics Sim Audit — Physics Correctness & Theory Fidelity

Date: 2026-05-30
Scope: 23 Chapter-1 canonical routes. Read-only audit.

## Method / Active Render Path

- Live engine = `js/sim-professional-lab.js` → `rendererFor()` (`window.SimRouteRenderers`) + `behaviorFor().derived` (`window.SimRouteBehaviors`). Confirmed `draw()` calls `behavior.derived(scene,state)` then `rendererEntry.render(ctx,scene,state,d)` (sim-professional-lab.js:1567,1575).
- `js/sims/ch1/statics-routes.js` wires `SimStatics.simXXX` into a SEPARATE `SimRegistry` — NOT consumed by professional-lab. Legacy/dead adapter for this audit.
- `js/sim-physics-statics.js` helpers are mathematically CORRECT (M=F·d sin θ, R=ΣF, beam Ra=P(L−a)/L, centroid ΣSx/ΣS, cone μN). BUT the Ch1 `derived` functions mostly DO NOT call them — they recompute with ad-hoc pixel formulas. That is where the bugs live.

## Verdict Table

| Route | Verdict | Issue | Evidence (file:line / formula) | Sev |
|-------|---------|-------|--------------------------------|-----|
| ch1-1-3 | GOOD | Force anatomy: tail/tip/components/α correct; Fx,Fy=dx,dy (px≈N concept). | ch1-force-law-renderers.js:58-72; behaviors:140 fx=dx,fy=dy | — |
| ch1-1-4 | GOOD | Moment M_O=F·d verified on screen 110×3=330 N.m. | behaviors:122 `moment=baseForce*distance`; shot 02 | — |
| ch1-1-5 | BROKEN | "Thu gọn hệ lực" but F1,F2,F3 are HARD-CODED decorative arrows; |R| & M_O come from ONE dragged vector, not ΣFi. Doesn't reduce a system. | renderers:94 fixed `forces=[[315,198,...]]`; behaviors:122 moment from single (p,v); shot 03 (R separate from F1-3) | P1 |
| ch1-1-6 | GOOD | Couple M=F·d, d invariant of position. | renderers:108-121; behaviors:127 `moment=baseForce*distance` | — |
| ch1-1-8 | GOOD | Qualitative reaction-per-support map (N/T/Rx,Ry/M). Concept only. | renderers:123-145; behaviors supportInfo:106 | P2 |
| ch1-2-1 | WEAK | Collinearity check ok but "balanceError=|dy|" px-only; ignores F1≠F2 magnitude. | behaviors:140 `balanceError=Math.abs(dy)` | P2 |
| ch1-2-3 | GOOD | Parallelogram R=F1+F2 by true vector sum; α correct. | behaviors:83-91 parallelogramData; renderers:164-191 | — |
| ch1-2-6 | WEAK | FBD: R_x/R_y reaction arrows decorative; moment=(p.x−476)·F/60 arbitrary, not from ΣM=0. | behaviors:138; renderers:203-205 | P2 |
| ch1-3-1 | GOOD | Normal ⟂ surface, N direction from tangent angle. Concept ok. | renderers:72-83; behaviors setSupportPoint | P2 |
| ch1-3-2 | GOOD | Cable T along rope axis; α from geometry. | behaviors:47-51,72; renderers:85-96 | — |
| ch1-3-3 | BROKEN | Reaction comps = FIXED fractions 0.55F & 0.83F regardless of load pos/angle; selector "Ry"/"Rx" zeroes one in readout but renderer ALWAYS draws both Ax,Ay. Not equilibrium-derived. | behaviors:94-95 `force*0.55`,`*0.83`; renderers:105-106 always both; shot 11 | P1 |
| ch1-3-4 | GOOD | Beam Ra=P−Rb, Rb=P·a/L correct statics. | behaviors:77-78 `rb=beamForce*aPx/span; ra=beamForce-rb` | — |
| ch1-3-6 | GOOD | Fixed support M_A=F·arm (arm in m). | behaviors supportMoment:24 `return force*arm` | — |
| ch1-3-7 | GOOD | Two-force member: N along axis, NA=−NB. | renderers:144-156; behaviors:94 axial dx/dy | — |
| ch1-4-1 | BROKEN | TWO conflicting resultants on screen: Rxyz=200 vs "|R| 3D"=106. Components spatialX/Y/Z are arbitrary pixel maps not force comps; projection readout shows force in "m". | behaviors:80-83,88 `Math.hypot(spatialX,spatialY,spatialZ)` vs force; shot 15 (200 vs 106, "100 m") | P0 |
| ch1-4-2 | BROKEN | Moment fake: `force*arm*cos(α)/120` not r×F·e. Readout "MO" shown in DEGREES (0°) for a moment. | behaviors supportMoment:25; scenes read2 angle; shot 16 (M_axis=0.9 N.m, MO=0°) | P1 |
| ch1-4-4 | BROKEN | "Cân bằng / 6 pt =0" but ΣF=116 N, ΣM=100 N·m never reach 0; residual=|x−y|/100 arbitrary. Contradicts displayed equilibrium condition (theory muc-IV-4: R=0 AND M=0). | behaviors:98 `residual`; renderers:78-90; shot 17 | P0 |
| ch1-5-1 | WEAK | Fms=applied with NO cap → on screen Fms=88 N > μN=0.38·140=53.2 N, violating the very inequality Fms≤μN it prints. | behaviors:59 `fms=applied` (ch1-5-1); shot 18 | P1 |
| ch1-5-2 | GOOD | threshold=μN, Fms=min(applied,μN), state by F vs μN. | behaviors:58-59,64 | — |
| ch1-5-3 | GOOD | Cone: tanα≤μ condition, slipState=hold/slip correct. | behaviors:60-64; renderers:53-67 | — |
| ch1-5-4 | GOOD | Self-lock α≤φ=arctan μ correct. | behaviors:61-62 `phi=atan(mu); lock=alpha<=phi` | — |
| ch1-6-2 | WEAK | Composite xG=ΣSx/ΣS ok via S2 slider, BUT dragging G sets gx=p.x — centroid decoupled from formula (G becomes free point). Readout units "px" (honest). | behaviors:80-82 `if _draggedCentroid gx=p.x`; renderers:18-31 | P2 |
| ch1-6-3 | WEAK | Subtractive formula ok in form, but: units "m" wrong (pixels); "S lỗ" area shown linear "m"; G0 drawn at (300,188) while box center ≈326; denom (big−holeArea) can shrink → instability. | behaviors:84-89; scenes ch1-6-3 unit 'm'; renderers:33-49; shot 23 (xG=314 m) | P2 |

## Worst Offenders (root cause)

1. ch1-4-4 — equilibrium sim where the equilibrium quantities never vanish; `residual` is a meaningless `|spatialX−spatialY|/100`. Teaches the opposite of muc-IV-4.
2. ch1-4-1 — two different "resultant" numbers shown simultaneously; force projection labeled in meters. Components are pixel mappings, not ΣFx/Fy/Fz.
3. ch1-1-5 — "force-system reduction" with three fake static force arrows; R and M_O describe a single draggable vector only.
4. ch1-4-2 — spatial moment uses an invented `F·arm·cosα/120` scale and prints the moment readout "MO" in degrees.
5. ch1-3-3 — hinge reaction components hard-coded to 0.55F/0.83F; renderer ignores the Rx/Ry selector and always draws both.
6. ch1-5-1 — friction readout violates its own Fms≤μN inequality (no clamp).

## Common Root Causes

- Ch1 `derived` functions bypass the correct `SimPhysicsStatics` helpers and substitute pixel-geometry heuristics → values are visually plausible but physically wrong / unit-inconsistent.
- Renderers draw fixed decorative vectors (ch1-1-5 F1-3, ch1-2-6 Rx/Ry, ch1-3-3 Ax/Ay) that don't track the derived model → diagram contradicts the readouts.
- Unit handling: pixel magnitudes printed as N / m / N·m without scaling (ch1-4-1, ch1-4-2, ch1-6-3).

## Recommended Fixes (priority)

- P0 ch1-4-4: drive ΣF, ΣM, residual from `checkEquilibrium()` over a real force list that the user balances; show →0.
- P0 ch1-4-1: single resultant via `spatialForceComponents`/vector sum; one |R|; fix projection units.
- P1 ch1-1-5: make F1,F2,F3 live vectors and compute R,M_O with `reduceToResultant()`.
- P1 ch1-4-2: use `spatialMoment` + dot with axis unit `e`; print M in N·m, not degrees.
- P1 ch1-3-3: derive Ax,Ay from ΣF=0 of load P; renderer must hide the zeroed component per selector.
- P1 ch1-5-1: clamp Fms=min(applied,μN) (as ch1-5-2 already does) or show "trượt" when exceeded.
- P2 ch1-6-2/6-3: keep G computed from areas (drop drag-overrides-centroid); fix m/px units; guard denom.

## Unresolved Questions

- Is `statics-routes.js`/`SimStatics` adapter still loaded anywhere (other entry pages) or fully dead? If live elsewhere, those sims need separate review.
- Are pixel-as-Newton concept diagrams (ch1-1-3) acceptable pedagogically, or should readouts carry a px→N scale? Needs author decision.
- ch1-6-2 drag-to-set-centroid: intentional "explore" affordance or bug? Confirm intended UX.
