---
title: "Local Math OCR Research"
description: "Research cho OCR công thức không API key."
status: complete
created: 2026-05-05
---

# Local Math OCR Research

## Summary

Mục tiêu là prefill LaTeX cho 702 unique equation image hashes, không dùng API key. Local OCR có thể làm được, nhưng không đủ tin để publish trực tiếp. Manual review là bắt buộc.

## Sources

| Source | Notes |
|---|---|
| `pix2tex` / LaTeX-OCR GitHub: https://github.com/lukas-blecher/LaTeX-OCR | Local image-to-LaTeX, Python/CLI, kéo PyTorch/model weights |
| `Pix2Text` GitHub: https://github.com/breezedeus/Pix2Text | Open-source OCR cho text/formula/table, hỗ trợ formula recognition |
| Pix2Text docs: https://pix2text.readthedocs.io/ | Usage/API docs |
| Project docs: `docs/docx-sync-pipeline.md` | Flow hiện tại và strict publish gates |

## Options

| Option | Pros | Cons | Decision |
|---|---|---|---|
| `pix2tex` first | Nhẹ hơn Pix2Text, chuyên image-to-LaTeX, dễ PoC | Dependency nặng: torch, torchvision, transformers; accuracy cần đo | Primary PoC |
| `Pix2Text` fallback | Có formula OCR broader, có thể xử lý ảnh khó hơn | Setup nặng hơn, API có thể thay đổi theo version | Secondary |
| Cloud Vision fallback | Accuracy thường cao, setup code đã có | Cần API key, có privacy/cost concern | Optional only |
| Manual only | Không dependency | 702 formulas quá chậm, dễ lệch | Không chọn |

## Key Findings

- Current Python env chưa có `torch`, `pix2tex`, `pix2text`.
- `pip install pix2tex --dry-run` kéo `torch`, `torchvision`, `transformers`, `timm`, `x-transformers`.
- Không nên cài vào Python chung. Dùng `.venv-ocr` hoặc external venv.
- First local run sẽ tải model weights, cần network một lần.
- OCR output phải giữ `reviewed=false`; reviewer phải sửa/tick `reviewed`.

## Recommended Architecture

```text
equation_mapping.template.json
  -> local OCR provider chain
  -> equation_mapping.ocr.json reviewed=false
  -> equation-review.html manual review
  -> equation_mapping.reviewed.json
  -> merge_equation_mapping.py
  -> equation_mapping.json reviewed=true
  -> extract_docx.py --write
  -> audit.py --strict-equations
```

## Test Strategy From Research

1. Sample 20 formulas across chapters and inline/display.
2. Compare OCR output visually in `equation-review.html`.
3. Reject model if sample exact/near-exact rate below practical threshold.
4. Full OCR only after sample accepted.
5. Strict publish only after all 702 reviewed.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| OCR hallucination | Wrong formulas in lesson | Review gate, `reviewed=false`, KaTeX preview |
| Model install breaks env | Toolchain unusable | Separate `.venv-ocr`, no global install |
| Empty/invalid LaTeX | Mapping unusable | Validate mapping, review UI, fail empty result |
| Some images too low-res | OCR poor | Manual transcription for hard rows |

Unresolved questions:
- Có dùng cloud fallback cho các row local OCR fail lâu không?
- Có đặt minimum sample accuracy threshold chính thức không?
