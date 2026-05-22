---
title: "Phase 02 - Coverage matrix and authoring standards"
status: completed
priority: P1
---

# Phase 02 - Coverage matrix and authoring standards

## Context Links

- `tools/docx_site_manifest.json`
- `chapters/ch1/*.html`
- `chapters/ch2/*.html`
- `chapters/ch3/*.html`
- `chapters/ch*/on-tap.html`
- `docs/docx-sync-pipeline.md`

## Overview

Chot matrix noi dung truoc khi viet them cau hoi. Phase nay giam rui ro tao 50 cau moi nhung lap y, lech section, hoac khong bam sat giao trinh.

## Requirements

- Moi cau moi phai trace ve chapter section/subsection.
- Khong copy nguyen van cau hoi tu `on-tap.html`; dung lam scope.
- Mix muc do:
  - 45% nho/hieu dinh nghia, dinh luat, dieu kien.
  - 35% van dung cong thuc va nhan dang sai lam.
  - 20% bai tap tinh toan ngan/tong hop.
- Distractor phai plausible, khong dung dap an "tat ca dung" qua muc.

## Architecture

Tao matrix trong plan/report, khong can code generator. Neu implementation muon them metadata tam thoi, khong dua vao runtime schema tru khi co ly do ro.

## Target Matrix

| Chapter | Section | Target count | Focus |
|---|---|---:|---|
| Ch1 | I | 12 | vat ran, can bang, luc, mo men, he luc, ngau luc, vat tu do |
| Ch1 | II | 9 | 6 dinh luat tinh hoc va he qua |
| Ch1 | III | 9 | lien ket tua, day, ban le, goi, ngam, thanh |
| Ch1 | IV | 18 | he luc khong gian, vecto chinh, mo men chinh, dang co ban, PTCB |
| Ch1 | V | 32 | ma sat truot/lan, goc ma sat, tu ham, bai toan co ma sat |
| Ch1 | VI | 5 | trong tam, cong thuc, tinh chat |
| Ch1 | VII | 15 | bai tap tong hop tinh hoc |
| Ch2 | I | 15 | dong hoc chat diem, toa do De-cac, tu nhien, chuyen dong dac biet |
| Ch2 | II | 11 | tinh tien, quay quanh truc co dinh |
| Ch2 | III | 10 | truyen dong dai/banh rang |
| Ch2 | IV | 14 | hop van toc, hop gia toc, Coriolis |
| Ch2 | V | 24 | chuyen dong song phang, tam van toc tuc thoi, slider-crank |
| Ch2 | VI | 11 | quay quanh diem co dinh, goc Euler |
| Ch2 | VII | 15 | bai tap tong hop dong hoc |
| Ch3 | I | 10 | vat the, luc, he quy chieu quan tinh |
| Ch3 | II | 27 | cac dinh luat Newton, doc lap tac dung, lien ket |
| Ch3 | III | 11 | phuong trinh vi phan chat diem/co he |
| Ch3 | IV | 9 | bai toan thuan/nguoc |
| Ch3 | V | 14 | khoi tam, dong luong, mo men dong luong, dong nang |
| Ch3 | VI | 14 | va cham, he so phuc hoi, tam va cham |
| Ch3 | VII | 15 | bai tap tong hop dong luc hoc |

## Related Code Files

Read:

- `tools/docx_site_manifest.json`
- `chapters/ch*/muc-*.html`
- `chapters/ch*/on-tap.html`

Modify:

- none required in this phase unless adding a plan-scoped report.

## Implementation Steps

1. Read manifest and chapter fragments by section.
2. Build a checklist of subsection topics for each section.
3. Compare existing 50-question bank to identify covered/under-covered topics.
4. Draft new question slots per section before writing final JSON.
5. Mark each slot as `concept`, `formula`, or `calculation`.
6. Normalize all Ch1 calculation/review slots to section `VII`; do not use `VIII`.

## Todo List

- [x] Create coverage checklist per chapter.
- [x] Identify existing question overlap.
- [x] Reserve 50 new slots per chapter.
- [x] Decision locked: normalize Ch1 legacy `VIII -> VII`.

## Tests

Manual/content tests:

- Spot-check every new question against corresponding `chapters/ch*/muc-*.html`.
- Run `npm run test:quiz` after updating target matrix if needed.

## Success Criteria

- Team has exact slot list before authoring.
- No section is below its target without explicit decision.
- Question authoring can proceed chapter by chapter without guessing scope.

## Risk Assessment

- Risk: content matrix based on generated fragments may drift after DOCX re-extract.
- Mitigation: use `tools/docx_site_manifest.json` and chapter fragments from current repo snapshot; rerun audit after implementation.

## Security Considerations

- Do not paste HTML from fragments into JSON fields.
- Keep quiz text plain text; no embedded event handlers or links.

## Next Steps

- Phase 03 expands Chapter 1.
