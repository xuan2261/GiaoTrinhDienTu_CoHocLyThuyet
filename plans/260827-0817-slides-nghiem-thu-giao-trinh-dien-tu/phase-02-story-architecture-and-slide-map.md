---
phase: 2
title: "Story architecture and slide map"
status: pending
priority: P1
date: 2026-08-27
dependencies: [1]
---

# Phase 02: Story architecture and slide map

## Context links
- [Plan overview](plan.md)
- [Phase 01 evidence contract](phase-01-evidence-lock-and-factual-gates.md)
- [Story research](research/story-research.md)
- [Repository scout](research/repo-scout.md)
- Next: [Phase 03](phase-03-visual-system-and-slide-templates.md)

## Overview
| Field | Value |
|---|---|
| Date | 2026-08-27 |
| Priority | P1 |
| Status | pending |
| Objective | Freeze a 13-slide, 15:00 main argument plus three backup slides. |

The narrative follows: training need → learning value → controlled evidence → limitations → conditional resolution. The main deck remains decision-oriented; feature detail and demo behavior move to backup.

## Key Insights
- The Council must understand the training purpose before the technology.
- A short learner journey makes the product concrete without turning the meeting into a feature tour.
- The strongest credibility signal is explicit separation of technical evidence, human review and final authority.
- Demo is optional evidence, never the basis of approval.

## Requirements
### Functional
- Lock exactly 16 slides: 13 main + 3 backup.
- Main-slide time must total exactly 15:00; backup time is excluded.
- Each slide must have one decision question, one takeaway, mapped evidence and a notes block.
- Slide 13 must request conditional academic–pedagogical approval and state that final release remains blocked.

### Non-functional
- Vietnamese sentence case; no promotional language or unsupported superlatives.
- Main slides contain no live demo, animation dependency or hidden factual caveat.
- Backup slide 14 caps live demo at 90 seconds and includes a static fallback.

## Architecture
```text
Slides 01–03: mandate and accountable scope
Slides 04–07: learner value and product model
Slides 08–11: integrity, accessibility and acceptance evidence
Slides 12–13: closure conditions and requested resolution
Slides 14–16: optional demo, evidence drill-down and Q&A boundaries
```

### Locked main-deck map — exactly 15:00
| # | Time | Title | Takeaway / primary evidence |
|---:|---:|---|---|
| 1 | 0:35 | Giáo trình điện tử Cơ học lý thuyết | Ask for conditional approval, not final-release confirmation. Cover lists Đại tá, TS Nguyễn Lê Văn; Thiếu tá, ThS Đinh Văn Tứ; Đại úy, ThS Bùi Thanh Xuân; Học viện Hải quân; Hội đồng Khoa học Khoa KTCS; Khánh Hòa – 2026. |
| 2 | 0:45 | Bài toán đào tạo | Audience: undergraduate-level platoon officer cadets; scope: Tĩnh học–Động học–Động lực học. |
| 3 | 0:55 | Phạm vi và trách nhiệm tác giả | Three authors, one canonical DOCX source, explicit division of responsibility from dossier. |
| 4 | 1:05 | Từ giáo trình nguồn đến trải nghiệm học | Five-step learner journey: tìm–học–luyện–quan sát–ghi nhớ; IMG-01/IMG-03. |
| 5 | 1:05 | Học được khi không có mạng | Static product works via `file://`, USB or HTTP; DOCX → pipeline → offline package; PDF integrated. |
| 6 | 1:10 | Tương tác gắn với nội dung | 300 questions and learning-state tools support study; no claim of learning-effectiveness proof. |
| 7 | 1:10 | Mô phỏng có lớp chính và lớp thử nghiệm | 25 Sim2 canonical routes; 10 optional Sim3 pilot routes with Sim2 fallback; IMG-04. |
| 8 | 1:05 | Kiểm soát tính toàn vẹn nội dung | Generation/audit/traceability pipeline supports control; academic confirmation remains human-reviewed. |
| 9 | 1:05 | Khả năng tiếp cận và chế độ an toàn | Automated keyboard/reflow/contrast contracts exist; independent review remains blocked; IMG-02. |
| 10 | 1:20 | Ứng viên kỹ thuật có hồ sơ nhưng hash chưa khóa | Candidate inventory is identifiable, but actual ZIP `b3e4…2451` differs from summary/evidence `6b488…cdbd`; show open-condition label. |
| 11 | 1:25 | Báo cáo trung thực: 20/24, chưa đạt quyết định cuối | `20 pass / 0 fail / 3 blocked / 1 not-run`; overall blocked; no percentage-as-quality score. |
| 12 | 1:15 | Các điều kiện để khóa bản cuối | Close four acceptance gates, reconcile/rebuild ZIP evidence and resolve two disclosed runtime findings before final confirmation. |
| 13 | 2:05 | Đề nghị Hội đồng quyết nghị | Request conditional academic–pedagogical approval; assign remediation; final release only after current evidence closes. |
| **Total** | **15:00** |  |  |

### Locked backup map — outside main timing
| # | Purpose | Content |
|---:|---|---|
| 14 | Demo offline dự phòng, tối đa 1:30 | Open package via `file://` → direct route `#ch1-1-4` → exercise Sim2 → open 139-page PDF. If any step fails, switch to IMG-01/03/04/06. Do not present search or quiz-placeholder flows as passed. |
| 15 | Ma trận bằng chứng và giới hạn | 24-gate breakdown, 31-criterion dossier result `7/21/2/1`, Option B PASS boundary and exact source paths. |
| 16 | Câu hỏi Hội đồng / provenance | Answers for offline, Sim3 fallback, accessibility, LMS, Word round-trip, two ZIP hashes, two runtime findings and proof needed after Council. |

### Speaker-notes contract
Each slide entry in `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-speaker-notes.md` must include:
1. slide number/title and target time;
2. exact spoken script plus one transition sentence;
3. `claim_id` and source locator list from Phase 01;
4. factual boundary / forbidden shorthand;
5. visual description and alt text;
6. anticipated question and bounded answer;
7. backup trigger, when applicable.

## Related files
### Read
- `research/story-research.md`
- `research/repo-scout.md`
- `deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-source-map.csv`

### Create during implementation
- `tools/slides/nghiem-thu/deck-content.mjs`
- `plans/260827-0817-slides-nghiem-thu-giao-trinh-dien-tu/deliverables/giao-trinh-dien-tu-nghiem-thu-16x9-speaker-notes.md`

## Implementation Steps
1. Convert each row above into a content record with `id`, `section`, `title`, `takeaway`, `body`, `visual`, `time`, `claims` and `notes`.
2. Enforce one takeaway and no more than three evidence callouts per main slide.
3. Draft spoken scripts to target time at measured delivery speed; retain a five-second transition allowance inside each row.
4. Put the full proposed resolution in slide 13 notes; display only the readable decision clauses on-slide.
5. Keep slides 14–16 outside the main sequence marker and label them `DỰ PHÒNG`.
6. Review the main story without visuals; remove any slide that functions only as feature inventory, but preserve the locked 13-slide count by consolidating content, not adding filler.
7. Cross-check every content record against Phase 01 source-map rows.

## Todo
- [ ] Freeze slide IDs `S01`–`S13` and `B14`–`B16`.
- [ ] Confirm the time sum is exactly 900 seconds.
- [ ] Draft all 16 notes entries using the notes contract.
- [ ] Bind claim IDs and visual IDs to every slide.
- [ ] Mark all backup triggers and forbidden claims.
- [ ] Obtain narrative review from a reader not involved in evidence preparation.

## Success Criteria
- [ ] Main deck is exactly 13 slides and 15:00; backup is exactly three slides.
- [ ] The requested decision appears on slide 1 and is resolved precisely on slide 13.
- [ ] Hash mismatch is a visible condition on slides 10, 12 and relevant notes.
- [ ] No main slide depends on a live demo.
- [ ] Every notes entry contains timing, sources, boundaries, alt text and Q&A.

## Risk Assessment
| Risk | Signal | Response |
|---|---|---|
| Story becomes a feature tour | Three consecutive slides list controls/components | Reframe each around training or decision value. |
| 15-minute overrun | Rehearsal exceeds 15:00 | Cut spoken detail; never steal time from slide 13 or hide caveats. |
| Resolution exceeds Council authority | Reviewer flags terminology | Replace only the authority phrase with the Council’s official term; keep release boundary. |
| Demo tempts presenter into search flow | Script references “mô men” search as success | Remove from demo; retain as disclosed finding/Q&A. |

## Security/Integrity Considerations
- Notes must not contain personal contact data, private machine paths or unpublished credentials.
- Backup answers must use the same claim IDs and classifications as main slides.
- Never shorten two hashes so far that they become indistinguishable; notes always show complete values.
- A Council decision cannot retroactively convert an unverified byte stream into a confirmed release artifact.

## Next steps
After storyline and notes schema are approved, proceed to Phase 03. Visual design may clarify hierarchy, but it may not change the slide count, timing, claims or decision boundary.
