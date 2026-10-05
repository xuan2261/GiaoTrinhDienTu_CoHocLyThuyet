# Chapter 3 simulation upgrades: implementation and evidence

Date: 2026-10-03 UTC. Scope: eight Sim2 routes and their three existing Sim3 adapters. This work is in the isolated upgrade candidate; it does not alter the physics kernels, deploy a site, or assert academic/accessibility/WebGL acceptance.

## Delivered U1 route matrix

| Route | Implemented | Independent evidence | Boundary still open |
|---|---|---|---|
| ch3-1-3, accelerating frame | Explicit relative-equilibrium model; weight P and tension T with common force scales; car/ground FBD buttons outside the 2D viewport; T, Tx, Ty and frame equations; SI-enriched 3D bridge; 3D hides fictitious force in ground frame | a=0/3/8: T=√(g²+a²), Tcosθ=mg, Tsinθ=ma; actual r160 arrow lengths share 0.05 scene units/N; same-state geometry reuse | These are force-diagram selectors, not moving camera/reference-frame animations. Actual WebGL labels and touch/AT pending |
| ch3-2-2, Newton II | Save/clear run A and overlay its measured samples on current run B, with different dash styles; absolutely fixed graph axes t=0–2.8 s and v=0–56 m/s for the full F/m control domain; current t/x/v/a sample and stored A parameters; force arrow identified as symbolic; position wrap/scale explained | F=6 N,m=2 kg,t=1 s gives x=1.5 m,v=3 m/s; F=20,m=1 gives x=10,v=20; graph pixel/world height checked against the same 56 m/s denominator | Intentional change from scrolling graph: after 2.8 s comparison samples stay fixed while physical time/readouts continue. A stores the sampled part of the run when the learner presses save, not a future forecast. No full exported history table |
| ch3-2-3, action/reaction | Accurate force-receiver names and handle ARIA; separate A/B/system force diagrams; +x sign and shared scale; explicitly says only internal forces of A+B cancel, not that either body is in equilibrium | F_AB=−F_BA at 20/60/80 N; diagram selection and receiver semantics checked; no inertial-force helper used to model Newton III | Individual accelerations/external forces are not modeled; actual keyboard/screen-reader interaction pending |
| ch3-3-1, oscillator | Continuous physical time; scrolling 2π-second window with fixed ±2 m scale and absolute time labels; exact dashed x(t)=2cos(√(k/m)t) overlay; v, period, energy, energy drift and absolute position error; one-cycle integrate-and-stop action; bounded 400-sample history | 100 cycles at (k,m)=(1,4),(4,1),(12,0.5), 1/60 s steps plus exact remainder, compared with independent sin/cos solutions and energy formula | One-cycle action calculates then displays the final state; it is not a newly animated “play one cycle” mode. No Euler/damping/forcing model. Browser long-run layout/performance pending |
| ch3-5-2, impulse | Separate SI-scaled p–t and shaded F–t graphs; fixed t=0–4 s,p=0–82 kg·m/s,F=0–20 N axes; m,v1,v2,p1,p2,area J and slope; short/strong vs long/weak equal-J presets (12×1 vs 3×4) | Independent p=mv and v2=v1+Ft/m; 12 Ns cases give identical v2; plotted endpoint coordinates reflect actual t and p, not per-run normalization | Only positive, constant forces. v2 is a model prediction, not a sensor measurement. Variable force profiles deferred |
| ch3-5-3, angular momentum | SI unit kg·m²/s; rotational energy and work from r0=3 m; saved radius/inertia/angular-speed/energy comparison; radius 3 and 1.5 m presets; semantic radial keyboard point mapping at current angle; visible SI energy in 3D | r halved: I/4,ω×4,E×4,L constant; phase unchanged by radius edits; physical radial mapping and geometry reuse; E=162/r² J independent of display scale 0.62 | Radius is prescribed instantaneously between steady states. Radial motion/energy and actuator dynamics are explicitly outside the model; camera/AT pending |
| ch3-5-4, work/energy | m,v1,predicted v2,T1,T2 readouts; fixed-scale shaded F–x area (0–6 m,0–15 N); stated same-direction constant force/no resistance assumptions | v2=√(1+6F),T1=1,T2=1+6F,W=6F for F=1/4/15; area coordinates; viewport guard changed from old empty-space crop to graph containment | No orthogonal/negative force preset: θ≠0 and stopping-before-distance require the U2 model below. Predictive v2 is identified honestly |
| ch3-6-2, collision | Before/contact/after event controls at 1.70/1.75/1.80 s; optional pause exactly on impact (off initially); phase and physical time shared with 3D; one-shot announcements on impact/event selection/reset/end-of-lane (none per frame); before/after/current velocities, signed impulses and signed kinetic-energy change; independent analytic loss; stop at visible lane edge and retain result; reset explicitly replays | e=0/.7/1; t_hit=1.75; independent v′ and J formulas; exact contact snapshot; actual fixed-step event pause/clock alignment; retained step no-op; fractional dt/1000 reset cleanup existing regressions | “At impact” means contact positions with velocities immediately after the ideal impulse. Default playback consumes the remainder of dt. Only deliberate impact/terminal-event stops shorten a step. Continuous timeline/p/T/J charts and actual DOM/GPU 1000-cycle profiling remain open |

The eight routes use the shared numeric/slider pairing, cached panel/read-current-state control, and robust semantic drag infrastructure supplied by the common-core work. Static routes remain event-driven; no new animation loop or independent 3D integrator was added. Paired 3D readouts use the Sim2 state and preserve the repaired contact metric.

### Numeric and pointer precision

Typed finite decimals are preserved within each control's domain and primary parameter readouts show the actual value (including, for example, a=3.25, F=6.25 and r=1.55). Pointer start/end/cancel and a replayed unchanged point do not change state. A genuine pointer movement snaps to the route's advertised slider lattice (a:0.5, reaction F:5, other F:1, r:0.1); semantic keyboard steps add that increment to the current typed value, including its fractional offset. Drag/key round-off is cleaned to 14 significant digits; repeated snapped state does not redraw. A reviewer-triggered regression was written and failed before this repair, recorded in `../ch3-precision-fail-before.log`; it passes for all five handles afterward. Displayed derived quantities are rounded as indicated by their readout precision; direct editable parameters are not rounded away.

## U2 and U3 disposition, by roadmap row

All items below remain deliberately unimplemented in this U1 stage; no UI implies they are supported.

- Accelerating frame: signed acceleration and a dynamic/transient pendulum require a stated frame, initial conditions and ODE. Ground/car FBD selection is delivered, but moving frame/camera comparisons and negative-a UI are not
- Newton II: v0, F=0/negative, optional friction, history CSV and replayable presets require an extended model/schema and domain tests. Existing fixed force/mass domain is retained
- Action/reaction: unequal masses and accelerations require explicit external-force assumptions; the current diagram does not infer mA aA or mB aB
- Oscillator: Euler-vs-RK4 experiment, damping and forcing remain separate future lessons; no speculative integrator selector
- Impulse: piecewise/triangular F(t) profiles need independent quadrature/closed-form impulse oracles. Equal constant-impulse presets are delivered without changing the force model
- Angular momentum: smooth r(t), radial kinetic energy and actuator work require a separate time-dependent constrained model. The present work only compares steady rotational states
- Work: angle controls/presets 0°/90°/180° and resistance require W=Fd cosθ plus event-aware stopping when negative work exhausts initial kinetic energy. The current positive collinear model is not relabeled as supporting them
- Collision: a seekable continuous timeline and p/T/J plots require their own event sampling contract. U1 event buttons are delivered and do not pretend to be that full timeline
- Cross-cutting CSV/preset version/hash metadata, freely orbitable cameras, advanced materials, full-body dynamics and WebGPU remain outside this stage

## Deterministic test scope and tolerance

New suite: `node --test tests/sim-upgrades-ch3.test.js` (15 tests). It executes the production route adapters, production physics/clock/overlay and real vendored Three.js r160 math/geometry where relevant. The shell/render recording fixture is not a browser. The three adapter tests replace only shell/DOM/GPU presentation and inspect production geometry/state.

The first eight U1 route tests were authored and run before route implementation: 8 failed/0 passed, for missing A/B/event actions, missing SI readouts/reference curves, and missing model semantics. Log: `../ch3-fail-before.log` in the isolated implementation workspace. After implementation and added adapter/clock/handle/event-announcement cases: 15 passed/0 failed, `../ch3-pass-after.log`. These workspace logs are implementation evidence, not application runtime assets.

Oscillator tolerances were written before implementation for the declared 100-cycle matrix: position ≤0.0002 m, velocity ≤0.003 m/s, energy ≤0.001 J; period/time readout ≤0.00001 s. Worst observed at k=12 N/m,m=0.5 kg: |position error|=3.169×10⁻⁵ m, |velocity error|≈0.002275 m/s, |energy error|≈7.594×10⁻⁴ J. These tolerances are for dt≤1/60 s and this parameter/time matrix, not arbitrary integrator settings or all future time.

Other geometric/physical comparisons normally use 10⁻⁷ SI tolerance; rounded scalar readouts use explicit 10⁻⁵ or smaller tolerances. Existing repair tests independently check fractional collision dt at 1/60,0.04,0.07,0.25 s, conserved momentum/restitution and contact snapshots, plus 1000 collision/reset cycles of the recording DOM.

Commands run additionally:

- `node --test tests/sim2-audit-repairs.test.js tests/sim3-audit-regression.test.js`: 24 tests, all pass on the shared candidate at verification time
- `node tests/sim2-ch3-physics.test.js`: 8/8 pass
- `node tests/sim2-visual-physics-regression.test.js`: pass, after replacing only the authorized obsolete work-diagram crop assertion with actual graph containment at F=1/4/15
- `node tests/sim2-no-legacy-physics.test.js`: pass
- `git diff --check`: pass

## Browser and acceptance boundary

Browser attempts did not reach rendering. The dedicated cloud browser returned `net::ERR_BLOCKED_BY_CLIENT` for the candidate localhost fixture. System Chromium launched by the project-native Playwright dependency failed before page creation with `FATAL chrome/browser/process_singleton_posix.cc:297 socket() failed: Operation not permitted (1)`. A sandbox escalation was admitted but had the same failure; attempts stopped. No screenshots, pixel inspection, shader compilation, WebGL, responsive readability, AT, touch, actual DOM/GPU memory or frame-time evidence was produced.

Q0 remains pending. Required next check on a supported environment: all eight routes at 320/768/1280 CSS px in light/dark themes; all new native actions and paired numeric controls; every physical handle at min/max and rotated radial positions; reduced-motion and 200/400% zoom; new graph tick/title intersections and small-screen readability; three 2D/3D toggles preserving state/control availability; exact-impact pause/continue/replay; 1000 actual DOM/GPU cycles after warm-up. Do not convert a CPU pass or an unchanged geometry UUID to a visual, performance, accessibility or formal acceptance claim.
