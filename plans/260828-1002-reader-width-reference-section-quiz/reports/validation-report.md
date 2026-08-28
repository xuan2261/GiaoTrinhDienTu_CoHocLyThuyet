---
title: "Critical plan validation"
status: final
created: 2026-08-28
tags: [validation, plan-review, decisions]
---

# Critical plan validation

## Trigger

Mandatory `--deep --tdd` post-red-team validation.

## Verification results

- Tier: Standard (4 phases).
- Existing file claims checked: 30; verified: 30; failed: 0; unverified: 0.
- Interface/flow claims checked against current source: content cap/preference pattern, quiz section filtering/attempt keys/store sanitize/commit, generated quiz-page target, chapter-index render seam, content-manifest exact keys/hash, hashchange navigation, bundle/search output paths.
- `[UNVERIFIED]` tags: 0.
- Red-team evidence already covered Fact Checker + Contract Verifier; validation did not duplicate hostile review.

## Questions and answers

1. **[Architecture] Chốt hợp đồng chiều rộng nào cho implementation?**
   - Options: Standard mặc định, Rộng khi bật | Rộng tối đa 1400px | Luôn luôn rộng
   - **Answer:** Standard mặc định, Rộng khi bật
   - Rationale: đáp ứng full ngang theo lựa chọn mà không làm prose width xấu cho mọi người học.

2. **[Architecture] Nguồn chuẩn cho bảng ký hiệu/chữ viết tắt nên là gì?**
   - Options: JSON curated + provenance | Bắt buộc nằm trong DOCX | Dữ liệu JS runtime
   - **Answer:** JSON curated + provenance
   - Rationale: giữ metadata có schema/route/hash và pre-render file://, tránh refactor parser bảng Word hoặc runtime fetch.

3. **[Scope] Menu quiz nên bao gồm và ghi nhớ phạm vi thế nào?**
   - Options: I–VII và ghi nhớ theo chương | Chỉ I–VI, có ghi nhớ | I–VII, không ghi nhớ
   - **Answer:** I–VII và ghi nhớ theo chương
   - Rationale: dùng đủ section data hiện hành, gồm 15 câu Section VII mỗi chương; nhất quán với attempt resume.

4. **[Risk] Khi bảng ký hiệu chạy đúng kỹ thuật nhưng chưa có SME độc lập duyệt, trạng thái hoàn thành xử lý thế nào?**
   - Options: Hoàn thành kỹ thuật, giữ acceptance pending | Chặn toàn bộ implementation | Không nối academic review
   - **Answer:** Hoàn thành kỹ thuật, giữ acceptance pending
   - Rationale: không biến reviewer ngoài thành blocker code nhưng không giả lập acceptance học thuật.

## Confirmed decisions

- Standard default; true available-width mode only when user enables it.
- Curated JSON is a supplemental academic source with explicit provenance.
- Quiz scopes include I–VII and persist per chapter; attempts remain isolated by existing key.
- Technical completion is distinct from academic acceptance.

## Phase propagation

- Phase 1 already matches confirmed I–VII/persistence contract; no semantic change required.
- Phase 2 already matches confirmed standard/wide contract; red-team first-paint/tablet corrections retained.
- Phase 3 already matches curated JSON/provenance contract.
- Phase 4 already records technical completion versus pending external acceptance.

## Whole-plan consistency sweep

- Required files: `plan.md`, Phases 1–4.
- Decision deltas: 4 validation answers + 5 red-team corrections.
- Stale/rejected alternatives searched: 1400px cap, always-wide, DOCX-only/runtime-JS reference source, I–VI-only/non-persistent quiz, acceptance-as-technical-pass, lexical `CHAPTER_SECTIONS`, `<=900px` hidden width toggle.
- Unresolved contradictions: 0.

## Recommendation

Proceed to implementation only from the final plan files after runtime task hydration. External SME acceptance remains a separate evidence gate.