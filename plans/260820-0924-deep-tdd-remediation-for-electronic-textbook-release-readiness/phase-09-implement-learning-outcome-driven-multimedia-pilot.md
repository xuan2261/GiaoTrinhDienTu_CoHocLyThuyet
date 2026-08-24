---
title: "Phase 9: Thí điểm đa phương tiện theo chuẩn đầu ra"
status: completed
priority: P1
effort: "6-12 ngày tùy số asset"
dependencies: [phase-03, phase-04, phase-07]
---

# Phase 9: Thí điểm đa phương tiện theo chuẩn đầu ra

## Overview

Xây pipeline video/audio đầy đủ và thí điểm 3-5 asset chỉ khi LO gap đã được review và ghi nhận. GIF hiện có vẫn là kênh riêng; phase này không biến dự án thành studio hoặc thay mô phỏng bằng video.

## Requirements

- Mỗi asset bắt đầu từ LO gap: vì sao prose/image/GIF/simulation hiện có chưa đủ.
- Workflow: script -> storyboard -> technical/SME review -> render/record -> captions -> transcript -> poster -> metadata/checksum/license -> offline/a11y QA.
- Không autoplay; native/accessible controls; poster/text fallback; file:// playback.
- Video/audio có duration/size/codec budget được đo; release không chứa source project nặng.
- Nếu review kết luận không có gap hợp lệ, phase kết thúc bằng no-go ledger đã ghi nhận vai trò/đơn vị review và pipeline tests, không tạo asset trang trí; artifact này thỏa dependency của Phase 10.

## Architecture

Curated `data/media-pilot-manifest.json` join LO IDs và route IDs. Mỗi asset có authoring packet dưới `media/pilot/<id>/`; publish artifacts ở `media/video|audio|posters|captions|transcripts`. Runtime đọc manifest local, không liên quan LMS.

## Related Code Files

- Reuse pattern: `js/gif-figures.js`, `gif-conversion-workspace/publish-gifs.py`, `tests/gif-figures.spec.js`.
- Create: media manifest/directories, `tools/validate_media_pilot.py`, `tests/media-pilot-manifest.test.js`, `tests/media-pilot-browser.spec.js`.
- Modify: `js/loader.js` hoặc một `js/media.js` riêng, `css/style.css`, `index.html`, Phase-2 manifest/build order.
- Do not hand-edit generated chapter fragments; integration marker phải xuất phát từ DOCX/curated manifest boundary.

## Tests Before

1. Run the future validator against an empty/incomplete pilot fixture and require failure for missing LO decision, caption/transcript/poster/license/hash where an asset is declared; repository absence is discovery evidence only.
2. Build invalid fixtures with autoplay enabled, external URL, missing provenance and stale media checksum.
3. Reproduce `file://` playback/fallback expectations with a tiny fixture asset.

## Implementation Steps

1. **RED:** schema and browser tests for completeness, offline local-only URLs, controls, reduced motion, fallback and no autoplay.
2. Review LO matrix ở trạng thái confirmed hoặc provisional có nguồn chính thức; rank gaps by learning value, temporal/causal need, audience and maintenance cost.
3. Select 3-5 pilot candidates or record no-go; record decision and reviewer role/unit.
4. Review script/storyboard before production; named signoff only when the institution requires it.
5. Produce encoded assets, captions/transcripts/posters, checksums, provenance and text alternatives.
6. Implement manifest-driven runtime mount/fallback with disposal and no external requests.
7. **GREEN:** all pilot assets pass schema, media decoding/playback, accessibility and file:// smoke.
8. **Refactor:** common media component, no per-route bespoke player code.

## Tests After

- `python tools/validate_media_pilot.py --strict`.
- `node --test tests/media-pilot-manifest.test.js`.
- `npx playwright test tests/media-pilot-browser.spec.js` under file:// and HTTP.
- Manual caption timing, transcript completeness, audio intelligibility/loudness, poster/fallback and low-bandwidth/offline review.

## Todo

- [x] Record media-gap rubric, pilot cap and review role/unit.
- [x] Select and record candidates/no-go decision.
- [x] Produce complete per-asset packets.
- [x] Implement manifest-driven offline player/fallback.
- [x] Record maintenance and release budgets.

## Success Criteria

- Every published asset resolves to a reviewed LO/gap and complete provenance/a11y packet.
- Zero autoplay/external request/missing text equivalent.
- `file://` playback and fallback work on Chrome/Edge target versions.
- Pilot size/duration budgets are measured and accepted.
- Go/no-go decision for wider production is evidence-backed, not assumed.

## Risk Assessment

- Scope creep: hard cap 3-5; expansion requires a second recorded review decision, not pre-filled approver details.
- Codec/browser mismatch: choose proven offline formats and test actual targets.
- Captions/transcripts drift after edit: bind checksums/version and invalidate review.
- Copyright/voice privacy: license/consent fields mandatory.

## Next Steps

Phase 10 ships only reviewed publish artifacts; Phase 12 reports media scope truthfully.