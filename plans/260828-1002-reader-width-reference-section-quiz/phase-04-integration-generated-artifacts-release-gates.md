---
phase: 4
title: "Đồng bộ artifacts, tài liệu và release gates"
status: completed
priority: P1
effort: ""
dependencies: [1, 2, 3]
---

# Phase 4: Đồng bộ artifacts, tài liệu và release gates

## Overview

Khóa end-to-end behavior sau ba feature phase: tạo RED freshness/integration contracts, chạy chuỗi generator canonical, kiểm file:///HTTP/accessibility/search/release, cập nhật docs/changelog và ghi đúng academic-review boundary.

## Context Links

- [Codebase evidence](./reports/codebase-evidence-and-recommendations.md)
- `README.md:43-56`, `129-135`: DOCX sync/generated policy.
- `docs/code-standards.md:45-62`, `72-99`: generated outputs, state keys and scoped gates.
- `package.json:9-75`: canonical test/build scripts.
- `tools/bundle_pages.py:19-66`: file:// bundle.
- `tools/build_search_index.py:104-178`: manifest-bound search outputs.
- `data/release-policy.json:16-50`: runtime ship list and authoring exclusions.

## Requirements

- Functional:
  - Fresh rebuild yields canonical quiz pages, explicit `window.CHAPTER_SECTIONS`, chapter reference tables, `js/pages.js`, content manifest and search indexes in one documented order.
  - File:// and static HTTP expose identical scope menu/reference/width behavior; saved wide dataset is applied before stylesheet first paint.
  - Search finds curated abbreviations/meanings from current chapter output and rejects stale content-manifest binding.
  - Navigation from reference first-use link updates route, breadcrumb and active sidebar.
  - Docs record the new preference key/early bootstrap, additive schema-v1 reference provenance, quiz scope/last-writer preference semantics and generator commands.
- Non-functional:
  - Generated files are never hand-edited; byte changes are attributable to source/generator inputs.
  - No page-level horizontal overflow at required widths/zoom.
  - No regression to quiz schema/attempt migration, content routes, release allowlist, simulations or PDF.
  - `validate:academic-review`/acceptance state is reported, not forged; independent review may remain blocked.
  - Historical release directories are unchanged; this plan does not mint a release candidate.

## Architecture

Canonical regeneration order:

```text
1. python tools/gen_quiz_pages.py
2. python tools/extract_docx.py --input ... --write
3. python tools/update_nav.py
4. python tools/bundle_pages.py
5. python tools/build_content_manifest.py
6. python tools/validate_content_manifest.py
7. python tools/build_search_index.py
8. python tools/audit.py
```

Ordering constraints:

- Quiz pages exist before `update_nav.py`/bundle consume PAGE_MAP targets.
- Extractor owns chapter index/reference output.
- Nav/catalog must be current before bundle/content manifest.
- Content manifest must be current before search index.
- Academic ledger review runs after final hashes and is not auto-accepted.

## File Inventory

Repository root: `C:/Work/GiaoTrinhDienTu_CoHocLyThuyet`.

| Action | Path | Owner | Test impact |
|---|---|---|---|
| Create | `tests/reader-enhancements-freshness.test.js` | Integration contract | Source/generated/catalog/bundle freshness |
| Create | `tests/chapter-reference-browser.spec.js` | Browser integration | Semantic table, route links, file:///reflow |
| Modify | `tests/accessibility-zoom-reflow.spec.js` | Existing a11y gate | Combined wide/reference/quiz narrow paths |
| Modify | `tests/search-runtime.spec.js` | Existing search gate | Reference term/abbreviation result |
| Modify | `package.json` | QA registry | `test:reader-enhancements` aggregate |
| Modify | `README.md` | Operator entry point | Controls + canonical sync command |
| Modify | `docs/code-standards.md` | Source/generated/state contract | Add module/input/state/gate |
| Modify | `docs/design-guidelines.md` | UI contract | Standard/wide, native scope, reference table |
| Modify | `docs/system-architecture.md` | Runtime/content architecture | Data flows/persistence |
| Modify | `docs/docx-sync-pipeline.md` | Authoring/provenance | Supplemental input and order |
| Modify | `docs/project-changelog.md` | Release history | Added/changed/verified record |
| Generate | `chapters/ch*/index.html`, `chapters/ch*/trac-nghiem.html` | Extractor/quiz generator | Direct HTTP fragments |
| Generate | `js/app.js`, `js/loader.js`, `index.html` nav region | `update_nav.py` | Section catalog/route parity |
| Generate | `js/pages.js` | `bundle_pages.py` | file:// parity |
| Generate | `tools/docx_site_manifest.json`, `tools/equation_report.json` | Extractor | Source tree/equation hashes |
| Generate | `data/content-manifest.json` | content manifest builder | Route/provenance hash |
| Generate | `data/search-index.json`, `js/search-index.js` | search builder | Search/runtime digest |
| Inspect only | `data/academic_review_ledger.json` | academic review workflow | May become stale/pending; never fake |
| Do not modify | `release/*`, `CoHocLyThuyet.pdf`, Sim2/Sim3 source | Outside scope | Regression checks only |

## Function and Interface Checklist

- [X] Freshness test traces quiz source → canonical fragments → PAGES bundle.
- [X] Freshness test traces chapter-reference JSON hash → schema-v1 `source.chapterReference` → chapter output/search binding.
- [X] `window.CHAPTER_SECTIONS` contains exactly current chapter sections and quiz scopes.
- [X] Browser helper opens the same route over `file://`; optional HTTP parity uses existing static-server test pattern.
- [X] Reference table exposes one heading/summary/table per chapter and route-valid hash links.
- [X] Search result points to current chapter route and visible text.
- [X] Aggregate script invokes phase-local gates rather than duplicate test implementations.
- [X] Docs list only commands/files actually present after implementation.

## Dependency Map

- Requires all source and phase-local tests from Phases 1–3 green.
- Regeneration order is sequential and owns the shared generated-file mutation boundary.
- Downstream: content/search/release/acceptance gates consume final hashes.
- No downstream implementation phase; completion evidence feeds cook/ship review only.

## Test Scenario Matrix

| Priority | Scenario | Expected proof |
|---|---|---|
| Critical | Delete/alter generated quiz scope markup/catalog | Freshness gate fails before browser tests |
| Critical | Mutate reference JSON after content manifest build | Manifest/freshness gate fails |
| Critical | File:// Ch1 reference → first-use link | Correct hash route, content, breadcrumb and active nav |
| Critical | File:// Ch1 VI quiz + wide mode + reload | 5-card scope, wide persisted, no state collision |
| Critical | Hai tab làm hai quiz scopes | Last-writer scope preference; cả hai attempt keys/answers còn nguyên |
| High | Reload saved wide at 800px tablet | Dataset set before CSS; compact toggle operable; no first-paint jump |
| Critical | 320px/400% reference + quiz | No document overflow; select/table region operable |
| High | Build twice from unchanged inputs | Relevant generated outputs byte-identical |
| High | Search abbreviation/meaning | Result loads chapter route; index hash matches content manifest |
| High | Static HTTP smoke | Same visible controls/counts/table as file:// |
| High | Release contract | New module/generated outputs included by existing `js`/`chapters` allowlist; authoring JSON not accidentally required at runtime |
| Medium | Theme light/dark and keyboard | Contrast/focus/semantic roles remain valid |
| Medium | Existing PDF/simulation route after wide toggle | Route lifecycle and child caps unchanged |

## Tests Before

1. Add RED freshness test for missing `window.CHAPTER_SECTIONS`, wrong quiz generator target, obsolete duplicate outputs, stale PAGES/reference hashes and missing/stale schema-v1 `source.chapterReference`.
2. Add RED browser tests for chapter reference semantics, hash navigation, file:// table reflow, search discovery and two-tab scope-attempt preservation.
3. Extend combined reflow test to cover early saved-wide bootstrap at desktop/tablet plus scope select and table region at narrow widths.
4. Add aggregate package script only after individual commands are named and RED tests fail for the intended reason.

## Refactor

1. Keep integration tests as contract joins; do not duplicate phase-local unit logic.
2. Reuse build helpers/parsers from current content/search/release tests.
3. Centralize documented regeneration order in README/docx-sync; no second script unless existing command sequence proves non-deterministic.
4. Keep academic review outcome separate from technical pass/fail.

## Implementation Steps

1. Write RED freshness/browser/search/reflow integration tests.
2. Run phase-local gates to prove source changes are green before regeneration.
3. Run canonical generator sequence; stop on first failure and fix source/generator, never generated output.
4. Re-run generation once and compare relevant artifacts for determinism.
5. Run content manifest, bundle and search freshness tests.
6. Run file:// browser flows across all three chapters, plus one static HTTP smoke.
7. Run accessibility, app, quiz, content, search and release contract gates.
8. Run academic review validators; record pending/external blockers accurately.
9. Update README, architecture, design, code standards, sync pipeline and changelog with observed final behavior/commands.
10. Re-run focused aggregate after docs to catch stale path/command claims.

## Tests After

- Add a mutation case for each join that failed during first full regeneration.
- Add an HTTP/file:// parity assertion only if existing loader behavior differs.
- Add a search performance boundary only if reference entries materially change current index metrics; never relax an existing threshold.

## Regression Gate

```powershell
npm run test:reader-enhancements
npm run test:content
npm run test:content-manifest
npm run test:quiz
npm run test:quiz:browser
npm run test:app
npm run test:search
npm run test:accessibility
npm run test:release
python tools\audit.py
python tools\academic_review.py
```

`npm run test:academic-acceptance` is evidence-sensitive and may remain blocked until independent reviewer acceptance. A blocked external gate is reported, never converted into a fake technical pass.

## Todo

- [X] Write RED freshness/browser/search/reflow tests.
- [X] Regenerate all affected artifacts in canonical order.
- [X] Prove deterministic second build.
- [X] Pass targeted file:///HTTP/a11y/content/search/release gates.
- [X] Record academic review boundary without overclaim.
- [X] Synchronize README/docs/changelog and rerun aggregate.

## Success Criteria

- [X] Source, generated fragments, offline bundle, content manifest and search index are mutually fresh.
- [X] Three user flows pass over file://; static HTTP smoke matches.
- [X] No document overflow or inaccessible control/table at tested widths/zoom/themes.
- [X] Existing quiz/content/search/release contracts remain green.
- [X] Docs and changelog match exact final keys, files, generators and commands.
- [X] External academic-review status is explicit; historical releases untouched.

## Risk Assessment

| Risk/assumption | Observable break signal | Pre-decided response |
|---|---|---|
| Generator order creates stale downstream artifact | Freshness/content/search hash test fails after a nominal build | Fix documented order or owning generator; do not patch artifacts |
| Full DOCX extraction changes unrelated generated content | Diff includes non-reference chapter/image changes | Stop; classify DOCX/tool drift, preserve user work, replan if source baseline changed |
| Search index grows/regresses | Existing performance/runtime test exceeds threshold | Reduce duplicate/hidden rendered text, not test threshold or requested reference content |
| Academic ledger invalidated by new hashes | Strict-current reports stale/pending records | Run canonical review update workflow and retain pending state; no fabricated acceptance |
| Release package misses new runtime module | Release contract reports missing script/file | Confirm `js` directory ship-list and script reference; update required path only if release validator needs explicit contract |

## Security Considerations

- Freshness tests ensure authoring JSON is transformed and escaped before runtime.
- Release does not need to ship the curated JSON because tables are pre-rendered; no new runtime trust boundary.
- No external assets, network calls, telemetry, executable author content or secrets.

## Next Steps

After red-team, validation and whole-plan consistency sweep are clean, hand off to `/ak:cook <absolute-plan-path>/plan.md --tdd`.
