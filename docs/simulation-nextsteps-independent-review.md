# Independent review: validation-first second pass

Date: 2026-10-03 UTC. Baseline: `2b87d7ab57171129a490f069a844649830a48bb3`.

## Review status

Complete against the frozen candidate identified below. **No unresolved P1/P2 findings in the reviewed delta.** One P3 evidence-schema defect was raised and repaired before the final run. All 275 tests in the final independent run passed, with zero failures/skips. This is bounded source/CPU review, not browser, WebGL, accessibility, academic, or formal acceptance.

## Scope and method

- Q0 producer action discovery, collector-owned action sequences and analytic/DOM oracles, receipts, source/run/state/collector binding, and explicit incomplete/not-run outcomes
- Full production Sim2 core/route DOM-host tests for all 25 routes; callback wiring, numeric drafts, companion controls, no-motion handles, mode transitions and disposal
- Signed and zero angular velocity in `ch2-5-3`, its paired Three scene, SI values, reversal symmetry, exact zero states, controls and unchanged geometry/camera contracts
- Technical teaching contracts for 25 routes, including assumptions, units, model domains, independent numerical/geometry checks and draft acceptance status

Review is read-only except this report. Permitted Node/CPU tests are used. No browser launch, browser flags, installation, external model, remote computer, network workaround, or publishing was performed.

## Findings raised during implementation

### R1 — P3, repaired: generated not-run records omitted the required schema version

`tools/sim-upgrade-qualification/core.js` requires `record.schemaVersion === 2`; the three unavailable/failed-operation record constructors in `run.js` initially omitted that property. A replay validator therefore rejects records produced by the same version of the runner with `Record schema version unsupported`.

Repair: the shared `notRunRecord` constructor stamps schema version 2 and protects source/run/collector/version/status fields. All three runtime paths use it. The new regression test checks the unavailable-action, failed-scenario and failed-route shapes and rejects an omitted version. The focused Q0 suite passed 33/33 after this repair. This concerned evidence schema compatibility; no false formal acceptance was observed.

### Integration checks resolved before freeze

- Resolved: signed/rest field actions now have an explicit off-axis signed-field sequence and independent component, speed, direction and sample-table checks
- The teaching contract and mathematical samples now use the signed `ch2-5-3` domain, absolute-value speed and rest/non-unique-IC semantics
- Four newly added chapter-3 static resets are reflected in actual control/reset tests and metadata. The old `resetMode: none` descriptions were removed
- Three existing exact formula-string assertions were updated to the more specific equivalent force/couple/rope contracts, retaining exact assertions and independent mathematical coverage

These were reported while the respective changes were still in progress, not treated as frozen-product defects.

## Independent verification

- Initial combined production-host, signed-field and Q0 tests passed 114/114 on the live candidate at 02:23 UTC; this was preliminary and is superseded by the fixed-source run below
- Independent source inspection confirmed signed velocity `(-ω r_y, ω r_x)`, nonnegative speed `|ω| r`, zero-vector hiding, numerical-control synchronization, exact-zero direction/IC explanations, and the Three label API's returned DOM-node contract
- The signed suite checks the real route/core controls and bridge with vendored Three r160 CPU objects; renderer, DOM, canvas and label test doubles remain explicitly limited and do not constitute pixel/WebGL evidence
- `git diff --check`: clean at the initial inspection
- Additional source changes: four chapter-3 static reset buttons were reviewed (`ch3-1-3`, `ch3-2-3`, `ch3-5-2`, `ch3-5-4`). Independent full-production-host checks changed all numeric inputs plus ground-frame/body-B/equal-impulse choices, clicked Reset, and recovered all baseline readouts and synchronized companion controls on all four routes
- A separate integration probe ran all Q0 action plans against the new **full production core/route DOM host**, rather than the route-only fixture used in the Q0 unit suite. With the same readout trimming as the browser collector, all **25 routes, 61 cases, 133 operations and 1,006 bounded oracle checks** passed. This remains CPU event dispatch and recorded source geometry, not native input or browser capture

### Final commands and outcomes

Run after the product/test/metadata freeze, 02:33–02:34 UTC:

```sh
npm run test:simulation-nextsteps
npm run test:simulation-evidence
node --test tests/sim2-audit-repairs.test.js tests/sim3-audit-regression.test.js
git diff --check
```

| Command scope | Passed | Failed/skipped |
|---|---:|---:|
| Upgrade/core/chapter/metadata/Q0 suites within nextsteps | 92 | 0/0 |
| Full production DOM-host + teaching + signed-velocity suites | 136 (79 + 50 + 7) | 0/0 |
| Specification, pedagogical review, drift and documentation evidence gates | 23 | 0/0 |
| Existing 2D and real-Three CPU repair regressions | 24 | 0/0 |
| Total test cases | **275** | **0/0** |

The command chain exited 0 and `git diff --check` was clean. Npm emitted its environment-level deprecated `http-proxy` configuration warning; no test or source failure resulted.

### Reviewed invariants and limits

- Q0 inventory retains IDs, labels and visibility/enabled observations; missing or ambiguous actions do not become executed evidence. Requested controls, actual committed values, immediate running observation and post-pause state are distinct
- Action receipts bind producer version, run, source, collector, route, operation, baseline and before/immediate/after hashes. Validator recomputation rejects changed oracle pass flags; planned-operation order, state chaining and final screenshot-state binding are checked. Unknown actions remain explicitly `not-evaluated`; bounded DOM checks are not described as pixel proof
- Frozen plan-only execution produced a not-run manifest for 420 default captures. Its test prevented Playwright import and HTTP listener creation. No real input action, PNG or WebGL run was performed by this review
- All 25 technical specifications retain `status: draft` and `evidence.verified: false`. The ten Sim3 review statuses are not promoted by the changed adapter hashes. Calculated force/energy/velocity readouts are explicitly distinguished from experimental measurements; production physics helpers are system-under-test provenance, not the independent expected-value authority
- The 25 teaching mathematical groups independently check force/moment balance, sign conventions, SI quantities, kinematic derivatives, collision COM/restitution, oscillator numerical-versus-analytic state, and physical graph/arrow coordinates. The source models, finite test matrices and declared tolerances limit the conclusion
- The teaching technical report was present and read before this report was finalized. Its fail-before descriptions distinguish missing contracts/features from baseline physics defects. Supporting documentation is excluded from the frozen product/collector/test receipt; this report makes no claim that documentation cannot subsequently change

## Frozen source receipt

Snapshot before: `2026-10-03T02:33:39.402Z`; snapshot after: `2026-10-03T02:34:22.683Z`. All three scope hashes and the combined hash were identical across the final command chain.

| Scope | SHA-256 |
|---|---|
| Product/source manifest, 498 files | `887e06b655981f2a4d3285f68a548b011440352d6e8c4167fb4455d889cdca9d` |
| Five-file collector manifest | `b5cb0f1f871766a7bfcb20962d93867a6f26b8c5c4f0ea9183622f6ef853d942` |
| Focused test/harness manifest, 11 files | `4af7b88a8b31755332ddee6b8c1abf0e80d187858f6176b2a66e1c7064394782` |
| Combined review receipt | `aab2eeb67b33f8c3839db905f0fb153841f9b70e81a3fa5e4a8cadbf29d4c2b0` |

The first three hashes use `sourceSnapshot` from `tools/sim-upgrade-qualification/core.js`: sorted `{path, bytes, sha256}` entries and the collector's canonical JSON SHA-256. Product scope is the unchanged `SOURCE_ROOTS` list, including production code, data, assets, package files and the textbook PDF. Collector scope is `actions.js`, `browser.js`, `core.js`, `run.js`, `server.js` in that tool directory. The combined hash is `hashJSON({source: sourceHash, collector: collectorHash, tests: testHash})`.

Focused test/harness files:

```text
tests/helpers/production-sim2-dom.cjs
tests/helpers/sim2-route-harness.cjs
tests/sim-production-controls.test.js
tests/sim-upgrade-qualification.test.js
tests/sim-upgrades-ch1.test.js
tests/sim-upgrades-ch2.test.js
tests/sim-upgrades-ch3.test.js
tests/sim-upgrades-core.test.js
tests/sim-upgrades-metadata.test.js
tests/sim-velocity-signed-u2.test.js
tests/simulation-teaching-contracts.test.js
```

The focused manifest binds the reviewed new/changed tests and their route harnesses. Additional existing evidence/repair suites executed as noted above; their files are not included in this focused test hash. The receipt establishes byte currentness for the named scopes, not cryptographic authentication of execution or formal acceptance.

## Still pending

Human academic approval, trusted browser input, native range/number sanitization, pointer/touch/AT tasks, real layout/pixels, WebGL/context recovery, GPU/performance/resource evidence, responsive/zoom review and learner effectiveness remain outside this CPU review and remain pending. In particular, negative-ω corner states and added readout/button rows require real narrow-screen and arrow/label-framing review. The known Q0 runtime blocker was not retried or bypassed.
