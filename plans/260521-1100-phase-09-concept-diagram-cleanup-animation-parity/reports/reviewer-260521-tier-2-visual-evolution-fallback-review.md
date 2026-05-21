# Reviewer Report - Tier-2 Visual Evolution Fallback

## Scope

- Files reviewed: requested Phase 9 spec/config/updater/baseline/package/docs/plan files.
- Focus: no-dependency JSON fallback, baseline update workflow, docs accuracy, plan status.
- Scout findings: updater relies on failing Playwright run to seed missing baselines; spec writes results before throwing failures; docs still contain PNG/pixelmatch plan text.

## Findings

### High

- `tools/update-visual-evolution-baseline.js:39-51` accepts any failed spec run if `visual-evolution-results.json` exists. `tests/sim-canvas-pixelmatch.spec.js:77-82` writes that results file before throwing lower-bound or baseline-drift failures. A real animation-off or large drift regression can therefore be normalized into the reviewed baseline by running the update script, with exit 0 and only an "updated" message.
  Fix: add explicit capture/update mode, or only tolerate failures that are proven to be missing-baseline bootstrap. Validate route count and fail loudly on lower/upper/drift failures unless an intentional `--accept-drift` style flag is passed.

### Medium

- `plans/.../phase-09-backlog-visual-baseline-pixelmatch.md:39-83` still states the implemented artifacts are PNG snapshots, 80 PNG files, `pixelmatch/pngjs`, and pixelmatch deltas. The completion note at `:95-119` corrects this, but the same completed phase file still contains contradictory requirements/architecture/steps.
  Fix: rewrite the phase body to mark the PNG/pixelmatch path as rejected/obsolete, and make JSON `getImageData` baseline the actual requirements/architecture.

- `docs/project-roadmap.md:34` says the Phase 09 baseline has "58 routes / 0 defects / 0 drift" while the tier-2 visual evolution baseline file contains 24 animated routes. The 58-route number belongs to the engine-time sweep, not the tier-2 JSON baseline.
  Fix: split wording: engine sweep covers 58 routes; tier-2 JSON fallback covers 24 animated routes.

### Low

- `plans/.../plan.md:4` has frontmatter `status: in-progress` while phases 1-10 are listed complete at `:50-59`, including backlog Phase 9 and 10. This is inconsistent status metadata for automation/readers.
  Fix: update plan status to completed/complete if the plan is closed, or keep backlog phases non-complete if closure is not intended.

- `docs/code-standards.md:252` still says `test:sim:browser` is 173 tests and lists only the older four Playwright specs. `package.json:15` now includes canvas-evolution and static-route no-play specs, and changelog claims 197/197.
  Fix: refresh this note or remove exact test count.

## Positive Observations

- No `pixelmatch`/`pngjs` dependency was introduced; `package.json` keeps only `@playwright/test`.
- Baseline JSON route set matches `VISUAL_EVOLUTION_ROUTES`: 24 expected, 24 present, no missing/extra routes.
- Spec fails missing baseline entries instead of silently passing them.
- Lower-bound t0->t3 evolution and t3 baseline drift checks are present.

## Checklist

- Concurrency: no shared runtime state introduced; updater artifact overwrite path reviewed.
- Error boundaries: updater failure handling has accepted flaw above.
- API contracts: package scripts and docs checked against implemented files.
- Backwards compatibility: no runtime dependency or public runtime contract changed in reviewed files.
- Input validation: no external user input path in reviewed code; filesystem paths are fixed repo paths.
- Auth/authz: not applicable.
- N+1/query efficiency: not applicable.
- Data leaks: no PII/secrets observed.
- Fact-checked: file paths, route counts, dependency claims, and plan/doc claims grep/read verified.

## Status

DONE_WITH_CONCERNS
