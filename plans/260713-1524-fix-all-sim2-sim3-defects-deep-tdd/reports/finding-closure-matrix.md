# Simulation finding closure matrix

Status values: `passed`, `blocked`. Every row below is `passed` because its named final command succeeded on the final working tree; Phase 11 evidence records the objective/full/soak gates and binds their concrete visual/probe artifacts.

| ID | Verified baseline or review finding | Fix surface | Regression evidence | Final command | Status |
|---|---|---|---|---|---|
| SIM-01 | Source-text route mentions allowed false coverage confidence | `tests/support/simulation-route-contracts.js`, route truth gate | Contract mutation and executable factory/oracle coverage | `npm run test:sim:contracts` | passed |
| SIM-02 | Slider-crank angle and zero-height potential energy helpers were incorrect | `js/sim2/physics/kinematics.js`, `js/sim2/physics/dynamics.js` | Independent helper boundary tests | `npm run test:sim:physics` | passed |
| SIM-03 | Playback depended on frame frequency and duplicated step paths | `js/sim2/core/animation-clock.js` and route playback wiring | 30/60/120/144 Hz, pause/resume, manual-step contracts | `npm run test:sim:physics` | passed |
| SIM-04 | Sim2 resize, DPR, pointer mapping, keyboard handles, and disposal were incomplete | `js/sim2/core/`, responsive route shells | Narrow/DPR/keyboard/dispose browser matrices | `npm run test:sim:mount` | passed |
| SIM-05 | Legal route domains clipped geometry or corrupted canonical state | affected `js/sim2/sims/ch*/` routes | Mounted route-domain and physics assertions | `npm run test:sim:route-physics` | passed |
| SIM-06 | Collision exit/contact state used wrong direction and stale impact data | `js/sim2/sims/ch3/ch3-6-2.js` | First-tangent contact, immutable impact, reset/exit tests | `npm run test:sim:route-physics` | passed |
| SIM-07 | Sim3 adapters lacked one explicit right-handed coordinate contract | `js/sim3/core/coordinate-system.js`, primitives and script order | Basis, mapping, sign, finite-input mutation tests | `npm run test:sim3:coordinates` | passed |
| SIM-08 | Sim3 owned idle RAF, stale sizing, incomplete fallback, and incomplete GPU disposal | `js/sim3/core/three-shell.js`, label/disposal/toggle modules | Core runtime, lifecycle, fallback, toggle-cycle tests | `npm run test:sim3:core` | passed |
| SIM-09 | `ch1-1-5` force/resultant mapping and moment sign were not independently proved | `js/sim3/sims/ch1-1-5-3d.js` | World-space `r×F` and mapped resultant oracle | `npm run test:sim:route-physics` | passed |
| SIM-10 | `ch1-5-3` incline contact and friction-cone axis/half-angle were inconsistent | `js/sim3/sims/ch1-5-3-3d.js` | Contact normal, `atan(mu)`, downhill slip, disposal cases | `npm run test:sim:route-physics` | passed |
| SIM-11 | `ch2-1-3` tangent-normal curvature geometry was not on one horizontal plane | `js/sim3/sims/ch2-1-3-3d.js` | Radius/tangent/normal orthogonality and sign cases | `npm run test:sim:route-physics` | passed |
| SIM-12 | `ch2-2-2` disk, axis, orbit, ticks, and velocity used inconsistent planes | `js/sim3/sims/ch2-2-2-3d.js` | XZ plane, +Y axis, `v=omega×r` cases | `npm run test:sim:route-physics` | passed |
| SIM-13 | `ch2-3-2` gear/pulley axes and unequal-radius open-belt tangents were incorrect | `js/sim3/sims/ch2-3-2-3d.js` | Contact, signed rotation, tangent continuity/non-intersection | `npm run test:sim:route-physics` | passed |
| SIM-14 | `ch2-4-4` Coriolis vector did not have an independent mapped cross-product oracle | `js/sim3/sims/ch2-4-4-3d.js` | `2*omega×vRel` direction, magnitude, zero/negative cases | `npm run test:sim:route-physics` | passed |
| SIM-15 | `ch2-5-3` instantaneous-center field did not prove `v=omega×r` | `js/sim3/sims/ch2-5-3-3d.js` | IC zero, perpendicularity, magnitude, negative omega | `npm run test:sim:route-physics` | passed |
| SIM-16 | `ch3-1-3` pendulum geometry could change length and inertial-force sign | `js/sim3/sims/ch3-1-3-3d.js` | Constant cord and `-m*aFrame` zero/sign cases | `npm run test:sim:route-physics` | passed |
| SIM-17 | `ch3-5-3` orbit, antipodal masses, and signed angular momentum were inconsistent | `js/sim3/sims/ch3-5-3-3d.js` | Constant radius, right-hand orbit, signed `L=I*omega` | `npm run test:sim:route-physics` | passed |
| SIM-18 | `ch3-6-2` 2D/3D collision lane, radii, contact, impact, velocity, and reset could drift | Sim2 collision bridge and `js/sim3/sims/ch3-6-2-3d.js` | Cross-engine contact/radius/phase/reset assertions | `npm run test:sim:route-physics` | passed |
| SIM-19 | Fixture-only and DOM-only tests did not prove production route and resource behavior | production/lifecycle/responsive Playwright suites | 35-path production navigation, callbacks/resources, narrow DPR matrix | `npm run test:sim:release` | passed |
| SIM-20 | Capture/contact/probe artifacts could be missing, stale, duplicated, or fallback-only without failing | strict capture/contact/probe validators and tools | Adversarial mutation tests plus fresh run-specific artifacts | `npm run test:sim:release:full` | passed |
| SIM-21 | Selective visual baseline had unexplained differences at `ch2-3-2`, `ch2-4-4`, `ch3-6-2` | corrected route geometry and reviewed baseline workflow | Actual/expected/diff triage; snapshot update remains explicit | `npm run test:sim:visual:baseline` | passed |
| SIM-22 | Documentation described older lifecycle, coordinate, fallback, and release behavior | README and `docs/` simulation sections | `tests/simulation-documentation-contract.test.js` plus final review | `npm run test:simulation-docs` and `git diff --check` | passed |

## Guarded paths

The remediation must not modify generated `chapters/`, generated `images/`, `js/pages.js`, the canonical DOCX, or dated `release/` artifacts.

## Evidence

- `../phase-11-evidence.json` binds SHA-256 for objective/full/soak command records, validated Sim2/Sim3 capture manifests and run images, contact sheets, the strict interaction probe, and the selective visual baseline spec/snapshots.
- `../evidence/objective-release.txt`, `../evidence/visual-release.txt`, `../evidence/release-soak.txt` record the executed commands and outcomes.
