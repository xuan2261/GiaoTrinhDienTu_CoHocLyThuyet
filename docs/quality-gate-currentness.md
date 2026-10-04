# QA-01: current metadata is not acceptance

The 2026-10-02 repair invalidates current Sim2 and Sim3 verification. Completed
historical plans and their artifacts remain unchanged. Original specification
and review documents are retained byte-for-byte in the content-addressed paths
named by each current document's `historicalSnapshot`.

## Refresh after source freeze

After rebuilding chapter/quiz outputs, page bundles, search and the content
manifest, run from the repository root:

```sh
python tools/refresh_quality_metadata.py --write --include-academic
node tools/sim-validation/validate-simulation-drift.js
python tools/academic_review.py --strict-current
node --test tests/simulation-specification-contract.test.js tests/sim3-pedagogical-review-contract.test.js tests/simulation-drift-validation.test.js tests/simulation-current-revalidation.test.js tests/simulation-documentation-contract.test.js
python -m unittest tests.test_quality_metadata_refresh tests.test_academic_review_ledger
```

The refresh command updates 300 quiz question hashes and existing simulation
source, helper and catalog byte hashes. It does not remap question identities or
change learning outcomes. It sets all 25 Sim2 specifications and 10 Sim3 reviews
to draft and resets current runtime review to pending. The optional academic
step rebuilds the inventory with every academic status pending; it refuses to
run if independent academic signoffs exist, because those require explicit
reconciliation. Academic signoffs, old reviewer wording and historical browser
captures are never rewritten into current approvals.

`freshness.metadataRefreshedOn` dates only byte-currentness. The older `checkedOn`
field is retained for provenance and does not date a new review. The source
catalog is a list of referenced files, not a record of newly executed tests.

## Acceptance remains a separate gate

These commands are expected to fail until the missing work is actually done:

```sh
node tools/sim-validation/validate-simulation-drift.js --require-verified
python tools/academic_review.py --strict-current --require-accepted
python tools/validate_accessibility_review.py --require-complete
```

The runtime gate now additionally requires `data/simulation-current-revalidation.json`.
Its pending record is not completed by the refresh utility. Verified state needs:

1. A current complete-source hash from
   `node tools/sim-validation/source-snapshot.js`, covering runtime JS, CSS,
   fragments, Three.js, tests, simulation validation/capture/probe tools and the
   named manifests, quizzes and specification/review metadata
2. A separate current evidence manifest, never the historical phase-11 manifest,
   bound to the same source hash and with a capture timestamp
3. All nine existing objective, visual, soak, capture, contact-sheet, interaction
   and baseline artifact types, each hash-valid and carrying the current source
   hash, observed time, passed result and concrete execution environment; the
   soak receipt must report at least three integer retry-free runs
4. An explicit technical reviewer identity, role, acceptance decision, timestamp
   after evidence capture and matching source hash

Use the exported `sourceSnapshot(root)` function to bind evidence to the exact
candidate, including any staged metadata state. Do not change scoped files
between capture, review and final validation. A subsequent source edit, addition
or deletion invalidates the receipt even if individual metadata hashes are
refreshed. A reviewer must rerun and examine the required evidence before
issuing a new receipt. The gate checks evidence bindings, completeness and
review assertions; it cannot authenticate a person's identity or prove the
truth of a manually authored assertion. The synthetic accepted receipts in
unit tests exercise schema/state transitions only and are never runtime proof.

No new WebGL, browser visual, accessibility or independent academic acceptance
was performed by this repair. Real review and browser execution remain required.

## Other evidence registries

Do not edit `data/evidence-registry.json` hashes or old captured logs to make
traceability appear current. Run the canonical evidence-capture workflow on
frozen sources, preserving historical logs first. A stale traceability result is
an honest blocker. The metadata refresh utility intentionally does not touch
that registry, independent signoffs, historical plan status or capture dates.

### Current execution payload contract

The wrapper manifest alone is insufficient. Fresh wrappers around byte-identical
historical files are explicitly rejected, including a renamed historical manifest.
Current capture and probe JSON must internally contain `sourceHash`, `runId`,
`status: "passed"`, `environment` and `generatedAt`, matching the artifact entry's
source, run ID, environment and `observedAt`. Existing image/route run bindings
and all file digests are still checked. Current capture/probe validation uses the
real clock and requires evidence within 24 hours; historical validation uses the
historical capture date only to check that the archive is structurally intact.

Current objective/visual/soak logs must begin with `simulation-run-evidence: `
followed by one JSON object with the same fields plus `command`, `startedAt` and
`exitCode: 0`, followed by the actual `--- stdout ---` section. The exact commands
are the existing `test:sim:release`, `test:sim:release:full` and
`test:sim:release:soak` scripts. A soak payload includes `retryFree: true` and a
`runs` array of at least three distinct UUIDs, with each run's source hash,
`npm run test:sim:release` command, start/completion timestamps and zero exit code.

Contact-sheet HTML embeds a JSON script with exactly
`type="application/json" id="simulation-run-evidence"`, containing the same run
metadata and `captureManifest: {path, sha256, runId}` bound to its matching capture
artifact. The current visual-baselines artifact is a separate JSON execution
report with those run fields and a `files` array matching the wrapper's baseline
files; the old baseline test source file is not a current execution report.

Execution must precede the manifest, and the manifest must precede reviewer
acceptance. Instrument the actual execution/capture runner to emit these fields
from the frozen source at execution time. Existing historical producers and
artifacts must not be retroactively stamped. This repair supplies validation and
synthetic negative/positive fixtures, not new browser runs or a completed
source-bound browser evidence producer. That producer and real runtime capture
are required before current acceptance can be completed.
