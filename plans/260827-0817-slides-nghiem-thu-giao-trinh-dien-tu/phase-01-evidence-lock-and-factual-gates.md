---
phase: 1
title: "Evidence lock and factual gates"
status: pending
priority: P1
date: 2026-08-27
dependencies: []
---

# Phase 01: Evidence lock and factual gates

## Context links
- [Plan overview](plan.md)
- [Repository scout](research/repo-scout.md)
- [Story research](research/story-research.md)
- [Design research](research/design-research.md)
- Next: [Phase 02](phase-02-story-architecture-and-slide-map.md)

## Overview
| Field | Value |
|---|---|
| Date | 2026-08-27 |
| Priority | P1 |
| Status | pending |
| Objective | Freeze every claim, number, visual and artifact status before authoring. |

Research is complete. This phase creates the single factual contract consumed by slide content, speaker notes, visual captions and final review.

## Key Insights
- The requested decision is conditional academic–pedagogical approval, not final institutional release.
- Current acceptance state is `20 pass / 0 fail / 3 blocked / 1 not-run`, therefore `overallStatus=blocked`.
- Actual candidate ZIP bytes are not the bytes described by release summary/evidence.
- Option B PASS applies only to the DOCX dossier, not the open product gates.
- Repository contains no approved logo/crest/emblem asset.

## Requirements
### Functional
- Create `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-source-map.csv` with columns: `slide_id,claim_id,claim_text,source_path,locator,evidence_status,display_label,notes`.
- Record all author names, roles, product counts, gate states, candidate identifiers, hashes, runtime findings and visual provenance.
- Mark each claim `confirmed`, `bounded`, `blocked`, `not-run` or `open-condition`; reject unsourced claims.
- Bind every release-bound image to original path, capture date, viewport and known downsampling.

### Non-functional
- Preserve all three `research/*.md` reports byte-for-byte.
- Use full SHA-256 values in notes/source map; visible slides may abbreviate only when notes retain the full value.
- No wording may convert automated checks into academic, WCAG, LMS or final-release certification.

## Architecture
```text
Repository evidence
  -> claim ledger + provenance checks
  -> source-map.csv (single factual contract)
  -> slide content + captions + speaker notes
  -> independent factual review
```

Factual gates:
| Gate | Required evidence | Pass condition |
|---|---|---|
| F1 Identity/scope | `DeCuongChiTietNop.docx`, author page | Three authors, unit, audience and three chapters match source. |
| F2 Product counts | manifests, quiz JSON, route manifests, PDF | Counts retain source and denominator. |
| F3 Acceptance state | `data/acceptance-report.json` | `20/0/3/1` and `blocked` always appear together. |
| F4 Option B boundary | independent review/contact sheet | PASS is limited to the DOCX dossier. |
| F5 ZIP integrity | actual ZIP + summary/evidence | Mismatch stays `open-condition`; no hash-lock claim. |
| F6 Claim boundary | LMS/accessibility/academic records | No unsupported certification language. |
| F7 Runtime findings | release-bound captures/routes | Search fallback and quiz placeholder remain disclosed. |
| F8 Visual provenance | six captures + canonical figures | Every used image has path/date/status. |

ZIP integrity record must retain both values:
- Summary/evidence: `6b48834ff3cfaddf29af6c0c83593e74ca4541c085da0bb8b1c36f128212cdbd`, 78,723,361 bytes.
- Actual ZIP on 2026-08-27: `b3e4f359da9dcfe483b058ac548561883d59108bb1666fd967d01b6e95702451`, 78,724,247 bytes, 375 entries.
- Required wording: “Hash lock chưa được xác nhận; release engineering phải tái tạo hoặc giải trình và tái sinh evidence trên đúng byte stream.”

## Related files
### Read
- `DeCuongChiTietNop.docx`
- `CoHocLyThuyet_Full_New.docx`
- `README.md`
- `data/acceptance-report.json`
- `data/lms-targets.json`
- `data/evidence-registry.json`
- `release/2026.08.25-candidate/release-summary.json`
- `release/2026.08.25-candidate/package/release-manifest.json`
- `release/2026.08.25-candidate/package/SHA256SUMS`
- `js/sim2/sim2-route-manifest.js`
- `js/sim3/sim3-route-manifest.js`
- `plans/260820-0639-vit-li-phn-quy-cch-thnh-bo-co-np-chnh-thc/independent-final-review.md`
- `plans/260820-0639-vit-li-phn-quy-cch-thnh-bo-co-np-chnh-thc/evidence/option-b-contact-sheet-195caea3.png`
- `backups/docx-option-b-20260826/captures/img-01-trang-chu-desktop-1440x1000.png` through `img-06-pdf-viewer-1440x1000.png`

### Create during implementation
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-source-map.csv`

## Implementation Steps
1. Extract the official cover identity and author-role strings from the dossier; preserve Vietnamese diacritics and titles.
2. Reconcile counts against their direct manifests/JSON rather than copying secondary prose.
3. Record the acceptance matrix and four open gate names with exact classifications.
4. Record Option B PASS with its explicit non-product boundary.
5. Hash the actual ZIP and compare size/entry inventory against release summary/evidence; classify mismatch as open.
6. Register the two runtime findings: search “mô men” falls back to the table of contents; `#ch1-quiz` shows “đang được cập nhật”.
7. Register each candidate-bound visual and forbid historical captures unless labeled as historical.
8. Run a two-person claim review: evidence owner prepares; independent reviewer confirms source, locator and status.

## Todo
- [ ] Populate all source-map rows for slides 01–16.
- [ ] Resolve every product count to a direct source.
- [ ] Record full hashes, sizes and mismatch status.
- [ ] Record four acceptance gates and two runtime findings.
- [ ] Confirm no official identity asset exists in supplied sources.
- [ ] Obtain independent factual sign-off.

## Success Criteria
- [ ] Every planned slide has at least one source-map row; every quantitative claim has a denominator and locator.
- [ ] No row labels the candidate ZIP hash as confirmed or locked.
- [ ] Conditional-approval wording is separated from final-release status.
- [ ] All visual paths are release-bound or explicitly marked historical.
- [ ] Research report hashes remain unchanged.

## Risk Assessment
| Risk | Signal | Response |
|---|---|---|
| Release evidence changes mid-authoring | Source hash/mtime differs from ledger | Stop exports; refresh source map and affected slides. |
| Secondary summary conflicts with direct artifact | Different count/hash/status | Prefer direct artifact, disclose conflict, keep gate open. |
| Reviewer interprets blocked as failed | Notes or slide changes taxonomy | Restore exact `pass/fail/blocked/not-run` language. |
| Official logo arrives late | Approved file plus usage permission supplied | Add only after provenance/permission check; otherwise retain text-only cover. |

## Security/Integrity Considerations
- Do not embed confidential local paths, usernames, tokens or machine metadata in slides, notes or package.
- Hashes establish byte identity only; they do not prove academic correctness or institutional approval.
- Never overwrite or mutate candidate evidence while measuring it; work read-only and record timestamp/tool.
- Keep source-map review history separate from the candidate release evidence.

## Next steps
After F1–F8 pass, proceed to Phase 02 and freeze the 13+3 narrative. Any unresolved source conflict remains visible in the slide map rather than being silently normalized.
