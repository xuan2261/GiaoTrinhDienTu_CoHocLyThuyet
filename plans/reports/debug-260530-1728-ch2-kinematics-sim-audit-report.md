# Ch2 Kinematics Simulation Audit — Physics Correctness & Theory Fidelity

Date: 2026-05-30 | Scope: 13 canonical Ch2 routes | Mode: read-only

## Executive Summary

Shared physics module `js/sim-physics-kinematics.js` is mathematically correct (central-difference v/a, `a_n=v²/ρ`, `φ=ω0t+½αt²`, `i=r2/r1`, `a_c=2ω×v_r`, `v_P=ω×r`). BUT route behaviors mostly re-implement physics inline; several do NOT use the verified helpers. One helper (`locateInstantCenter`) is exported but **never called** — the IC route fakes the concept instead.

- 1 BROKEN (P0): **ch2-5-2** instant center is an arbitrary draggable dot, not determined from geometry.
- 4 WEAK (P1/P2): ch2-4-4 (fake `a_e`), ch2-3-2 (inert slider), ch2-1-2 (canned SHM, nothing to sync), ch2-4-1 / ch2-5-1 (abstract / pole not translating).
- 7 GOOD: ch2-1-1, ch2-1-3, ch2-1-4, ch2-2-2, ch2-4-2, ch2-4-3, ch2-5-3.

Note: legacy renderer files (`ch2-rotation-transmission-renderers.js`, `ch2-relative-renderers.js`, `ch2-plane-checker-renderers.js`) and legacy scene files (`ch2-relative-plane-motion-scenes.js`, `ch2-particle-rotation-transmission-scenes.js`) define functions but **never register** — dead code. Canonical wiring confirmed in `ch2-*-renderers.js` + `ch2-kinematics-behaviors-a/b.js` + `ch2-kinematics-scenes.js`.

## Verdict Table

| Route | Verdict | Issue | Evidence (file:line) | Sev |
|-------|---------|-------|----------------------|-----|
| ch2-1-1 | GOOD | Analytic v/aτ/an, ρ from `radiusOfCurvature`, `an=a−aτ` decomposed correctly | ch2-kinematics-behaviors-a.js:31-47,49-67 | – |
| ch2-1-2 | WEAK | Curves hardcoded `54·sin/cos(t)`; ω only scales cursor speed; no moving object to "sync" with (objective unmet). v=ẋ,a=ẍ relations self-consistent | behaviors-a.js:86-93; trajectory-graph-renderers.js:113-117 | P2 |
| ch2-1-3 | GOOD | Circle, τ=(−sint,+cost) & n toward center correct; `an=v²/r`, at=0 | behaviors-a.js:141-156; trajectory-graph-renderers.js:171-172 | – |
| ch2-1-4 | GOOD | Preset trajectory gallery (Tròn/Elip/Parabol); meets compare objective. Minor: dots only, no v/a vectors | trajectory-graph-renderers.js:177-189 | – |
| ch2-2-2 | GOOD | `θ=θ0+ωt+½αt²`, `ω=ω0+αt`; v=ωr tangential, an=ω²r inward, at=αr drawn correctly | behaviors-a.js:170-184; rotation-gear-renderers.js:26-35 | – |
| ch2-3-2 | WEAK | `ω2=ω1·r1/r2` correct, BUT r1 slider range 0–80 (default 50) clamped to [0.56,1.6] → most of slider inert, ω2 barely responds | behaviors-a.js:191-193; scenes.js:159 maxFor(r1)=80 vs clamp behaviors-a.js:113,191 | P1 |
| ch2-4-1 | WEAK | `v_a=v_e+v_r` triangle correct, but abstract vectors only — no moving frame / point shown; objective "thiết lập bài toán trong hệ quy chiếu động" not illustrated | relative-motion-velocity-renderers.js:32-51; behaviors-b.js:42-54 | P2 |
| ch2-4-2 | GOOD | Three panels va/ve/vr with `v_a=v_e+v_r` maintained (vr=va−ve) | behaviors-b.js:55-67; renderers:53-72 | – |
| ch2-4-3 | GOOD | Closed velocity triangle ve+vr=va, correct addition | behaviors-b.js:68-85; renderers:74-91 | – |
| ch2-4-4 | WEAK | Core `a_c=2ω×v_r` magnitude+direction correct (90=2·1.5·30), BUT `a_e` readout is FABRICATED pixel-distance proxy `hypot(px−280,py−180)·ω²/10` shown as m/s²; P never slides (vr is a free vector) → no genuine relative motion vs muc-IV-4 | ac: behaviors-b.js:103-104 (OK); ae FAKE: sim-professional-lab.js:184 | P1 |
| ch2-5-1 | WEAK | `v_B=v_A+ω×AB` displayed correctly (vBA recomputed from rotated geometry), BUT pole A drawn with v_A yet never translates (ax fixed) → pure rotation, inconsistent with translation+rotation theory | renderers ch2-instant-center-plane-motion:42-48; behaviors-b.js:107-118 | P2 |
| ch2-5-2 | **BROKEN** | IC is an **arbitrary user-draggable dot** defaulting to (270,245), NOT located from linkage geometry/velocities. vB⊥IB by circular construction. `locateInstantCenter` helper is **dead code** (never called). Faked core concept "xác định tâm vận tốc tức thời" | behaviors-b.js:126-136; renderers:53-99; helper unused: sim-physics-kinematics.js:300 (only def+export) | **P0** |
| ch2-5-3 | GOOD | v∝r from IC: `v=ω×(P−A)` linear distribution, A as IC (vA=0), perpendicular arrows growing — matches v∝r_IC | behaviors-b.js:140-173; renderers:102-118 | – |

## Detailed Findings (critical routes)

### ch2-5-2 — BROKEN (P0)
`onTick` (behaviors-b.js:126-136): `icX = isFinite(state.icX) ? state.icX : primary.x` — IC initialized to (270,245) and only changes if the user drags it. Bars O-A-B are placed from `theta`, but the IC is **decoupled** from that geometry. `vB = ω×(B−IC)` is then drawn perpendicular to IB *by assumption*. The simulation asserts an IC and draws a consistent velocity, rather than **determining** the IC (intersection of perpendiculars / constraint pin). Screenshot confirms IC floats below the bar, unrelated to the linkage's true IC. The verified `locateInstantCenter` exists but is never wired in. This is the textbook fake-IC failure.

### ch2-4-4 — WEAK (P1)
Coriolis magnitude/direction correct. Two defects: (1) `a_e` readout = `Math.hypot(pointX−280, pointY−180) * ω² / 10` — a meaningless pixel-distance/10 number presented in m/s² (sim-professional-lab.js:184); the screenshot shows `a_e=18`. (2) Point P is static (initial px,py finite, never orbits); `v_r` is a free animated vector, so there is no actual point sliding in a rotating frame as muc-IV-4 (boat/river, rotating slot) teaches. Illustrates the formula but not a mechanism.

### ch2-3-2 — WEAK (P1)
Transmission law correct, but the `r1` slider is configured 0–80 (default 50, unit m) while the behavior clamps `r1` to [0.56, 1.6]. Every slider position ≥1.6 maps to the same r1, so dragging across ~98% of the track produces no change in ω2. Control fidelity broken.

### ch2-1-2 — WEAK (P2)
`x=54sin t`, `v=54cos t`, `a=−54sin t` are hardcoded and self-consistent (v=ẋ, a=ẍ), but they are fixed regardless of any control (ω only changes cursor advance speed, behaviors-a.js:137). There is no moving object to "synchronize" with the graphs, so the stated objective (đồng bộ chuyển động với đồ thị) is only half-met.

## Recurrence Prevention

- ch2-5-2: wire `locateInstantCenter(a,b,va,vb)` (already verified) to compute IC from the two bar-point velocities each tick; remove the draggable-IC shortcut. Add a regression check that IC lies on both velocity perpendiculars (residual≈0) — the diagnostics block at renderers:87-96 already computes `perpendicularResidual` but only when a velocity field is real.
- ch2-4-4: drop the synthetic `a_e`, or compute true transport accel `a_e = ω²·r` in meters; animate P along a radial slot so v_r is the actual relative velocity.
- ch2-3-2: align slider min/max/step with the behavior's clamp ([0.56,1.6]) so the control is monotonic across its range.
- General: add a unit test asserting each behavior's emitted readouts come from the shared physics helpers (catches inline re-implementations and fabricated values like `ae`).

## Unresolved Questions

1. Is ch2-4-4's `a_e` intended to display transport acceleration at all, or is it leftover from a generic derived() shared across families? It is sourced from the global `derived()` (sim-professional-lab.js), suggesting accidental leakage into a kinematics readout.
2. ch2-5-2/ch2-5-3 are marked `static:true` (snapshot, no Play) per a Phase-07 decision — confirm whether an instructor expects IC to be *interactively located* (which would require the geometry-driven fix) or only shown as a static concept.
3. ch2-1-1 parabola uses pixel-space coefficients; readout magnitudes (ρ, an) are in pixel units, not SI — acceptable for a qualitative diagram but inconsistent with the m/s² unit labels. Confirm intended.
