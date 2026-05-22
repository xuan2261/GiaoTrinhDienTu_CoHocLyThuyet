---
title: "Chapter coverage research"
status: done_with_concerns
---

# Chapter Coverage Research

## Summary

- Repo has 3 chapters, 21 sections, 78 subsections from `tools/docx_site_manifest.json`.
- Best content sources for question writing: `chapters/ch*/muc-*.html` and `chapters/ch*/on-tap.html`.
- DOCX remains source of truth for textbook content; quiz is supplemental data.

## Findings

| Chapter | Main priority |
|---|---|
| Ch1 | He luc khong gian, ma sat, bai tap tong hop |
| Ch2 | Dong hoc diem, hop chuyen dong, song phang |
| Ch3 | Newton/D'Alembert, phuong trinh vi phan, dinh ly tong quat, va cham |

## Proposed Matrix

| Chapter | I | II | III | IV | V | VI | VII | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Ch1 | 12 | 9 | 9 | 18 | 32 | 5 | 15 | 100 |
| Ch2 | 15 | 11 | 10 | 14 | 24 | 11 | 15 | 100 |
| Ch3 | 10 | 27 | 11 | 9 | 14 | 14 | 15 | 100 |

## Decisions

- Existing Ch1 data uses `VIII` for calculation questions while manifest has only through `VII`; final implementation must normalize `VIII -> VII`.
- Need compare new authoring against existing data to avoid duplicate stems.

## Unresolved Questions

- None.
