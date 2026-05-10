---
title: "Local OCR Environment Report"
description: "Phase 02 isolated pix2tex environment setup and smoke results."
status: complete
created: 2026-05-05
---

# Local OCR Environment Report

## Environment

OCR venv:

```text
D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\.venv-ocr
```

Python:

```text
Python 3.11.5, 64-bit, Windows 10.0.18363
```

Pinned OCR stack:

```text
pix2tex==0.1.4
torch==2.1.2+cpu
torchvision==0.16.2+cpu
numpy==1.26.4
transformers==4.37.2
tokenizers==0.15.2
huggingface-hub==0.20.3
opencv-python-headless==4.10.0.84
```

Model weights downloaded under venv:

```text
.venv-ocr\Lib\site-packages\pix2tex\model\checkpoints\weights.pth        102113875 bytes
.venv-ocr\Lib\site-packages\pix2tex\model\checkpoints\image_resizer.pth   19441973 bytes
```

## Issue And Fix

Initial `pip install pix2tex` pulled floating latest `torch==2.11.0` and `torchvision==0.26.0`.
`import torch` failed at `c10.dll` with `WinError 1114`. Debugger evidence pointed to MSVC runtime/binary compatibility.

Avoided system-wide VC++ runtime change. Fixed inside `.venv-ocr` by installing official PyTorch CPU wheels:

```powershell
.\.venv-ocr\Scripts\python.exe -m pip install --force-reinstall --no-cache-dir --index-url https://download.pytorch.org/whl/cpu --extra-index-url https://pypi.org/simple "torch==2.1.2+cpu" "torchvision==0.16.2+cpu"
```

Then pinned `numpy`/`transformers`/OpenCV to compatible versions because latest `transformers` requires newer torch and `numpy 2.x` breaks torch 2.1 NumPy bridge.

```powershell
.\.venv-ocr\Scripts\python.exe -m pip install --force-reinstall "numpy==1.26.4" "transformers==4.37.2" "tokenizers==0.15.2" "huggingface-hub==0.20.3"
.\.venv-ocr\Scripts\python.exe -m pip install --force-reinstall "opencv-python-headless==4.10.0.84" "numpy==1.26.4"
```

## Verification

`pip check`:

```text
No broken requirements found.
```

Import smoke:

```text
torch 2.1.2+cpu
numpy 1.26.4
transformers 4.37.2
cv2 4.10.0
torch numpy bridge tensor([0.])
pix2tex import ok
```

OCR smoke:

```text
=== EQUATION OCR PREFILL ===
Input rows: 702
Output: data\equation_mapping.ocr.sample.json
Provider chain: pix2tex:local
Provider successes: pix2tex=1
Processed: 1
Skipped: 0
Failed: 0
```

Sample validation:

```text
Rows: 702
Unique hashes: 702
Reviewed: 0
OK
```

Python compile:

```text
python -m compileall -q tools
Pass.
```

## Code Guard Added

`tools\ocr_equation_mapping.py` now rejects OCR LaTeX with unbalanced delimiters/braces before writing it to the mapping. Invalid OCR is kept as a failed note, preserving validator compatibility and review workflow.

## Release Notes

`.venv-ocr` and model checkpoints are local-only development artifacts. Exclude them from release package.

Use explicit local provider commands for this plan:

```powershell
.\.venv-ocr\Scripts\python.exe tools\ocr_equation_mapping.py --provider pix2tex ...
```

Do not rely on default `--provider auto` when API keys may exist in the environment.

## Unresolved Questions

- None for Phase 02.
