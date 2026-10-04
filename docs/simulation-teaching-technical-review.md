# Simulation teaching contracts: source and CPU technical review

Date: 2026-10-03 UTC. Baseline: delivered commit `2b87d7a`. Scope: all 25 production Sim2 routes, their displayed quantities, formulas, input domains, reset semantics and `data/simulation-specifications.json`.

This is an automated technical review with executable mathematical checks. It is not a human academic review, learner study, accessibility assessment, browser/WebGL qualification or authorization to publish. Every specification retains `status: draft` and `evidence.verified: false`. The existing historical snapshot and prior acceptance boundaries are preserved.

## Findings and disposition

1. **Underspecified contracts, all 25 routes.** Units previously used the placeholder “SI units where a dimensional quantity is displayed”; most assumptions, boundary checks and resets were generic. That did not distinguish radians from displayed degrees, normalized force ratios from newtons, area moments from force moments, physical state from display scaling, or supported special cases from general textbook formulas. Each record now gives explicit dimensional quantities, assumptions, the actual control ID/domain/step/default, numerical-input policy, parameter-change behavior, reset semantics and at least three route-specific checks.
2. **Formula/domain mismatches.** The old moment expression could suggest a variable force angle; oscillator `F_ext` could suggest an external-force input; general work `Fd cosα` could suggest arbitrary angles or braking; the collision formula did not define the actual restitution solution. These are now restricted to the implemented models. General textbook identities are not necessarily wrong, but are incomplete route contracts without the imposed assumptions.
3. **Calculation provenance.** Every route now explicitly says its outputs are model calculations, not experimental measurements. In particular, work calculates `v2` from `W` and then recomputes `ΔT`: matching `W` and `ΔT` is algebraic consistency. Impulse similarly calculates `v2` from `FΔt/m`. Newton A/B curves and velocity-field sample tables are generated model data. Force/moment residuals reuse solved reactions. They are useful checks, but not independent observations of nature.
4. **Oracle wording.** The production helper is part of the system under test, not an independent oracle merely because it is in a different file from the adapter. Each specification now points to the new route-level independent test suite; older chapter tests are retained as supplemental evidence. RK4 versus a closed-form solution and collision-kernel versus center-of-mass solution are algorithmically separate comparisons of one ideal model, not experimental validation.
5. **Four reset promises were false at baseline.** The static accelerating-frame, action/reaction, impulse and work routes had no reset control despite the generic specification promising one. The coordinated product fix adds explicit default-restoring controls. Specifications and this suite verify the final behavior. This review did not edit those routes.
6. **Signed velocity-field integration.** The coordinated field upgrade now supports `ω∈[-2.5,2.5] rad/s`, reversal and rest. Its final contract states source x-right/y-up, 3D XY and angular axis ±Z. Seen from +Z toward XY, positive ω is CCW. With the model constraint `v(P)=0`, ω=0 means rest and a non-unique IC, not translation. `|v|=|ω|r` is used. This review did not edit the route or adapter.

No additional arithmetic defect was found in the 25 baseline route models over the tested cases. Passing cases below are bounded evidence, not proof over every possible input or duration.

## Independent executable evidence

New file: `tests/simulation-teaching-contracts.test.js`.

- 25 specification/control/provenance contracts, joined to production routes
- 25 mathematical route tests using the production adapters and kernels as the system under test
- Expected results use separately written closed-form mechanics, decoded arrow/graph geometry, force balance or independent trajectory finite differences
- No expected value is obtained by calling the production physics helper, reading a debug “pass” flag or accepting a route's reported ratio as the sole reference
- The recording DOM/render harness does not produce browser pixels, exercise pointer events or measure GPU behavior

Final suite replay against original `2b87d7a` source and original specification: **50 tests, 20 pass, 30 fail, 0 skip**. The failures are **25 absent metadata contracts**, **4 absent static reset actions**, and **1 absent signed-field rest action**. The other 20 mathematical groups pass at baseline. This is not a claim of 30 baseline physics defects.

Final suite against integrated candidate: **50 tests, 50 pass, 0 fail, 0 skip**.

The first run before metadata changes, prior to rebasing this suite to the coordinated product changes, was **25 math pass + 25 metadata fail**. An intermediate run during integration was **45 pass + 5 fail**, correctly catching the newer signed field domain and the four newly added resets against the still-old contracts. Those known integration mismatches were reconciled; they were not ignored or relaxed.

Final receipt files produced in the isolated execution workspace:

- `/tmp/mechanics-teaching-baseline-red.tap`: final suite replay on baseline
- `/tmp/mechanics-teaching-green.tap`: final candidate suite
- `/tmp/mechanics-teaching-spec-before.json`: original specification extracted from baseline

These temporary logs are implementation receipts, not browser artifacts or application runtime assets. Integrated source/evidence catalog hash refresh is a separate packaging step after file freeze; hash freshness does not change any acceptance state.

### Reproduction

From the repository root, with existing Node available; no install or browser needed:

```sh
node --test --test-reporter=tap tests/simulation-teaching-contracts.test.js
```

To reproduce the final fail-before check without reverting or modifying candidate files:

```sh
baseline=$(mktemp -d)
git archive 2b87d7a js/sim2 | tar -x -C "$baseline"
git show 2b87d7a:data/simulation-specifications.json > "$baseline/spec.json"
SIM2_TEST_REPO="$baseline" SIM2_TEACHING_SPEC_PATH="$baseline/spec.json" \
  node --test --test-reporter=tap tests/simulation-teaching-contracts.test.js
```

The second command is expected to exit nonzero with the 30 failures described above. `SIM2_TEST_REPO` selects only the source under test; the executable expectations are the final candidate suite. No baseline assertions are rewritten to force a failure.

## All-route review matrix

“Pass” below means the named CPU/source checks passed, not formal acceptance. Canonical metadata retains more detailed control limits and model assumptions.

| Route | Formula and dimensional meaning | Independent checks and important teaching boundary |
|---|---|---|
| ch1-1-3 | `Fx=Fcosα`, `Fy=Fsinα`, forces N, displayed α in degrees | 3 forces × 3 angles; decode actual arrow components/length. Fixed point O and quadrant I only |
| ch1-1-4 | `M=+Fd`, N·m; d in m is perpendicular arm for upward F | 3 forces × 3 arms; cross product from arrow base and vector. Variable θ is not an input; moment arc is not rotation |
| ch1-1-5 | `R=ΣF`, `Mo=Σ(rxFy−ryFx)` | Default, pure couple, all-zero, mixed forces; fixed application positions and coupled viewport clamps. Reduction table is prescribed input data |
| ch1-1-6 | `M=−50d` N·m, `ΣF=0` | 3 separations × 3 moment origins, calculated from both arrow geometries; CW sign and moment-origin independence |
| ch1-2-3 | Vector addition/cosine law, force N, angle degrees | Nonzero, one-zero, all-zero and perpendicular cases; undefined zero-vector angle. Signed opposing forces still outside this route |
| ch1-1-8 | `RA=P(10−a)/10`, `RB=Pa/10`, forces N | 3 loads × 3 positions; geometry-derived reaction force/moment balance. Residuals reuse solved reactions; beam ends excluded |
| ch1-3-2 | `T=W/(2cosα)`, T/W in N, rope length m | All 71 integer angles; independently obtain cosine from generated rope endpoints and check constant length 3 m |
| ch1-3-6 | `R=P`, load moment `−Pa`, support moment `+Pa` | 3 loads × 3 positions; sign and residual checks. No beam deflection or arbitrary load system |
| ch1-5-3 | `N/P=cosβ`, `Ft_required/P=sinβ`, margin `μcosβ−sinβ`, dimensionless | 9 β/μ pairs plus exact threshold and either side for 3 μ values; decode force-vector sum. Impossible required equilibrium remains a construction, not actual sliding forces |
| ch1-6-3 | Negative area; coordinates m, areas m², first area moments m³ | Four hole-center corners and centered hole; independent first-moment identities. Uniform plate and fixed radius 1 m |
| ch2-1-1 | Ideal projectile with g=9.81 m/s² | 12 parameter pairs; exact apex/touchdown, complementary angles, retained terminal state. Physical readouts do not inherit display caps |
| ch2-1-3 | Prescribed ellipse, analytic derivatives, `R=|v|³/10`, κ m⁻¹ | 8 phases including quadrant/seam cases; reconstruct Cartesian acceleration from tangent/normal components. Unit n is not total a |
| ch2-2-2 | `φ=ω0t+αt²/2`, `at=αR`, `an=ω²R` | 27 parameter/time cases; Cartesian velocity/normal acceleration. Constant speed still has centripetal acceleration |
| ch2-3-2 | Signed reciprocal no-slip ratios; radii m, speed m/s | 4 radius pairs; independently differentiate belt marker at 5 times per pair. Ratio readouts alone do not prove correct marker speed or tooth meshing |
| ch2-4-4 | Prescribed radial motion; full absolute acceleration decomposition | 45 parameter/phase cases; central first/second position differences check v/a. Coriolis acceleration differs in sign and units from rotating-frame fictitious force |
| ch2-5-2 | `vA=(ωBy,0)`, `vB=(0,ω(2−Ax))` | 4 positions × 2 ω; decode arrows, rigid compatibility, IC location and zero endpoint. General translation/rest kernel cases are not this rod UI |
| ch2-5-3 | `v=(−ωry,ωrx)`, `|v|=|ω|r`, signed ω | 6 origins × 5 ω including zero; all sparse samples, reverse/rest/reset actions. Calculated table is not independent measurement; rest has non-unique IC |
| ch3-1-3 | `T=m√(g²+a²)`, `tanθ=a/g`, forces N | a=0/3.25/8; force triangle, cord length, frame selector and default reset. Relative equilibrium only, not transient settling |
| ch3-2-2 | `a=F/m`, `v=at`, `x=at²/2` | 4 force/mass pairs × 3 times, including wrapping and beyond graph window; decode fixed-scale graph and retained A. A/B samples are analytic model values |
| ch3-2-3 | Forces equal/opposite on different receivers, N | F=20/62.5/80; arrow attachment, three body selectors and reset. Internal pair cancellation does not establish either body's equilibrium |
| ch3-3-1 | Unforced RK4 oscillator versus `2cos(√(k/m)t)` | 3 extreme/default parameter pairs at 13.375 periods; numerical state, analytic reference, period and energy. Non-periodic time avoids checking only full-cycle return points |
| ch3-5-2 | `J=FΔt`, `v2=1+FΔt/2`, momentum kg·m/s | 5 force/duration pairs; decode graph slope and shaded physical impulse, equal-J presets and reset. Δp and v2 are model predictions |
| ch3-5-3 | `I=4r²`, `ω=9/r²`, `L=36`, `E=162/r²` J | 5 radii at nonzero phase, saved-state ΔE; halving radius needs +54 J. No radial kinetic energy or actuator dynamics |
| ch3-5-4 | `W=6F`, `v2=√(1+6F)`, energy J | 4 forces; physical shaded area and reset. v2 is predicted from W, so recomputed ΔT is not an independent measurement |
| ch3-6-2 | COM/restitution solution, signed impulse N·s, signed ΔT J | 3 mass pairs × 3 e × before/contact/after; independent COM velocities and propagation. Exact contact snapshot is distinct from live post-impact separation |

## Numerical tolerance and precision

- Rounded readouts are compared within half of their last displayed decimal unit plus `1e-9` arithmetic allowance. Rounded display strings are never substituted into model equations as exact input values.
- Decoded arrow/source-state algebra uses normally `1e-9` absolute tolerance for these SI scales. Geometry recorded by the stand-in is source geometry, not a pixel measurement.
- Belt-marker speed uses a `1e-5 s` difference and `1e-5 m/s` tolerance. Existing dedicated belt-join tests retain their separate broader coverage.
- Coriolis finite differences use `1e-4 s`, with `3e-7 m/s` velocity and `3e-6 m/s²` acceleration tolerances.
- The new oscillator sample is 13.375 periods at steps no larger than `1/60 s`, with position/velocity absolute tolerances `0.0004` in SI and energy `0.00011 J`. These are declared for the tested three-pair matrix. Existing 100-cycle tests and their separately declared tolerances remain unchanged.
- Ch1 static routes deliberately quantize to their implemented steps; friction preserves exact decimals to reach the threshold. Other routes may retain typed decimals even if the slider has a coarser nominal step. A rounded readout is a presentation precision choice, not an additional quantization of physical state.

## Remaining boundaries

The full chapter upgrade records and earlier upgrade roadmap were read and used to distinguish already-delivered corrections from deferred U2 work. This pass does not expand any other physical model. No browser attempt, WebGL launch workaround, package installation, external model call, user-computer access, commit, push or deployment was performed by this review.

Actual browser controls, pixels, narrow-screen/zoom readability, screen-reader/touch behavior, GPU performance/resource behavior, learner effectiveness and a responsible human academic acceptance decision remain unverified. Q0 remains blocked/pending under the existing qualification record. Fresh metadata and CPU results cannot convert those missing observations into acceptance.
