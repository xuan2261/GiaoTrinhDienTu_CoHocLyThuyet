---
title: "Phase 06 - Merge Reviewed Mapping"
status: complete
priority: P1
effort: 2h
---

# Phase 06 - Merge Reviewed Mapping

## Context Links

- `tools/merge_equation_mapping.py`
- `tools/validate_equation_mapping.py`
- `data/equation_mapping.reviewed.json`

## Overview

Merge reviewed mapping into publish file and validate strict before touching generated textbook output.

## Key Insights

- `data/equation_mapping.json` is the publish source.
- Extractor uses reviewed rows with LaTeX/MathML or explicit reviewed artifact handling.
- Strict validation must pass before regenerate.

## Requirements

Functional:
- Merge reviewed JSON to `data/equation_mapping.json`.
- Validate strict.
- Backup previous publish mapping.

Non-functional:
- No manual schema edits.
- No partial publish.

## Architecture

```text
base mapping -> reviewed mapping -> merge script -> publish mapping -> strict validator
```

## Related Code Files

Modify:
- `data/equation_mapping.json`

Create:
- backup copy of old `data/equation_mapping.json`

Delete:
- None.

## Implementation Steps

1. Backup publish mapping:
   ```powershell
   Copy-Item data\equation_mapping.json data\equation_mapping.before-reviewed-merge.json
   ```
2. Merge:
   ```powershell
   python tools\merge_equation_mapping.py --base data\equation_mapping.json --reviewed data\equation_mapping.reviewed.json --output data\equation_mapping.json
   ```
3. Validate strict:
   ```powershell
   python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict
   ```
4. Count rows:
   ```powershell
   $rows = Get-Content -Raw data\equation_mapping.json | ConvertFrom-Json
   $rows.Count
   ($rows | Where-Object reviewed).Count
   ```
5. Confirm no schema drift:
   ```powershell
   Select-String -Path data\equation_mapping.json -Pattern '"confidence"'
   ```

## Todo List

- [x] Backup current publish mapping.
- [x] Run merge script.
- [x] Validate strict.
- [x] Confirm 702 rows reviewed.
- [x] Confirm no schema drift.

## Success Criteria

- `data/equation_mapping.json` strict validates.
- 702 unique rows.
- All reviewed.
- No fallback publish risk from missing mapping.

## Test And Validation

```powershell
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict
```

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Merge overwrites good mapping | Backup before merge |
| Reviewed file partial | Strict validation blocks |
| Duplicate hash conflicts | Validator blocks conflicts |

## Security Considerations

- Mapping contains only formula text; no secrets expected.
- Do not include API keys in notes/source fields.

## Next Steps

Proceed to regenerate only after strict validation passes.
