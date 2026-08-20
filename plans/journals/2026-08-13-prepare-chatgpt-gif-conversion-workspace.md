---
title: Prepare ChatGPT GIF conversion workspace
date: 2026-08-13
summary: Created and verified eight image-prompt pairs for physics-accurate GIF generation
---

# Prepare ChatGPT GIF conversion workspace

## What happened
Created `gif-conversion-workspace/` with eight representative textbook PNG copies, eight same-basename Vietnamese ChatGPT Web prompts, and `huong-dan.txt`.

## Decision
Keep the workspace isolated from generated `images/` and `chapters/`. Select motion-suitable figures instead of forcing animation onto all 126 assets. Prompts require physics-first analysis, PNG-grounded Python/Pillow rendering, downloadable GIF/source/contact-sheet artifacts, and technical validation.

## Verification
Mechanical validation passed: 17 files, chapter split 2/3/3, 8/8 basename pairs, 8/8 SHA256 source-copy matches, and 8/8 prompt contracts. Code review passed with no findings. Debugger confirmed no changes under `images/`, `chapters/`, or `js/pages.js`.

## Next steps
Use one PNG/TXT pair per ChatGPT Web conversation. Review the contact sheet and physics before publishing any generated GIF.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
