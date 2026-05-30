# Ch3 Dynamics Sim Audit — Physics Correctness & Theory Fidelity

Date: 2026-05-30
Scope: 16 canonical Ch3 routes. Read-only audit.
Method: verified shared math (`js/sim-physics-dynamics.js`), per-route onTick/derived behaviors, renderers, theory HTML, and screenshots (`plans/reports/260530-sim-review-capture/sim-only/`).

## Executive Summary

- 9 GOOD, 6 WEAK, 1 BROKEN.
- Shared physics module formulas are correct (RK4, restitution, momentum, I, torque all verified).
- Most defects are in per-route wiring, not the math library: visual/equation mismatch (ch3-3-2), fake/unit-inconsistent momentum display (ch3-6-2), missing conservation teaching (ch3-5-3), misleading vectors (ch3-5-1), unphysical fudge terms (ch3-5-2), renderer/behavior desync (ch3-4-2), missing oblique case (ch3-6-3).
- Newton-law family (ch3-1-2..ch3-2-5), spring RK4 (ch3-3-1), D'Alembert (ch3-4-1), work-energy (ch3-5-4), collision solver math (ch3-6-3) are physically sound.

## Verdict Table

| Route | Verdict | Issue | Evidence (file:line) | Severity |
|-------|---------|-------|----------------------|----------|
| ch3-1-2 | GOOD | a=F/m, integrated v,x correct | behaviors:32-38 | — |
| ch3-1-3 | GOOD | F*=-m·a_frame, correct sign, static concept diagram | behaviors:40-45; renderers:39-43 | — |
| ch3-2-1 | GOOD | ΣF=0→v=const; Fnet=F·cosα via slider; status flips at Fnet<1 | behaviors:47-55; newton-renderers:48-71 | P2 (decorative F₂ arrow not a real force) |
| ch3-2-2 | GOOD | a=F/m, v(t) line grows correctly | behaviors:57-63; newton-renderers:75-92 | — |
| ch3-2-3 | GOOD | F_AB=-F_BA; a1=F/m1, a2=-F/m2 (equal force, unequal accel) | behaviors:65-71 | — |
| ch3-2-5 | GOOD | F+F*=0, F*=-ma shown both panels | behaviors:73-80; newton-renderers:110-122 | — |
| ch3-3-1 | GOOD | RK4 SHM dv=-(k/m)x; energy conserved (T+V=6.4J verified screenshot) | behaviors:82-93; phys:78-87 | — |
| ch3-3-2 | BROKEN | 3-spring visual (wall-m1-m2-wall) but eq models only the single middle spring; wall springs unmodeled; uses Euler not RK4 | behaviors:95-111 (a1=k/m1·(x2-x1)) vs spring-renderers:87-107 (draws 3 springs) | P1 |
| ch3-4-1 | GOOD | F+F*=0, F*=-ma | behaviors:113-119; spring-renderers:119-132 | — |
| ch3-4-2 | WEAK | a(t)→F=ma relation correct but renderer uses sin(2t)/ω=0.5² while behavior uses sin(0.5t)/ω=0.5 — displayed a,F desync from animated curve | behaviors:121-126 vs spring-renderers:137-138 | P2 |
| ch3-5-1 | WEAK | m·a_CM=ΣF correct numerically, but ΣF_ext and a_CM arrows drawn non-parallel (a_CM must ∥ ΣF); orbiting masses are decorative, not force-driven | theorem-behaviors:25-32; theorems-renderers:43-44 | P2 |
| ch3-5-2 | WEAK | J=Δp correct in readout, but renderer pAfter=pBefore+J·min(1,t/4)+0.25·F·t grows unbounded (unphysical fudge), inconsistent with derived pAfter=pBefore+J | theorem-behaviors:34-39,117-121 vs theorems-renderers:65-66 | P2 |
| ch3-5-3 | WEAK | L=Iω correct, but section core is bảo toàn mô men động lượng (eq 3.31/3.32) — NOT demonstrated; I, ω, r are independent sliders (physically I=mr²), so geometry/I inconsistent; result panel renders empty | theorem-behaviors:49-53; theorems-renderers:85-107; theory muc-V-3.html:1255-1442 | P1 |
| ch3-5-4 | GOOD | SHM T+V=½mv0² const (verified analytically, ω0²=k/m) | theorem-behaviors:55-63 | P2 (renderer also labels V=mgh, mixing spring/gravity) |
| ch3-6-2 | WEAK | Collision impulse math correct, BUT b.x+=vx treats vx as px/frame yet labels p as kg·m/s (unit-fake); setCollisionMomentum sets pBefore==pAfter every tick so display always "conserved" even though wall bounces flip vx and break system momentum | theorem-behaviors:65-95 (line 69 b1.x+=b1.vx; line 75 p0,p0; lines 70-73 wall flips) | P1 |
| ch3-6-3 | WEAK | restitutionVelocity correct, momentum conserved (verified), but objective requires đàn hồi/mềm/**xiên** — only 1D head-on implemented, oblique missing | theorem-behaviors:97-103; phys:138-144 | P2 |

## Detailed Findings (WEAK + BROKEN)

### ch3-3-2 — BROKEN (P1): equation/visual mismatch
Renderer draws three springs: wall→m1, m1→m2, m2→wall (`spring-renderers:87-107`). Equations of motion only model the middle spring:
`a1=(k/m1)(x2-x1)`, `a2=(-k/m2)(x2-x1)` (`behaviors:98-99`). The two wall springs store no force and are never integrated. Internal forces cancel (m1·a1+m2·a2=0) which is consistent with a single connecting spring, but contradicts the drawn boundary springs that visibly stretch. Student sees a 3-spring system obeying 1-spring dynamics. Also uses forward Euler (energy drifts) instead of RK4 used in ch3-3-1.

### ch3-6-2 — WEAK (P1): fake conservation + wrong units
`b1.x += b1.vx` (`behaviors:69`) advances by vx pixels per frame, so vx is pixels/frame, yet momentum is reported as "kg·m/s" (screenshot: p=(5;0)). Each tick `setCollisionMomentum(state,p0,p0,0)` (`behaviors:75`) forces pBefore==pAfter and residual 0 — so the panel claims perfect conservation unconditionally. But wall reflections (`behaviors:70-73`, `b1.vx*=-1`) change system momentum between collisions; the always-equal display masks this. The genuine ball-ball impulse resolution (`behaviors:82-92`) is correct (j=-(1+e)·vrn/(1/m1+1/m2)).

### ch3-5-3 — WEAK (P1): conservation not taught, inconsistent geometry
Theory muc-V-3.html establishes L=Jω and conservation (eq 3.31/3.32) as the section's payload. Sim only computes scalar L=Iω (`behaviors:49-53`) and animates a point mass at fixed r=60. No conservation scenario (e.g. change I → ω adjusts to keep L). I, ω, r are independent sliders although for the drawn point mass I≡m·r²; the displayed L=Iω is therefore disconnected from the drawn radius/velocity. Result panel ("MÔ MEN ĐỘNG LƯỢNG") renders empty in screenshot 49.

### ch3-5-1 — WEAK (P2)
m·a_CM=ΣF_ext computed correctly (`theorem-behaviors:25-32`, aCM=F/Σm). Renderer draws ΣF_ext arrow and a_CM arrow in different directions (`theorems-renderers:43-44`); physically a_CM∥ΣF. Orbiting point masses are decorative, not produced by the force.

### ch3-5-2 — WEAK (P2)
Readout J=Δp is correct. Renderer momentum bar uses pAfter=pBefore+J·min(1,t/4)+0.25·F·t (`theorems-renderers:66`); the 0.25·F·t term grows without bound and is unphysical, diverging from the derived pAfter=pBefore+J.

### ch3-4-2 — WEAK (P2)
F=ma relation fine. Behavior a=-ω²sin(ωt)·10 with ω=0.5 (`behaviors:122-125`); renderer recomputes a=-0.5²·sin(2t)·10 (`spring-renderers:138`). Different frequency → animated curve and displayed a/F values disagree.

### ch3-6-3 — WEAK (P2)
1D restitution solver correct and momentum-conserving. Objective demands oblique (xiên) collision too; not implemented (no 2D/angle input).

## Recurrence Prevention
- Add an invariant assertion harness: each collision route should assert |p_after−p_before|<tol from the SAME state used for rendering, not a re-seeded copy (fixes ch3-6-2 class of fake conservation).
- Equations-of-motion and rendered geometry should derive from one shared config object (fixes ch3-3-2; would also catch ch3-4-2 desync).
- Use the shared `rk4Step` everywhere an ODE is integrated (ch3-3-2 still on Euler).
- Conservation-law routes (ch3-5-3) need a control that varies I and shows ω responding at constant L.
- Tie displayed units to integration units (scale vx by dt and a px-per-meter constant) so readouts are physically labeled (ch3-6-2).

## Unresolved Questions
- ch3-5-3 / ch3-3-2 empty side panels: is this a DOM-math overlay rendering failure on the capture environment, or are the labels positioned off-canvas? Needs a live browser check (could not confirm from static screenshots).
- Is oblique collision (ch3-6-3 "xiên") intended for a separate route, or expected within ch3-6-3? Objective text implies the latter.
