---
title: "Phase 11: Thêm adapter LMS theo từng tầng"
status: completed
priority: P2
effort: "QTI/CC 8-12 ngày; xAPI/cmi5/SCORM phụ thuộc target"
dependencies: [phase-03, phase-06, phase-10]
---

# Phase 11: Thêm adapter LMS theo từng tầng

## Overview

Xây canonical course/assessment export rồi adapter QTI 3, Common Cartridge, xAPI/cmi5 và SCORM 2004 theo thứ tự lock-in tăng dần. Runtime standalone phải bất biến và không import API LMS.

## Requirements

- Canonical Course/ContentItem/Assessment/AssessmentItem schemas có stable IDs, version, source/evidence hashes và LO refs.
- Adapter API: `export(course, options) -> PackageArtifact`; `validate(package) -> ConformanceReport`.
- QTI 3 choice interaction round-trip giữ choice/correct/feedback/source/LO; unsupported construct fail explicit.
- Common Cartridge gói course navigation/web resources + QTI association.
- xAPI/cmi5 chỉ triển khai khi có privacy/launch contract ở mức vai trò/đơn vị và no-PII default; không cần khóa trước tên production LRS trong kế hoạch.
- SCORM 2004 chỉ chạy target-specific acceptance khi có LMS sandbox thực tế; thiếu target không chặn canonical adapter hoặc standalone release.
- Boundary test cấm adapters import/mutate `js/app.js`, `js/loader.js`, `js/quiz.js`, `js/sim2/**`, generated runtime files.
- Canonical LMS export contains course/content/assessment definitions only. Learner attempt history, localStorage state and device/session data are forbidden unless an explicit privacy/launch contract authorizes a separate telemetry package.

## Architecture

`lms/canonical/**` consume Phase-2/3/6 data. Adapters nằm `lms/adapters/qti3`, `common-cartridge-1.4`, `xapi-cmi5`, `scorm-2004`; CLI wrappers dưới `tools/lms/`. Packages là derivative artifacts, không nằm trong standalone ship set.

## Related Code Files

- Create: canonical schemas/maps; adapter modules; CLI tools; package validators.
- Tests: `tests/lms/canonical-course-schema.test.js`, `canonical-assessment-roundtrip.test.js`, `qti3-package-contract.test.js`, `common-cartridge-package-contract.test.js`, conditional xAPI/cmi5/SCORM tests, `lms-adapter-boundary.test.js`.
- Consume only: quiz v2 data, content/LO/evidence manifests, simulation evidence references.

## Tests Before

1. Assert repo has no QTI/CC/xAPI/cmi5/SCORM artifacts.
2. Add boundary RED test against runtime imports and generated-file edits.
3. Add invalid canonical fixtures: unstable IDs, missing provenance, unsafe markup.
4. Record target LMS/LRS/version/plugin only when a target-specific import or launch stage is actually executed; do not guess defaults.

## Implementation Steps

1. **RED Stage 0:** canonical schema, ID, provenance and runtime-boundary tests.
2. Implement canonical export from usable Phase-2/3/6 data; preserve provisional/confirmed status and never upgrade authority implicitly.
3. **RED/GREEN Stage 1 QTI 3:** XML/package/namespace/ID/response processing and round-trip tests; external validator first, target LMS pilot when available.
4. **RED/GREEN Stage 2 Common Cartridge:** imsmanifest organizations/resources/hrefs/QTI links; validator first, target LMS import when available.
5. Stage 3 xAPI/cmi5 only after privacy/launch review: statement vocabulary, registration, timestamps, offline queue/error policy.
6. Stage 4 SCORM 2004 last: SCO shell/API mapping/suspend data; run ADL suite/sandbox evidence when a concrete target is in scope.
7. **Refactor:** shared XML escaping, ZIP inventory, IDs and diagnostics; no vendor dialect in canonical model.
8. Add adapter artifacts and validation logs to release evidence, but not standalone package.

## Tests After

- Node canonical/boundary/round-trip/package contract tests.
- 1EdTech QTI 3 and Common Cartridge validation where tools are available.
- Target LMS import/launch/score/feedback/navigation evidence when a target is in scope.
- Conditional xAPI/cmi5 LRS conformance and SCORM 2004 sandbox/test-suite evidence.
- Re-run standalone release smoke and prove byte/inventory unchanged by LMS build.

## Todo

- [x] Record target LMS/LRS/version/plugin when executing a target-specific stage.
- [x] Build canonical schemas and boundary tests.
- [x] Implement/validate QTI 3.
- [x] Implement/validate Common Cartridge.
- [x] Implement xAPI/cmi5 and SCORM only when their privacy/launch/target inputs exist.

## Success Criteria

- Canonical assessment round-trip preserves supported semantics with zero unstable IDs.
- QTI and CC packages pass spec/validator gates; import evidence is added when a concrete target is available.
- xAPI/cmi5/SCORM either pass the applicable target gates or remain not-executed for their derivative packages; they do not block standalone acceptance.
- Standalone runtime/package has no LMS imports, API calls or artifact drift.

## Risk Assessment

- Target dialect differences: record version/plugin and import logs only for targets actually tested; never generalize one target's result.
- Common Cartridge 1.4 candidate-final changes: pin exact spec/validator version.
- SCORM legacy tooling: isolate adapter, never constrain canonical runtime.
- xAPI privacy/offline behavior: opt-in policy, no PII, explicit failure/queue rules.

## Next Steps

Phase 12 reports each adapter stage separately and never conflates design-level validation with production LMS acceptance.