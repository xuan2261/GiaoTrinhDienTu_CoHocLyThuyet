# Academic Certification Review

## Status and scope

This is an integrity and review-workflow control, **not academic approval**. Technical `passed` never certifies mechanics correctness. Until independent SMEs record current decisions, strict validation reports `academic-claim:provisional`. The initial registry has no decisions, names, signatures, or invented findings.

Version 1 inventories 1,033 records: 791 equation occurrences, 134 figure occurrences, and 108 canonical routes. One record is retained per report row and manifest route. IDs use the canonical report-row SHA-256 prefix; byte-identical report rows receive a deterministic ordinal after canonical sorting, preserving IDs under report reordering while retaining multiplicity. Duplicate ledger IDs fail.

Canonical extraction retains only release-referenced images. Technical counts are 235 passed and 798 `stale-source-artifact`: 2/791 equation report occurrences and 125/134 figure occurrences retain current raster outputs, while all 108 content routes pass. The 798 stale rows describe retired or merged source raster derivatives; strict semantic-equation and release image gates pass independently. Technical `PASS` is not academic certification, and every academic item remains pending.

## Version-1 contracts

`data/academic_review_ledger.json` has `version`, `occurrencePolicy`, and `records`. Each record has `id`, `itemType` (`equation`, `figure`, `content-route`), `routeRef`, `sourceRef`, `outputRef`, `outputResolution`, `context`, `sourceHash`, `outputHash`, `scopeHash`, `technicalStatus` (`passed`, `failed`, `pending`, `stale-source-artifact`), and `academicStatus` (`pending`, `accepted`, `blocked`). A report `sourceHash` is the canonical report-row fingerprint. Output resolution is `logical-path`, `exact-sha256-match`, or `missing-logical-output`; canonical manifest routes use `canonical-route`.

`data/academic_signoffs.json` has `version` and append-only `records`. Every signoff has unique `reviewId`, `itemId`, reviewer `role` and `affiliation`/unit, optional `identity`, `independent: true`, decision (`accept` or `block`), current `scopeHash`, non-empty root-confined existing `evidenceRefs`, and ISO-8601 `reviewedAt`; `approvalRef` and same-item `supersedes` are optional. Role/unit are mandatory; identity and approval references are optional for privacy.

A replacement appends a record pointing backwards with `supersedes`. Cycles, forks, missing targets, duplicate IDs, and multiple active decisions fail. An accepted item needs exactly one active independent current `accept`; a blocked item needs an active `block`; unreviewed items stay pending. Report scope includes only its row, matching equation mapping/manual review/image mapping/alt override, resolved output, and the bytes of fragments actually referencing that output. Route scope includes only its route and fragment. Relevant change stales its signoff; unrelated registry edits do not.

## Representative independent-SME packet

No academic decision is recorded below. Engineering QA reconciled these nine samples on 2026-08-21: the two current equation diagrams and three current figures were readable; the Chapter 1 distributed-load caption was corrected; Chapter 2 and Chapter 3 index wording defects were corrected in the canonical DOCX and regenerated output; the Chapter 3 raster equation sample remains explicitly stale after release pruning. This bounded technical inspection is not mechanics approval. An independent SME must still check meaning, labels, chapter fit, and pedagogy before recording a current-scope decision.

### Equations

| ID | Source → output (resolution) | Context; source / output / scope hashes |
| --- | --- | --- |
| `equation-ch1-p520-mimage78-png-h4cfedae55f5e-n1` | `tools/equation_report.json#sha256=4cfedae55f5ed30a86ae7f7b0e2b5e0ea835854430609dc0b0472514656b325d;occurrence=1` → `images/ch1/hinh-078.png` (logical path) | “Xét một dầm thẳng…”; `4cfedae55f5ed30a86ae7f7b0e2b5e0ea835854430609dc0b0472514656b325d` / `39eb4e47ef36565264f32eedaac3493c8a11c3060c23dbed63a71faa17cc03a5` / `baeaade753f4e561e765540b1377297565c8a0caa2a3f6a4ea6f86388f2888a8` |
| `equation-ch2-p1352-mimage447-png-h99388f9b7209-n1` | `tools/equation_report.json#sha256=99388f9b72094a2373075db448ef6cc4f1338fe6bc9429297b0a6d0cc9c5bfbd;occurrence=1` → `images/ch2/hinh-211.png` (logical path) | “Gia tốc pháp tuyến”; `99388f9b72094a2373075db448ef6cc4f1338fe6bc9429297b0a6d0cc9c5bfbd` / `9656da603eac9e6e2605a82d0c29e52029d7d55f516e47e8f6ee00650fae1c26` / `28446e6d979e07f724abdb685379235772d4440105bc532543c07115cec21e79` |
| `equation-ch3-p1567-mimage540-wmf-hb31724c0a569-n1` | `tools/equation_report.json#sha256=b31724c0a569333327e999850597125367bd8f069e3c270298fe2a7020cf6a6f;occurrence=1` → `images/ch3/hinh-001.png` (missing logical output; stale) | “Các đặc trưng của lực là…”; `b31724c0a569333327e999850597125367bd8f069e3c270298fe2a7020cf6a6f` / `ef6f88dfff344987bbd50eb7fe4a00c65eeba890da7a2f0461066f3a4fe10854` / `736854cd484939faa82dc40883b58fa011f6d577e4b49570cb87c2f60f8dbc08` |

### Figures

| ID | Source → output (resolution) | Context; source / output / scope hashes |
| --- | --- | --- |
| `figure-ch1-p341-mimage2-png-ha272ad444746-n1` | `tools/equation_report.json#sha256=a272ad444746eb131a270dd217aef418974084d51407b6d6510c859524b75376;occurrence=1` → `images/ch1/hinh-002.png` (logical path) | Empty adjacent context; `a272ad444746eb131a270dd217aef418974084d51407b6d6510c859524b75376` / `f32f41cbc2ca9d6ac7643a1a31f93215f1caa2c515a726f12d2e5e00e8526369` / `e1894b0f9d3d4456ce277f212ea74a98c8602d208bdd8abd8a021f0b93cb2918` |
| `figure-ch2-p1018-mimage292-png-h01c60c549f75-n1` | `tools/equation_report.json#sha256=01c60c549f7501f25ca2b7ba57e5b0a14aa6f2ace6072f9e22079f261dd38c18;occurrence=1` → `images/ch2/hinh-056.png` (logical path) | Empty adjacent context; `01c60c549f7501f25ca2b7ba57e5b0a14aa6f2ace6072f9e22079f261dd38c18` / `f726d1b11fb42a29ad31bf3f06971681288c3b62a444bd91c1bdce466062cc87` / `c00fb98918927f9fa0a19906276e6b020fcfd17239bf230a0ffb9e42deb813ee` |
| `figure-ch3-p1587-mimage547-png-h653f5a645d4e-n1` | `tools/equation_report.json#sha256=653f5a645d4ebcc47ef93962557b98fd443dc95adf687cec9cb3f7a36d47466a;occurrence=1` → `images/ch3/hinh-008.png` (logical path) | Empty adjacent context; `653f5a645d4ebcc47ef93962557b98fd443dc95adf687cec9cb3f7a36d47466a` / `5d103b743e22e780114329ac8b2235c7002d5bb52de8854e01757eb84f5379d5` / `3ee03ece41596aa459d6735237dbce1bd98ba81d955ecb267e8bd627feac4063` |

### Content routes

| ID | Source → output | Context; source / output / scope hashes |
| --- | --- | --- |
| `content-route-ch1` | `data/content-manifest.json#/routes/ch1` → `chapters/ch1/index.html` | Tĩnh học; `b2077728721235df6ee2f430c42beeac95f91e6691d4df6785d873249a229d81` / `b651a9b0b1b00813fb411e5a6404201f2d42cea40cb6eb5839362585f4147071` / `3461bc8f3a2c869b5eea749011728e999defb57802f7dfc0ca52932ee29d2cd6` |
| `content-route-ch2` | `data/content-manifest.json#/routes/ch2` → `chapters/ch2/index.html` | Động học; `607cebb8a3eaecd480e09b57e86e4694ad5e124ae2ea340817117865f26ac2de` / `3bd8e395c9fbd709354387722b83f330a9b749e8743e80fbd4698dc63ed7d38e` / `4d1b19d26a7395cd43dc18d7b17b4a937bee2a47d3ad36b31c17f70d8212984e` |
| `content-route-ch3` | `data/content-manifest.json#/routes/ch3` → `chapters/ch3/index.html` | Động lực học; `90bca364987ca4e1ba32d841b44290ca4e0292b86fca9dab27d871a42fb58a54` / `e29daff725d1b60ca0e901ca2db8feae2c504b242ac15f21712ddb9a8c248b1a` / `7bf4971c8732737ee9a048a614a8b7fc74ef9821255da2a7cc29f5452a524015` |

## Commands and privacy

`npm run validate:academic-review` checks registry shape. `npm run test:academic-review` runs strict currentness and reports counts, stale artifacts, and the provisional limitation. Store role/unit and root-relative evidence only by default; avoid personal identity, signatures, or contact details. Review history is append-only; a relevant source/output/scope change requires renewed independent review.
