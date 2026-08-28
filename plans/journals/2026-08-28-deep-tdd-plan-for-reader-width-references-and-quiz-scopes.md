---
title: Deep TDD plan for reader width references and quiz scopes
date: 2026-08-28
summary: Created and validated a four-phase TDD plan for three offline reader enhancements.
---

# Deep TDD plan for reader width references and quiz scopes

## What happened

Created `plans/260828-1002-reader-width-reference-section-quiz/` with one overview, four detailed TDD phases, and plan-scoped evidence/red-team/validation reports. Scanned unfinished plans and found no blocking dependency.

Three researcher jobs and three red-team reviewer jobs were dispatched as required by deep mode, but all failed before reading files because the configured erablue API keys were disabled. Completed repository research and Standard-tier Fact Checker/Contract Verifier fallback directly from current source and tests.

## Decisions

- Keep standard reading width by default; apply saved wide mode before CSS first paint and retain a compact tablet control.
- Use curated `data/chapter-reference.json` with explicit schema-v1 content-manifest provenance; preserve DOCX as narrative canonical.
- Include quiz Sections I-VII, persist selected scope per chapter, preserve attempts by existing chapter/mode/section keys.
- Treat technical completion separately from pending external academic acceptance.

## Review outcome

Red-team fallback found six issues: five accepted and applied, one unrelated cleanup rejected. User confirmed all four critical validation decisions. Whole-plan consistency sweep found zero unresolved contradictions. `ak plan validate` passed; plan status is pending with 4 phases and 80 unchecked tasks.

## Operational note

`ak plan reindex --apply` recognized the new four-phase plan. One unrelated existing slides plan was skipped by reindex because its stored phases violate a unique phase-number constraint; this did not affect the new plan.

## Next steps

Hydrate the four phase-level runtime tasks. Implementation handoff: `/ak:cook C:/Work/GiaoTrinhDienTu_CoHocLyThuyet/plans/260828-1002-reader-width-reference-section-quiz/plan.md --tdd`.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
