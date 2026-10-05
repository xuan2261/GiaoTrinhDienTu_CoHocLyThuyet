# Chapter 2 U1 implementation and verification

Date: 2026-10-03 UTC. Source scope: all seven `js/sim2/sims/ch2/` routes and their five `js/sim3/sims/ch2-*-3d.js` adapters. This is an upgrade record, not a repeat claim for the repaired IC, projectile framing, belt speed or camera defects.

## Evidence and boundaries

- Added `tests/sim-upgrades-ch2.test.js`: 13 deterministic integration/oracle tests. They execute production Sim2 routes/physics/clock and real vendored Three r160 math, geometry, scene graph and mode-toggle code. DOM, canvas drawing and WebGLRenderer are stand-ins.
- Fail-before evidence: `ch2-before.log` records 7 failing route upgrade tests before implementation; `ch2-3d-before.log` records 2 failing new adapter tests (missing acceleration vectors and the sector's old angle). The existing exact-toggle contract already passed that intermediate run and is not claimed as a new route failure.
- Pass-after command: `node --test tests/sim-upgrades-ch2.test.js tests/sim2-audit-repairs.test.js tests/sim3-audit-regression.test.js`: **37 passed, 0 failed**. Log: `ch2-after.log` in this work session's evidence directory.
- This verifies CPU/source contracts, not actual pixels, browser interaction, screen readers, touch, GPU timing, GPU memory or WCAG acceptance. Q0 remains pending. In particular, added readout rows/labels need real narrow-screen and 200/400% zoom checks.
- No commits, push, deployment, dependency upgrades or WebGPU changes are part of this scope.

## Common contract used

- Existing range controls now also receive the parent's paired numeric control. Phase and IC inputs live outside the hidden 2D scene, so the same controls work in either mode.
- Production `Sim3Mode` receives the existing Sim2 state and stores an immutable copy; adapters neither advance time nor mutate it. The new suite mounts every paired Ch2 adapter through that production toggle and checks every SI state field after **20 full 2D→3D→2D cycles per route**, including nonzero physical time and a seam-adjacent phase. This is CPU DOM integration, not browser evidence.
- Parameter changes on all four animated Ch2 routes now stop playback and restart physical time at zero. Reset preserves the chosen experiment parameters; it does not silently restore defaults. Display-only toggles retain time/state. Geometric reset actions explicitly restore the indicated initial geometry.
- Exact projectile event seeking uses the parent's `shell.seekTime`. `shell.stop` also synchronizes the play button through the parent's shared-core change. End-state step presses remain at the exact endpoint.
- Units, signs, assumptions and display scales are presented in route readouts/theory. Capped arrows never feed physical readouts or analytical comparisons. No force, energy or transient dynamics is invented for a purely kinematic model.
- Shared pointer cancellation, keyed panels, current-state announcement and immutable bridge work belong to the parent core changes. This chapter adds its own meaningful projectile event announcements, emitted once on actual touchdown or explicit event selection, never per frame.
- U2 CSV/preset export with provenance, general plot/timeline infrastructure and new physical models remain deferred; no incomplete CSV export is presented as implemented.

## Route-by-route roadmap accounting

### ch2-1-1 — ideal projectile (Sim2 only)

**U1 implemented:** x/y, vx/vy, ay, speed, flight duration, range and physical time; explicit gravity/no-drag/sign convention; trajectory scale and vector scale/cap text; current cap indication; exact touchdown clamping and pause with retained result; explicit apex, touchdown and replay controls; named ascending/apex/descending/touchdown phase; explicit parameter-reset semantics; bounded trajectory samples on fixed 1/60-second physical-time spacing. Analytical velocity/acceleration replace nested finite differences for this exactly solvable model. Caption explains complementary launch angles and downward acceleration at the apex.

**Tested:** 9 v0/angle combinations against flight/range/apex equations, exact clock seek, repeated endpoint steps, replay, parameter pause/reset and event-only announcements. Existing R2D-07 coverage still checks 12 parameter pairs × 101 trajectory samples including immediately before touchdown. Independent x/y/v readouts use ≤0.00051 tolerance solely for 3-decimal presentation; exact clock endpoint uses 1e-9. Zero altitude at touchdown is set explicitly rather than allowing floating-point residue.

**Deferred/Q0:** actual near-touchdown stroke/arrowhead/label clipping, touch and AT. The review did not specify a separate projectile U2 physical model; no air drag, launch-height or extra force model was added.

### ch2-1-3 + Sim3Ch213 — ellipse/Frenet frame

**U1 implemented:** range plus numeric phase 0–360°, accessible from 3D; normalized drag phase across the atan2 seam; phase reset; SI convention a=4 m,b=2.5 m, θ=(1 rad/s)t; τ/n explicitly dimensionless unit directions, with n identified as the principal normal rather than the whole acceleration; speed, signed tangential acceleration, normal acceleration, total acceleration, point, R and κ readouts. Optional fixed 2D scale versus auto-fit is named as 2D-only. Ellipse samples are cached, and its SVG path is rebuilt only when display scale changes. Radius label is attached to the midpoint of its radius line in 3D; the repaired camera fit remains unchanged.

**Tested:** all four quadrants, 359°/360°/0° seam, independent analytic derivatives and R=|v|³/10, τ·n=0, aτ/aₙ and center-distance equality. R(0)=1.5625 m and R(π/2)=6.4 m. Existing S3-05 full-geometry frustum/resize suite remains green. Phase aria-valuetext uses the real core `valueText` API. Exact adapter state is retained across toggles.

**U2 implemented in bounded form:** κ=1/R, a fixed 2D comparison scale and explicit phase selection permit comparison of the two ellipse vertices.

**U2 deferred:** 3D freeze-camera/out-of-frame/refit controls need a deliberate camera interaction contract and actual viewport QA; arbitrary straight-line R=∞ needs a new curve model. The existing finite ellipse radius remains in the adapter's safe range; no fake finite circle is offered as an infinity model. Free orbit was not introduced.

### ch2-2-2 + Sim3Ch222 — fixed-axis rotation

**U1 implemented:** t,R,v=ωR,aτ=αR,aₙ=ω²R,|a|; independent tangential/normal vectors in 2D and 3D with separate toggles that preserve time; signs/direction and explicit uniform-rotation explanation. Both renderers consume the same SI state. 3D derives α×r and ω×(ω×r) from the physical R=3, independent of the display disk radius 1.22. Velocity, angular-velocity and acceleration scales/caps are stated separately; current 2D/3D cap readouts identify shortened components. Zero velocity/acceleration arrows are hidden.

**Tested:** 3 ω0 × 3 α × 3 times, including uniform rotation, zero initial speed and t=10 s; v⊥r and aτ⊥aₙ; exact αR/ω²R; display cap predicates; component toggles; production 3D vector direction/magnitude/zero visibility, with actual Three math; parameter reset/pause and mode state retention. Existing arrow length and adapter resource/demand-render tests still pass.

**U2 deferred:** signed ω/α, passage through ω=0, braking presets, φ/ω/α plots, timeline and playback-rate controls. They require a coordinated signed-domain lesson and timeline, not a silent enlargement of this U1 scope. Named axial/edge camera views also await a shared camera UI/real viewport checks. Existing positive domain remains explicit.

### ch2-3-2 + Sim3Ch232 — gears/open belt

**U1 implemented:** labels distinguish driving/driven radius from tooth count; explicit “3D teeth are illustrative, ratio is by pitch radius”; metres and m/s; signed i12=ω1/ω2 and k21=ω2/ω1 are separately named for gears and open belt; ω1 and equal tangential-speed readouts. New 2D marker traverses the complete open-belt path by physical arc length (wraps and straight spans), with a direction arrow. Source radius controls and marker physics retain the repaired geometry. 3D marks the two gears by role and labels the belt as open. Radius changes restart a paused experiment.

**Tested:** 9 radius pairs including equality and both extreme ratios; reciprocal signed ratios and |ω2|r2=ω1r1. New 2D marker tests independently check path membership and ds/dt=r1ω1 at normal samples and just before/on/after each join for four radius pairs. Existing 3D signed belt no-slip tests, including all joins, remain green. Exact mode state retention remains green.

**U2 deferred:** crossed-belt geometry/selection, signed or zero ω1 control and slow-motion controls. Those require a separately specified geometry/ratio experiment. “Decorative teeth” is disclosed rather than claiming an integer-tooth/module/contact-phase model. Shared/instanced teeth are not added without draw-call evidence. Actual label/crop/marker occlusion and alternative camera views remain Q0/U2 respectively.

### ch2-4-4 + Sim3Ch244 — Coriolis

**U1 implemented:** explicit prescribed radial motion, fixed positive angular-speed convention and all parameter changes restarting paused; independent v_abs, a_rel, a_transport, a_cor and a_abs component readouts in SI. a_rel=−(vmax²/1.5)sin(vmax t/1.5)e_r, a_transport=−ω²r e_r, and their vector sum with a_cor uses physical uncapped values. Text separates the positive kinematic acceleration contribution from the negative fictitious force in the rotating frame. Inward/outward/turning state and left-of-v_rel relationship are named. Both 2D arrows hide at zero. The 3D 90° sector is built from the current v_rel/a_cor directions, including inward speed and signed adapter ω, and hides when the relation has no direction. Scales/current cap flags are explicit; minimum nonzero length floors were removed from these 3D vectors.

**Tested:** 3 ω × 3 vmax × 4 times, including exact radial turning; sum equals an independent central second derivative of p(t) (epsilon 1e-4 s, tolerance 2e-6 m/s²); a_cor·v_rel=0; exact vector-sum and reset semantics. Sector endpoints are tested with real Three transforms at 4 phases × 3 speed signs × 2 ω signs. Existing plane/axis geometry repair tests and all toggle tests remain green.

**U2 already covered mathematically:** the velocity/acceleration decomposition is exposed numerically, as requested in both the Sim2 U1 and Sim3 U2 sections of the roadmap.

**U2 deferred:** simultaneous inertial/rotating camera views, general 3D v_rel parallel to ω, and signed user ω control. The current domain is deliberately planar and positive-ω; negative adapter tests do not claim signed UI support. Trail storage remains explicitly bounded at 400 points; replacing the short array with a ring buffer needs measured benefit and is deferred as a performance optimization, not a physics issue.

### ch2-5-2 — constrained rigid rod/IC (Sim2 only)

**U1 implemented:** numeric A.x and ω controls, geometric reset, physical-coordinate aria-valuetext, explicit input bounds; PA/PB distances and |vA|/|vB|=PA/PB readout; text explains the two normal construction steps and instantaneous rather than permanent hinge meaning. A construction-step action progressively reveals the normal through A, then the normal through B and their intersection; reset restores the complete construction. The existing finite-rotation model and corrected velocities are retained, including IC=A and a hidden zero arrow. The new ω domain is 0.1–0.4 rad/s to retain the existing common uncapped velocity scale and repaired framing; this scope choice is stated in the UI.

**Tested:** A.x endpoints/interior × ω endpoints; |AB| constraint through independent B calculation, (vB−vA)·AB=0, velocity components, PA/PB ratio, IC=A, progressive-guide visibility, reset and actual `valueText` API. Existing 91-point rigid-motion/framing tests and independent kernel translation/rest/invalid-input tests remain green.

**U2 deferred:** named rotation/translation/rest/non-rigid presets and a richer null-reason classification. The kernel can distinguish finite rotation vs null, but the current constrained rotating rod cannot genuinely produce every state. UI does not invent a finite IC for translation or treat an ambiguous null as infinity.

### ch2-5-3 + Sim3Ch253 — rigid velocity field

**U1 implemented:** numeric IC.x/y controls available in 3D; direct zero-sample preset IC=M and reset; metres/m/s, vx/vy and IC readouts; three fixed measurement points with independent uncapped r/vx/vy values; explicit 2D base-dot convention and main/field scale differences for both renderers; current main-vector cap flags and capped-count for all 63 2D samples. 3D also exposes scale/cap diagnostic values and removes the minimum arrow-length floor. IC is explicitly instantaneous and may lie outside the body; zero main arrow is hidden. Drag units use the actual `valueText` core contract.

**Tested:** opposite domain corners, IC=M, default and two ω limits; v·r=0, |v|=|ω|r, raw components and fixed measurement table; zero sample, reset, control labels and exact mode retention. Existing adapter disposal and arrow tests remain green.

**U2 implemented in bounded form:** the zero-at-M preset and fixed sparse measurement table enable radius/speed comparison without changing the underlying model.

**U2 deferred:** user-selected M, signed/zero ω control, selectable density and replacement of the 3D seven illustrative sample locations with a fixed spatial grid. The 2D 9×7 field is already fixed. Existing 3D samples remain illustrative; the independent three-point numeric measurement table is fixed. No instancing was added for seven arrows. Real overlap, small-screen framing and AT direction perception remain Q0.

## Remaining acceptance work

1. Run the final integrated candidate in a real browser/WebGL context, especially all new numeric/actions/toggles, focus/keyboard and retained exact event state.
2. Observe 320/360/768/1280 CSS px and zoom 200/400%, light/dark themes; check the enlarged readouts, captions and 3D labels for clipping or overlap. CPU frustum checks do not include DOM label boxes.
3. Perform real assistive-technology/touch tests for control equivalence and event announcements. Programmatic callback tests do not prove those interactions.
4. Measure, rather than infer, DOM/layout cost, frame-time and GPU/resource behavior. Demand rendering and disposal regressions remain protected, but no measured performance improvement is claimed.
