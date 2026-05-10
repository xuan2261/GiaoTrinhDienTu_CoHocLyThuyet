---
title: "OCR Sampling And Model Selection Report"
description: "Phase 03 representative OCR sample, quality review, and provider decision gate."
status: complete
created: 2026-05-05
---

# OCR Sampling And Model Selection Report

## Summary

Representative sample created and tested.

```text
Sample rows: 24
Chapter distribution: ch1=8, ch2=8, ch3=8
Kind distribution: math-display=12, math-inline=12
```

Artifacts:

```text
data\equation_mapping.sample.json
data\equation_mapping.ocr.sample-pix2tex.json
equation-review-sample.html
plans\20260505-2044-local-math-ocr-semantic-math-strict-publish\reports\equation-sample-contact-sheet.png
```

## Pix2tex Result

Command:

```powershell
.\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --input data\equation_mapping.sample.json --output data\equation_mapping.ocr.sample-pix2tex.json --provider pix2tex
```

Output:

```text
Input rows: 24
Provider successes: pix2tex=24
Processed: 24
Failed: 0
```

Validation:

```text
Rows: 24
Unique hashes: 24
Reviewed: 0
OK
```

## Quality Classification

Manual visual spot review against the contact sheet:

| Class | Count | Notes |
|---|---:|---|
| Exact | 0 | None trusted as publish-ready |
| Minor edit | 7 | Simple symbols or nearly correct scalar/vector formulas |
| Major edit | 8 | Captures some structure but wrong symbol/operator/missing term |
| Unusable | 9 | Wrong vector letters, garbage arrays, or missing multi-line content |

Usable after minor edit = 7/24 = 29 percent, below the >=80 percent gate.

Key failure patterns:

- Vector arrows often become overlines, `\Lambda`, `\bigcup`, or other symbols.
- Dot/cross products may become `\supset` or unrelated operators.
- Multi-line display equations often lose rows or become arrays of arrows/blanks.
- Some scalar equations are close but still need manual correction.

## Pix2Text Fallback

Tried isolated venv:

```text
.venv-ocr-pix2text
pix2text==1.1.6
```

Blocked after dependency attempts:

- Floating latest pulled `torch==2.11.0`, failing at `c10.dll` with `WinError 1114`.
- Pinning PyTorch CPU fixed torch import but exposed `numpy`/`transformers`/`optimum` compatibility issues.
- `onnxruntime==1.17.3` can import, but `Pix2Text` still fails importing `ORTModelForVision2Seq` from the available `optimum` stack.

Current conclusion: Pix2Text is not a reliable local fallback on this Windows environment without more environment work or system VC++ runtime update.

## Decision Gate

Phase 03 blocks normal full-batch progression because the primary provider fails the sample quality threshold and fallback provider is not usable.

Risk acceptance recorded on 2026-05-06: continue with `pix2tex` only as rough prefill after user re-ran `$ck:cook --tdd` for this plan. This is not approval to publish. It only approves creating an unreviewed OCR queue for manual-heavy review.

Conservative options:

| Option | Impact |
|---|---|
| Continue with `pix2tex` as rough prefill | Full batch possible, but manual review is heavy and must not publish without 702-row strict review |
| Stop OCR and do manual transcription only | Slowest but avoids misleading OCR draft |
| Update system VC++ runtime and retry Pix2Text/latest torch | Requires system-wide change outside repo |
| Approve cloud fallback for hard rows | Violates local-only default; needs explicit approval |

Decision: run Phase 04 full batch with `pix2tex` rough prefill, then reject KaTeX-invalid OCR rows and keep every row `reviewed=false`.

## Unresolved Questions

- Có cho phép cập nhật VC++ Redistributable system-wide để thử lại latest torch/Pix2Text?
- Có cho phép cloud fallback cho hard rows không?
